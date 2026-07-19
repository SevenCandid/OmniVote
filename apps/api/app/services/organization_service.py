import uuid
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.exceptions import ConflictException, NotFoundException
from app.models.organization import (
    Organization,
    OrganizationBranding,
    OrganizationSettings,
    OrganizationStatus,
    OrganizationVerificationStatus,
    OrganizationSubscription,
)
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, TransferOwnershipRequest
from app.utils.time import utc_now
from app.modules.membership.models.membership import Membership, MembershipStatus
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.modules.rbac.repositories.rbac_repository import RBACRepository
from app.modules.rbac.models.rbac import MembershipRole
from app.identity.services.audit_service import AuditService


class OrganizationService:
    def __init__(self, session: AsyncSession):
        self.repository = OrganizationRepository(session)
        self.session = session

    async def create_organization(self, org_data: OrganizationCreate, current_user_id: uuid.UUID) -> Organization:
        """Creates an organization along with its default 1:1 relations and assigns Owner role."""
        # 1. Check for slug uniqueness
        existing_org = await self.repository.get_by_slug(org_data.slug)
        if existing_org:
            raise ConflictException(message="Organization slug is already in use.")

        # 2. Create the core organization
        org_dict = org_data.model_dump()
        if org_dict.get("website"):
            org_dict["website"] = str(org_dict["website"])
            
        organization = Organization(
            **org_dict,
            status=OrganizationStatus.ACTIVE,
            verification_status=OrganizationVerificationStatus.UNVERIFIED
        )
        
        # 3. Create default 1:1 relations attached to it
        organization.settings = OrganizationSettings()
        organization.branding = OrganizationBranding()
        organization.subscription = OrganizationSubscription()

        # 4. Save to DB
        created_org = await self.repository.create(organization)
        
        # 5. Create Membership for creator
        membership_repo = MembershipRepository(self.session)
        membership = Membership(
            user_id=current_user_id,
            organization_id=created_org.id,
            status=MembershipStatus.ACCEPTED,
            accepted_at=utc_now()
        )
        created_membership = await membership_repo.create_membership(membership)
        
        # 6. Assign Owner role
        rbac_repo = RBACRepository(self.session)
        owner_role = await rbac_repo.get_role_by_name("Owner", None)
        if owner_role:
            membership_role = MembershipRole(
                membership_id=created_membership.id,
                role_id=owner_role.id,
                assigned_by=current_user_id
            )
            await rbac_repo.assign_role_to_membership(membership_role)
        
        # Wait for commit outside this layer typically, but we flush here
        await self.session.commit()
        
        return created_org

    async def get_organization(self, org_id: uuid.UUID) -> Organization:
        """Fetch organization or raise 404."""
        org = await self.repository.get_by_id(org_id)
        if not org:
            raise NotFoundException(message="Organization not found")
        return org

    async def list_organizations(self, skip: int = 0, limit: int = 100) -> Sequence[Organization]:
        """List active organizations."""
        return await self.repository.list_organizations(skip=skip, limit=limit)

    async def update_organization(self, org_id: uuid.UUID, org_data: OrganizationUpdate) -> Organization:
        """Partially update an organization."""
        org = await self.get_organization(org_id)
        
        update_data = org_data.model_dump(exclude_unset=True)
        
        if "website" in update_data and update_data["website"]:
            update_data["website"] = str(update_data["website"])
        
        if "slug" in update_data and update_data["slug"] != org.slug:
            existing_org = await self.repository.get_by_slug(update_data["slug"])
            if existing_org:
                raise ConflictException(message="Organization slug is already in use.")
                
        for field, value in update_data.items():
            setattr(org, field, value)
            
        updated_org = await self.repository.update(org)
        await self.session.commit()
        
        return updated_org

    async def delete_organization(self, org_id: uuid.UUID) -> None:
        """Soft delete the organization."""
        org = await self.get_organization(org_id)
        
        org.is_deleted = True
        org.deleted_at = utc_now()
        
        await self.repository.update(org)
        await self.session.commit()

    async def transfer_ownership(self, org_id: uuid.UUID, current_user_id: uuid.UUID, transfer_data: TransferOwnershipRequest) -> None:
        """Transfers ownership from the current user to the target membership."""
        from app.exceptions.exceptions import ForbiddenException
        
        membership_repo = MembershipRepository(self.session)
        rbac_repo = RBACRepository(self.session)
        audit_service = AuditService()
        
        # Verify requester is active member
        requester_membership = await membership_repo.get_membership_by_user_and_org(current_user_id, org_id)
        if not requester_membership or requester_membership.status != MembershipStatus.ACCEPTED:
            raise ForbiddenException(message="You are not an active member of this organization")
            
        # Verify requester is Owner
        requester_roles = await rbac_repo.list_membership_roles(requester_membership.id)
        if not any(r.name == "Owner" and r.is_system for r in requester_roles):
            raise ForbiddenException(message="You do not have permission to transfer ownership")
            
        # Verify target membership is active
        target_membership = await membership_repo.get_membership_by_id(transfer_data.target_membership_id)
        if not target_membership or target_membership.organization_id != org_id:
            raise NotFoundException(message="Target membership not found in this organization")
        if target_membership.status != MembershipStatus.ACCEPTED:
            raise ConflictException(message="Target membership must be an active member to receive ownership")
            
        # Assign Owner to target
        owner_role = await rbac_repo.get_role_by_name("Owner", None)
        if not owner_role:
            raise ConflictException(message="System Owner role not found")
            
        target_roles = await rbac_repo.list_membership_roles(target_membership.id)
        if not any(r.id == owner_role.id for r in target_roles):
            await rbac_repo.assign_role_to_membership(MembershipRole(
                membership_id=target_membership.id,
                role_id=owner_role.id,
                assigned_by=current_user_id
            ))
            
        # Remove Owner from requester
        await rbac_repo.remove_role_from_membership(requester_membership.id, owner_role.id)
        
        # Verify minimum 1 owner invariant holds
        owner_count = await rbac_repo.count_owners_in_organization(org_id)
        if owner_count == 0:
            raise ConflictException(message="Operation would leave the organization without an Owner")
            
        await audit_service.log_event(
            db=self.session,
            event_type="OwnershipTransferred",
            user_id=current_user_id,
            metadata_payload={
                "organization_id": str(org_id),
                "from_membership_id": str(requester_membership.id),
                "to_membership_id": str(target_membership.id)
            }
        )
        
        await self.session.commit()

