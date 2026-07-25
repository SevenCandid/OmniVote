from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.category import ElectionCategory


class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_election(self, election_id: uuid.UUID) -> List[ElectionCategory]:
        result = await self.db.execute(
            select(ElectionCategory)
            .filter(ElectionCategory.election_id == election_id, ElectionCategory.is_deleted == False)
            .order_by(ElectionCategory.display_order.asc(), ElectionCategory.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, election_id: uuid.UUID, category_id: uuid.UUID) -> Optional[ElectionCategory]:
        result = await self.db.execute(
            select(ElectionCategory)
            .filter(
                ElectionCategory.id == category_id,
                ElectionCategory.election_id == election_id,
                ElectionCategory.is_deleted == False
            )
        )
        return result.scalars().first()

    async def create(self, category: ElectionCategory) -> ElectionCategory:
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        return category

    async def get_max_display_order(self, election_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(ElectionCategory.display_order)
            .filter(ElectionCategory.election_id == election_id, ElectionCategory.is_deleted == False)
            .order_by(ElectionCategory.display_order.desc())
            .limit(1)
        )
        val = result.scalar_one_or_none()
        return val if val is not None else -1
