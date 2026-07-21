import uuid
from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    event_type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata_payload: Optional[dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedAuditResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    skip: int
    limit: int
