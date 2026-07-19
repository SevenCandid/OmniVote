import uuid
from typing import Sequence
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.membership.models.invitation import Invitation, InvitationStatus
from app.models.organization import Organization

class InvitationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_invitation(self, invitation: Invitation) -> Invitation:
        self.session.add(invitation)
        await self.session.commit()
        await self.session.refresh(invitation)
        return await self.get_invitation_by_id(invitation.id)

    async def get_invitation_by_id(self, invitation_id: uuid.UUID) -> Invitation | None:
        query = (
            select(Invitation)
            .options(selectinload(Invitation.organization))
            .where(Invitation.id == invitation_id)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_invitation_by_token(self, token: str) -> Invitation | None:
        query = (
            select(Invitation)
            .options(selectinload(Invitation.organization))
            .where(Invitation.invitation_token == token)
        )
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_all_invitations_for_org(self, org_id: uuid.UUID) -> Sequence[Invitation]:
        query = (
            select(Invitation)
            .options(selectinload(Invitation.organization))
            .where(Invitation.organization_id == org_id)
            .order_by(Invitation.created_at.desc())
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def get_all_invitations_for_user(self, email: str, user_id: uuid.UUID | None = None) -> Sequence[Invitation]:
        conditions = [Invitation.recipient_email == email]
        if user_id:
            conditions.append(Invitation.recipient_user_id == user_id)
            conditions.append(Invitation.invited_by == user_id)
        
        query = (
            select(Invitation)
            .join(Organization, Organization.id == Invitation.organization_id)
            .options(selectinload(Invitation.organization))
            .where(
                and_(
                    or_(*conditions),
                    Organization.is_deleted == False
                )
            )
            .order_by(Invitation.created_at.desc())
        )
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update_invitation(self, invitation: Invitation) -> Invitation:
        self.session.add(invitation)
        await self.session.commit()
        await self.session.refresh(invitation)
        return await self.get_invitation_by_id(invitation.id)

    async def delete_invitation(self, invitation: Invitation) -> None:
        await self.session.delete(invitation)
        await self.session.commit()
