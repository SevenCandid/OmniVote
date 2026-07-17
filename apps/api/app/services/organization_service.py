import uuid
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.exceptions import ConflictException, NotFoundException
from app.models.organization import (
    Organization,
    OrganizationBranding,
    OrganizationSettings,
    OrganizationStatus,
    OrganizationSubscription,
)
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.utils.time import utc_now


class OrganizationService:
    def __init__(self, session: AsyncSession):
        self.repository = OrganizationRepository(session)
        self.session = session

    async def create_organization(self, org_data: OrganizationCreate) -> Organization:
        """Creates an organization along with its default 1:1 relations."""
        # 1. Check for slug uniqueness
        existing_org = await self.repository.get_by_slug(org_data.slug)
        if existing_org:
            raise ConflictException(message="Organization slug is already in use.")

        # 2. Create the core organization
        organization = Organization(
            **org_data.model_dump(),
            status=OrganizationStatus.PENDING_VERIFICATION
        )
        
        # 3. Create default 1:1 relations attached to it
        organization.settings = OrganizationSettings()
        organization.branding = OrganizationBranding()
        organization.subscription = OrganizationSubscription()

        # 4. Save to DB
        created_org = await self.repository.create(organization)
        
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
