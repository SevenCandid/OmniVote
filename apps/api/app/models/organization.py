import uuid
from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database.base import BaseModel
from app.database.mixins import AuditMixin, SoftDeleteMixin, TimestampMixin
from sqlalchemy import Index, text


class OrganizationStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class OrganizationVerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    REJECTED = "rejected"
    MORE_INFO_REQUESTED = "more_info_requested"


class Organization(BaseModel, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = "organizations"
    __table_args__ = (
        Index(
            "ix_organizations_slug",
            "slug",
            unique=True,
            postgresql_where=text("is_deleted = false"),
        ),
    )

    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    legal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    country: Mapped[str | None] = mapped_column(String(2), nullable=True)  # ISO 3166-1 alpha-2
    timezone: Mapped[str | None] = mapped_column(String(100), nullable=True, default="UTC")
    preferred_language: Mapped[str | None] = mapped_column(String(10), nullable=True, default="en")
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True, default="USD")
    
    status: Mapped[OrganizationStatus] = mapped_column(
        Enum(OrganizationStatus, name="organization_status_enum"),
        default=OrganizationStatus.ACTIVE,
        nullable=False
    )
    
    verification_status: Mapped[OrganizationVerificationStatus] = mapped_column(
        Enum(OrganizationVerificationStatus, name="organization_verification_status_enum"),
        default=OrganizationVerificationStatus.UNVERIFIED,
        nullable=False
    )

    # Relationships
    settings: Mapped["OrganizationSettings"] = relationship(
        "OrganizationSettings", back_populates="organization", uselist=False, cascade="all, delete-orphan"
    )
    branding: Mapped["OrganizationBranding"] = relationship(
        "OrganizationBranding", back_populates="organization", uselist=False, cascade="all, delete-orphan"
    )
    subscription: Mapped["OrganizationSubscription"] = relationship(
        "OrganizationSubscription", back_populates="organization", uselist=False, cascade="all, delete-orphan"
    )


class OrganizationSettings(BaseModel, TimestampMixin, AuditMixin):
    __tablename__ = "organization_settings"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    
    default_timezone: Mapped[str] = mapped_column(String(100), default="UTC", nullable=False)
    date_format: Mapped[str] = mapped_column(String(50), default="YYYY-MM-DD", nullable=False)
    time_format: Mapped[str] = mapped_column(String(50), default="24h", nullable=False)
    
    default_event_visibility: Mapped[str] = mapped_column(String(50), default="private", nullable=False)
    default_result_visibility: Mapped[str] = mapped_column(String(50), default="private", nullable=False)
    
    # Placeholder for default voting rules (JSON structure mapped to Pydantic later)
    default_voting_rules: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="settings")


class OrganizationBranding(BaseModel, TimestampMixin, AuditMixin):
    __tablename__ = "organization_branding"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    logo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    banner_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    favicon_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    
    primary_color: Mapped[str | None] = mapped_column(String(7), nullable=True, default="#2563eb") # Hex code
    secondary_color: Mapped[str | None] = mapped_column(String(7), nullable=True, default="#475569")
    accent_color: Mapped[str | None] = mapped_column(String(7), nullable=True, default="#f59e0b")
    
    theme_preference: Mapped[str] = mapped_column(String(20), default="system", nullable=False)

    organization: Mapped["Organization"] = relationship("Organization", back_populates="branding")


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    TRIALING = "trialing"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"


class OrganizationSubscription(BaseModel, TimestampMixin, AuditMixin):
    __tablename__ = "organization_subscriptions"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    current_plan: Mapped[str] = mapped_column(String(100), default="free", nullable=False)
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus, name="subscription_status_enum"),
        default=SubscriptionStatus.TRIALING,
        nullable=False
    )
    
    is_trial: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    trial_expires_at: Mapped[str | None] = mapped_column(String(100), nullable=True) # Could use datetime, keeping simple for foundation

    organization: Mapped["Organization"] = relationship("Organization", back_populates="subscription")
