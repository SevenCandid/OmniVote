import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.organization import Organization


class OrganizationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, organization_id: uuid.UUID) -> Organization | None:
        """Fetch organization by ID with all 1:1 relations eager loaded."""
        stmt = (
            select(Organization)
            .options(
                selectinload(Organization.settings),
                selectinload(Organization.branding),
                selectinload(Organization.subscription),
            )
            .where(Organization.id == organization_id, Organization.is_deleted == False)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Organization | None:
        """Fetch organization by slug to enforce uniqueness."""
        stmt = select(Organization).where(Organization.slug == slug, Organization.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_organizations(
        self, skip: int = 0, limit: int = 100, status: str | None = None
    ) -> Sequence[Organization]:
        """List active organizations with optional filters."""
        stmt = (
            select(Organization)
            .where(Organization.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        if status:
            stmt = stmt.where(Organization.status == status)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, organization: Organization) -> Organization:
        """Insert a new organization and flush to get ID."""
        self.session.add(organization)
        await self.session.flush()
        return organization

    async def update(self, organization: Organization) -> Organization:
        """Commit changes to an existing organization."""
        self.session.add(organization)
        await self.session.flush()
        return organization
