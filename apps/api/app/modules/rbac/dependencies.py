import uuid
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.modules.membership.models.membership import Membership, MembershipStatus
from app.modules.rbac.services.authorization_service import AuthorizationService
from app.exceptions.exceptions import ForbiddenException


class RequirePermission:
    """
    Dependency to require a specific permission.
    Checks direct membership role mapping first. If membership is absent,
    checks for an active temporary support session and resolves capabilities
    granted to the organization-level 'Platform Support' role.
    """
    def __init__(self, permission_key: str):
        self.permission_key = permission_key

    async def __call__(
        self,
        organization_id: uuid.UUID,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db_session)
    ):
        # 1. Find direct membership for this user in this organization
        membership_repo = MembershipRepository(db)
        membership = await membership_repo.get_membership_by_user_and_org(current_user.id, organization_id)
        
        if membership and membership.status == MembershipStatus.ACCEPTED:
            # Check permissions of membership normally
            auth_service = AuthorizationService(db)
            has_perm = await auth_service.has_permission(membership.id, self.permission_key)
            if has_perm:
                return membership

        # 2. Check for active support session (temporary access bypass)
        from app.modules.support.models.support import SupportSession, SessionStatus
        now = datetime.now(timezone.utc)
        stmt = select(SupportSession).where(
            SupportSession.platform_user_id == current_user.id,
            SupportSession.organization_id == organization_id,
            SupportSession.status == SessionStatus.ACTIVE,
            SupportSession.expires_at > now
        )
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        
        if session:
            # Resolve permissions using the organization's 'Platform Support' system role
            from app.modules.rbac.models.rbac import Role, RolePermission, Permission
            role_stmt = select(Role).where(Role.name == "Platform Support", Role.is_system == True)
            role_res = await db.execute(role_stmt)
            support_role = role_res.scalar_one_or_none()
            
            if support_role:
                perm_stmt = select(Permission.key).join(
                    RolePermission, RolePermission.permission_id == Permission.id
                ).where(RolePermission.role_id == support_role.id)
                perm_res = await db.execute(perm_stmt)
                support_permissions = perm_res.scalars().all()
                
                if self.permission_key in support_permissions:
                    # Create temporary Membership object to maintain interface compatibility
                    temp_membership = Membership(
                        id=uuid.uuid4(),
                        user_id=current_user.id,
                        organization_id=organization_id,
                        status=MembershipStatus.ACCEPTED
                    )
                    temp_membership.user = current_user
                    
                    # Audit support action
                    from app.identity.services.audit_service import AuditService
                    audit_service = AuditService()
                    await audit_service.log_event(
                        db=db,
                        event_type="support_access_action",
                        user_id=current_user.id,
                        metadata_payload={
                            "organization_id": str(organization_id),
                            "action": f"accessed route protected by {self.permission_key}",
                            "support_session_id": str(session.id)
                        }
                    )
                    return temp_membership

        raise ForbiddenException(message=f"Missing required permission: {self.permission_key}")



class RequirePlatformPermission:
    """
    Dependency to require a global platform-level administrative permission.
    Example: Depends(RequirePlatformPermission("support.operate"))
    """
    def __init__(self, platform_permission_key: str):
        self.platform_permission_key = platform_permission_key

    async def __call__(
        self,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db_session)
    ):
        from app.modules.rbac.models.rbac import UserPlatformRole, PlatformRolePermission, PlatformPermission
        stmt = select(PlatformPermission.key).join(
            PlatformRolePermission, PlatformRolePermission.permission_id == PlatformPermission.id
        ).join(
            UserPlatformRole, UserPlatformRole.role_id == PlatformRolePermission.role_id
        ).where(
            UserPlatformRole.user_id == current_user.id
        )
        res = await db.execute(stmt)
        permissions = res.scalars().all()
        
        if self.platform_permission_key not in permissions:
            raise ForbiddenException(message=f"Missing required platform permission: {self.platform_permission_key}")
            
        return current_user

