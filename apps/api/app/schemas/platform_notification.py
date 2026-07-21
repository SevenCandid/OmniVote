import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.notification import NotificationType

class PlatformNotificationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime
    metadata_payload: dict | None = Field(None, alias="metadata")

    class Config:
        populate_by_name = True
        from_attributes = True

class PaginatedNotificationResponse(BaseModel):
    items: list[PlatformNotificationResponse]
    total: int
    unread_count: int
    skip: int
    limit: int
