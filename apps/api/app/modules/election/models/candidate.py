import enum
import uuid
import datetime
from sqlalchemy import String, ForeignKey, Enum, Boolean, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime


class CandidateStatus(str, enum.Enum):
    ACTIVE = "active"
    WITHDRAWN = "withdrawn"
    DISQUALIFIED = "disqualified"


class ElectionCandidate(BaseModel, TimestampMixin):
    __tablename__ = "election_candidates"

    # Identity
    election_category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("election_categories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # Ordering and Ballot representation
    candidate_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # General
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    photo: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    manifesto: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    status: Mapped[CandidateStatus] = mapped_column(
        Enum(CandidateStatus), nullable=False, default=CandidateStatus.ACTIVE, index=True
    )

    # Soft deletion
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    category = relationship("ElectionCategory", back_populates="candidates")

    # Ensure candidate_number is unique within an election category for non-deleted candidates.
    # Note: A partial unique index is better implemented in the alembic migration explicitly,
    # but we can declare a standard UniqueConstraint here if we assume soft deletes might be handled application-side.
    # Given SQLAlchemy, partial indexes are dialect specific, so we will rely on application logic + 
    # potentially adding an explicit partial index in Alembic.
