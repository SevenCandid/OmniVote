import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.rbac.dependencies import RequirePlatformPermission

from app.schemas.platform_identity import (
    PlatformUserResponse,
    PlatformRoleResponse,
    PlatformInvitationCreate,
    PlatformInvitationResponse,
    PlatformUserUpdate,
    PlatformEffectivePermissionsResponse
)
from app.services.platform_identity_service import PlatformIdentityService

router = APIRouter()

# --- Roles ---

@router.get("/roles", response_model=list[PlatformRoleResponse])
async def list_platform_roles(
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """List all available platform roles."""
    service = PlatformIdentityService(db)
    return await service.list_platform_roles()

# --- Users ---

@router.get("/users", response_model=list[PlatformUserResponse])
async def list_platform_users(
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """List all platform users with their roles."""
    service = PlatformIdentityService(db)
    return await service.list_platform_users()

@router.get("/users/me", response_model=PlatformUserResponse)
async def get_current_platform_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Get the current authenticated platform user's details."""
    service = PlatformIdentityService(db)
    # Reusing the get_platform_user endpoint which requires user_id
    # We don't require platform permissions here since they are just checking themselves.
    return await service.get_platform_user(current_user.id)

@router.get("/users/{user_id}", response_model=PlatformUserResponse)
async def get_platform_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """Get specific platform user details."""
    service = PlatformIdentityService(db)
    return await service.get_platform_user(user_id)

@router.patch("/users/{user_id}", response_model=PlatformUserResponse)
async def update_platform_user(
    user_id: uuid.UUID,
    update_data: PlatformUserUpdate,
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """Update a platform user's roles or status."""
    service = PlatformIdentityService(db)
    return await service.update_platform_user(user_id, update_data)

@router.get("/users/{user_id}/permissions", response_model=PlatformEffectivePermissionsResponse)
async def get_platform_user_permissions(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """Get calculated effective permissions for a user."""
    service = PlatformIdentityService(db)
    return await service.get_effective_permissions(user_id)


# --- Invitations ---

@router.get("/invitations", response_model=list[PlatformInvitationResponse])
async def list_platform_invitations(
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """List all platform invitations."""
    service = PlatformIdentityService(db)
    return await service.list_invitations()

@router.post("/invitations", response_model=PlatformInvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_platform_invitation(
    request: PlatformInvitationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """Invite a user to the platform."""
    service = PlatformIdentityService(db)
    return await service.create_invitation(request, current_user.id)

@router.patch("/invitations/{invitation_id}", response_model=PlatformInvitationResponse)
async def update_platform_invitation(
    invitation_id: uuid.UUID,
    status_update: dict,  # Only accepting {"status": "REVOKED"} or similar right now
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """Revoke or modify an invitation."""
    service = PlatformIdentityService(db)
    return await service.update_invitation_status(invitation_id, status_update.get("status"))

@router.delete("/invitations/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform_invitation(
    invitation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("user.manage")),
):
    """Delete an invitation entirely (only if needed, prefer revoking)."""
    # For now, we will just revoke via DELETE method for simplicity if frontend sends DELETE
    service = PlatformIdentityService(db)
    await service.update_invitation_status(invitation_id, "REVOKED")
    return None

# --- Public Invitation Endpoints ---

from app.schemas.platform_identity import PlatformInvitationDetailsResponse

@router.get("/invitations/{token}/details", response_model=PlatformInvitationDetailsResponse)
async def get_platform_invitation_details(
    token: str,
    db: AsyncSession = Depends(get_db_session)
):
    """Get details of a platform invitation via its token (publicly accessible)."""
    service = PlatformIdentityService(db)
    return await service.get_invitation_details(token)

@router.post("/invitations/{token}/accept", status_code=status.HTTP_200_OK)
async def accept_platform_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Accept a platform invitation."""
    service = PlatformIdentityService(db)
    await service.accept_invitation(token, current_user.id)
    return {"message": "Invitation accepted successfully"}
