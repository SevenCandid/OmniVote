"""
Organization schemas.
"""
import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl

# pylint: disable=import-error
from app.models.organization import (
    OrganizationStatus,
    SubscriptionStatus,
    OrganizationVerificationStatus
)

# --- Base Models ---

class OrganizationBase(BaseModel):
    """Base schema for an organization."""
    name: str = Field(..., min_length=2, max_length=255)
    legal_name: Optional[str] = Field(None, max_length=255)
    slug: str = Field(..., min_length=2, max_length=100, pattern=r"^[a-z0-9-]+$")
    description: Optional[str] = None
    website: Optional[HttpUrl] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    timezone: Optional[str] = Field("UTC", max_length=100)
    preferred_language: Optional[str] = Field("en", max_length=10)
    currency: Optional[str] = Field("USD", min_length=3, max_length=3)

class OrganizationSettingsBase(BaseModel):
    """Base schema for organization settings."""
    default_timezone: str = Field("UTC", max_length=100)
    date_format: str = Field("YYYY-MM-DD", max_length=50)
    time_format: str = Field("24h", max_length=50)
    default_event_visibility: str = Field("private", max_length=50)
    default_result_visibility: str = Field("private", max_length=50)
    default_voting_rules: Optional[str] = None

class OrganizationBrandingBase(BaseModel):
    """Base schema for organization branding."""
    logo_url: Optional[HttpUrl] = None
    banner_url: Optional[HttpUrl] = None
    favicon_url: Optional[HttpUrl] = None
    primary_color: Optional[str] = Field("#2563eb", pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    secondary_color: Optional[str] = Field("#475569", pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    accent_color: Optional[str] = Field("#f59e0b", pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    theme_preference: str = Field("system", max_length=20)

class OrganizationSubscriptionBase(BaseModel):
    """Base schema for organization subscription."""
    current_plan: str = Field("free", max_length=100)
    status: SubscriptionStatus = SubscriptionStatus.TRIALING
    is_trial: bool = True
    trial_expires_at: Optional[str] = None

# --- Create Models ---

class OrganizationCreate(OrganizationBase):
    """Schema for creating a new organization."""
    pass

# --- Update Models ---

class OrganizationUpdate(BaseModel):
    """Schema for updating an organization."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    legal_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    website: Optional[HttpUrl] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    timezone: Optional[str] = Field(None, max_length=100)
    preferred_language: Optional[str] = Field(None, max_length=10)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    status: Optional[OrganizationStatus] = None
    verification_status: Optional[OrganizationVerificationStatus] = None

class TransferOwnershipRequest(BaseModel):
    """Schema for transferring organization ownership."""
    target_membership_id: uuid.UUID

class OrganizationSettingsUpdate(BaseModel):
    """Schema for updating organization settings."""
    default_timezone: Optional[str] = Field(None, max_length=100)
    date_format: Optional[str] = Field(None, max_length=50)
    time_format: Optional[str] = Field(None, max_length=50)
    default_event_visibility: Optional[str] = Field(None, max_length=50)
    default_result_visibility: Optional[str] = Field(None, max_length=50)
    default_voting_rules: Optional[str] = None

class OrganizationBrandingUpdate(BaseModel):
    """Schema for updating organization branding."""
    logo_url: Optional[HttpUrl] = None
    banner_url: Optional[HttpUrl] = None
    favicon_url: Optional[HttpUrl] = None
    primary_color: Optional[str] = Field(None, pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    secondary_color: Optional[str] = Field(None, pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    accent_color: Optional[str] = Field(None, pattern=r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    theme_preference: Optional[str] = Field(None, max_length=20)

# --- Response Models ---

class OrganizationSettingsResponse(OrganizationSettingsBase):
    """Schema for organization settings response."""
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class OrganizationBrandingResponse(OrganizationBrandingBase):
    """Schema for organization branding response."""
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class OrganizationSubscriptionResponse(OrganizationSubscriptionBase):
    """Schema for organization subscription response."""
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

class OrganizationResponse(OrganizationBase):
    """Schema for organization response."""
    id: uuid.UUID
    status: OrganizationStatus
    verification_status: OrganizationVerificationStatus
    is_deleted: bool

    settings: Optional[OrganizationSettingsResponse] = None
    branding: Optional[OrganizationBrandingResponse] = None
    subscription: Optional[OrganizationSubscriptionResponse] = None

    model_config = ConfigDict(from_attributes=True)
