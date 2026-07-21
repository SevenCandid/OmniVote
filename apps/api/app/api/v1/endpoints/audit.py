from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.identity.models.security import SecurityEvent
from app.schemas.audit import PaginatedAuditResponse

router = APIRouter()

@router.get(
    "",
    response_model=PaginatedAuditResponse,
)
async def get_personal_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    event_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get personal security and audit events for the authenticated user.
    """
    base_query = select(SecurityEvent).where(SecurityEvent.user_id == current_user.id)
    
    if event_type:
        base_query = base_query.where(SecurityEvent.event_type == event_type)
        
    count_query = select(func.count()).select_from(base_query.subquery())
    total = await db.scalar(count_query) or 0
    
    query = base_query.order_by(desc(SecurityEvent.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return PaginatedAuditResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )
