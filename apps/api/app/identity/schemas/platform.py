import uuid
from pydantic import BaseModel, ConfigDict


class PlatformRoleRead(BaseModel):
    id: uuid.UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class PlatformIdentityData(BaseModel):
    is_platform_user: bool
    roles: list[PlatformRoleRead]
    permissions: list[str]


class PlatformIdentityResponse(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str
    platform: PlatformIdentityData
