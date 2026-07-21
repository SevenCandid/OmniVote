import uuid
import datetime
from pydantic import BaseModel, Field
from app.modules.support.models.support import SupportRequestStatus, SessionStatus


class SupportRequestCreate(BaseModel):
    description: str = Field(..., min_length=10, max_length=1000)
    request_type: str = Field("GENERAL", max_length=50)


class SupportRequestResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    requested_by: uuid.UUID
    request_type: str
    description: str
    status: SupportRequestStatus
    created_at: datetime.datetime
    resolved_at: datetime.datetime | None = None

    class Config:
        from_attributes = True


class SupportSessionResponse(BaseModel):
    id: uuid.UUID
    platform_user_id: uuid.UUID
    organization_id: uuid.UUID
    support_request_id: uuid.UUID | None = None
    access_level: str
    reason: str
    expires_at: datetime.datetime
    status: SessionStatus
    created_at: datetime.datetime
    ended_at: datetime.datetime | None = None

    class Config:
        from_attributes = True


class EmergencySessionCreate(BaseModel):
    organization_id: uuid.UUID
    reason: str = Field(..., min_length=10, max_length=500)
    duration_minutes: int = Field(60, ge=5, le=1440)
