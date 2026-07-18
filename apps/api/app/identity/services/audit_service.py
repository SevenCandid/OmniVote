import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.identity.models.security import SecurityEvent


class AuditService:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        event_type: str,
        user_id: uuid.UUID | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        metadata_payload: dict | None = None,
    ) -> SecurityEvent:
        """
        Record a security or authentication event in the audit log.
        """
        event = SecurityEvent(
            user_id=user_id,
            event_type=event_type,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata_payload=metadata_payload,
        )
        db.add(event)
        await db.commit()
        await db.refresh(event)
        return event
