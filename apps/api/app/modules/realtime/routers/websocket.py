import asyncio
import datetime
import json
import uuid
import structlog
from typing import Optional
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.session import get_db
from app.identity.security.jwt import decode_access_token
from app.modules.election.services.visitor_service import VisitorService
from app.modules.realtime.connections.manager import connection_manager
from app.modules.realtime.connections.metadata import ConnectionMetadata
from app.modules.realtime.gateway.gateway import realtime_gateway

logger = structlog.get_logger(__name__)

router = APIRouter()


async def authenticate_websocket(
    websocket: WebSocket,
    token: Optional[str] = None,
    visitor_token: Optional[str] = None,
    db: Optional[AsyncSession] = None,
) -> Optional[ConnectionMetadata]:
    """
    Strict authentication check for incoming WebSockets.
    Rejects unauthenticated connections immediately.
    Supports JWT Access Tokens (Platform Users) and Visitor Tokens (Anonymous Visitors).
    """
    client_ip = websocket.client.host if websocket.client else None
    user_agent = websocket.headers.get("user-agent")

    ip_hash = ConnectionMetadata.hash_string(client_ip)
    ua_hash = ConnectionMetadata.hash_string(user_agent)
    conn_id = str(uuid.uuid4())

    # 1. Authenticate Platform User via JWT Token
    if token:
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            org_id = payload.get("organization_id")
            role = payload.get("role", "MEMBER")

            org_set = set()
            if org_id:
                org_set.add(str(org_id))
            if role == "SUPER_ADMIN":
                org_set.add("SUPER_ADMIN")

            metadata = ConnectionMetadata(
                connection_id=conn_id,
                connection_type="user",
                authenticated=True,
                authentication_method="jwt",
                user_id=str(user_id) if user_id else None,
                organization_ids=org_set,
                ip_hash=ip_hash,
                user_agent_hash=ua_hash,
            )
            return metadata
        except Exception as e:
            logger.warning("realtime_jwt_auth_failed", error=str(e))
            return None

    # 2. Authenticate Anonymous Visitor via Visitor Token
    if visitor_token and db:
        try:
            visitor_service = VisitorService(db)
            session = await visitor_service.get_visitor_session_by_token(visitor_token)
            if session:
                metadata = ConnectionMetadata(
                    connection_id=conn_id,
                    connection_type="visitor",
                    authenticated=True,
                    authentication_method="visitor_token",
                    visitor_session_id=str(session.id),
                    active_election_ids={str(session.election_id)},
                    ip_hash=ip_hash,
                    user_agent_hash=ua_hash,
                )
                return metadata
        except Exception as e:
            logger.warning("realtime_visitor_auth_failed", error=str(e))
            return None

    # Unauthenticated connection
    return None


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    visitor_token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Main WebSocket endpoint for OmniVote real-time client connections.
    Enforces mandatory authentication (JWT or Visitor Token).
    """
    await websocket.accept()

    # Perform mandatory authentication check
    metadata = await authenticate_websocket(websocket, token=token, visitor_token=visitor_token, db=db)
    if not metadata:
        logger.warning("realtime_unauthenticated_connection_rejected")
        # 4001: Unauthorized WS close code
        await websocket.send_json({"type": "error", "message": "Authentication required. Valid JWT or Visitor Token must be provided."})
        await websocket.close(code=4001)
        return

    # Register connection with ConnectionManager
    await connection_manager.connect(websocket, metadata)

    # Send initial connection acknowledgment
    await websocket.send_json({
        "type": "connection_ack",
        "connection_id": metadata.connection_id,
        "connection_type": metadata.connection_type,
        "authenticated": True,
        "server_time": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    })

    try:
        while True:
            raw_message = await websocket.receive_text()
            try:
                msg = json.loads(raw_message)
            except Exception:
                await websocket.send_json({"type": "error", "message": "Invalid JSON format"})
                continue

            msg_type = msg.get("type")

            # Handle Heartbeat Ping
            if msg_type == "ping":
                await connection_manager.record_heartbeat(metadata.connection_id)
                await websocket.send_json({"type": "pong", "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()})

            # Handle Channel Subscription
            elif msg_type == "subscribe":
                channel = msg.get("channel")
                if not channel:
                    await websocket.send_json({"type": "error", "message": "Missing channel attribute"})
                    continue

                # Authorize channel subscription
                is_authorized = await realtime_gateway.authorize_subscription(metadata, channel)
                if is_authorized:
                    await connection_manager.subscribe(metadata.connection_id, channel)
                    presence = await connection_manager.get_presence(channel)
                    await websocket.send_json({
                        "type": "subscribed",
                        "channel": channel,
                        "presence": presence,
                    })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "channel": channel,
                        "message": f"Unauthorized subscription attempt to channel '{channel}'",
                    })

            # Handle Channel Unsubscription
            elif msg_type == "unsubscribe":
                channel = msg.get("channel")
                if channel:
                    await connection_manager.unsubscribe(metadata.connection_id, channel)
                    await websocket.send_json({"type": "unsubscribed", "channel": channel})

    except WebSocketDisconnect:
        logger.info("realtime_client_disconnected_normally", connection_id=metadata.connection_id)
    except Exception as e:
        logger.error("realtime_websocket_error", connection_id=metadata.connection_id, error=str(e))
    finally:
        await connection_manager.disconnect(metadata.connection_id)


@router.get("/metrics")
async def get_realtime_metrics():
    """
    Expose realtime connectivity and broadcast metrics.
    """
    conn_metrics = await connection_manager.get_metrics()
    return {
        "status": "success",
        "connection_metrics": conn_metrics,
        "gateway_metrics": {
            "total_published_events": realtime_gateway.total_published_events,
            "total_authorization_failures": realtime_gateway.total_authorization_failures,
        },
    }
