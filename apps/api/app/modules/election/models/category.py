import enum
import uuid
import datetime
from sqlalchemy import String, ForeignKey, Enum, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime


class CategoryType(str, enum.Enum):
    POSITION = "position"
    CATEGORY = "category"

class VotingMethod(str, enum.Enum):
    FIRST_PAST_THE_POST = "first_past_the_post"
    APPROVAL = "approval"
    RANKED_CHOICE = "ranked_choice" # Prepared for future
    STV = "stv" # Prepared for future


class ElectionCategory(BaseModel, TimestampMixin):
    __tablename__ = "election_categories"

    # Identity
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # General
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    category_type: Mapped[CategoryType] = mapped_column(Enum(CategoryType), nullable=False, default=CategoryType.POSITION)
    
    # Configuration
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_winners: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    voting_method: Mapped[VotingMethod] = mapped_column(Enum(VotingMethod), nullable=False, default=VotingMethod.FIRST_PAST_THE_POST)

    # Soft deletion
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    election = relationship("Election", back_populates="categories")
    candidates = relationship("ElectionCandidate", back_populates="category", cascade="all, delete-orphan")
