import uuid
from datetime import datetime, timedelta, timezone
import secrets
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Sequence

from app.identity.models.user import User
from app.modules.rbac.repositories.rbac_repository import RBACRepository
from app.schemas.platform_identity import (
    PlatformUserResponse,
    PlatformRoleResponse,
    PlatformInvitationCreate,
    PlatformInvitationResponse,
    PlatformUserUpdate,
    PlatformEffectivePermissionsResponse,
    PlatformInvitationDetailsResponse
)
from app.modules.rbac.models.rbac import PlatformInvitation

class PlatformIdentityService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rbac_repo = RBACRepository(db)

    async def list_platform_users(self) -> list[PlatformUserResponse]:
        users = await self.rbac_repo.list_platform_users()
        response = []
        for user in users:
            identity = await self.rbac_repo.get_platform_identity(user.id)
            roles = await self.rbac_repo.get_user_platform_roles(user.id)
            
            response.append(PlatformUserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                is_active=user.status == "ACTIVE",
                status=identity.status if identity else "ACTIVE",
                roles=[PlatformRoleResponse.model_validate(r) for r in roles],
                created_at=identity.created_at if identity else user.created_at,
                last_login_at=user.last_login_at
            ))
        return response

    async def get_platform_user(self, user_id: uuid.UUID) -> PlatformUserResponse:
        from sqlalchemy import select
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platform user not found")
            
        identity = await self.rbac_repo.get_platform_identity(user.id)
        if not identity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not have a platform identity")

        roles = await self.rbac_repo.get_user_platform_roles(user.id)
        
        return PlatformUserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_active=user.status == "ACTIVE",
            status=identity.status,
            roles=[PlatformRoleResponse.model_validate(r) for r in roles],
            created_at=identity.created_at,
            last_login_at=user.last_login_at
        )

    async def update_platform_user(self, user_id: uuid.UUID, update_data: PlatformUserUpdate) -> PlatformUserResponse:
        identity = await self.rbac_repo.get_platform_identity(user_id)
        if not identity:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not have a platform identity")
            
        if update_data.status is not None:
            identity.status = update_data.status
            self.db.add(identity)
            
        if update_data.roles is not None:
            # Verify roles exist
            all_roles = await self.list_platform_roles()
            valid_role_ids = {r.id for r in all_roles}
            for rid in update_data.roles:
                if rid not in valid_role_ids:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid platform role ID: {rid}")
            
            await self.rbac_repo.replace_user_platform_roles(user_id, update_data.roles)
            
        await self.db.commit()
        return await self.get_platform_user(user_id)

    async def get_effective_permissions(self, user_id: uuid.UUID) -> PlatformEffectivePermissionsResponse:
        permissions = await self.rbac_repo.get_user_platform_permissions(user_id)
        return PlatformEffectivePermissionsResponse(permissions=list(permissions))

    async def list_platform_roles(self) -> list[PlatformRoleResponse]:
        roles = await self.rbac_repo.list_platform_roles()
        return [PlatformRoleResponse.model_validate(r) for r in roles]

    # --- Invitations ---

    async def list_invitations(self) -> list[PlatformInvitationResponse]:
        invitations = await self.rbac_repo.list_platform_invitations()
        # Fetch actual roles to include in response
        all_roles = await self.rbac_repo.list_platform_roles()
        role_map = {str(r.id): r for r in all_roles}
        
        response = []
        for inv in invitations:
            role_ids = inv.role_ids.split(",") if inv.role_ids else []
            inv_roles = [role_map[rid] for rid in role_ids if rid in role_map]
            
            response.append(PlatformInvitationResponse(
                id=inv.id,
                email=inv.email,
                status=inv.status,
                roles=[PlatformRoleResponse.model_validate(r) for r in inv_roles],
                inviter_id=inv.inviter_id,
                expires_at=inv.expires_at,
                created_at=inv.created_at
            ))
            
        return response

    async def get_invitation_details(self, token: str) -> PlatformInvitationDetailsResponse:
        invitation = await self.rbac_repo.get_platform_invitation_by_token(token)
        if not invitation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")

        from sqlalchemy import select
        result = await self.db.execute(select(User).where(User.id == invitation.inviter_id))
        invited_by_user = result.scalar_one_or_none()
        invited_by_name = f"{invited_by_user.first_name} {invited_by_user.last_name}" if invited_by_user and invited_by_user.first_name else "Platform Administrator"

        all_roles = await self.rbac_repo.list_platform_roles()
        role_map = {str(r.id): r for r in all_roles}
        role_ids = invitation.role_ids.split(",") if invitation.role_ids else []
        inv_roles = [role_map[rid] for rid in role_ids if rid in role_map]

        return PlatformInvitationDetailsResponse(
            id=invitation.id,
            email=invitation.email,
            status=invitation.status,
            roles=[PlatformRoleResponse.model_validate(r) for r in inv_roles],
            invited_by_name=invited_by_name,
            expires_at=invitation.expires_at
        )

    async def create_invitation(self, request: PlatformInvitationCreate, inviter_id: uuid.UUID) -> PlatformInvitationResponse:
        # Check if already a platform user
        from sqlalchemy import select
        result = await self.db.execute(select(User).where(User.email == request.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            identity = await self.rbac_repo.get_platform_identity(existing_user.id)
            if identity:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a platform user")
                
        # Validate roles
        all_roles = await self.rbac_repo.list_platform_roles()
        valid_role_ids = {r.id for r in all_roles}
        for rid in request.roles:
            if rid not in valid_role_ids:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid platform role ID: {rid}")
                
        token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(days=7)
        
        invitation = PlatformInvitation(
            email=request.email,
            token=token,
            role_ids=",".join(str(rid) for rid in request.roles),
            status="PENDING",
            inviter_id=inviter_id,
            expires_at=expires.isoformat()
        )
        
        await self.rbac_repo.create_platform_invitation(invitation)
        await self.db.commit()
        
        # In a real app, we would send an email here
        
        # Format response
        inv_roles = [r for r in all_roles if r.id in request.roles]
        return PlatformInvitationResponse(
            id=invitation.id,
            email=invitation.email,
            status=invitation.status,
            roles=[PlatformRoleResponse.model_validate(r) for r in inv_roles],
            inviter_id=invitation.inviter_id,
            expires_at=invitation.expires_at,
            created_at=invitation.created_at
        )

    async def update_invitation_status(self, invitation_id: uuid.UUID, new_status: str) -> PlatformInvitationResponse:
        invitation = await self.rbac_repo.get_platform_invitation_by_id(invitation_id)
        if not invitation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
            
        invitation.status = new_status
        self.db.add(invitation)
        await self.db.commit()
        
        # Construct response
        all_roles = await self.rbac_repo.list_platform_roles()
        role_map = {str(r.id): r for r in all_roles}
        role_ids = invitation.role_ids.split(",") if invitation.role_ids else []
        inv_roles = [role_map[rid] for rid in role_ids if rid in role_map]
        
        return PlatformInvitationResponse(
            id=invitation.id,
            email=invitation.email,
            status=invitation.status,
            roles=[PlatformRoleResponse.model_validate(r) for r in inv_roles],
            inviter_id=invitation.inviter_id,
            expires_at=invitation.expires_at,
            created_at=invitation.created_at
        )

    async def accept_invitation(self, token: str, user_id: uuid.UUID):
        """Used when a user accepts an invitation."""
        invitation = await self.rbac_repo.get_platform_invitation_by_token(token)
        if not invitation or invitation.status != "PENDING":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired invitation")
            
        expires_date = datetime.fromisoformat(invitation.expires_at)
        if expires_date < datetime.now(timezone.utc):
            invitation.status = "EXPIRED"
            self.db.add(invitation)
            await self.db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation expired")
            
        # Grant platform roles
        role_ids = [uuid.UUID(r) for r in invitation.role_ids.split(",") if r]
        
        identity = await self.rbac_repo.get_or_create_platform_identity(user_id)
        identity.status = "ACTIVE"
        
        await self.rbac_repo.replace_user_platform_roles(user_id, role_ids)
        
        invitation.status = "ACCEPTED"
        self.db.add(invitation)
        await self.db.commit()
