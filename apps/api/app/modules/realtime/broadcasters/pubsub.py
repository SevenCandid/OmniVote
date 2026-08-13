import asyncio
import json
import structlog
from typing import Optional
import redis.asyncio as redis

from app.core.config import settings
from app.modules.realtime.connections.manager import connection_manager

logger = structlog.get_logger(__name__)


class PubSubManager:
    """
    Dedicated Redis Pub/Sub client and listener.
    Maintains a dedicated long-lived connection separate from the shared connection pool.
    """

    def __init__(self):
        self._pub_client: Optional[redis.Redis] = None
        self._sub_client: Optional[redis.Redis] = None
        self._pubsub: Optional[redis.client.PubSub] = None
        self._listener_task: Optional[asyncio.Task] = None
        self._running = False

    async def init(self) -> None:
        """Initialize dedicated Redis connections for publishing and subscribing."""
        if not self._pub_client:
            logger.info("realtime_redis_pubsub_init", url=self._get_safe_url())
            self._pub_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            self._sub_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
            self._pubsub = self._sub_client.pubsub()

    async def start_listener(self) -> None:
        """Start background task listening to Redis Pub/Sub pattern omnivote:*"""
        await self.init()
        if self._running:
            return

        self._running = True
        # Subscribe to all omnivote real-time channels using pattern matching
        await self._pubsub.psubscribe("omnivote:*")
        self._listener_task = asyncio.create_task(self._listen_loop())
        logger.info("realtime_redis_listener_started")

    async def _listen_loop(self) -> None:
        """Continuously receive messages from Redis and forward to local ConnectionManager."""
        while self._running:
            try:
                message = await self._pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message.get("type") == "pmessage":
                    raw_channel = message.get("channel", "")
                    data = message.get("data", "")
                    
                    # Convert Redis channel back to application channel format
                    # e.g., 'omnivote:election.123.results' -> 'election.123.results'
                    channel_name = raw_channel.replace("omnivote:", "", 1) if raw_channel.startswith("omnivote:") else raw_channel
                    
                    try:
                        parsed_data = json.loads(data) if isinstance(data, str) else data
                    except Exception:
                        parsed_data = data
                    
                    await connection_manager.broadcast_to_channel(channel_name, parsed_data)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("realtime_pubsub_listener_error", error=str(e), exc_info=True)
                await asyncio.sleep(1.0)

    async def publish(self, channel: str, message: dict | str) -> bool:
        """Publish a message to Redis Pub/Sub so all API instances receive it."""
        await self.init()
        if not self._pub_client:
            return False

        try:
            redis_channel = f"omnivote:{channel}"
            payload_str = json.dumps(message) if isinstance(message, dict) else message
            await self._pub_client.publish(redis_channel, payload_str)
            return True
        except Exception as e:
            logger.error("realtime_redis_publish_failed", channel=channel, error=str(e))
            return False

    async def close(self) -> None:
        """Cleanly close dedicated Redis pubsub connections and background task."""
        self._running = False
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
            self._listener_task = None

        if self._pubsub:
            await self._pubsub.punsubscribe("omnivote:*")
            await self._pubsub.close()
            self._pubsub = None

        if self._sub_client:
            await self._sub_client.aclose()
            self._sub_client = None

        if self._pub_client:
            await self._pub_client.aclose()
            self._pub_client = None

        logger.info("realtime_redis_pubsub_closed")

    def _get_safe_url(self) -> str:
        url = settings.REDIS_URL
        if "@" in url:
            return "redis://:****@" + url.split("@")[-1]
        return url


# Singleton dedicated pubsub manager
pubsub_manager = PubSubManager()
