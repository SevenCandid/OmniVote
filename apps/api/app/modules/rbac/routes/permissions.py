import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.rbac.schemas.rbac import PermissionResponse
from app.modules.rbac.services.authorization_service import AuthorizationService

router = APIRouter()

@router.get("", response_model=list[PermissionResponse])
async def list_permissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Sequence[PermissionResponse]:
    service = AuthorizationService(db)
    return await service.get_all_permissions()

@router.get("/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = AuthorizationService(db)
    return await service.get_permission(permission_id)
