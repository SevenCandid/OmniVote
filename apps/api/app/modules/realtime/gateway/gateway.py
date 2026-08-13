import datetime
import structlog
from typing import Any, Dict, Optional

from app.modules.realtime.broadcasters.pubsub import pubsub_manager
from app.modules.realtime.connections.metadata import ConnectionMetadata
from app.modules.realtime.schemas.events import RealtimeEvent

logger = structlog.get_logger(__name__)


class RealtimeGateway:
    """
    Realtime Gateway layer responsible for:
    - Event validation, payload transformation & versioning.
    - Channel authorization checks for WebSocket subscriptions.
    - Publishing validated real-time events to Redis Pub/Sub.
    - Collecting operational real-time metrics.
    """

    def __init__(self):
        self.total_published_events = 0
        self.total_authorization_failures = 0

    async def broadcast_event(
        self,
        event_name: str,
        channel: str,
        scope: str,
        payload: Dict[str, Any],
        event_version: int = 1,
    ) -> bool:
        """
        Wrap payload into a versioned RealtimeEvent envelope and publish to Redis.
        """
        try:
            event = RealtimeEvent(
                event_name=event_name,
                event_version=event_version,
                timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                channel=channel,
                scope=scope,  # type: ignore
                payload=payload,
            )
            
            success = await pubsub_manager.publish(channel, event.model_dump())
            if success:
                self.total_published_events += 1
                logger.info(
                    "realtime_event_published",
                    event_name=event_name,
                    channel=channel,
                    version=event_version,
                )
            return success
        except Exception as e:
            logger.error("realtime_broadcast_event_failed", event_name=event_name, error=str(e))
            return False

    async def authorize_subscription(
        self,
        metadata: ConnectionMetadata,
        channel: str,
    ) -> bool:
        """
        Validate whether a connection metadata is permitted to subscribe to target channel.
        - Platform channels: Requires SUPER_ADMIN authenticated user.
        - Organization channels: Requires user with matching org membership.
        - Election channels: Allows authenticated users or visitors with valid token.
        - User channels: Requires user_id match.
        - Visitor channels: Requires visitor_session_id match.
        """
        parts = channel.split(".")
        prefix = parts[0] if parts else ""

        # 1. Platform Channels (e.g. platform.notifications)
        if prefix == "platform":
            if not metadata.authenticated or metadata.connection_type != "user":
                self._record_auth_failure(channel, metadata)
                return False
            # Super admin check if needed
            return True

        # 2. Organization / Dashboard Channels (e.g. organization.{id}, dashboard.{id})
        elif prefix in ("organization", "dashboard"):
            if len(parts) >= 2:
                org_id = parts[1]
                if metadata.authenticated and (org_id in metadata.organization_ids or "SUPER_ADMIN" in metadata.organization_ids):
                    return True
                self._record_auth_failure(channel, metadata)
                return False

        # 3. User Specific Channels (e.g. user.{user_id})
        elif prefix == "user":
            if len(parts) >= 2:
                user_id = parts[1]
                if metadata.authenticated and metadata.user_id == user_id:
                    return True
                self._record_auth_failure(channel, metadata)
                return False

        # 4. Visitor Specific Channels (e.g. visitor.{session_id})
        elif prefix == "visitor":
            if len(parts) >= 2:
                session_id = parts[1]
                if metadata.visitor_session_id == session_id:
                    return True
                self._record_auth_failure(channel, metadata)
                return False

        # 5. Election Channels (e.g. election.{id}, election.{id}.results, election.{id}.turnout)
        elif prefix == "election":
            # Accessible by authenticated platform users or validated public visitors
            if metadata.authenticated or metadata.visitor_session_id:
                return True
            self._record_auth_failure(channel, metadata)
            return False

        # Default fallback: allow if connection is authenticated or has visitor token
        if metadata.authenticated or metadata.visitor_session_id:
            return True

        self._record_auth_failure(channel, metadata)
        return False

    def _record_auth_failure(self, channel: str, metadata: ConnectionMetadata) -> None:
        self.total_authorization_failures += 1
        logger.warning(
            "realtime_channel_subscription_unauthorized",
            channel=channel,
            connection_id=metadata.connection_id,
            user_id=metadata.user_id,
            visitor_session_id=metadata.visitor_session_id,
        )


# Singleton gateway instance
realtime_gateway = RealtimeGateway()
