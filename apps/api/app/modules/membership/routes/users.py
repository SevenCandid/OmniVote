import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.membership.schemas.membership import MembershipResponse
from app.modules.membership.schemas.invitation import InvitationResponse
from app.modules.membership.services.membership_service import MembershipService
from app.modules.membership.services.invitation_service import InvitationService

router = APIRouter()

@router.get("/me/organizations", response_model=list[MembershipResponse])
async def list_user_organizations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Sequence[MembershipResponse]:
    service = MembershipService(db)
    return await service.get_user_organizations(current_user.id)

@router.get("/me/invitations", response_model=list[InvitationResponse])
async def list_user_invitations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Sequence[InvitationResponse]:
    service = InvitationService(db)
    return await service.get_pending_invitations_for_user(current_user.id)
