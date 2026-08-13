import datetime
import structlog
from app.core.events.base import Event
from app.modules.election.events import BallotSubmitted
from app.modules.realtime.gateway.gateway import realtime_gateway
from app.modules.realtime.schemas.events import (
    BallotSubmittedRealtimePayload,
    ElectionStateChangedPayload,
    PaymentCompletedRealtimePayload,
)

logger = structlog.get_logger(__name__)


class BallotSubmittedRealtimeHandler:
    """
    Translates core domain BallotSubmitted events into WebSocket realtime broadcasts.
    """

    async def handle(self, event: BallotSubmitted) -> None:
        try:
            election_id_str = str(event.election_id)
            channel = f"election.{election_id_str}.results"
            
            payload = BallotSubmittedRealtimePayload(
                election_id=election_id_str,
                timestamp=event.occurred_at.isoformat(),
                anonymous=True,
            )

            await realtime_gateway.broadcast_event(
                event_name="BallotSubmitted",
                channel=channel,
                scope="election",
                payload=payload.model_dump(),
                event_version=1,
            )
            
            # Also notify election turnout channel
            turnout_channel = f"election.{election_id_str}.turnout"
            await realtime_gateway.broadcast_event(
                event_name="TurnoutUpdated",
                channel=turnout_channel,
                scope="election",
                payload={"election_id": election_id_str, "timestamp": event.occurred_at.isoformat()},
                event_version=1,
            )
        except Exception as e:
            logger.error("realtime_ballot_submitted_handler_error", error=str(e))


class GenericRealtimeHandler:
    """
    Generic handler for domain events broadcast to real-time subscribers.
    """

    async def handle(self, event: Event) -> None:
        try:
            event_name = event.event_name
            if hasattr(event, "election_id") and event.election_id:
                channel = f"election.{event.election_id}"
                await realtime_gateway.broadcast_event(
                    event_name=event_name,
                    channel=channel,
                    scope="election",
                    payload=event.model_dump(mode="json"),
                    event_version=1,
                )
        except Exception as e:
            logger.error("realtime_generic_handler_error", event=event.event_name, error=str(e))


# Instantiate singleton handlers
ballot_submitted_realtime_handler = BallotSubmittedRealtimeHandler()
generic_realtime_handler = GenericRealtimeHandler()
