import uuid
from typing import List
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.identity.models.security import SecurityEvent
from app.modules.election.schemas.audit import ElectionAuditLogEntry

class AuditLogService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_election_audit_logs(self, election_id: uuid.UUID, limit: int = 100) -> List[ElectionAuditLogEntry]:
        """
        Retrieves the audit logs for a specific election.
        We filter SecurityEvents where metadata_payload contains 'election_id'.
        """
        # In SQLAlchemy, querying JSON cross-db can be tricky. 
        # A robust cross-DB way for this simple case is to cast to string and search, 
        # or use JSON path. Let's try the generic string match for robustness across SQLite/PG.
        # Alternatively, we can just fetch recent events and filter in Python if the volume is small,
        # but a like query is more efficient.
        
        # We will look for the election UUID string in the JSON payload.
        # This handles both Postgres JSONB and SQLite JSON/String.
        search_term = f"%{str(election_id)}%"
        
        stmt = (
            select(SecurityEvent)
            .where(
                # Cast the JSON column to string to use LIKE
                SecurityEvent.metadata_payload.cast(select().column('text').type).like(search_term) 
                if self.db.bind and self.db.bind.dialect.name != 'postgresql' 
                else SecurityEvent.metadata_payload.cast(select().column('text').type).like(search_term) # We'll just use CAST to string for simplicity
            )
            .order_by(desc(SecurityEvent.created_at))
            .limit(limit)
        )
        
        # A simpler approach that works across dialects:
        # Cast the JSON column to a string/varchar explicitly.
        from sqlalchemy import String, cast
        stmt = (
            select(SecurityEvent)
            .where(cast(SecurityEvent.metadata_payload, String).like(search_term))
            .order_by(desc(SecurityEvent.created_at))
            .limit(limit)
        )
        
        result = await self.db.execute(stmt)
        events = result.scalars().all()
        
        logs = []
        for event in events:
            # Double check in python since LIKE can be greedy
            if event.metadata_payload and event.metadata_payload.get("election_id") == str(election_id):
                logs.append(
                    ElectionAuditLogEntry(
                        id=event.id,
                        event_type=event.event_type,
                        ip_address=event.ip_address,
                        user_agent=event.user_agent,
                        metadata_payload=event.metadata_payload,
                        created_at=event.created_at,
                    )
                )
        return logs
