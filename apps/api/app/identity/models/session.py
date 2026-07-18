import uuid
import datetime
from sqlalchemy import String, Boolean, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.types import UTCDateTime
from app.identity.models.user import User


class Session(BaseModel):
    __tablename__ = "identity_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    refresh_token_hash: Mapped[str] = mapped_column(String(1024), unique=True, index=True, nullable=False)
    
    device_information: Mapped[str | None] = mapped_column(String(512), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    
    expires_at: Mapped[datetime.datetime] = mapped_column(UTCDateTime, nullable=False)
    revoked_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        UTCDateTime, server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship()
