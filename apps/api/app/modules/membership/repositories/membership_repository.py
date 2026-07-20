import uuid
from typing import Sequence
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.membership.models.membership import Membership
from app.models.organization import Organization

class MembershipRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_membership(self, membership: Membership) -> Membership:
        self.session.add(membership)
        await self.session.commit()
        await self.session.refresh(membership)
        return await self.get_membership_by_id(membership.id)

    async def get_membership_by_id(self, membership_id: uuid.UUID) -> Membership | None:
        query = (
            select(Membership)
            .options(selectinload(Membership.organization), selectinload(Membership.user))
            .where(Membership.id == membership_id)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_membership_by_user_and_org(
        self, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> Membership | None:
        query = (
            select(Membership)
            .options(selectinload(Membership.organization), selectinload(Membership.user))
            .where(
                and_(
                    Membership.user_id == user_id,
                    Membership.organization_id == organization_id
                )
            )
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_user_memberships(self, user_id: uuid.UUID) -> Sequence[Membership]:
        from app.modules.membership.models.membership import MembershipStatus
        query = (
            select(Membership)
            .join(Organization, Organization.id == Membership.organization_id)
            .options(selectinload(Membership.organization))
            .where(
                and_(
                    Membership.user_id == user_id,
                    Organization.is_deleted.is_(False),
                    Membership.status != MembershipStatus.REMOVED
                )
            )
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_organization_memberships(self, org_id: uuid.UUID) -> Sequence[Membership]:
        from app.modules.membership.models.membership import MembershipStatus
        query = (
            select(Membership)
            .options(selectinload(Membership.organization), selectinload(Membership.user))
            .where(
                and_(
                    Membership.organization_id == org_id,
                    Membership.status != MembershipStatus.REMOVED
                )
            )
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_membership(self, membership: Membership) -> Membership:
        self.session.add(membership)
        await self.session.commit()
        await self.session.refresh(membership)
        return await self.get_membership_by_id(membership.id)
