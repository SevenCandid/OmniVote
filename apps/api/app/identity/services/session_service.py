import uuid
import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.identity.models.session import Session
from app.identity.security.password import generate_secure_token, get_password_hash
from app.core.config import settings


class SessionService:
    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: uuid.UUID,
        device_information: str | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> tuple[Session, str]:
        """
        Create a new session and generate a secure refresh token.
        Returns the Session model and the raw plaintext refresh token.
        """
        raw_token = generate_secure_token(64)
        token_hash = get_password_hash(raw_token)
        
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
        
        session = Session(
            user_id=user_id,
            refresh_token_hash=token_hash,
            device_information=device_information,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        
        return session, raw_token

    @staticmethod
    async def revoke_session(db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Revoke a specific session."""
        stmt = select(Session).where(Session.id == session_id, Session.user_id == user_id, Session.revoked_at.is_(None))
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
            
        session.revoked_at = datetime.datetime.now(datetime.timezone.utc)
        await db.commit()
