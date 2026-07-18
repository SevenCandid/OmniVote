import uuid
import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.identity.models.user import AccountStatus


class UserBase(BaseModel):
    email: EmailStr
    username: str | None = Field(default=None, max_length=100)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    phone_number: str | None = Field(default=None, max_length=50)
    avatar_url: str | None = Field(default=None, max_length=1024)


class UserUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    phone_number: str | None = Field(default=None, max_length=50)
    avatar_url: str | None = Field(default=None, max_length=1024)


class UserRead(UserBase):
    id: uuid.UUID
    status: AccountStatus
    is_email_verified: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime
    last_login_at: datetime.datetime | None = None

    model_config = ConfigDict(from_attributes=True)
