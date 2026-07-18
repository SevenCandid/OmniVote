from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.database.session import get_db_session
from app.identity.schemas.session import SessionRead
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.identity.models.session import Session
from app.identity.services.session_service import SessionService

router = APIRouter()

@router.get("/", response_model=List[SessionRead])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """List all active sessions for the current user."""
    stmt = select(Session).where(Session.user_id == current_user.id, Session.revoked_at.is_(None))
    result = await db.execute(stmt)
    return result.scalars().all()

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_session(
    session_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Revoke a specific session."""
    await SessionService.revoke_session(db, session_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
