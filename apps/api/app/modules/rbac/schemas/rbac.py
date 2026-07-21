import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PermissionBase(BaseModel):
    key: str = Field(..., max_length=255, description="Unique string identifier for permission (e.g., event.create)")
    display_name: str = Field(..., max_length=255)
    description: str | None = Field(None, max_length=500)
    category: str = Field(..., max_length=100)
    is_system: bool = Field(default=True)


class PermissionResponse(PermissionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoleBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str | None = Field(None, max_length=500)


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=500)


class RoleResponse(RoleBase):
    id: uuid.UUID
    organization_id: uuid.UUID | None
    is_system: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RolePermissionAssign(BaseModel):
    permission_id: uuid.UUID


class MembershipRoleAssign(BaseModel):
    role_id: uuid.UUID


class RolePermissionResponse(BaseModel):
    id: uuid.UUID
    role_id: uuid.UUID
    permission_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MembershipRoleResponse(BaseModel):
    id: uuid.UUID
    membership_id: uuid.UUID
    role_id: uuid.UUID
    assigned_by: uuid.UUID | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EffectivePermissionsResponse(BaseModel):
    organization_id: uuid.UUID
    membership_id: uuid.UUID
    roles: list[RoleResponse]
    permissions: list[str]


class RolePermissionsBulkSet(BaseModel):
    """Payload for PUT /roles/{role_id}/permissions — replaces the full permission set atomically."""
    permission_ids: list[uuid.UUID] = Field(
        ...,
        description="Complete set of permission IDs to assign to this role. Replaces existing assignments."
    )


class MembershipRolesBulkSet(BaseModel):
    """Payload for PUT /memberships/{membership_id}/roles — replaces the full role set atomically."""
    role_ids: list[uuid.UUID] = Field(
        ...,
        description="Complete set of role IDs to assign to this membership. Replaces existing assignments."
    )
