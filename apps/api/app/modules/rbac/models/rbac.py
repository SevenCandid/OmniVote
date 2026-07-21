import uuid
from sqlalchemy import Boolean, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin


class Permission(BaseModel, TimestampMixin):
    __tablename__ = "rbac_permissions"

    key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Role(BaseModel, TimestampMixin):
    __tablename__ = "rbac_roles"

    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class RolePermission(BaseModel, TimestampMixin):
    __tablename__ = "rbac_role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rbac_roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rbac_permissions.id", ondelete="CASCADE"), nullable=False, index=True
    )

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )


class MembershipRole(BaseModel, TimestampMixin):
    __tablename__ = "rbac_membership_roles"

    membership_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("memberships.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rbac_roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True
    )

    __table_args__ = (
        UniqueConstraint("membership_id", "role_id", name="uq_membership_role"),
    )


# --- Platform RBAC Layer ---

class PlatformPermission(BaseModel, TimestampMixin):
    __tablename__ = "rbac_platform_permissions"

    key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)



class PlatformRole(BaseModel, TimestampMixin):
    __tablename__ = "rbac_platform_roles"

    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)


class PlatformRolePermission(BaseModel, TimestampMixin):
    __tablename__ = "rbac_platform_role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rbac_platform_roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rbac_platform_permissions.id", ondelete="CASCADE"), nullable=False, index=True
    )

    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_platform_role_permission"),
    )


class UserPlatformRole(BaseModel, TimestampMixin):
    __tablename__ = "rbac_user_platform_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rbac_platform_roles.id", ondelete="CASCADE"), nullable=False, index=True
    )

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_platform_role"),
    )


class PlatformIdentity(BaseModel, TimestampMixin):
    """
    Central record for a user's platform-level identity and access state.
    """
    __tablename__ = "rbac_platform_identities"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    # Statuses: ACTIVE, SUSPENDED, REVOKED
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)


class PlatformInvitation(BaseModel, TimestampMixin):
    """
    Tracks an invitation sent to an email address to join the platform administration team.
    """
    __tablename__ = "rbac_platform_invitations"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    # Store the intended role IDs as a comma-separated list or JSON for simplicity before acceptance.
    # Since sqlite doesn't have a native array type, we can use a JSON or simple string.
    # For robust relational design, we could use a secondary table, but string is simpler for an invite.
    role_ids: Mapped[str] = mapped_column(String(1000), nullable=False)

    # Statuses: PENDING, ACCEPTED, EXPIRED, REVOKED
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    
    inviter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("identity_users.id", ondelete="CASCADE"), nullable=False
    )
    expires_at: Mapped[str] = mapped_column(String(50), nullable=False) # Storing as ISO string for simplicity across DBs

