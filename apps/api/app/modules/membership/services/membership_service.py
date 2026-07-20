import uuid
from datetime import datetime, timezone
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from app.identity.services.audit_service import AuditService
from app.modules.membership.models.membership import Membership, MembershipStatus
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.modules.membership.exceptions import (
    InvalidStateTransitionException,
    MembershipNotFoundException,
)
from app.exceptions.exceptions import ConflictException
from app.modules.rbac.repositories.rbac_repository import RBACRepository

class MembershipService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = MembershipRepository(session)
        self.audit_service = AuditService()

    async def _get_utc_now(self) -> datetime:
        return datetime.now(timezone.utc)

    async def remove_member(self, admin_user_id: uuid.UUID, org_id: uuid.UUID, membership_id: uuid.UUID) -> Membership:
        membership = await self.repository.get_membership_by_id(membership_id)
        if not membership or membership.organization_id != org_id:
            raise MembershipNotFoundException()

        if membership.status == MembershipStatus.REMOVED:
            return membership

        rbac_repo = RBACRepository(self.session)
        roles = await rbac_repo.list_membership_roles(membership_id)
        if any(r.name == "Owner" and r.is_system for r in roles):
            owner_count = await rbac_repo.count_owners_in_organization(org_id)
            if owner_count <= 1:
                raise ConflictException(message="Cannot remove the last Owner from the organization.")

        membership.status = MembershipStatus.REMOVED
        membership.removed_at = await self._get_utc_now()
        membership = await self.repository.update_membership(membership)

        await self.audit_service.log_event(
            db=self.session,
            event_type="membership_removed",
            user_id=admin_user_id,
            metadata_payload={
                "removed_user_id": str(membership.user_id),
                "organization_id": str(org_id),
                "membership_id": str(membership.id)
            }
        )

        return membership

    async def leave_organization(self, user_id: uuid.UUID, membership_id: uuid.UUID) -> Membership:
        membership = await self.repository.get_membership_by_id(membership_id)
        if not membership or membership.user_id != user_id:
            raise MembershipNotFoundException()

        if membership.status not in [MembershipStatus.ACCEPTED, MembershipStatus.SUSPENDED]:
            raise InvalidStateTransitionException("Cannot leave unless you are an active or suspended member.")

        rbac_repo = RBACRepository(self.session)
        roles = await rbac_repo.list_membership_roles(membership_id)
        if any(r.name == "Owner" and r.is_system for r in roles):
            owner_count = await rbac_repo.count_owners_in_organization(membership.organization_id)
            if owner_count <= 1:
                raise ConflictException(message="Cannot leave the organization because you are the last Owner. Transfer ownership first.")

        membership.status = MembershipStatus.REMOVED
        membership.removed_at = await self._get_utc_now()
        membership = await self.repository.update_membership(membership)

        await self.audit_service.log_event(
            db=self.session,
            event_type="user_left_organization",
            user_id=user_id,
            metadata_payload={
                "organization_id": str(membership.organization_id),
                "membership_id": str(membership.id)
            }
        )

        return membership

    async def get_user_organizations(self, user_id: uuid.UUID) -> Sequence[Membership]:
        return await self.repository.get_user_memberships(user_id)

    async def get_organization_members(self, org_id: uuid.UUID) -> Sequence[Membership]:
        return await self.repository.get_organization_memberships(org_id)
