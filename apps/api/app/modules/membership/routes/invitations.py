import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.membership.schemas.membership import MembershipResponse
from app.modules.membership.schemas.invitation import InvitationDetailsResponse, InvitationResponse
from app.modules.membership.services.invitation_service import InvitationService
from sqlalchemy import select

router = APIRouter()

@router.get("/{token}", response_model=InvitationDetailsResponse)
async def get_invitation_details(
    token: str,
    db: AsyncSession = Depends(get_db_session)
):
    service = InvitationService(db)
    invitation = await service.get_invitation_by_token(token)
    
    # We populate some fields for the public response
    stmt = select(User).where(User.id == invitation.invited_by)
    result = await db.execute(stmt)
    invited_by_user = result.scalar_one_or_none()
    invited_by_name = f"{invited_by_user.first_name} {invited_by_user.last_name}" if invited_by_user else "An Administrator"

    return InvitationDetailsResponse(
        id=invitation.id,
        organization_name=invitation.organization.name,
        invited_by_name=invited_by_name,
        recipient_email=invitation.recipient_email,
        status=invitation.status,
        expires_at=invitation.expires_at
    )

@router.post("/{token}/accept", response_model=MembershipResponse)
async def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = InvitationService(db)
    membership = await service.accept_invitation(current_user.id, token)
    return membership

@router.post("/{token}/decline", response_model=InvitationResponse)
async def decline_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = InvitationService(db)
    invitation = await service.decline_invitation(current_user.id, token)
    return invitation
