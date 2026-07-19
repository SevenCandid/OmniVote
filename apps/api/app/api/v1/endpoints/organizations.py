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
) -> Sequence[OrganizationResponse]:
    """
    Retrieve all active organizations.
    """
    service = OrganizationService(db)
    return await service.list_organizations(skip=skip, limit=limit)


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


@router.patch("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: uuid.UUID,
    org_in: OrganizationUpdate,
    db: AsyncSession = Depends(get_db_session),
) -> OrganizationResponse:
    """
    Update an organization's core profile fields.
    """
    service = OrganizationService(db)
    return await service.update_organization(org_id, org_in)


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Soft delete an organization.
    """
    service = OrganizationService(db)
    await service.delete_organization(org_id)


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
