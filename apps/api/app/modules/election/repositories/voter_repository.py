import uuid
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.database.repository import BaseRepository
from app.modules.election.models.voter import EligibleVoter, VoterGroup

class VoterRepository(BaseRepository[EligibleVoter]):
    def __init__(self, session: AsyncSession):
        super().__init__(EligibleVoter, session)

    async def get_by_identifier(self, election_id: uuid.UUID, identifier: str) -> EligibleVoter | None:
        stmt = select(EligibleVoter).where(
            and_(
                EligibleVoter.election_id == election_id,
                EligibleVoter.voter_identifier == identifier,
                EligibleVoter.is_deleted == False
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_by_election(self, election_id: uuid.UUID, skip: int = 0, limit: int = 50) -> tuple[list[EligibleVoter], int]:
        base_query = select(EligibleVoter).where(
            and_(
                EligibleVoter.election_id == election_id,
                EligibleVoter.is_deleted == False
            )
        )
        
        # Get total count
        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = await self.session.execute(count_stmt)
        total_count = total.scalar_one()

        # Get paginated items
        stmt = base_query.order_by(EligibleVoter.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total_count

    async def bulk_create(self, voters: list[EligibleVoter]) -> int:
        """
        Bulk inserts a list of voters. Note: Does not handle 'ON CONFLICT DO UPDATE'.
        Requires data to be pre-validated for duplicates.
        """
        self.session.add_all(voters)
        try:
            await self.session.commit()
            return len(voters)
        except IntegrityError:
            await self.session.rollback()
            raise
