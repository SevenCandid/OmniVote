from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.exceptions.exceptions import ForbiddenException
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.identity.schemas.platform import PlatformIdentityResponse, PlatformIdentityData, PlatformRoleRead
from app.identity.services.audit_service import AuditService
from app.modules.rbac.services.permission_resolver import PermissionResolver

router = APIRouter()


@router.get("/me", response_model=PlatformIdentityResponse)
async def get_current_platform_identity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Get the authenticated user's platform identity, including assigned platform roles and effective platform permissions.
    Only accessible to users with at least one platform role.
    """
    platform_service = PermissionResolver(db)
    platform_data = await platform_service.resolve_platform_permissions(current_user.id)

    if not platform_data:
        raise ForbiddenException(message="You do not have access to the Platform Administration Portal.")

    # Audit the platform login/access
    audit_service = AuditService()
    await audit_service.log_event(
        db=db,
        event_type="platform.login",
        user_id=current_user.id,
        metadata_payload={
            "roles_count": len(platform_data["roles"]),
            "permissions_count": len(platform_data["permissions"]),
        },
    )

    return PlatformIdentityResponse(
        id=current_user.id,
        email=current_user.email,
        display_name=f"{current_user.first_name} {current_user.last_name}".strip(),
        platform=PlatformIdentityData(
            is_platform_user=platform_data["is_platform_user"],
            roles=[
                PlatformRoleRead.model_validate(role)
                for role in platform_data["roles"]
            ],
            permissions=platform_data["permissions"],
        ),
    )
