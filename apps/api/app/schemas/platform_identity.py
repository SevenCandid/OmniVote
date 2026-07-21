from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class PlatformRoleResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlatformPermissionResponse(BaseModel):
    key: str
    display_name: str
    category: str
    description: str | None = None

class PlatformIdentityBase(BaseModel):
    status: str

class PlatformUserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    is_active: bool
    status: str
    roles: list[PlatformRoleResponse]
    created_at: datetime
    last_login_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class PlatformUserUpdate(BaseModel):
    status: str | None = Field(None, pattern="^(ACTIVE|SUSPENDED|REVOKED)$")
    roles: list[uuid.UUID] | None = None

class PlatformInvitationCreate(BaseModel):
    email: EmailStr
    roles: list[uuid.UUID]

class PlatformInvitationResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    status: str
    roles: list[PlatformRoleResponse]
    inviter_id: uuid.UUID
    expires_at: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PlatformInvitationDetailsResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    status: str
    roles: list[PlatformRoleResponse]
    invited_by_name: str
    expires_at: str

    model_config = ConfigDict(from_attributes=True)

class PlatformEffectivePermissionsResponse(BaseModel):
    permissions: list[str]
