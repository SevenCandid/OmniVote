import uuid
import datetime
from sqlalchemy import String, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime

class VoterGroup(BaseModel, TimestampMixin):
    __tablename__ = "voter_groups"

    # Identity
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)

    __table_args__ = (
        UniqueConstraint('election_id', 'name', name='uq_voter_group_name_per_election'),
    )

    # Soft deletion
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )

    voters = relationship("EligibleVoter", back_populates="group")


class EligibleVoter(BaseModel, TimestampMixin):
    __tablename__ = "eligible_voters"

    # Identity
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    voter_identifier: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. student ID, employee ID
    
    # Personal Info
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(15), nullable=True)
    
    # Grouping
    group_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("voter_groups.id", ondelete="SET NULL"), nullable=True
    )

    # State
    has_voted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint('election_id', 'voter_identifier', name='uq_voter_identifier_per_election'),
    )

    # Soft deletion
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    group = relationship("VoterGroup", back_populates="voters")
