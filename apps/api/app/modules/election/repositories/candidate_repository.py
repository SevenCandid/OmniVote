from typing import List, Optional
import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.candidate import ElectionCandidate

class CandidateRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_category(self, category_id: uuid.UUID) -> List[ElectionCandidate]:
        result = await self.db.execute(
            select(ElectionCandidate)
            .filter(ElectionCandidate.election_category_id == category_id, ElectionCandidate.is_deleted == False)
            .order_by(ElectionCandidate.candidate_number.asc())
        )
        return list(result.scalars().all())

    async def get_by_election(self, election_id: uuid.UUID) -> List[ElectionCandidate]:
        from app.modules.election.models.category import ElectionCategory
        stmt = (
            select(ElectionCandidate)
            .join(ElectionCategory)
            .where(ElectionCategory.election_id == election_id)
            .where(ElectionCandidate.is_deleted == False)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, category_id: uuid.UUID, candidate_id: uuid.UUID) -> Optional[ElectionCandidate]:
        result = await self.db.execute(
            select(ElectionCandidate)
            .filter(
                ElectionCandidate.id == candidate_id,
                ElectionCandidate.election_category_id == category_id,
                ElectionCandidate.is_deleted == False
            )
        )
        return result.scalars().first()

    async def create(self, candidate: ElectionCandidate) -> ElectionCandidate:
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate

    async def get_max_candidate_number(self, category_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.max(ElectionCandidate.candidate_number))
            .filter(ElectionCandidate.election_category_id == category_id, ElectionCandidate.is_deleted == False)
        )
        val = result.scalar()
        return val if val is not None else 0

    async def check_candidate_number_exists(self, category_id: uuid.UUID, candidate_number: int, exclude_candidate_id: Optional[uuid.UUID] = None) -> bool:
        query = select(ElectionCandidate).filter(
            ElectionCandidate.election_category_id == category_id,
            ElectionCandidate.candidate_number == candidate_number,
            ElectionCandidate.is_deleted == False
        )
        if exclude_candidate_id:
            query = query.filter(ElectionCandidate.id != exclude_candidate_id)
        
        result = await self.db.execute(query.limit(1))
        return result.scalars().first() is not None

    async def bulk_update_numbers(self, updates: dict[uuid.UUID, int]) -> None:
        """
        Updates multiple candidate numbers. `updates` is a mapping from candidate_id to new candidate_number.
        """
        if not updates:
            return
        
        candidates_result = await self.db.execute(
            select(ElectionCandidate).filter(ElectionCandidate.id.in_(updates.keys()))
        )
        candidates = candidates_result.scalars().all()
        
        # To avoid temporary unique constraint violations (if DB enforces it), we might need to 
        # do this safely depending on the DB schema. But currently we don't have a hard DB unique constraint 
        # (relying on app logic), so we can just update them.
        for candidate in candidates:
            candidate.candidate_number = updates[candidate.id]
            
        await self.db.flush()
