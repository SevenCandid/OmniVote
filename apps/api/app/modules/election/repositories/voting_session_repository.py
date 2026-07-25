import uuid
import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.election.models.voting_session import VotingSession, VotingSelection, VotingSessionStatus

class VotingSessionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, session: VotingSession) -> VotingSession:
        self.db.add(session)
        await self.db.flush()
        return session
    async def get_by_id_with_selections(self, session_id: uuid.UUID) -> VotingSession | None:
        stmt = (
            select(VotingSession)
            .options(selectinload(VotingSession.selections))
            .where(VotingSession.id == session_id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def update(self, session_id: uuid.UUID, data: dict) -> None:
        from sqlalchemy import update as sa_update
        stmt = sa_update(VotingSession).where(VotingSession.id == session_id).values(**data)
        await self.db.execute(stmt)
        await self.db.flush()
    
    async def mark_expired_sessions(self) -> int:
        """Mark sessions as expired if their expires_at has passed and they are still ACTIVE."""
        # We can implement this with an update statement, or loop through.
        # For simplicity, returning 0 for now as it will be implemented via service layer updates if needed.
        return 0

    async def get_active_session_for_user(self, election_id: uuid.UUID, user_id: uuid.UUID) -> VotingSession | None:
        stmt = (
            select(VotingSession)
            .options(selectinload(VotingSession.selections))
            .where(VotingSession.election_id == election_id)
            .where(VotingSession.user_id == user_id)
            .where(VotingSession.status == VotingSessionStatus.ACTIVE)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_active_session_for_identifier(self, election_id: uuid.UUID, identifier: str) -> VotingSession | None:
        stmt = (
            select(VotingSession)
            .options(selectinload(VotingSession.selections))
            .where(VotingSession.election_id == election_id)
            .where(VotingSession.voter_identifier == identifier)
            .where(VotingSession.status == VotingSessionStatus.ACTIVE)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()


class VotingSelectionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, selection: VotingSelection) -> VotingSelection:
        self.db.add(selection)
        await self.db.flush()
        return selection
        
    async def delete(self, selection_id: uuid.UUID) -> None:
        from sqlalchemy import delete as sa_delete
        stmt = sa_delete(VotingSelection).where(VotingSelection.id == selection_id)
        await self.db.execute(stmt)
        await self.db.flush()
    async def get_selections_for_session(self, session_id: uuid.UUID) -> list[VotingSelection]:
        stmt = select(VotingSelection).where(VotingSelection.session_id == session_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def clear_selections_for_category(self, session_id: uuid.UUID, category_id: uuid.UUID) -> None:
        # Note: In SQLAlchemy 2.0 async, bulk deletes require careful execution.
        # This implementation deletes one by one or we can build an delete stmt.
        stmt = select(VotingSelection).where(
            VotingSelection.session_id == session_id,
            VotingSelection.category_id == category_id
        )
        result = await self.db.execute(stmt)
        for selection in result.scalars().all():
            await self.db.delete(selection)
        await self.db.flush()
