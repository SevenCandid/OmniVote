import enum
import uuid
import datetime
from sqlalchemy import ForeignKey, String, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime


class SupportRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class SessionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    TERMINATED = "TERMINATED"


class SupportRequest(BaseModel, TimestampMixin):
    __tablename__ = "support_requests"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    request_type: Mapped[str] = mapped_column(String(50), default="GENERAL", server_default="GENERAL", nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    status: Mapped[SupportRequestStatus] = mapped_column(
        Enum(SupportRequestStatus, name="support_request_status_enum", create_type=False),
        default=SupportRequestStatus.PENDING,
        server_default="PENDING",
        nullable=False
    )
    resolved_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)


class SupportSession(BaseModel, TimestampMixin):
    __tablename__ = "support_sessions"

    platform_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    support_request_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("support_requests.id", ondelete="SET NULL"), nullable=True, index=True
    )
    access_level: Mapped[str] = mapped_column(String(50), default="Platform Support", server_default="Platform Support", nullable=False)
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    expires_at: Mapped[datetime.datetime] = mapped_column(UTCDateTime, nullable=False)
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, name="session_status_enum", create_type=False),
        default=SessionStatus.ACTIVE,
        server_default="ACTIVE",
        nullable=False
    )
    ended_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
