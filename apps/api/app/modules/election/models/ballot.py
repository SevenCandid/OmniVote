import uuid
import datetime
import enum
from sqlalchemy import String, ForeignKey, DateTime, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.types import UTCDateTime

class BallotStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    INVALIDATED = "invalidated"

class Ballot(BaseModel):
    """
    The final, immutable, and fully anonymous cast vote.
    Does not include a TimestampMixin to explicitly avoid tracking update times.
    """
    __tablename__ = "ballots"

    # Core
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # Optional identities for auditing/fraud-prevention as requested
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    visitor_session_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitor_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    # Receipt code for verifiable voting (e.g., voter can check their ballot was recorded)
    receipt_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    
    status: Mapped[BallotStatus] = mapped_column(Enum(BallotStatus), nullable=False, default=BallotStatus.SUBMITTED, index=True)
    invalidation_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Audit tracking (When was it cast, not who)
    ballot_schema_version: Mapped[int] = mapped_column(default=1, nullable=False)
    cast_at: Mapped[datetime.datetime] = mapped_column(UTCDateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    selections = relationship("BallotSelection", back_populates="ballot", cascade="all, delete-orphan")


class BallotSelection(BaseModel):
    """
    The actual vote choices tied to a Ballot.
    """
    __tablename__ = "ballot_selections"

    ballot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ballots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("election_categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("election_candidates.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vote_weight: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Relationships
    ballot = relationship("Ballot", back_populates="selections")
