import enum
import uuid
import datetime
from sqlalchemy import ForeignKey, String, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime

class NotificationType(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ALERT = "ALERT"
    SUCCESS = "SUCCESS"

class PlatformNotification(BaseModel, TimestampMixin):
    __tablename__ = "platform_notifications"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, name="notification_type_enum", create_type=False),
        default=NotificationType.INFO,
        server_default="INFO",
        nullable=False
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    metadata_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
