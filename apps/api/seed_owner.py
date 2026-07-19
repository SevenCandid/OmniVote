import asyncio
from app.database.session import async_session_factory
from sqlalchemy import select
from app.identity.models.user import User
from app.models.organization import Organization
from app.modules.membership.models.membership import Membership, MembershipStatus
from app.modules.rbac.models.rbac import Role, MembershipRole
from datetime import datetime, timezone

async def main():
    async with async_session_factory() as db:
        res = await db.execute(select(Role).where(Role.name == "Owner"))
        owner_role = res.scalar_one_or_none()
        if not owner_role:
            print("No Owner role")
            return
            
        u_res = await db.execute(select(User))
        users = u_res.scalars().all()
        if not users:
            print("No users found")
            return

        o_res = await db.execute(select(Organization))
        orgs = o_res.scalars().all()
        if not orgs:
            print("No organizations found")
            return

        for user in users:
            for org in orgs:
                m_res = await db.execute(select(Membership).where(Membership.user_id == user.id, Membership.organization_id == org.id))
                membership = m_res.scalar_one_or_none()
                if not membership:
                    membership = Membership(
                        user_id=user.id,
                        organization_id=org.id,
                        status=MembershipStatus.ACCEPTED,
                        invited_by=user.id,
                        invited_at=datetime.now(timezone.utc),
                        accepted_at=datetime.now(timezone.utc)
                    )
                    db.add(membership)
                    await db.flush()
                    print(f"Created membership for user {user.id} in org {org.id}")
                
                mr_res = await db.execute(select(MembershipRole).where(MembershipRole.membership_id == membership.id, MembershipRole.role_id == owner_role.id))
                if not mr_res.scalar_one_or_none():
                    db.add(MembershipRole(membership_id=membership.id, role_id=owner_role.id, assigned_by=user.id))
                    print(f"Assigned owner to membership {membership.id} for user {user.id}")
                
        await db.commit()
        print("Done")

if __name__ == "__main__":
    asyncio.run(main())
