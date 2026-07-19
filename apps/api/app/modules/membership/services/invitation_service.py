import uuid
import secrets
from datetime import datetime, timezone, timedelta
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.identity.services.audit_service import AuditService
from app.modules.membership.models.invitation import Invitation, InvitationStatus
from app.modules.membership.repositories.invitation_repository import InvitationRepository
from app.modules.membership.models.membership import Membership, MembershipStatus
from app.modules.membership.repositories.membership_repository import MembershipRepository
from sqlalchemy import select
from app.identity.models.user import User
from app.modules.rbac.repositories.rbac_repository import RBACRepository

class InvitationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = InvitationRepository(session)
        self.membership_repo = MembershipRepository(session)
        self.audit_service = AuditService()

    async def _get_utc_now(self) -> datetime:
        return datetime.now(timezone.utc)

    async def create_invitation(
        self, current_user_id: uuid.UUID, org_id: uuid.UUID, recipient_email: str, roles: list[str] | None = None
    ) -> Invitation:
        # Check if recipient already has an active membership
        stmt = select(User).where(User.email == recipient_email, User.is_deleted == False)
        result = await self.session.execute(stmt)
        recipient_user = result.scalar_one_or_none()
        
        if recipient_user:
            existing_membership = await self.membership_repo.get_membership_by_user_and_org(recipient_user.id, org_id)
            if existing_membership and existing_membership.status in [MembershipStatus.ACCEPTED, MembershipStatus.SUSPENDED]:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User is already a member of this organization."
                )

        # Generate secure token
        token = secrets.token_urlsafe(32)
        
        # Default expiration to 7 days
        expires_at = await self._get_utc_now() + timedelta(days=7)

        # Remove 'Owner' from requested roles
        filtered_roles = [r for r in (roles or []) if r.lower() != "owner"]

        invitation = Invitation(
            organization_id=org_id,
            invited_by=current_user_id,
            recipient_email=recipient_email,
            recipient_user_id=recipient_user.id if recipient_user else None,
            invitation_token=token,
            status=InvitationStatus.PENDING,
            initial_roles=filtered_roles,
            expires_at=expires_at
        )
        
        invitation = await self.repository.create_invitation(invitation)

        await self.audit_service.log_event(
            db=self.session,
            event_type="invitation_created",
            user_id=current_user_id,
            metadata_payload={
                "recipient_email": recipient_email, 
                "roles": filtered_roles,
                "organization_id": str(org_id),
                "invitation_id": str(invitation.id)
            }
        )
        return invitation

    async def get_invitation_by_token(self, token: str) -> Invitation:
        invitation = await self.repository.get_invitation_by_token(token)
        if not invitation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found.")
        return invitation

    async def accept_invitation(self, user_id: uuid.UUID, token: str) -> Membership:
        invitation = await self.get_invitation_by_token(token)
        
        now = await self._get_utc_now()
        
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation is no longer pending.")
            
        if invitation.expires_at < now:
            invitation.status = InvitationStatus.EXPIRED
            await self.repository.update_invitation(invitation)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation has expired.")
            
        # Verify the accepting user matches the intended recipient if email/user was specified
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user or user.email != invitation.recipient_email:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This invitation was sent to a different email address.")

        # Create membership
        membership = Membership(
            user_id=user_id,
            organization_id=invitation.organization_id,
            status=MembershipStatus.ACCEPTED,
            invited_by=invitation.invited_by,
            invited_at=invitation.created_at,
            accepted_at=now
        )
        membership = await self.membership_repo.create_membership(membership)

        # Assign roles
        rbac_repo = RBACRepository(self.session)
        roles_to_assign = invitation.initial_roles
        if not roles_to_assign:
            roles_to_assign = ["Member"]
            
        from app.modules.rbac.models.rbac import MembershipRole
        
        for role_name in roles_to_assign:
            if role_name.lower() == "owner":
                continue # Safety check
            role = await rbac_repo.get_role_by_name(role_name, invitation.organization_id)
            if not role:
                role = await rbac_repo.get_role_by_name(role_name, None)
            if role:
                await rbac_repo.assign_role_to_membership(MembershipRole(
                    membership_id=membership.id,
                    role_id=role.id,
                    assigned_by=invitation.invited_by
                ))

        # Update invitation
        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = now
        invitation.recipient_user_id = user_id
        await self.repository.update_invitation(invitation)

        await self.audit_service.log_event(
            db=self.session,
            event_type="invitation_accepted",
            user_id=user_id,
            metadata_payload={
                "invitation_id": str(invitation.id),
                "organization_id": str(invitation.organization_id),
                "membership_id": str(membership.id)
            }
        )
        
        return membership

    async def decline_invitation(self, user_id: uuid.UUID, token: str) -> Invitation:
        invitation = await self.get_invitation_by_token(token)
        now = await self._get_utc_now()
        
        if invitation.status != InvitationStatus.PENDING:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invitation is no longer pending.")
            
        # Verify the declining user matches the intended recipient
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user or user.email != invitation.recipient_email:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This invitation was sent to a different email address.")

        invitation.status = InvitationStatus.DECLINED
        invitation.declined_at = now
        invitation.recipient_user_id = user_id
        await self.repository.update_invitation(invitation)

        await self.audit_service.log_event(
            db=self.session,
            event_type="invitation_declined",
            user_id=user_id,
            metadata_payload={
                "invitation_id": str(invitation.id),
                "organization_id": str(invitation.organization_id)
            }
        )
        return invitation

    async def get_pending_invitations_for_org(self, org_id: uuid.UUID) -> Sequence[Invitation]:
        return await self.repository.get_pending_invitations_for_org(org_id)

    async def get_pending_invitations_for_user(self, user_id: uuid.UUID) -> Sequence[Invitation]:
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if not user:
            return []
        return await self.repository.get_pending_invitations_for_user(email=user.email, user_id=user_id)
