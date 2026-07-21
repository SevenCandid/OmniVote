import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class PlatformStatisticsResponse(BaseModel):
    total_organizations: int = Field(..., description="Total number of organizations")
    verified_organizations: int = Field(..., description="Number of verified organizations")
    pending_verification: int = Field(..., description="Number of organizations pending verification")
    platform_users: int = Field(..., description="Number of platform administrators/owners")
    standard_users: int = Field(..., description="Number of standard users")
    active_support_sessions: int = Field(..., description="Number of active support sessions")
    open_support_requests: int = Field(..., description="Number of open support requests")

class PlatformActivityLogResponse(BaseModel):
    id: str | uuid.UUID
    timestamp: datetime
    event_type: str
    user_id: uuid.UUID | None = None
    ip_address: str | None = None
    metadata_payload: dict | None = Field(None, alias="metadata")

    class Config:
        populate_by_name = True
