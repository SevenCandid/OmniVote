import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.rbac.dependencies import RequirePlatformPermission

from app.schemas.platform_organization import (
    PlatformOrganizationListResponse,
    PlatformOrganizationResponse,
    PlatformOrganizationStatusUpdate,
    PlatformOrganizationVerificationUpdate,
)
from app.services.platform_organization_service import PlatformOrganizationService

router = APIRouter()

@router.get("/", response_model=PlatformOrganizationListResponse)
async def list_platform_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: str | None = None,
    org_status: str | None = Query(None, alias="status"),
    verification_status: str | None = None,
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("organization.manage")),
):
    """List all organizations across the platform."""
    service = PlatformOrganizationService(db)
    total, orgs = await service.list_organizations(skip, limit, search, org_status, verification_status)
    return PlatformOrganizationListResponse(
        items=orgs,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{org_id}", response_model=PlatformOrganizationResponse)
async def get_platform_organization(
    org_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("organization.manage")),
):
    """Get full details of a specific organization including statistics."""
    service = PlatformOrganizationService(db)
    return await service.get_organization_details(org_id)

@router.patch("/{org_id}/status", response_model=PlatformOrganizationResponse)
async def update_platform_organization_status(
    org_id: uuid.UUID,
    status_update: PlatformOrganizationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("organization.manage")),
):
    """Suspend or reactivate an organization."""
    service = PlatformOrganizationService(db)
    return await service.update_organization_status(org_id, status_update, current_user)

@router.patch("/{org_id}/verification-status", response_model=PlatformOrganizationResponse)
async def update_platform_organization_verification_status(
    org_id: uuid.UUID,
    verification_update: PlatformOrganizationVerificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("organization.verify")),
):
    """Approve, reject, or request more info for an organization."""
    service = PlatformOrganizationService(db)
    return await service.update_organization_verification_status(org_id, verification_update, current_user)

@router.get("/{org_id}/audit")
async def get_platform_organization_audit_history(
    org_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("organization.manage")),
):
    """Get recent audit events for an organization."""
    service = PlatformOrganizationService(db)
    return await service.get_organization_audit_history(org_id, limit)
