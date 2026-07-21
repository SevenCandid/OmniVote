import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.rbac.schemas.rbac import (
    MembershipRoleAssign,
    MembershipRoleResponse,
    MembershipRolesBulkSet,
    RoleResponse,
    EffectivePermissionsResponse,
)
from app.modules.rbac.services.authorization_service import AuthorizationService
from app.modules.rbac.dependencies import RequirePermission
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.exceptions.exceptions import NotFoundException, ForbiddenException

router = APIRouter()


# --- Effective Permissions ---

@router.get("/me/effective-permissions", response_model=EffectivePermissionsResponse)
async def get_my_effective_permissions(
    organization_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Returns the caller's effective roles and permission keys within the organization."""
    from app.modules.rbac.services.permission_resolver import PermissionResolver
    resolver = PermissionResolver(db)
    return await resolver.resolve_organization_permissions(current_user.id, organization_id)


@router.get("/my-permissions", response_model=EffectivePermissionsResponse)
async def get_my_permissions_alias(
    organization_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Alias for /me/effective-permissions.
    Returns the caller's effective roles and permission keys within the organization.
    Primarily used by the frontend for conditional rendering.
    """
    from app.modules.rbac.services.permission_resolver import PermissionResolver
    resolver = PermissionResolver(db)
    return await resolver.resolve_organization_permissions(current_user.id, organization_id)


# --- Membership Role Assignment ---

@router.post("/{membership_id}/roles", response_model=MembershipRoleResponse, status_code=status.HTTP_201_CREATED)
async def assign_role_to_membership(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    payload: MembershipRoleAssign,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("member.update")),
    db: AsyncSession = Depends(get_db_session),
):
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    role = await service.get_role(payload.role_id)
    if not role.is_system and role.organization_id != organization_id:
        raise ForbiddenException(message="Role does not belong to this organization")

    return await service.assign_role_to_membership(
        membership_id=membership_id,
        role_id=payload.role_id,
        admin_user_id=current_user.id,
        caller_membership_id=auth_context["membership_id"],
    )


@router.put("/{membership_id}/roles", response_model=list[MembershipRoleResponse], status_code=status.HTTP_200_OK)
async def replace_membership_roles(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    payload: MembershipRolesBulkSet,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("member.update")),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Atomically replaces all roles assigned to a membership.
    Provide the complete desired role set — all existing roles are replaced.
    Enforces Last Owner Protection and privilege escalation prevention.
    """
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    return await service.replace_membership_roles(
        membership_id=membership_id,
        role_ids=payload.role_ids,
        organization_id=organization_id,
        admin_user_id=current_user.id,
        caller_membership_id=auth_context["membership_id"],
    )


@router.delete("/{membership_id}/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role_from_membership(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    role_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePermission("member.update")),
    db: AsyncSession = Depends(get_db_session),
):
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    await service.remove_role_from_membership(
        membership_id=membership_id,
        role_id=role_id,
        organization_id=organization_id,
        actor_user_id=current_user.id,
    )
    return None


@router.get("/{membership_id}/roles", response_model=list[RoleResponse])
async def list_membership_roles(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    auth_context: dict = Depends(RequirePermission("member.view")),
    db: AsyncSession = Depends(get_db_session),
) -> Sequence[RoleResponse]:
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    return await service.get_membership_roles(membership_id)
