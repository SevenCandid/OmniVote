import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.rbac.models.rbac import (
    Permission,
    Role,
    RolePermission,
    MembershipRole,
)
from app.modules.rbac.repositories.rbac_repository import RBACRepository
from app.modules.rbac.schemas.rbac import RoleCreate, RoleUpdate
from app.exceptions.exceptions import NotFoundException, ConflictException, ForbiddenException


class AuthorizationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RBACRepository(db)

    async def has_permission(self, membership_id: uuid.UUID, permission_key: str) -> bool:
        """
        Determines if a membership holds a specific permission.
        Optimized to use a single joined query.
        """
        permissions = await self.repo.get_all_permissions_for_membership(membership_id)
        return permission_key in permissions

    # --- Permissions ---
    
    async def get_all_permissions(self) -> Sequence[Permission]:
        return await self.repo.list_permissions()

    async def get_permission(self, permission_id: uuid.UUID) -> Permission:
        permission = await self.repo.get_permission_by_id(permission_id)
        if not permission:
            raise NotFoundException(message="Permission not found")
        return permission

    # --- Roles ---

    async def get_organization_roles(self, organization_id: uuid.UUID) -> Sequence[Role]:
        return await self.repo.list_roles_by_organization(organization_id)

    async def get_role(self, role_id: uuid.UUID) -> Role:
        role = await self.repo.get_role_by_id(role_id)
        if not role:
            raise NotFoundException(message="Role not found")
        return role

    async def create_role(self, organization_id: uuid.UUID, data: RoleCreate) -> Role:
        existing = await self.repo.get_role_by_name(data.name, organization_id)
        if existing:
            raise ConflictException(message="Role with this name already exists in the organization")

        role = Role(
            organization_id=organization_id,
            name=data.name,
            description=data.description,
            is_system=False
        )
        return await self.repo.create_role(role)

    async def update_role(self, role_id: uuid.UUID, organization_id: uuid.UUID, data: RoleUpdate) -> Role:
        role = await self.get_role(role_id)
        
        if role.is_system:
            raise ForbiddenException(message="System roles cannot be modified")
            
        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        if data.name and data.name != role.name:
            existing = await self.repo.get_role_by_name(data.name, organization_id)
            if existing:
                raise ConflictException(message="Role with this name already exists")
            role.name = data.name

        if data.description is not None:
            role.description = data.description

        await self.db.flush()
        return role

    async def delete_role(self, role_id: uuid.UUID, organization_id: uuid.UUID) -> None:
        role = await self.get_role(role_id)
        
        if role.is_system:
            raise ForbiddenException(message="System roles cannot be deleted")

        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        await self.repo.delete_role(role)

    # --- Role Permissions ---

    async def assign_permission(self, role_id: uuid.UUID, permission_id: uuid.UUID, organization_id: uuid.UUID) -> RolePermission:
        role = await self.get_role(role_id)
        
        if role.is_system:
            raise AppException(
                status_code=403,
                message="Cannot modify permissions of a system role",
                error=AppError.AUTHORIZATION_FAILED
            )
            
        if role.organization_id != organization_id:
            raise AppException(
                status_code=403,
                message="Role does not belong to this organization",
                error=AppError.AUTHORIZATION_FAILED
            )

        permission = await self.get_permission(permission_id)

        existing = await self.repo.get_role_permission(role_id, permission_id)
        if existing:
            raise ConflictException(message="Permission is already assigned to this role")

        role_permission = RolePermission(role_id=role.id, permission_id=permission.id)
        return await self.repo.assign_permission_to_role(role_permission)

    async def remove_permission(self, role_id: uuid.UUID, permission_id: uuid.UUID, organization_id: uuid.UUID) -> None:
        role = await self.get_role(role_id)
        
        if role.is_system:
            raise AppException(
                status_code=403,
                message="Cannot modify permissions of a system role",
                error=AppError.AUTHORIZATION_FAILED
            )
            
        if role.organization_id != organization_id:
            raise AppException(
                status_code=403,
                message="Role does not belong to this organization",
                error=AppError.AUTHORIZATION_FAILED
            )

        removed = await self.repo.remove_permission_from_role(role_id, permission_id)
        if not removed:
            raise NotFoundException(message="Permission is not assigned to this role")

    async def get_role_permissions(self, role_id: uuid.UUID) -> Sequence[Permission]:
        return await self.repo.list_role_permissions(role_id)

    # --- Membership Roles ---

    async def assign_role_to_membership(self, membership_id: uuid.UUID, role_id: uuid.UUID, admin_user_id: uuid.UUID) -> MembershipRole:
        role = await self.get_role(role_id)
        
        existing = await self.repo.get_membership_role(membership_id, role_id)
        if existing:
            raise ConflictException(message="Role is already assigned to this membership")

        membership_role = MembershipRole(
            membership_id=membership_id,
            role_id=role.id,
            assigned_by=admin_user_id
        )
        return await self.repo.assign_role_to_membership(membership_role)

    async def remove_role_from_membership(self, membership_id: uuid.UUID, role_id: uuid.UUID, organization_id: uuid.UUID | None = None) -> None:
        role = await self.get_role(role_id)
        if role.name == "Owner" and role.is_system and organization_id:
            count = await self.repo.count_owners_in_organization(organization_id)
            if count <= 1:
                from app.exceptions.exceptions import ConflictException
                raise ConflictException(message="Cannot remove the last Owner from the organization")

        removed = await self.repo.remove_role_from_membership(membership_id, role_id)
        if not removed:
            from app.exceptions.exceptions import NotFoundException
            raise NotFoundException(message="Role is not assigned to this membership")

    async def get_membership_roles(self, membership_id: uuid.UUID) -> Sequence[Role]:
        return await self.repo.list_membership_roles(membership_id)
