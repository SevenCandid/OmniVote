import uuid
import datetime
from pydantic import BaseModel, Field


class ElectionAuditLogEntry(BaseModel):
    id: uuid.UUID
    event_type: str = Field(..., description="The type of the security event")
    ip_address: str | None = Field(None, description="IP address of the user who performed the action")
    user_agent: str | None = Field(None, description="User agent string")
    metadata_payload: dict | None = Field(None, description="Additional context such as target_id")
    created_at: datetime.datetime = Field(..., description="When the event occurred")
    
    class Config:
        from_attributes = True
