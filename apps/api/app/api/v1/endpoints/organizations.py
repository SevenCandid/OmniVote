import uuid
from typing import Sequence

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
    TransferOwnershipRequest,
)
from app.services.organization_service import OrganizationService
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User

from app.modules.rbac.dependencies import RequirePermission

router = APIRouter()


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> OrganizationResponse:
    """
    Create a new organization.
    Automatically generates default Settings, Branding, and Subscription records.
    """
    service = OrganizationService(db)
    return await service.create_organization(org_in, current_user.id)


@router.get("/", response_model=list[OrganizationResponse])
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> Sequence[OrganizationResponse]:
    """
    Retrieve organizations the current user is a member of.
    """
    service = OrganizationService(db)
    return await service.list_user_organizations(current_user.id, skip=skip, limit=limit)


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
) -> OrganizationResponse:
    """
    Retrieve a specific organization by ID.
    """
    service = OrganizationService(db)
    return await service.get_organization(org_id)


@router.patch("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: uuid.UUID,
    org_in: OrganizationUpdate,
    membership=Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
) -> OrganizationResponse:
    """
    Update an organization's core profile fields.
    """
    service = OrganizationService(db)
    return await service.update_organization(organization_id, org_in)


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: uuid.UUID,
    membership=Depends(RequirePermission("organization.delete")),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Soft delete an organization.
    """
    service = OrganizationService(db)
    await service.delete_organization(organization_id)


@router.post("/{org_id}/transfer-ownership", status_code=status.HTTP_200_OK)
async def transfer_ownership(
    org_id: uuid.UUID,
    transfer_data: TransferOwnershipRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Transfer ownership of the organization to another member.
    """
    service = OrganizationService(db)
    await service.transfer_ownership(org_id, current_user.id, transfer_data)
    return {"message": "Ownership transferred successfully"}


@router.get("/{org_id}/my-permissions", response_model=list[str])
async def get_my_permissions(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get the effective permissions for the current user in this organization.
    """
    from fastapi import HTTPException
    from app.modules.membership.repositories.membership_repository import MembershipRepository
    from app.modules.rbac.repositories.rbac_repository import RBACRepository

    mem_repo = MembershipRepository(db)
    membership = await mem_repo.get_membership_by_user_and_org(current_user.id, org_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this organization")

    rbac_repo = RBACRepository(db)
    return await rbac_repo.get_all_permissions_for_membership(membership.id)
