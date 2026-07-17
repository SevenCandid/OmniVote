import uuid
from typing import Sequence

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.organization_service import OrganizationService

router = APIRouter()


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    """
    Create a new organization.
    Automatically generates default Settings, Branding, and Subscription records.
    """
    service = OrganizationService(db)
    return await service.create_organization(org_in)


@router.get("/", response_model=list[OrganizationResponse])
async def list_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> Sequence[OrganizationResponse]:
    """
    Retrieve all active organizations.
    """
    service = OrganizationService(db)
    return await service.list_organizations(skip=skip, limit=limit)


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
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
    db: AsyncSession = Depends(get_db),
) -> OrganizationResponse:
    """
    Update an organization's core profile fields.
    """
    service = OrganizationService(db)
    return await service.update_organization(org_id, org_in)


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Soft delete an organization.
    """
    service = OrganizationService(db)
    await service.delete_organization(org_id)
