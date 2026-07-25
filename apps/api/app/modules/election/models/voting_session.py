import enum
import uuid
import datetime
from sqlalchemy import String, ForeignKey, Enum, Boolean, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime

class VotingSessionStatus(str, enum.Enum):
    ACTIVE = "active"
    SUBMITTED = "submitted"
    EXPIRED = "expired"
    ABANDONED = "abandoned"

class VerificationMethod(str, enum.Enum):
    PLATFORM_ACCOUNT = "platform_account"
    STUDENT_ID = "student_id"
    EMPLOYEE_ID = "employee_id"
    EMAIL = "email"
    PHONE_NUMBER = "phone_number"
    USSD = "ussd"
    PUBLIC = "public"


class VotingSession(BaseModel, TimestampMixin):
    __tablename__ = "voting_sessions"

    # Core
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Identity (Flexible representation)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    visitor_session_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitor_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    voter_identifier: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    verification_method: Mapped[VerificationMethod] = mapped_column(
        Enum(VerificationMethod), nullable=False, default=VerificationMethod.PUBLIC
    )

    # State
    status: Mapped[VotingSessionStatus] = mapped_column(
        Enum(VotingSessionStatus), nullable=False, default=VotingSessionStatus.ACTIVE, index=True
    )
    expires_at: Mapped[datetime.datetime] = mapped_column(UTCDateTime, nullable=False)
    completed_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)

    # Relationships
    election = relationship("Election")
    selections = relationship("VotingSelection", back_populates="session", cascade="all, delete-orphan")


class VisitorSession(BaseModel, TimestampMixin):
    """
    Backend-managed session for anonymous voters to prevent tracking reliance on local storage.
    Ties together the VoteWallet and VotingSession securely.
    """
    __tablename__ = "visitor_sessions"
    
    # Bound to a specific election context
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # A secure token stored in an HttpOnly cookie
    visitor_token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    # Metadata for fraud prevention/audit
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    
    expires_at: Mapped[datetime.datetime] = mapped_column(UTCDateTime, nullable=False)
    
    # Relationships
    election = relationship("Election")


class VotingSelection(BaseModel, TimestampMixin):
    """
    Temporary draft selection associated with a VotingSession.
    These are deleted or ignored once the session is converted into a Ballot.
    """
    __tablename__ = "voting_selections"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("voting_sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("election_categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("election_candidates.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vote_weight: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Relationships
    session = relationship("VotingSession", back_populates="selections")
    category = relationship("ElectionCategory")
    candidate = relationship("ElectionCandidate")
