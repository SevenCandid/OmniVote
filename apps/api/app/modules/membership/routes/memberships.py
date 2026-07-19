import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.membership.schemas.membership import MembershipResponse
from app.modules.membership.services.membership_service import MembershipService

router = APIRouter()

@router.post("/{membership_id}/accept", response_model=MembershipResponse)
async def accept_invitation(
    membership_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = MembershipService(db)
    return await service.accept_invitation(
        user_id=current_user.id,
        membership_id=membership_id
    )

@router.post("/{membership_id}/decline", response_model=MembershipResponse)
async def decline_invitation(
    membership_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = MembershipService(db)
    return await service.decline_invitation(
        user_id=current_user.id,
        membership_id=membership_id
    )

@router.delete("/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_membership(
    membership_id: uuid.UUID,
    organization_id: uuid.UUID, # Requires organization context to ensure caller has admin rights (RBAC future)
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    service = MembershipService(db)
    await service.remove_member(
        admin_user_id=current_user.id,
        org_id=organization_id,
        membership_id=membership_id
    )
    return None
