import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.rbac.models.rbac import (
    Permission,
    Role,
    RolePermission,
    MembershipRole,
)


class RBACRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # --- Permissions ---

    async def get_permission_by_id(self, permission_id: uuid.UUID) -> Permission | None:
        result = await self.db.execute(select(Permission).where(Permission.id == permission_id))
        return result.scalar_one_or_none()

    async def get_permission_by_key(self, key: str) -> Permission | None:
        result = await self.db.execute(select(Permission).where(Permission.key == key))
        return result.scalar_one_or_none()

    async def list_permissions(self) -> Sequence[Permission]:
        result = await self.db.execute(select(Permission).order_by(Permission.category, Permission.key))
        return result.scalars().all()

    async def create_permission(self, permission: Permission) -> Permission:
        self.db.add(permission)
        await self.db.flush()
        return permission

    # --- Roles ---

    async def get_role_by_id(self, role_id: uuid.UUID) -> Role | None:
        result = await self.db.execute(select(Role).where(Role.id == role_id))
        return result.scalar_one_or_none()

    async def list_roles_by_organization(self, organization_id: uuid.UUID) -> Sequence[Role]:
        result = await self.db.execute(
            select(Role)
            .where((Role.organization_id == organization_id) | (Role.is_system == True))
            .order_by(Role.is_system.desc(), Role.name)
        )
        return result.scalars().all()

    async def get_role_by_name(self, name: str, organization_id: uuid.UUID | None = None) -> Role | None:
        if organization_id:
            query = select(Role).where(Role.name == name, Role.organization_id == organization_id)
        else:
            query = select(Role).where(Role.name == name, Role.is_system == True)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_role(self, role: Role) -> Role:
        self.db.add(role)
        await self.db.flush()
        return role

    async def delete_role(self, role: Role) -> None:
        await self.db.delete(role)
        await self.db.flush()

    # --- Role Permissions ---

    async def assign_permission_to_role(self, role_permission: RolePermission) -> RolePermission:
        self.db.add(role_permission)
        await self.db.flush()
        return role_permission

    async def remove_permission_from_role(self, role_id: uuid.UUID, permission_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_id, RolePermission.permission_id == permission_id
            )
        )
        rp = result.scalar_one_or_none()
        if rp:
            await self.db.delete(rp)
            await self.db.flush()
            return True
        return False

    async def list_role_permissions(self, role_id: uuid.UUID) -> Sequence[Permission]:
        result = await self.db.execute(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role_id == role_id)
        )
        return result.scalars().all()
        
    async def get_role_permission(self, role_id: uuid.UUID, permission_id: uuid.UUID) -> RolePermission | None:
        result = await self.db.execute(
            select(RolePermission).where(
                RolePermission.role_id == role_id, RolePermission.permission_id == permission_id
            )
        )
        return result.scalar_one_or_none()

    # --- Membership Roles ---

    async def assign_role_to_membership(self, membership_role: MembershipRole) -> MembershipRole:
        self.db.add(membership_role)
        await self.db.flush()
        return membership_role

    async def remove_role_from_membership(self, membership_id: uuid.UUID, role_id: uuid.UUID) -> bool:
        result = await self.db.execute(
            select(MembershipRole).where(
                MembershipRole.membership_id == membership_id, MembershipRole.role_id == role_id
            )
        )
        mr = result.scalar_one_or_none()
        if mr:
            await self.db.delete(mr)
            await self.db.flush()
            return True
        return False

    async def list_membership_roles(self, membership_id: uuid.UUID) -> Sequence[Role]:
        result = await self.db.execute(
            select(Role)
            .join(MembershipRole, MembershipRole.role_id == Role.id)
            .where(MembershipRole.membership_id == membership_id)
        )
        return result.scalars().all()
        
    async def get_membership_role(self, membership_id: uuid.UUID, role_id: uuid.UUID) -> MembershipRole | None:
        result = await self.db.execute(
            select(MembershipRole).where(
                MembershipRole.membership_id == membership_id, MembershipRole.role_id == role_id
            )
        )
        return result.scalar_one_or_none()

    async def count_owners_in_organization(self, organization_id: uuid.UUID) -> int:
        from app.modules.membership.models.membership import Membership, MembershipStatus
        from sqlalchemy import func
        result = await self.db.execute(
            select(func.count())
            .select_from(MembershipRole)
            .join(Membership, Membership.id == MembershipRole.membership_id)
            .join(Role, Role.id == MembershipRole.role_id)
            .where(
                Membership.organization_id == organization_id,
                Role.name == "Owner",
                Role.is_system == True,
                Membership.status != MembershipStatus.REMOVED
            )
        )
        return result.scalar() or 0

    # --- Resolution ---

    async def get_all_permissions_for_membership(self, membership_id: uuid.UUID) -> Sequence[str]:
        """
        Highly optimized single query to fetch all permission keys for a given membership.
        Resolves via MembershipRole -> Role -> RolePermission -> Permission.
        Returns a list of string keys (e.g., ['event.create', 'organization.view']).
        """
        result = await self.db.execute(
            select(Permission.key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(MembershipRole, MembershipRole.role_id == RolePermission.role_id)
            .where(MembershipRole.membership_id == membership_id)
        )
        return result.scalars().all()
