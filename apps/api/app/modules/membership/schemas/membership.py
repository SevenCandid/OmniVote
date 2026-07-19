import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.modules.membership.models.membership import MembershipStatus

class OrganizationBasicResponse(BaseModel):
    id: uuid.UUID
    name: str

    model_config = ConfigDict(from_attributes=True)

class MembershipBase(BaseModel):
    organization_id: uuid.UUID
    status: MembershipStatus = Field(default=MembershipStatus.PENDING)

class MembershipCreate(BaseModel):
    user_id: uuid.UUID
    organization_id: uuid.UUID
    roles: list[str] | None = Field(default=None, description="List of role names to assign upon acceptance")

class MembershipUpdate(BaseModel):
    status: MembershipStatus

class MembershipResponse(MembershipBase):
    id: uuid.UUID
    user_id: uuid.UUID
    invited_by: uuid.UUID | None = None
    invited_at: datetime | None = None
    accepted_at: datetime | None = None
    suspended_at: datetime | None = None
    removed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    organization: OrganizationBasicResponse | None = None

    model_config = ConfigDict(from_attributes=True)
