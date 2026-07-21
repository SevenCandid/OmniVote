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

    async def list_user_organizations(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 100, status: str | None = None
    ) -> Sequence[Organization]:
        """List active organizations the user belongs to with optional filters."""
        from app.modules.membership.models.membership import Membership, MembershipStatus
        
        stmt = (
            select(Organization)
            .join(Membership, Membership.organization_id == Organization.id)
            .options(
                selectinload(Organization.settings),
                selectinload(Organization.branding),
                selectinload(Organization.subscription),
            )
            .where(
                Membership.user_id == user_id, 
                Organization.is_deleted == False,
                Membership.status.in_([MembershipStatus.ACCEPTED, MembershipStatus.SUSPENDED])
            )
            .offset(skip)
            .limit(limit)
        )
        if status:
            stmt = stmt.where(Organization.status == status)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_platform_organizations(
        self, skip: int = 0, limit: int = 100, search: str | None = None, status: str | None = None, verification_status: str | None = None
    ) -> tuple[int, Sequence[Organization]]:
        """List all organizations globally for platform administrators, with total count."""
        from sqlalchemy import func

        base_stmt = select(Organization).where(Organization.is_deleted == False)

        if search:
            search_pattern = f"%{search}%"
            base_stmt = base_stmt.where(Organization.name.ilike(search_pattern) | Organization.slug.ilike(search_pattern))

        if status:
            base_stmt = base_stmt.where(Organization.status == status)
            
        if verification_status:
            base_stmt = base_stmt.where(Organization.verification_status == verification_status)

        # Count total
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = await self.session.scalar(count_stmt) or 0

        # Fetch records
        stmt = (
            base_stmt
            .options(
                selectinload(Organization.settings),
                selectinload(Organization.branding),
                selectinload(Organization.subscription),
            )
            .order_by(Organization.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return total, result.scalars().all()

    async def get_organization_statistics(self, organization_id: uuid.UUID) -> dict:
        """Fetch statistics for an organization (e.g., member count)."""
        from sqlalchemy import func
        from app.modules.membership.models.membership import Membership, MembershipStatus
        
        member_count_stmt = (
            select(func.count(Membership.id))
            .where(
                Membership.organization_id == organization_id,
                Membership.status == MembershipStatus.ACCEPTED
            )
        )
        member_count = await self.session.scalar(member_count_stmt) or 0
        
        return {
            "member_count": member_count
        }

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
