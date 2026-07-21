import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.modules.support.models.support import SupportRequest, SupportSession, SupportRequestStatus, SessionStatus


class SupportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_support_request(self, request: SupportRequest) -> SupportRequest:
        self.db.add(request)
        await self.db.flush()
        return request

    async def get_support_request_by_id(self, request_id: uuid.UUID) -> SupportRequest | None:
        result = await self.db.execute(select(SupportRequest).where(SupportRequest.id == request_id))
        return result.scalar_one_or_none()

    async def list_support_requests_by_org(self, organization_id: uuid.UUID) -> Sequence[SupportRequest]:
        result = await self.db.execute(
            select(SupportRequest)
            .where(SupportRequest.organization_id == organization_id)
            .order_by(SupportRequest.created_at.desc())
        )
        return result.scalars().all()

    async def list_support_sessions_by_org(self, organization_id: uuid.UUID) -> Sequence[SupportSession]:
        result = await self.db.execute(
            select(SupportSession)
            .where(SupportSession.organization_id == organization_id)
            .order_by(SupportSession.created_at.desc())
        )
        return result.scalars().all()

    async def list_all_support_requests(self) -> Sequence[SupportRequest]:
        result = await self.db.execute(
            select(SupportRequest).order_by(SupportRequest.created_at.desc())
        )
        return result.scalars().all()

    async def create_support_session(self, session: SupportSession) -> SupportSession:
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_support_session_by_id(self, session_id: uuid.UUID) -> SupportSession | None:
        result = await self.db.execute(select(SupportSession).where(SupportSession.id == session_id))
        return result.scalar_one_or_none()

    async def get_active_session_for_user_and_org(
        self, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> SupportSession | None:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(SupportSession)
            .where(
                SupportSession.platform_user_id == user_id,
                SupportSession.organization_id == organization_id,
                SupportSession.status == SessionStatus.ACTIVE,
                SupportSession.expires_at > now
            )
        )
        return result.scalar_one_or_none()

    async def list_all_support_sessions(self) -> Sequence[SupportSession]:
        result = await self.db.execute(
            select(SupportSession).order_by(SupportSession.created_at.desc())
        )
        return result.scalars().all()

    async def update_support_request(self, request: SupportRequest) -> SupportRequest:
        await self.db.flush()
        return request

    async def update_support_session(self, session: SupportSession) -> SupportSession:
        await self.db.flush()
        return session
