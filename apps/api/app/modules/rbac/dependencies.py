import uuid
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.membership.repositories.membership_repository import MembershipRepository
from app.modules.membership.models.membership import MembershipStatus
from app.modules.rbac.services.authorization_service import AuthorizationService
from app.exceptions.exceptions import ForbiddenException


class RequirePermission:
    """
    Dependency to require a specific permission.
    Example: Depends(RequirePermission("organization.update"))
    
    This implicitly requires that the route provides an `organization_id` in the path or query.
    To avoid complex parsing, we assume that any route protected by this will have `organization_id`
    in its dependencies or path parameters, and we will extract it.
    Wait, FastAPI dependencies don't easily extract path parameters unless explicitly requested.
    Instead, we'll design this dependency to be used in routes where `organization_id` is defined
    as a parameter.
    
    Actually, a better pattern in FastAPI is a class-based dependency that returns a callable.
    """
    def __init__(self, permission_key: str):
        self.permission_key = permission_key

    async def __call__(
        self,
        organization_id: uuid.UUID,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db_session)
    ):
        # Find the membership for this user in this organization
        membership_repo = MembershipRepository(db)
        membership = await membership_repo.get_membership_by_user_and_org(current_user.id, organization_id)
        if not membership or membership.status != MembershipStatus.ACCEPTED:
            raise ForbiddenException(message="You must be an active member of this organization to perform this action.")
            
        # Check permission
        auth_service = AuthorizationService(db)
        has_perm = await auth_service.has_permission(membership.id, self.permission_key)
        
        if not has_perm:
            raise ForbiddenException(message=f"Missing required permission: {self.permission_key}")
        
        return membership
