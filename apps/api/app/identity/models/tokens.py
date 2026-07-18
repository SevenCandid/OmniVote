from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime

from app.database.base import Base

class VerificationToken(Base):
    __tablename__ = "verification_tokens"

    token = Column(String(128), primary_key=True, index=True)
    user_id = Column(ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    token = Column(String(128), primary_key=True, index=True)
    user_id = Column(ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User")
