import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from app.schemas.organization import OrganizationResponse
from app.models.organization import OrganizationStatus, OrganizationVerificationStatus

class PlatformOrganizationResponse(OrganizationResponse):
    """
    Extended organization response for platform administrators.
    Includes additional metadata like owner information and statistics.
    """
    created_at: datetime
    owner_email: Optional[str] = None
    member_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class PlatformOrganizationListResponse(BaseModel):
    """
    Paginated response for platform organization list.
    """
    items: list[PlatformOrganizationResponse]
    total: int
    skip: int
    limit: int

class PlatformOrganizationStatusUpdate(BaseModel):
    """
    Payload to suspend or reactivate an organization from the platform.
    """
    status: OrganizationStatus
    reason: Optional[str] = None

class PlatformOrganizationVerificationUpdate(BaseModel):
    """
    Payload to approve, reject, or request more info during verification.
    """
    verification_status: OrganizationVerificationStatus
    reason: Optional[str] = None
