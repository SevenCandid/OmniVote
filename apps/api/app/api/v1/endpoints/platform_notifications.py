import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.modules.rbac.dependencies import RequirePlatformPermission
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.schemas.platform_notification import PlatformNotificationResponse, PaginatedNotificationResponse
from app.services.platform_notification_service import PlatformNotificationService

router = APIRouter()

@router.get("", response_model=PaginatedNotificationResponse)
async def get_platform_notifications(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePlatformPermission("platform.configure")),
):
    """Get paginated platform notifications."""
    service = PlatformNotificationService(db)
    total, unread_count, items = await service.get_notifications(
        current_user, limit=limit, skip=skip, unread_only=unread_only
    )
    return PaginatedNotificationResponse(
        items=items, total=total, unread_count=unread_count, skip=skip, limit=limit
    )

@router.patch("/{notification_id}/read", response_model=PlatformNotificationResponse)
async def mark_notification_as_read(
    notification_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    auth_context: dict = Depends(RequirePlatformPermission("platform.configure")),
):
    """Mark a notification as read."""
    service = PlatformNotificationService(db)
    return await service.mark_as_read(current_user, notification_id)
