import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, status

from app.database.session import get_db_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User

from app.modules.rbac.dependencies import RequirePermission, RequirePlatformPermission
from app.modules.support.schemas.support import (
    SupportRequestCreate,
    SupportRequestResponse,
    SupportSessionResponse,
    EmergencySessionCreate,
)
from app.modules.support.services.support_service import SupportService

router = APIRouter()


# --- Customer Endpoints ---

@router.post(
    "/organizations/{organization_id}/support/requests",
    response_model=SupportRequestResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_support_request(
    organization_id: uuid.UUID,
    data: SupportRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePermission("organization.view"))
):
    service = SupportService(db)
    return await service.create_request(
        organization_id=organization_id,
        requester_id=current_user.id,
        data=data
    )


@router.get(
    "/organizations/{organization_id}/support/requests",
    response_model=Sequence[SupportRequestResponse]
)
async def list_org_support_requests(
    organization_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePermission("organization.view"))
):
    service = SupportService(db)
    return await service.list_requests_by_org(organization_id)


@router.get(
    "/organizations/{organization_id}/support/sessions",
    response_model=Sequence[SupportSessionResponse]
)
async def list_org_support_sessions(
    organization_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePermission("organization.view"))
):
    service = SupportService(db)
    return await service.list_sessions_by_org(organization_id)


# --- Platform Admin Endpoints ---

@router.get(
    "/support/requests",
    response_model=Sequence[SupportRequestResponse]
)
async def list_all_support_requests(
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePlatformPermission("support.operate"))
):
    service = SupportService(db)
    return await service.list_all_requests()


@router.get(
    "/support/sessions",
    response_model=Sequence[SupportSessionResponse]
)
async def list_all_support_sessions(
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePlatformPermission("support.operate"))
):
    service = SupportService(db)
    return await service.list_all_sessions()


@router.post(
    "/support/requests/{request_id}/accept",
    response_model=SupportSessionResponse
)
async def accept_support_request(
    request_id: uuid.UUID,
    duration_minutes: int = 60,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePlatformPermission("support.operate"))
):
    service = SupportService(db)
    return await service.accept_request(
        request_id=request_id,
        admin_user_id=current_user.id,
        duration_minutes=duration_minutes
    )


@router.post(
    "/support/requests/{request_id}/reject",
    response_model=SupportRequestResponse
)
async def reject_support_request(
    request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePlatformPermission("support.operate"))
):
    service = SupportService(db)
    return await service.reject_request(
        request_id=request_id,
        admin_user_id=current_user.id
    )


@router.post(
    "/support/emergency-sessions",
    response_model=SupportSessionResponse,
    status_code=status.HTTP_201_CREATED
)
async def start_emergency_session(
    data: EmergencySessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePlatformPermission("support.operate"))
):
    service = SupportService(db)
    return await service.start_emergency_session(
        admin_user_id=current_user.id,
        data=data
    )


@router.post(
    "/support/sessions/{session_id}/terminate",
    response_model=SupportSessionResponse
)
async def terminate_support_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    _ = Depends(RequirePlatformPermission("support.operate"))
):
    service = SupportService(db)
    return await service.terminate_session(
        session_id=session_id,
        user_id=current_user.id
    )
