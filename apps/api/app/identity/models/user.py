import enum
import datetime
from sqlalchemy import String, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin, SoftDeleteMixin
from app.database.types import UTCDateTime


class AccountStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    SUSPENDED = "SUSPENDED"
    DISABLED = "DISABLED"


class User(BaseModel, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "identity_users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    
    status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status_enum", create_type=False),
        nullable=False,
        default=AccountStatus.PENDING_VERIFICATION,
        server_default="PENDING_VERIFICATION",
    )
    
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    last_login_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
