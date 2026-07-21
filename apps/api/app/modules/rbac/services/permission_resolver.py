import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.modules.rbac.repositories.rbac_repository import RBACRepository
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.modules.membership.models.membership import MembershipStatus
from app.modules.support.models.support import SupportSession, SessionStatus
from app.modules.rbac.models.rbac import Role, RolePermission, Permission
from app.exceptions.exceptions import ForbiddenException

class PermissionResolver:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RBACRepository(db)

    async def resolve_platform_permissions(self, user_id: uuid.UUID) -> dict | None:
        """
        Calculates and returns the effective platform roles and permissions for a user.
        If the user has no platform roles, returns None, indicating they are not a platform user.
        """
        roles = await self.repo.get_user_platform_roles(user_id)
        if not roles:
            return None

        permissions = await self.repo.get_user_platform_permissions(user_id)

        return {
            "is_platform_user": True,
            "roles": roles,
            "permissions": permissions,
        }

    async def resolve_organization_permissions(
        self, user_id: uuid.UUID, organization_id: uuid.UUID
    ) -> dict:
        """
        Calculates and returns effective roles and permissions for a user within an organization.
        Supports both direct membership context and platform support sessions.
        Returns:
            dict with keys: organization_id, membership_id, roles, permissions, is_support_session, support_session_id
        """
        # 1. Check direct active membership
        mem_repo = MembershipRepository(self.db)
        membership = await mem_repo.get_membership_by_user_and_org(user_id, organization_id)

        if membership and membership.status == MembershipStatus.ACCEPTED:
            roles = await self.repo.list_membership_roles(membership.id)
            permission_keys = await self.repo.get_all_permissions_for_membership(membership.id)
            return {
                "organization_id": organization_id,
                "membership_id": membership.id,
                "roles": roles,
                "permissions": permission_keys,
                "is_support_session": False,
                "support_session_id": None
            }

        # 2. Check for active support session (temporary access bypass)
        now = datetime.now(timezone.utc)
        stmt = select(SupportSession).where(
            SupportSession.platform_user_id == user_id,
            SupportSession.organization_id == organization_id,
            SupportSession.status == SessionStatus.ACTIVE,
            SupportSession.expires_at > now,
        )
        res = await self.db.execute(stmt)
        session = res.scalar_one_or_none()

        if session:
            role_stmt = select(Role).where(Role.name == "Platform Support", Role.is_system == True)
            role_res = await self.db.execute(role_stmt)
            support_role = role_res.scalar_one_or_none()

            if support_role:
                perm_stmt = select(Permission.key).join(
                    RolePermission, RolePermission.permission_id == Permission.id
                ).where(RolePermission.role_id == support_role.id)
                perm_res = await self.db.execute(perm_stmt)
                support_permissions = perm_res.scalars().all()

                return {
                    "organization_id": organization_id,
                    "membership_id": session.id, # Using session ID as a surrogate membership ID
                    "roles": [support_role],
                    "permissions": support_permissions,
                    "is_support_session": True,
                    "support_session_id": session.id
                }

        raise ForbiddenException(message="You are not an active member of this organization")
