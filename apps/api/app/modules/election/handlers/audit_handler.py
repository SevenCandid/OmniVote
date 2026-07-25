import logging
from app.core.events.base import EventHandler
from app.modules.election.events import BallotSubmitted
from app.database.session import async_session_factory
from app.identity.models.security import SecurityEvent

logger = logging.getLogger(__name__)

class AuditEventHandler(EventHandler[BallotSubmitted]):
    async def handle(self, event: BallotSubmitted) -> None:
        logger.info(f"AuditEventHandler processing event {event.event_id}")
        try:
            async with async_session_factory() as session:
                audit_log = SecurityEvent(
                    event_type="ballot_submitted",
                    metadata_payload={
                        "election_id": str(event.election_id),
                        "ballot_reference": event.ballot_reference,
                        "voting_session_id": str(event.voting_session_id),
                        "ballot_schema_version": event.ballot_schema_version,
                        "voting_engine_version": event.voting_engine_version,
                    }
                )
                session.add(audit_log)
                await session.commit()
        except Exception as e:
            logger.error(f"Failed to record audit log for ballot {event.ballot_reference}: {e}")
            raise
