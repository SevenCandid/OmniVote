from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.schemas.user import UserRead, UserUpdate
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.identity.services.audit_service import AuditService

router = APIRouter()

@router.get("/me", response_model=UserRead)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user

@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    request: Request,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update the currently authenticated user's profile."""
    if data.first_name is not None:
        current_user.first_name = data.first_name
    if data.last_name is not None:
        current_user.last_name = data.last_name
    if data.phone_number is not None:
        current_user.phone_number = data.phone_number
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url

    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    await AuditService.log_event(db, "Profile Update", current_user.id, ip_address, user_agent)
    await db.commit()
    await db.refresh(current_user)
    return current_user
