import uuid
import datetime
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.types import UTCDateTime
from app.identity.models.user import User


class Credential(BaseModel):
    __tablename__ = "identity_credentials"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(1024), nullable=False)
    password_updated_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    locked_until: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)

    user: Mapped["User"] = relationship()
