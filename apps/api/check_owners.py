import asyncio
from app.database.session import async_session_factory
from sqlalchemy import select
from app.identity.models.user import User
from app.models.organization import Organization
from app.modules.membership.models.membership import Membership
from app.modules.rbac.models.rbac import Role, MembershipRole

async def main():
    async with async_session_factory() as db:
        res = await db.execute(select(Role).where(Role.name == "Owner"))
        owner_role = res.scalar_one_or_none()
        if not owner_role:
            print("Owner role not found")
            return
            
        stmt = (
            select(User, Organization)
            .join(Membership, Membership.user_id == User.id)
            .join(Organization, Organization.id == Membership.organization_id)
            .join(MembershipRole, MembershipRole.membership_id == Membership.id)
            .where(MembershipRole.role_id == owner_role.id)
        )
        
        results = await db.execute(stmt)
        for user, org in results.all():
            print(f"User '{user.email}' is an Owner of Organization '{org.name}'")

if __name__ == "__main__":
    asyncio.run(main())
