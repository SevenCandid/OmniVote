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
    PlatformRole,
    PlatformPermission,
    PlatformRolePermission,
    UserPlatformRole,
    PlatformIdentity,
    PlatformInvitation,
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

    async def get_users_with_role_in_organization(self, organization_id: uuid.UUID, role_name: str):
        from app.identity.models.user import User
        from app.modules.membership.models.membership import Membership, MembershipStatus
        result = await self.db.execute(
            select(User)
            .join(Membership, Membership.user_id == User.id)
            .join(MembershipRole, MembershipRole.membership_id == Membership.id)
            .join(Role, Role.id == MembershipRole.role_id)
            .where(
                Membership.organization_id == organization_id,
                Role.name == role_name,
                Role.is_system == True,
                Membership.status == MembershipStatus.ACCEPTED
            )
        )
        return result.scalars().all()

    async def get_users_with_any_permission(self, organization_id: uuid.UUID, permission_keys: list[str]):
        from app.identity.models.user import User
        from app.modules.membership.models.membership import Membership, MembershipStatus
        result = await self.db.execute(
            select(User)
            .join(Membership, Membership.user_id == User.id)
            .join(MembershipRole, MembershipRole.membership_id == Membership.id)
            .join(RolePermission, RolePermission.role_id == MembershipRole.role_id)
            .join(Permission, Permission.id == RolePermission.permission_id)
            .where(
                Membership.organization_id == organization_id,
                Membership.status == MembershipStatus.ACCEPTED,
                Permission.key.in_(permission_keys)
            )
            .distinct()
        )
        return result.scalars().all()

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

    async def replace_role_permissions(
        self,
        role_id: uuid.UUID,
        permission_ids: list[uuid.UUID],
    ) -> None:
        """
        Atomically replaces all permissions for a role.
        Deletes existing RolePermission rows then inserts the new set.
        Caller is responsible for committing.
        """
        from sqlalchemy import delete as sa_delete

        await self.db.execute(
            sa_delete(RolePermission).where(RolePermission.role_id == role_id)
        )
        for perm_id in permission_ids:
            self.db.add(RolePermission(role_id=role_id, permission_id=perm_id))
        await self.db.flush()

    async def replace_membership_roles(
        self,
        membership_id: uuid.UUID,
        role_ids: list[uuid.UUID],
        assigned_by: uuid.UUID,
    ) -> None:
        """
        Atomically replaces all roles for a membership.
        Deletes existing MembershipRole rows then inserts the new set.
        Caller is responsible for Last Owner Protection checks before calling.
        Caller is responsible for committing.
        """
        from sqlalchemy import delete as sa_delete

        await self.db.execute(
            sa_delete(MembershipRole).where(MembershipRole.membership_id == membership_id)
        )
        for role_id in role_ids:
            self.db.add(MembershipRole(
                membership_id=membership_id,
                role_id=role_id,
                assigned_by=assigned_by,
            ))
        await self.db.flush()

    # --- Platform RBAC Resolution ---

    async def get_user_platform_roles(self, user_id: uuid.UUID) -> Sequence[PlatformRole]:
        """
        Retrieves all platform roles assigned to a user.
        """
        result = await self.db.execute(
            select(PlatformRole)
            .join(UserPlatformRole, UserPlatformRole.role_id == PlatformRole.id)
            .where(UserPlatformRole.user_id == user_id)
            .order_by(PlatformRole.name)
        )
        return result.scalars().all()

    async def get_user_platform_permissions(self, user_id: uuid.UUID) -> Sequence[str]:
        """
        Highly optimized single query to fetch all unique platform permission keys for a given user.
        Resolves via UserPlatformRole -> PlatformRolePermission -> PlatformPermission.
        Returns a list of string keys (e.g., ['platform.dashboard.view']).
        """
        result = await self.db.execute(
            select(PlatformPermission.key)
            .join(PlatformRolePermission, PlatformRolePermission.permission_id == PlatformPermission.id)
            .join(UserPlatformRole, UserPlatformRole.role_id == PlatformRolePermission.role_id)
            .where(UserPlatformRole.user_id == user_id)
            .distinct()
        )
        return result.scalars().all()

    # --- Platform Identity & Users ---

    async def list_platform_users(self):
        from app.identity.models.user import User
        result = await self.db.execute(
            select(User)
            .join(PlatformIdentity, PlatformIdentity.user_id == User.id)
            .order_by(User.email)
        )
        return result.scalars().all()

    async def get_platform_identity(self, user_id: uuid.UUID) -> PlatformIdentity | None:
        result = await self.db.execute(select(PlatformIdentity).where(PlatformIdentity.user_id == user_id))
        return result.scalar_one_or_none()
        
    async def get_or_create_platform_identity(self, user_id: uuid.UUID) -> PlatformIdentity:
        identity = await self.get_platform_identity(user_id)
        if not identity:
            identity = PlatformIdentity(user_id=user_id, status="ACTIVE")
            self.db.add(identity)
            await self.db.flush()
        return identity

    async def list_platform_roles(self) -> Sequence[PlatformRole]:
        result = await self.db.execute(select(PlatformRole).order_by(PlatformRole.name))
        return result.scalars().all()

    async def replace_user_platform_roles(self, user_id: uuid.UUID, role_ids: list[uuid.UUID]):
        from sqlalchemy import delete as sa_delete
        await self.db.execute(
            sa_delete(UserPlatformRole).where(UserPlatformRole.user_id == user_id)
        )
        for role_id in role_ids:
            self.db.add(UserPlatformRole(user_id=user_id, role_id=role_id))
        await self.db.flush()

    # --- Platform Invitations ---

    async def create_platform_invitation(self, invitation: PlatformInvitation) -> PlatformInvitation:
        self.db.add(invitation)
        await self.db.flush()
        return invitation

    async def get_platform_invitation_by_token(self, token: str) -> PlatformInvitation | None:
        result = await self.db.execute(
            select(PlatformInvitation).where(PlatformInvitation.token == token)
        )
        return result.scalar_one_or_none()
        
    async def get_platform_invitation_by_id(self, invitation_id: uuid.UUID) -> PlatformInvitation | None:
        result = await self.db.execute(
            select(PlatformInvitation).where(PlatformInvitation.id == invitation_id)
        )
        return result.scalar_one_or_none()

    async def list_platform_invitations(self) -> Sequence[PlatformInvitation]:
        result = await self.db.execute(
            select(PlatformInvitation).order_by(PlatformInvitation.created_at.desc())
        )
        return result.scalars().all()
