import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import async_session_factory
from app.modules.rbac.models.rbac import Permission, Role, RolePermission, PlatformPermission, PlatformRole, PlatformRolePermission
from app.models.organization import Organization
from app.modules.membership.models.membership import Membership
from sqlalchemy import select

SYSTEM_PERMISSIONS = [
    # Organization
    {"key": "organization.view", "display_name": "View Organization", "category": "Organization", "description": "View organization details"},
    {"key": "organization.update", "display_name": "Update Organization", "category": "Organization", "description": "Update organization settings"},
    {"key": "organization.delete", "display_name": "Delete Organization", "category": "Organization", "description": "Delete organization"},
    
    # Membership
    {"key": "member.view", "display_name": "View Members", "category": "Membership", "description": "View organization members"},
    {"key": "member.invite", "display_name": "Invite Members", "category": "Membership", "description": "Invite new members"},
    {"key": "member.update", "display_name": "Update Members", "category": "Membership", "description": "Update member roles"},
    {"key": "member.remove", "display_name": "Remove Members", "category": "Membership", "description": "Remove members from organization"},
    
    # Election
    {"key": "election.view", "display_name": "View Elections", "category": "Election", "description": "View elections"},
    {"key": "election.create", "display_name": "Create Election", "category": "Election", "description": "Create a new election"},
    {"key": "election.edit", "display_name": "Edit Election", "category": "Election", "description": "Edit election details"},
    {"key": "election.delete", "display_name": "Delete Election", "category": "Election", "description": "Delete an election"},
    {"key": "election.publish", "display_name": "Publish Election", "category": "Election", "description": "Publish an election"},
    {"key": "election.open_voting", "display_name": "Open Voting", "category": "Election", "description": "Open voting for an election"},
    {"key": "election.pause_voting", "display_name": "Pause Voting", "category": "Election", "description": "Pause voting for an election"},
    {"key": "election.resume_voting", "display_name": "Resume Voting", "category": "Election", "description": "Resume voting for an election"},
    {"key": "election.close_voting", "display_name": "Close Voting", "category": "Election", "description": "Close voting for an election"},
    {"key": "election.archive", "display_name": "Archive Election", "category": "Election", "description": "Archive an election"},
    {"key": "election.cancel", "display_name": "Cancel Election", "category": "Election", "description": "Cancel an election"},
    
    # Results
    {"key": "results.view", "display_name": "View Results", "category": "Results", "description": "View election results"},
    {"key": "results.publish", "display_name": "Publish Results", "category": "Results", "description": "Publish election results"},
    
    # System
    {"key": "audit.view", "display_name": "View Audit Logs", "category": "System", "description": "View organization audit logs"},
]

PLATFORM_PERMISSIONS = [
    {"key": "organization.manage", "display_name": "Manage Organizations", "category": "Platform", "description": "Manage all customer organizations"},
    {"key": "platform.configure", "display_name": "Configure Platform", "category": "Platform", "description": "Configure platform settings"},
    {"key": "user.manage", "display_name": "Manage Users", "category": "Platform", "description": "Manage platform users globally"},
    {"key": "organization.verify", "display_name": "Verify Organizations", "category": "Platform", "description": "Perform verification workflows on organizations"},
    {"key": "support.operate", "display_name": "Operate Support", "category": "Platform", "description": "Review and accept customer support requests"},
    {"key": "security.operate", "display_name": "Operate Security", "category": "Platform", "description": "Perform security and audit operations"},
]

