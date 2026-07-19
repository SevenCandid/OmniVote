import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.modules.membership.models.invitation import InvitationStatus
from app.schemas.organization import OrganizationBase

class OrganizationBasicResponse(BaseModel):
    id: uuid.UUID
    name: str

    model_config = ConfigDict(from_attributes=True)

class InvitationCreate(BaseModel):
    recipient_email: EmailStr
    initial_roles: list[str] = Field(default_factory=list, description="List of role names to assign upon acceptance")

class InvitationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    invited_by: uuid.UUID
    recipient_email: str
    recipient_user_id: uuid.UUID | None = None
    status: InvitationStatus
    initial_roles: list[str]
    expires_at: datetime
    accepted_at: datetime | None = None
    declined_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    
    organization: OrganizationBasicResponse | None = None

    model_config = ConfigDict(from_attributes=True)

class InvitationDetailsResponse(BaseModel):
    """Public facing details for an invitation (does not expose internal UUIDs besides org if needed)."""
    id: uuid.UUID
    organization_name: str
    invited_by_name: str | None = None # Could be populated in service
    recipient_email: str
    status: InvitationStatus
    expires_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InvitationAcceptRequest(BaseModel):
    invitation_token: str
