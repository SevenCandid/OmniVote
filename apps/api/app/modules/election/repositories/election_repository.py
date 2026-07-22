import uuid
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.modules.election.models.election import Election


class ElectionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, election: Election) -> Election:
        self.db.add(election)
        await self.db.flush()
        return election

    async def get_by_id(self, election_id: uuid.UUID) -> Optional[Election]:
        stmt = select(Election).where(
            Election.id == election_id,
            Election.is_deleted == False
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
        
    async def get_by_id_and_org(self, election_id: uuid.UUID, organization_id: uuid.UUID) -> Optional[Election]:
        stmt = select(Election).where(
            Election.id == election_id,
            Election.organization_id == organization_id,
            Election.is_deleted == False
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, organization_id: uuid.UUID, slug: str) -> Optional[Election]:
        stmt = select(Election).where(
            Election.organization_id == organization_id,
            Election.slug == slug,
            Election.is_deleted == False
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_organization(self, organization_id: uuid.UUID, skip: int = 0, limit: int = 50) -> Tuple[List[Election], int]:
        base_stmt = select(Election).where(
            Election.organization_id == organization_id,
            Election.is_deleted == False
        )

        total_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self.db.execute(total_stmt)
        total = total_result.scalar_one()

        items_stmt = base_stmt.order_by(Election.created_at.desc()).offset(skip).limit(limit)
        items_result = await self.db.execute(items_stmt)
        items = items_result.scalars().all()

        return list(items), total

    async def update(self, election: Election) -> Election:
        self.db.add(election)
        await self.db.flush()
        return election

    async def soft_delete(self, election: Election) -> Election:
        self.db.add(election)
        await self.db.flush()
        return election
