import uuid
import datetime
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.election.models.voting_session import VisitorSession

class VisitorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_visitor_session_by_token(self, token: str) -> VisitorSession | None:
        stmt = select(VisitorSession).where(
            VisitorSession.visitor_token == token,
            VisitorSession.expires_at > datetime.datetime.utcnow()
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_visitor_session(self, election_id: uuid.UUID, ip_address: str | None = None, user_agent: str | None = None) -> VisitorSession:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=7) # 7 days
        
        session = VisitorSession(
            election_id=election_id,
            visitor_token=token,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at
        )
        
        self.db.add(session)
        await self.db.flush()
        return session
