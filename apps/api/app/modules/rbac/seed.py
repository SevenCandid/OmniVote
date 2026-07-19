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

    # Assign all permissions to Owner
    result = await db.execute(select(Permission))
    all_perms = result.scalars().all()
    for perm in all_perms:
        result_rp = await db.execute(
            select(RolePermission).where(
                RolePermission.role_id == owner_role.id,
                RolePermission.permission_id == perm.id
            )
        )
        if not result_rp.scalar_one_or_none():
            rp = RolePermission(role_id=owner_role.id, permission_id=perm.id)
            db.add(rp)
            
    await db.commit()

async def run_seed():
    async with async_session_factory() as db:
        await seed_permissions(db)

if __name__ == "__main__":
    asyncio.run(run_seed())
