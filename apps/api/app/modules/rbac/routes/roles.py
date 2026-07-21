import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.rbac.schemas.rbac import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    RolePermissionAssign,
    RolePermissionResponse,
    RolePermissionsBulkSet,
    PermissionResponse,
)
from app.modules.rbac.services.authorization_service import AuthorizationService
from app.modules.rbac.dependencies import RequirePermission

router = APIRouter()

@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    organization_id: uuid.UUID,
    payload: RoleCreate,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
):
    service = AuthorizationService(db)
    return await service.create_role(organization_id, payload, actor_user_id=current_user.id)

@router.get("", response_model=list[RoleResponse])
async def list_roles(
    organization_id: uuid.UUID,
    auth_context: dict = Depends(RequirePermission("organization.view")),
    db: AsyncSession = Depends(get_db_session),
) -> Sequence[RoleResponse]:
    service = AuthorizationService(db)
    has_update = await service.has_permission(auth_context["membership_id"], "organization.update")
    if has_update:
        return await service.get_organization_roles(organization_id)
    return await service.get_membership_roles(auth_context["membership_id"])

@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    auth_context: dict = Depends(RequirePermission("organization.view")),
    db: AsyncSession = Depends(get_db_session),
):
    service = AuthorizationService(db)
    role = await service.get_role(role_id)
    if not role.is_system and role.organization_id != organization_id:
        from app.exceptions.exceptions import ForbiddenException
        raise ForbiddenException(message="Role does not belong to this organization")

    has_update = await service.has_permission(auth_context["membership_id"], "organization.update")
    if not has_update:
        my_roles = await service.get_membership_roles(auth_context["membership_id"])
        if not any(r.id == role.id for r in my_roles):
            from app.exceptions.exceptions import ForbiddenException
            raise ForbiddenException(message="You can only view details of your own roles")

    return role

@router.patch("/{role_id}", response_model=RoleResponse)
async def update_role(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    payload: RoleUpdate,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
):
    service = AuthorizationService(db)
    return await service.update_role(role_id, organization_id, payload, actor_user_id=current_user.id)

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
):
    service = AuthorizationService(db)
    await service.delete_role(role_id, organization_id, actor_user_id=current_user.id)
    return None

# --- Role Permissions ---

@router.post("/{role_id}/permissions", response_model=RolePermissionResponse, status_code=status.HTTP_201_CREATED)
async def assign_permission_to_role(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    payload: RolePermissionAssign,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
):
    service = AuthorizationService(db)
    return await service.assign_permission(
        role_id=role_id,
        permission_id=payload.permission_id,
        organization_id=organization_id,
        caller_membership_id=auth_context["membership_id"],
        actor_user_id=current_user.id,
    )

@router.put("/{role_id}/permissions", response_model=list[PermissionResponse], status_code=status.HTTP_200_OK)
async def replace_role_permissions(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    payload: RolePermissionsBulkSet,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
) -> Sequence[PermissionResponse]:
    """
    Atomically replaces all permissions on a custom role.
    Provide the complete desired permission set — all existing permissions are replaced.
    """
    service = AuthorizationService(db)
    return await service.replace_role_permissions(
        role_id=role_id,
        permission_ids=payload.permission_ids,
        organization_id=organization_id,
        caller_membership_id=auth_context["membership_id"],
        actor_user_id=current_user.id,
    )

@router.delete("/{role_id}/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_permission_from_role(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    permission_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("organization.update")),
    db: AsyncSession = Depends(get_db_session),
):
    service = AuthorizationService(db)
    await service.remove_permission(role_id, permission_id, organization_id, actor_user_id=current_user.id)
    return None

@router.get("/{role_id}/permissions", response_model=list[PermissionResponse])
async def list_role_permissions(
    organization_id: uuid.UUID,
    role_id: uuid.UUID,
    auth_context: dict = Depends(RequirePermission("organization.view")),
    db: AsyncSession = Depends(get_db_session),
) -> Sequence[PermissionResponse]:
    service = AuthorizationService(db)
    role = await service.get_role(role_id)
    if not role.is_system and role.organization_id != organization_id:
        from app.exceptions.exceptions import ForbiddenException
        raise ForbiddenException(message="Role does not belong to this organization")

    has_update = await service.has_permission(auth_context["membership_id"], "organization.update")
    if not has_update:
        my_roles = await service.get_membership_roles(auth_context["membership_id"])
        if not any(r.id == role.id for r in my_roles):
            from app.exceptions.exceptions import ForbiddenException
            raise ForbiddenException(message="You can only view details of your own roles")

    return await service.get_role_permissions(role_id)
