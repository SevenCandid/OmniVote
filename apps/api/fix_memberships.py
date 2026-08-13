import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import async_session_factory
from sqlalchemy import select
from app.models.organization import Organization
from app.modules.membership.models.membership import Membership
from app.modules.rbac.models.rbac import MembershipRole, Role
from app.modules.rbac.repositories.rbac_repository import RBACRepository

async def fix_memberships(db: AsyncSession):
    # 1. Get the Owner role
    rbac_repo = RBACRepository(db)
    owner_role = await rbac_repo.get_role_by_name("Owner", None)
    
    if not owner_role:
        print("Owner role still missing!")
        return

    # 2. Find all memberships
    result = await db.execute(select(Membership))
    memberships = result.scalars().all()
    
    for mem in memberships:
        # Check if they have roles
        roles = await rbac_repo.list_membership_roles(mem.id)
        if not roles:
            print(f"Membership {mem.id} has no roles. Assigning Owner.")
            membership_role = MembershipRole(
                membership_id=mem.id,
                role_id=owner_role.id,
                assigned_by=mem.user_id
            )
            db.add(membership_role)
            await db.flush()
        else:
            print(f"Membership {mem.id} already has roles: {[r.name for r in roles]}")
            
    await db.commit()
    print("Done fixing memberships.")

async def run_fix():
    async with async_session_factory() as db:
        await fix_memberships(db)

if __name__ == "__main__":
    asyncio.run(run_fix())
