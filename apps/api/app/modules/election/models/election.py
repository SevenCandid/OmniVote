import enum
import uuid
import datetime
from sqlalchemy import String, ForeignKey, Enum, Boolean, DateTime, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime

class ElectionStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIGURED = "configured"
    PUBLISHED = "published"
    VOTING_OPEN = "voting_open"
    VOTING_PAUSED = "voting_paused"
    VOTING_CLOSED = "voting_closed"
    COUNTING = "counting"
    RESULTS_PUBLISHED = "results_published"
    ARCHIVED = "archived"
    CANCELLED = "cancelled"

class ElectionType(str, enum.Enum):
    GENERAL_ELECTION = "general_election"
    REFERENDUM = "referendum"
    SURVEY = "survey"
    POLL = "poll"
    AWARD_VOTING = "award_voting"
    CONTEST = "contest"
    COMMITTEE_ELECTION = "committee_election"
    CUSTOM = "custom"

class Visibility(str, enum.Enum):
    PRIVATE = "private"
    ORGANIZATION_ONLY = "organization_only"
    PUBLIC = "public"
    UNLISTED = "unlisted"


class ResultVisibility(str, enum.Enum):
    HIDDEN = "hidden"
    LIVE = "live"
    AFTER_CLOSE = "after_close"
    ADMIN_ONLY = "admin_only"
    PUBLIC = "public"

class PublicVerificationMethod(str, enum.Enum):
    NONE = "none"
    EMAIL_OTP = "email_otp"
    SMS_OTP = "sms_otp"
    PHONE = "phone"
    PLATFORM_ACCOUNT = "platform_account"

class Election(BaseModel, TimestampMixin):
    __tablename__ = "elections"

    # Identity
    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    slug: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    public_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)

    # General
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    election_type: Mapped[ElectionType] = mapped_column(Enum(ElectionType), nullable=False, default=ElectionType.CUSTOM)
    status: Mapped[ElectionStatus] = mapped_column(Enum(ElectionStatus), nullable=False, default=ElectionStatus.DRAFT, index=True)

    # Visibility
    visibility: Mapped[Visibility] = mapped_column(Enum(Visibility), nullable=False, default=Visibility.PRIVATE)
    result_visibility: Mapped[ResultVisibility] = mapped_column(Enum(ResultVisibility), nullable=False, default=ResultVisibility.HIDDEN)

    # Scheduling
    registration_opens_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    registration_closes_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    voting_opens_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    voting_closes_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    results_publish_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    
    # Fallback voter count for closed elections before VoterRegistry exists
    expected_voter_count: Mapped[int | None] = mapped_column(nullable=True)

    # Configuration
    voting_engine_version: Mapped[int] = mapped_column(default=1, nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="UTC")
    allow_anonymous_voting: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    automatically_publish_results: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    require_voter_verification: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    allow_admin_live_results: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Public & Paid Voting Configuration
    public_verification_method: Mapped[PublicVerificationMethod] = mapped_column(Enum(PublicVerificationMethod), default=PublicVerificationMethod.NONE, nullable=False)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cost_per_vote: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(10), nullable=True)
    min_payment: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    max_payment: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    preset_amounts: Mapped[list | None] = mapped_column(JSON, nullable=True)
    allow_custom_amount: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Metadata & Tracking
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )
    
    # Soft deletion
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    deleted_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    categories = relationship("ElectionCategory", back_populates="election", cascade="all, delete-orphan")
