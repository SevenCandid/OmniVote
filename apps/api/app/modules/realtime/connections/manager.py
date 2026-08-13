import asyncio
import datetime
import json
import structlog
from typing import Dict, Optional, Set, Tuple
from fastapi import WebSocket, status

from app.modules.realtime.connections.metadata import ConnectionMetadata

logger = structlog.get_logger(__name__)


class ConnectionManager:
    """
    Centralized connection manager responsible for:
    - Registering & deregistering active WebSocket client connections.
    - Handling channel subscriptions and unsubscriptions.
    - Maintaining connection metadata, heartbeats, and presence counts.
    - Safe broadcasting to connected WebSocket clients.
    """

    def __init__(self):
        # connection_id -> (WebSocket, ConnectionMetadata)
        self._connections: Dict[str, Tuple[WebSocket, ConnectionMetadata]] = {}
        # channel_name -> Set[connection_id]
        self._channels: Dict[str, Set[str]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, metadata: ConnectionMetadata) -> None:
        """Register a pre-authenticated WebSocket connection."""
        async with self._lock:
            self._connections[metadata.connection_id] = (websocket, metadata)
            logger.info(
                "realtime_client_connected",
                connection_id=metadata.connection_id,
                connection_type=metadata.connection_type,
                user_id=metadata.user_id,
                visitor_session_id=metadata.visitor_session_id,
            )

    async def disconnect(self, connection_id: str) -> None:
        """Clean up connection and remove from all subscribed channels."""
        async with self._lock:
            if connection_id not in self._connections:
                return

            _, metadata = self._connections.pop(connection_id)
            for channel in list(metadata.subscribed_channels):
                if channel in self._channels:
                    self._channels[channel].discard(connection_id)
                    if not self._channels[channel]:
                        del self._channels[channel]

            logger.info("realtime_client_disconnected", connection_id=connection_id)

    async def subscribe(self, connection_id: str, channel: str) -> bool:
        """Subscribe a connection to a specific channel."""
        async with self._lock:
            if connection_id not in self._connections:
                return False

            _, metadata = self._connections[connection_id]
            metadata.subscribed_channels.add(channel)

            if channel not in self._channels:
                self._channels[channel] = set()
            self._channels[channel].add(connection_id)

            logger.debug("realtime_subscribed", connection_id=connection_id, channel=channel)
            return True

    async def unsubscribe(self, connection_id: str, channel: str) -> bool:
        """Unsubscribe a connection from a specific channel."""
        async with self._lock:
            if connection_id not in self._connections:
                return False

            _, metadata = self._connections[connection_id]
            metadata.subscribed_channels.discard(channel)

            if channel in self._channels:
                self._channels[channel].discard(connection_id)
                if not self._channels[channel]:
                    del self._channels[channel]

            logger.debug("realtime_unsubscribed", connection_id=connection_id, channel=channel)
            return True

    async def record_heartbeat(self, connection_id: str) -> None:
        """Record heartbeat ping from a client."""
        async with self._lock:
            if connection_id in self._connections:
                _, metadata = self._connections[connection_id]
                metadata.last_seen = datetime.datetime.now(datetime.timezone.utc)
                metadata.heartbeat_count += 1

    async def broadcast_to_channel(self, channel: str, message: dict | str) -> int:
        """
        Send message to all WebSocket connections subscribed to target channel.
        Returns the number of successfully delivered client messages.
        """
        connection_ids = list(self._channels.get(channel, set()))
        if not connection_ids:
            return 0

        payload_str = json.dumps(message) if isinstance(message, dict) else message
        delivered_count = 0
        stale_connections = []

        for conn_id in connection_ids:
            if conn_id not in self._connections:
                continue

            websocket, _ = self._connections[conn_id]
            try:
                await websocket.send_text(payload_str)
                delivered_count += 1
            except Exception as e:
                logger.warning(
                    "realtime_broadcast_delivery_failed",
                    connection_id=conn_id,
                    channel=channel,
                    error=str(e),
                )
                stale_connections.append(conn_id)

        # Cleanup failed connections asynchronously
        for stale_id in stale_connections:
            await self.disconnect(stale_id)

        return delivered_count

    async def get_presence(self, channel: str) -> dict:
        """Expose connection count metrics for a channel without revealing PII."""
        conn_ids = self._channels.get(channel, set())
        online_connections = len(conn_ids)
        online_users = set()
        online_visitors = set()

        for conn_id in conn_ids:
            if conn_id in self._connections:
                _, metadata = self._connections[conn_id]
                if metadata.user_id:
                    online_users.add(metadata.user_id)
                if metadata.visitor_session_id:
                    online_visitors.add(metadata.visitor_session_id)

        return {
            "channel": channel,
            "online_connections": online_connections,
            "online_users": len(online_users),
            "online_visitors": len(online_visitors),
        }

    async def get_metrics(self) -> dict:
        """Expose system-wide realtime connectivity metrics."""
        total_connections = len(self._connections)
        authenticated_users = sum(1 for _, m in self._connections.values() if m.user_id)
        anonymous_visitors = sum(1 for _, m in self._connections.values() if m.visitor_session_id)
        total_channels = len(self._channels)

        return {
            "connected_sockets": total_connections,
            "authenticated_users": authenticated_users,
            "anonymous_visitors": anonymous_visitors,
            "active_channels": total_channels,
        }

    async def clean_stale_connections(self, max_idle_seconds: int = 60) -> int:
        """Remove connections that have missed heartbeats beyond max_idle_seconds."""
        now = datetime.datetime.now(datetime.timezone.utc)
        stale_ids = []

        for conn_id, (_, metadata) in list(self._connections.items()):
            idle_seconds = (now - metadata.last_seen).total_seconds()
            if idle_seconds > max_idle_seconds:
                stale_ids.append(conn_id)

        for stale_id in stale_ids:
            await self.disconnect(stale_id)

        return len(stale_ids)


# Singleton connection manager instance
connection_manager = ConnectionManager()