async def seed_permissions(db: AsyncSession):
    # Insert system permissions
    for perm_data in SYSTEM_PERMISSIONS:
        result = await db.execute(select(Permission).where(Permission.key == perm_data["key"]))
        existing = result.scalar_one_or_none()
        if not existing:
            perm = Permission(
                key=perm_data["key"],
                display_name=perm_data["display_name"],
                category=perm_data["category"],
                description=perm_data["description"],
                is_system=True
            )
            db.add(perm)
            
    # Insert platform permissions
    for perm_data in PLATFORM_PERMISSIONS:
        result = await db.execute(select(PlatformPermission).where(PlatformPermission.key == perm_data["key"]))
        existing = result.scalar_one_or_none()
        if not existing:
            perm = PlatformPermission(
                key=perm_data["key"],
                display_name=perm_data["display_name"],
                category=perm_data["category"],
                description=perm_data["description"]
            )
            db.add(perm)
    
    await db.flush()

    # Create default Owner role
    result = await db.execute(select(Role).where(Role.name == "Owner", Role.is_system == True))
    owner_role = result.scalar_one_or_none()
    if not owner_role:
        owner_role = Role(
            name="Owner",
            description="System Owner role with all permissions",
            is_system=True
        )
        db.add(owner_role)
        await db.flush()

    # Create default Admin role
    result = await db.execute(select(Role).where(Role.name == "Admin", Role.is_system == True))
    admin_role = result.scalar_one_or_none()
    if not admin_role:
        admin_role = Role(
            name="Admin",
            description="System Admin role with administrative permissions",
            is_system=True
        )
        db.add(admin_role)
        await db.flush()

    # Create default Member role
    result = await db.execute(select(Role).where(Role.name == "Member", Role.is_system == True))
    member_role = result.scalar_one_or_none()
    if not member_role:
        member_role = Role(
            name="Member",
            description="System Member role with standard access",
            is_system=True
        )
        db.add(member_role)
        await db.flush()

    # Create default Platform Support role
    result = await db.execute(select(Role).where(Role.name == "Platform Support", Role.is_system == True))
    support_role = result.scalar_one_or_none()
    if not support_role:
        support_role = Role(
            name="Platform Support",
            description="System Role for platform administrators during an active support session",
            is_system=True
        )
        db.add(support_role)
        await db.flush()

    # Assign all permissions to Owner
    result = await db.execute(select(Permission))
    all_perms = result.scalars().all()
    for perm in all_perms:
        # Owner gets everything
        result_rp = await db.execute(select(RolePermission).where(RolePermission.role_id == owner_role.id, RolePermission.permission_id == perm.id))
        if not result_rp.scalar_one_or_none():
            db.add(RolePermission(role_id=owner_role.id, permission_id=perm.id))
            
        # Admin gets everything except audit.view and organization.update/delete
        if perm.key not in ["audit.view", "organization.update", "organization.delete"]:
            result_rp_admin = await db.execute(select(RolePermission).where(RolePermission.role_id == admin_role.id, RolePermission.permission_id == perm.id))
            if not result_rp_admin.scalar_one_or_none():
                db.add(RolePermission(role_id=admin_role.id, permission_id=perm.id))
                
        # Member gets basic view permissions
        if perm.key in ["organization.view", "member.view", "election.view", "results.view"]:
            result_rp_member = await db.execute(select(RolePermission).where(RolePermission.role_id == member_role.id, RolePermission.permission_id == perm.id))
            if not result_rp_member.scalar_one_or_none():
                db.add(RolePermission(role_id=member_role.id, permission_id=perm.id))
                
        # Platform Support gets read-only support permissions
        if perm.key in ["organization.view", "member.view", "election.view", "results.view", "audit.view"]:
            result_rp_support = await db.execute(select(RolePermission).where(RolePermission.role_id == support_role.id, RolePermission.permission_id == perm.id))
            if not result_rp_support.scalar_one_or_none():
                db.add(RolePermission(role_id=support_role.id, permission_id=perm.id))

    # --- Seed Platform Roles ---
    platform_roles_data = [
        {"name": "Platform Owner", "description": "Global Platform Owner with root capabilities", "permissions": [p["key"] for p in PLATFORM_PERMISSIONS]},
        {"name": "Platform Administrator", "description": "Global Platform Admin with general management rights", "permissions": ["organization.manage", "organization.verify", "support.operate"]},
        {"name": "Support Administrator", "description": "Global Support Staff with rights to assist organizations", "permissions": ["support.operate"]},
        {"name": "Security Administrator", "description": "Global Security Auditor with security operations rights", "permissions": ["security.operate"]},
    ]

    for role_data in platform_roles_data:
        result_pr = await db.execute(select(PlatformRole).where(PlatformRole.name == role_data["name"]))
        existing_role = result_pr.scalar_one_or_none()
        if not existing_role:
            existing_role = PlatformRole(
                name=role_data["name"],
                description=role_data["description"]
            )
            db.add(existing_role)
            await db.flush()

        # Map role permissions
        for perm_key in role_data["permissions"]:
            res_p = await db.execute(select(PlatformPermission).where(PlatformPermission.key == perm_key))
            perm_obj = res_p.scalar_one_or_none()
            if perm_obj:
                res_rp = await db.execute(select(PlatformRolePermission).where(PlatformRolePermission.role_id == existing_role.id, PlatformRolePermission.permission_id == perm_obj.id))
                if not res_rp.scalar_one_or_none():
                    db.add(PlatformRolePermission(role_id=existing_role.id, permission_id=perm_obj.id))
            
    await db.commit()

async def run_seed():
    async with async_session_factory() as db:
        await seed_permissions(db)

if __name__ == "__main__":
    asyncio.run(run_seed())
