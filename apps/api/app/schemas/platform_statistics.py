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
    
    # New Growth Metrics
    org_growth_percentage: float = Field(0.0, description="Organization growth percentage in the last 30 days")
    user_growth_percentage: float = Field(0.0, description="User growth percentage in the last 30 days")
    
    # New Election Metrics
    total_elections: int = Field(0, description="Total number of elections")
    active_elections: int = Field(0, description="Number of active elections")
    
    # System Health
    system_health: dict = Field(default_factory=dict, description="System health status (e.g. database, redis, uptime)")

class PlatformAuditLogResponse(BaseModel):
    id: str | uuid.UUID
    timestamp: datetime
    event_type: str
    user_id: uuid.UUID | None = None
    ip_address: str | None = None
    metadata_payload: dict | None = Field(None, alias="metadata")

    class Config:
        populate_by_name = True

class PlatformActivityLogResponse(BaseModel):
    id: str | uuid.UUID
    timestamp: datetime
    event_type: str
    user_id: uuid.UUID | None = None
    ip_address: str | None = None
    metadata_payload: dict | None = Field(None, alias="metadata")

    class Config:
        populate_by_name = True
