import logging
import uuid
from typing import Any, Protocol

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import PlatformNotification, NotificationType

logger = logging.getLogger(__name__)

class NotificationProvider(Protocol):
    async def send(self, user_id: uuid.UUID | None, title: str, message: str, type: NotificationType, metadata: dict | None = None) -> bool:
        ...

class InAppNotificationProvider:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send(self, user_id: uuid.UUID | None, title: str, message: str, type: NotificationType, metadata: dict | None = None) -> bool:
        try:
            notification = PlatformNotification(
                user_id=user_id,
                title=title,
                message=message,
                type=type,
                metadata_payload=metadata or {}
            )
            self.db.add(notification)
            await self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to save in-app notification: {e}")
            await self.db.rollback()
            return False

class SMSProvider:
    """Stub for future SMS integrations (e.g. Twilio)"""
    async def send(self, user_id: uuid.UUID | None, title: str, message: str, type: NotificationType, metadata: dict | None = None) -> bool:
        logger.info(f"SMS stub: would send '{title}' to user {user_id}")
        return True

class EmailProvider:
    """Stub for future Email integrations (e.g. SendGrid)"""
    async def send(self, user_id: uuid.UUID | None, title: str, message: str, type: NotificationType, metadata: dict | None = None) -> bool:
        logger.info(f"Email stub: would send '{title}' to user {user_id}")
        return True

class PushProvider:
    """Stub for future Push notifications (e.g. OneSignal)"""
    async def send(self, user_id: uuid.UUID | None, title: str, message: str, type: NotificationType, metadata: dict | None = None) -> bool:
        logger.info(f"Push stub: would send '{title}' to user {user_id}")
        return True

class WhatsAppProvider:
    """Stub for future WhatsApp integrations (e.g. Twilio WhatsApp)"""
    async def send(self, user_id: uuid.UUID | None, title: str, message: str, type: NotificationType, metadata: dict | None = None) -> bool:
        logger.info(f"WhatsApp stub: would send '{title}' to user {user_id}")
        return True

class NotificationDispatcher:
    def __init__(self, db: AsyncSession):
        # Initialize providers
        self.providers: list[NotificationProvider] = [
            InAppNotificationProvider(db),
            # SMSProvider(),
            # EmailProvider(),
            # PushProvider(),
            # WhatsAppProvider(),
        ]

    async def dispatch(self, title: str, message: str, type: NotificationType = NotificationType.INFO, user_id: uuid.UUID | None = None, metadata: dict | None = None) -> None:
        """
        Dispatch a notification to all configured providers.
        """
        for provider in self.providers:
            try:
                await provider.send(user_id=user_id, title=title, message=message, type=type, metadata=metadata)
            except Exception as e:
                logger.error(f"Provider {provider.__class__.__name__} failed to send notification: {e}")
