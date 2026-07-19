import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.membership.schemas.membership import MembershipResponse
from app.modules.membership.schemas.invitation import InvitationCreate, InvitationResponse
from app.modules.membership.services.membership_service import MembershipService
from app.modules.membership.services.invitation_service import InvitationService

router = APIRouter()

@router.post("/{organization_id}/members/invite", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_member(
    organization_id: uuid.UUID,
    payload: InvitationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = InvitationService(db)
    return await service.create_invitation(
        current_user_id=current_user.id,
        org_id=organization_id,
        recipient_email=payload.recipient_email,
        roles=payload.initial_roles
    )

@router.get("/{organization_id}/members", response_model=list[MembershipResponse])
async def list_organization_members(
    organization_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Sequence[MembershipResponse]:
    service = MembershipService(db)
    return await service.get_organization_members(organization_id)

@router.get("/{organization_id}/members/pending", response_model=list[InvitationResponse])
async def list_pending_invitations(
    organization_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Sequence[InvitationResponse]:
    service = InvitationService(db)
    return await service.get_pending_invitations_for_org(organization_id)
