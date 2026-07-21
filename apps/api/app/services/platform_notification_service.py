import uuid
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.notification import PlatformNotification
from app.schemas.platform_notification import PlatformNotificationResponse
from app.identity.models.user import User

class PlatformNotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_notifications(
        self, current_user: User, limit: int = 50, skip: int = 0, unread_only: bool = False
    ) -> tuple[int, int, list[PlatformNotificationResponse]]:
        """
        Get paginated notifications for the current user.
        """
        # User specific or global (user_id is null)
        stmt = select(PlatformNotification).where(
            (PlatformNotification.user_id == current_user.id) | (PlatformNotification.user_id.is_(None))
        )
        count_stmt = select(func.count(PlatformNotification.id)).where(  # pylint: disable=not-callable
            (PlatformNotification.user_id == current_user.id) | (PlatformNotification.user_id.is_(None))
        )
        
        unread_count_stmt = count_stmt.where(PlatformNotification.is_read == False)

        if unread_only:
            stmt = stmt.where(PlatformNotification.is_read == False)
            count_stmt = count_stmt.where(PlatformNotification.is_read == False)

        stmt = stmt.order_by(desc(PlatformNotification.created_at)).offset(skip).limit(limit)

        total = await self.db.scalar(count_stmt) or 0
        unread_count = await self.db.scalar(unread_count_stmt) or 0
        
        result = await self.db.execute(stmt)
        notifications = result.scalars().all()

        return total, unread_count, [PlatformNotificationResponse.model_validate(n) for n in notifications]

    async def mark_as_read(self, current_user: User, notification_id: uuid.UUID) -> PlatformNotificationResponse:
        """
        Mark a specific notification as read.
        """
        stmt = select(PlatformNotification).where(
            PlatformNotification.id == notification_id,
            ((PlatformNotification.user_id == current_user.id) | (PlatformNotification.user_id.is_(None)))
        )
        result = await self.db.execute(stmt)
        notification = result.scalar_one_or_none()

        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

        notification.is_read = True
        await self.db.commit()
        await self.db.refresh(notification)

        return PlatformNotificationResponse.model_validate(notification)
