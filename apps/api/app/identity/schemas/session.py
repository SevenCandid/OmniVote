import uuid
import datetime
from pydantic import BaseModel, ConfigDict


class SessionRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    device_information: str | None = None
    ip_address: str | None = None
    user_agent: str | None = None
    created_at: datetime.datetime
    expires_at: datetime.datetime
    revoked_at: datetime.datetime | None = None
    
    model_config = ConfigDict(from_attributes=True)
