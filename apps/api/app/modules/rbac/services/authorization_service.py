import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.rbac.models.rbac import (
    Permission,
    Role,
    RolePermission,
    MembershipRole,
)
from app.modules.rbac.repositories.rbac_repository import RBACRepository
from app.modules.rbac.schemas.rbac import RoleCreate, RoleUpdate
from app.exceptions.exceptions import NotFoundException, ConflictException, ForbiddenException
from app.identity.services.audit_service import AuditService


class AuthorizationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RBACRepository(db)

    async def has_permission(self, membership_id: uuid.UUID, permission_key: str) -> bool:
        """
        Determines if a membership holds a specific permission.
        Optimized to use a single joined query.
        """
        permissions = await self.repo.get_all_permissions_for_membership(membership_id)
        return permission_key in permissions

    # --- Permissions ---

    async def get_all_permissions(self) -> Sequence[Permission]:
        return await self.repo.list_permissions()

    async def get_permission(self, permission_id: uuid.UUID) -> Permission:
        permission = await self.repo.get_permission_by_id(permission_id)
        if not permission:
            raise NotFoundException(message="Permission not found")
        return permission

    # --- Roles ---

    async def get_organization_roles(self, organization_id: uuid.UUID) -> Sequence[Role]:
        return await self.repo.list_roles_by_organization(organization_id)

    async def get_role(self, role_id: uuid.UUID) -> Role:
        role = await self.repo.get_role_by_id(role_id)
        if not role:
            raise NotFoundException(message="Role not found")
        return role

    async def create_role(
        self,
        organization_id: uuid.UUID,
        data: RoleCreate,
        actor_user_id: uuid.UUID | None = None,
    ) -> Role:
        existing = await self.repo.get_role_by_name(data.name, organization_id)
        if existing:
            raise ConflictException(message="Role with this name already exists in the organization")

        role = Role(
            organization_id=organization_id,
            name=data.name,
            description=data.description,
            is_system=False,
        )
        res = await self.repo.create_role(role)
        await AuditService.log_event_no_commit(
            self.db,
            event_type="role.created",
            user_id=actor_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "role_name": data.name,
                "role_id": str(res.id),
            },
        )
        await self.db.commit()
        return res

    async def update_role(
        self,
        role_id: uuid.UUID,
        organization_id: uuid.UUID,
        data: RoleUpdate,
        actor_user_id: uuid.UUID | None = None,
    ) -> Role:
        role = await self.get_role(role_id)

        if role.is_system:
            await AuditService.log_event_no_commit(
                self.db,
                event_type="role.protected_action_blocked",
                user_id=actor_user_id,
                metadata_payload={
                    "organization_id": str(organization_id),
                    "role_id": str(role_id),
                    "action": "update",
                    "reason": "system_role_immutable",
                },
            )
            await self.db.commit()
            raise ForbiddenException(message="System roles cannot be modified")

        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        old_name = role.name
        if data.name and data.name != role.name:
            existing = await self.repo.get_role_by_name(data.name, organization_id)
            if existing:
                raise ConflictException(message="Role with this name already exists")
            role.name = data.name

        if data.description is not None:
            role.description = data.description

        await self.db.flush()
        await AuditService.log_event_no_commit(
            self.db,
            event_type="role.updated",
            user_id=actor_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "role_id": str(role_id),
                "old_name": old_name,
                "new_name": role.name,
            },
        )
        await self.db.commit()
        return role

    async def delete_role(
        self,
        role_id: uuid.UUID,
        organization_id: uuid.UUID,
        actor_user_id: uuid.UUID | None = None,
    ) -> None:
        role = await self.get_role(role_id)

        if role.is_system:
            await AuditService.log_event_no_commit(
                self.db,
                event_type="role.protected_action_blocked",
                user_id=actor_user_id,
                metadata_payload={
                    "organization_id": str(organization_id),
                    "role_id": str(role_id),
                    "action": "delete",
                    "reason": "system_role_immutable",
                },
            )
            await self.db.commit()
            raise ForbiddenException(message="System roles cannot be deleted")

        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        role_name = role.name
        await self.repo.delete_role(role)
        await AuditService.log_event_no_commit(
            self.db,
            event_type="role.deleted",
            user_id=actor_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "role_id": str(role_id),
                "role_name": role_name,
            },
        )
        await self.db.commit()

    # --- Role Permissions ---

    async def assign_permission(
        self,
        role_id: uuid.UUID,
        permission_id: uuid.UUID,
        organization_id: uuid.UUID,
        caller_membership_id: uuid.UUID,
        actor_user_id: uuid.UUID | None = None,
    ) -> RolePermission:
        role = await self.get_role(role_id)

        if role.is_system:
            raise ForbiddenException(message="Cannot modify permissions of a system role")

        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        permission = await self.get_permission(permission_id)

        # Privilege escalation prevention
        caller_has_perm = await self.has_permission(caller_membership_id, permission.key)
        if not caller_has_perm:
            await AuditService.log_event_no_commit(
                self.db,
                event_type="role.protected_action_blocked",
                user_id=actor_user_id,
                metadata_payload={
                    "organization_id": str(organization_id),
                    "role_id": str(role_id),
                    "permission_key": permission.key,
                    "action": "assign_permission",
                    "reason": "privilege_escalation_prevented",
                },
            )
            await self.db.commit()
            raise ForbiddenException(message="You cannot assign a permission you do not possess")

        existing = await self.repo.get_role_permission(role_id, permission_id)
        if existing:
            raise ConflictException(message="Permission is already assigned to this role")

        role_permission = RolePermission(role_id=role.id, permission_id=permission.id)
        res = await self.repo.assign_permission_to_role(role_permission)
        await AuditService.log_event_no_commit(
            self.db,
            event_type="role.permission_assigned",
            user_id=actor_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "role_id": str(role_id),
                "role_name": role.name,
                "permission_id": str(permission_id),
                "permission_key": permission.key,
            },
        )
        await self.db.commit()
        return res

    async def remove_permission(
        self,
        role_id: uuid.UUID,
        permission_id: uuid.UUID,
        organization_id: uuid.UUID,
        actor_user_id: uuid.UUID | None = None,
    ) -> None:
        role = await self.get_role(role_id)

        if role.is_system:
            raise ForbiddenException(message="Cannot modify permissions of a system role")

        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        permission = await self.get_permission(permission_id)
        removed = await self.repo.remove_permission_from_role(role_id, permission_id)
        if not removed:
            raise NotFoundException(message="Permission is not assigned to this role")

        await AuditService.log_event_no_commit(
            self.db,
            event_type="role.permission_removed",
            user_id=actor_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "role_id": str(role_id),
                "role_name": role.name,
                "permission_id": str(permission_id),
                "permission_key": permission.key,
            },
        )
        await self.db.commit()

    async def replace_role_permissions(
        self,
        role_id: uuid.UUID,
        permission_ids: list[uuid.UUID],
        organization_id: uuid.UUID,
        caller_membership_id: uuid.UUID,
        actor_user_id: uuid.UUID | None = None,
    ) -> Sequence[Permission]:
        """
        Atomically replaces all permissions on a custom role with the provided set.
        Enforces privilege escalation prevention for every permission in the new set.
        """
        role = await self.get_role(role_id)

        if role.is_system:
            raise ForbiddenException(message="Cannot modify permissions of a system role")

        if role.organization_id != organization_id:
            raise ForbiddenException(message="Role does not belong to this organization")

        # Validate all permissions exist and caller holds them
        resolved_permissions: list[Permission] = []
        for perm_id in permission_ids:
            perm = await self.get_permission(perm_id)
            caller_has = await self.has_permission(caller_membership_id, perm.key)
            if not caller_has:
                raise ForbiddenException(
                    message=f"You cannot assign permission '{perm.key}' — you do not possess it"
                )
            resolved_permissions.append(perm)

        # Atomic replace via repository
        await self.repo.replace_role_permissions(role_id, [p.id for p in resolved_permissions])
        await AuditService.log_event_no_commit(
            self.db,
            event_type="role.permissions_replaced",
            user_id=actor_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "role_id": str(role_id),
                "role_name": role.name,
                "permission_count": len(resolved_permissions),
                "permission_keys": [p.key for p in resolved_permissions],
            },
        )
        await self.db.commit()
        return resolved_permissions

    async def get_role_permissions(self, role_id: uuid.UUID) -> Sequence[Permission]:
        return await self.repo.list_role_permissions(role_id)

    # --- Membership Roles ---

    async def assign_role_to_membership(
        self,
        membership_id: uuid.UUID,
        role_id: uuid.UUID,
        admin_user_id: uuid.UUID,
        caller_membership_id: uuid.UUID,
    ) -> MembershipRole:
        role = await self.get_role(role_id)

        # Privilege escalation prevention
        role_permissions = await self.repo.list_role_permissions(role.id)
        for perm in role_permissions:
            caller_has_perm = await self.has_permission(caller_membership_id, perm.key)
            if not caller_has_perm:
                await AuditService.log_event_no_commit(
                    self.db,
                    event_type="role.protected_action_blocked",
                    user_id=admin_user_id,
                    metadata_payload={
                        "membership_id": str(membership_id),
                        "role_id": str(role_id),
                        "action": "assign_role_to_membership",
                        "reason": "privilege_escalation_prevented",
                        "blocked_permission": perm.key,
                    },
                )
                await self.db.commit()
                raise ForbiddenException(message="You cannot assign a role containing permissions you do not possess")

        existing = await self.repo.get_membership_role(membership_id, role_id)
        if existing:
            raise ConflictException(message="Role is already assigned to this membership")

        membership_role = MembershipRole(
            membership_id=membership_id,
            role_id=role.id,
            assigned_by=admin_user_id,
        )
        res = await self.repo.assign_role_to_membership(membership_role)
        await AuditService.log_event_no_commit(
            self.db,
            event_type="membership.role_assigned",
            user_id=admin_user_id,
            metadata_payload={
                "membership_id": str(membership_id),
                "role_id": str(role_id),
                "role_name": role.name,
            },
        )
        await self.db.commit()
        return res

    async def remove_role_from_membership(
        self,
        membership_id: uuid.UUID,
        role_id: uuid.UUID,
        organization_id: uuid.UUID | None = None,
        actor_user_id: uuid.UUID | None = None,
    ) -> None:
        role = await self.get_role(role_id)
        if role.name == "Owner" and role.is_system and organization_id:
            count = await self.repo.count_owners_in_organization(organization_id)
            if count <= 1:
                raise ConflictException(message="Cannot remove the last Owner from the organization")

        removed = await self.repo.remove_role_from_membership(membership_id, role_id)
        if not removed:
            raise NotFoundException(message="Role is not assigned to this membership")

        await AuditService.log_event_no_commit(
            self.db,
            event_type="membership.role_removed",
            user_id=actor_user_id,
            metadata_payload={
                "membership_id": str(membership_id),
                "role_id": str(role_id),
                "role_name": role.name,
                "organization_id": str(organization_id) if organization_id else None,
            },
        )
        await self.db.commit()

    async def replace_membership_roles(
        self,
        membership_id: uuid.UUID,
        role_ids: list[uuid.UUID],
        organization_id: uuid.UUID,
        admin_user_id: uuid.UUID,
        caller_membership_id: uuid.UUID,
    ) -> list[MembershipRole]:
        """
        Atomically replaces all roles on a membership with the provided set.
        Enforces: Last Owner Protection, privilege escalation prevention.
        """
        # Validate all roles exist and belong to org or are system
        resolved_roles: list[Role] = []
        for role_id in role_ids:
            role = await self.get_role(role_id)
            if not role.is_system and role.organization_id != organization_id:
                raise ForbiddenException(message=f"Role '{role.name}' does not belong to this organization")
            resolved_roles.append(role)

        # Privilege escalation: caller must hold all permissions in every new role
        for role in resolved_roles:
            role_permissions = await self.repo.list_role_permissions(role.id)
            for perm in role_permissions:
                if not await self.has_permission(caller_membership_id, perm.key):
                    raise ForbiddenException(
                        message=f"You cannot assign role '{role.name}' — you do not possess permission '{perm.key}'"
                    )

        # Last Owner Protection: ensure at least one Owner remains in the org after swap
        owner_role_in_new_set = any(r.name == "Owner" and r.is_system for r in resolved_roles)
        if not owner_role_in_new_set:
            # Check if this membership is the last owner
            owner_count = await self.repo.count_owners_in_organization(organization_id)
            current_roles = await self.repo.list_membership_roles(membership_id)
            is_currently_owner = any(r.name == "Owner" and r.is_system for r in current_roles)
            if is_currently_owner and owner_count <= 1:
                raise ConflictException(message="Cannot remove the last Owner from the organization")

        await self.repo.replace_membership_roles(
            membership_id=membership_id,
            role_ids=[r.id for r in resolved_roles],
            assigned_by=admin_user_id,
        )
        await AuditService.log_event_no_commit(
            self.db,
            event_type="membership.roles_replaced",
            user_id=admin_user_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "membership_id": str(membership_id),
                "role_count": len(resolved_roles),
                "role_names": [r.name for r in resolved_roles],
            },
        )
        await self.db.commit()
        # Return fresh MembershipRole records
        from sqlalchemy import select
        from app.modules.rbac.models.rbac import MembershipRole as MR
        res = await self.db.execute(select(MR).where(MR.membership_id == membership_id))
        return list(res.scalars().all())

    async def get_membership_roles(self, membership_id: uuid.UUID) -> Sequence[Role]:
        return await self.repo.list_membership_roles(membership_id)


