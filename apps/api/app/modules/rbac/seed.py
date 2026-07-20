import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import async_session_factory
from app.modules.rbac.models.rbac import Permission, Role, RolePermission
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
    {"key": "election.update", "display_name": "Update Election", "category": "Election", "description": "Update election details"},
    {"key": "election.delete", "display_name": "Delete Election", "category": "Election", "description": "Delete an election"},
    {"key": "election.launch", "display_name": "Launch Election", "category": "Election", "description": "Launch an election to live status"},
    
    # Results
    {"key": "results.view", "display_name": "View Results", "category": "Results", "description": "View election results"},
    {"key": "results.publish", "display_name": "Publish Results", "category": "Results", "description": "Publish election results"},
    
    # System
    {"key": "audit.view", "display_name": "View Audit Logs", "category": "System", "description": "View organization audit logs"},
]

async def seed_permissions(db: AsyncSession):
    # Insert permissions
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
            
    await db.commit()

async def run_seed():
    async with async_session_factory() as db:
        await seed_permissions(db)

if __name__ == "__main__":
    asyncio.run(run_seed())
