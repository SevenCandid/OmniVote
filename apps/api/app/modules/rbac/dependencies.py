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
from app.modules.rbac.services.permission_resolver import PermissionResolver
from app.exceptions.exceptions import ForbiddenException


class RequirePermission:
    """
    Dependency to require a specific permission.
    Checks direct membership role mapping first. If membership is absent,
    checks for an active temporary support session and resolves capabilities
    granted to the organization-level 'Platform Support' role.
    Returns the resolved AuthorizationContext dict.
    """
    def __init__(self, permission_key: str):
        self.permission_key = permission_key

    async def __call__(
        self,
        organization_id: uuid.UUID,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db_session)
    ):
        resolver = PermissionResolver(db)
        context = await resolver.resolve_organization_permissions(current_user.id, organization_id)
        
        if self.permission_key not in context["permissions"]:
            raise ForbiddenException(message=f"Missing required permission: {self.permission_key}")
            
        if context.get("is_support_session"):
            # Audit support action
            from app.identity.services.audit_service import AuditService
            await AuditService.log_event_no_commit(
                db=db,
                event_type="support_access_action",
                user_id=current_user.id,
                metadata_payload={
                    "organization_id": str(organization_id),
                    "action": f"accessed route protected by {self.permission_key}",
                    "support_session_id": str(context.get("support_session_id"))
                }
            )
            await db.commit()

        return context


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
        resolver = PermissionResolver(db)
        identity = await resolver.resolve_platform_permissions(current_user.id)
        
        if not identity or self.platform_permission_key not in identity["permissions"]:
            raise ForbiddenException(message=f"Missing required platform permission: {self.platform_permission_key}")
            
        return current_user


