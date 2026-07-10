import structlog
from redis.asyncio import ConnectionPool, Redis

from app.core.config import settings

logger = structlog.get_logger()


class RedisClientManager:
    """
    Manages lifecycle and connection pooling of the shared async Redis client.
    Ensures safe initialization and cleanup callbacks within application context bounds.
    """

    def __init__(self):
        self.pool: ConnectionPool | None = None
        self.client: Redis | None = None

    def init_pool(self) -> None:
        """Initialize the connection pool from environment configurations."""
        if not self.pool:
            safe_url = self._get_safe_url()
            logger.info("redis_connection_pool_init", url=safe_url)
            try:
                self.pool = ConnectionPool.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,  # Decodes byte responses to Python strings automatically
                    max_connections=50,
                )
                self.client = Redis(connection_pool=self.pool)
            except Exception as e:
                logger.error("redis_connection_pool_failed", error=str(e))
                raise

    async def close_pool(self) -> None:
        """Close the connection pool cleanly on shutdown to prevent leak warnings."""
        if self.pool:
            logger.info("redis_connection_pool_shutdown")
            try:
                await self.pool.disconnect()
            except Exception as e:
                logger.error("redis_connection_shutdown_failed", error=str(e))
            finally:
                self.pool = None
                self.client = None

    def _get_safe_url(self) -> str:
        url = settings.REDIS_URL
        if "@" in url:
            return "redis://:****@" + url.split("@")[-1]
        return url


# Singleton manager instance
redis_manager = RedisClientManager()


def get_redis() -> Redis:
    """Expose the initialized async Redis client instance."""
    if redis_manager.client is None:
        raise RuntimeError(
            "Redis Client Manager has not been initialized. Call init_pool first."
        )
    return redis_manager.client
