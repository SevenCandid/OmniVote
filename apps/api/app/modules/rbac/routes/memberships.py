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
    RoleResponse
)
from app.modules.rbac.services.authorization_service import AuthorizationService
from app.modules.rbac.dependencies import RequirePermission
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.exceptions.exceptions import NotFoundException, ForbiddenException

router = APIRouter()

@router.post("/{membership_id}/roles", response_model=MembershipRoleResponse, status_code=status.HTTP_201_CREATED)
async def assign_role_to_membership(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    payload: MembershipRoleAssign,
    current_user: User = Depends(get_current_user),
    membership=Depends(RequirePermission("member.update")),
    db: AsyncSession = Depends(get_db_session)
):
    # Verify the membership belongs to the organization
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    # verify the role belongs to this org or is system
    role = await service.get_role(payload.role_id)
    if not role.is_system and role.organization_id != organization_id:
        raise ForbiddenException(message="Role does not belong to this organization")

    return await service.assign_role_to_membership(
        membership_id=membership_id,
        role_id=payload.role_id,
        admin_user_id=current_user.id
    )

@router.delete("/{membership_id}/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_role_from_membership(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    role_id: uuid.UUID,
    membership=Depends(RequirePermission("member.update")),
    db: AsyncSession = Depends(get_db_session)
):
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    await service.remove_role_from_membership(membership_id, role_id)
    return None

@router.get("/{membership_id}/roles", response_model=list[RoleResponse])
async def list_membership_roles(
    organization_id: uuid.UUID,
    membership_id: uuid.UUID,
    membership=Depends(RequirePermission("member.view")),
    db: AsyncSession = Depends(get_db_session)
) -> Sequence[RoleResponse]:
    mem_repo = MembershipRepository(db)
    target_membership = await mem_repo.get_membership_by_id(membership_id)
    if not target_membership or target_membership.organization_id != organization_id:
        raise NotFoundException(message="Membership not found in this organization")

    service = AuthorizationService(db)
    return await service.get_membership_roles(membership_id)
