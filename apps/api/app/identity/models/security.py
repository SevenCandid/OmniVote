import uuid
import datetime
from sqlalchemy import String, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import BaseModel
from app.database.types import UTCDateTime


class SecurityEvent(BaseModel):
    __tablename__ = "identity_security_events"

    # Nullable because some events (like failed login with bad email) might not map to a user ID securely
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    
    metadata_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime.datetime] = mapped_column(
        UTCDateTime, server_default=func.now(), nullable=False, index=True
    )
