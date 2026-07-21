import asyncio
import sys
import argparse
from sqlalchemy import select, func
from app.database.session import async_session_factory
from app.identity.models.user import User
from app.modules.rbac.models.rbac import PlatformRole, UserPlatformRole, PlatformIdentity

async def bootstrap(email: str, override: bool):
    async with async_session_factory() as db:
        # Check if there are ANY platform owners already
        result = await db.execute(select(PlatformRole).where(PlatformRole.name == "Platform Owner"))
        role = result.scalar_one_or_none()
        
        if not role:
            print("Platform Owner role not found. Ensure the initial database migration/seed has run.")
            return

        result = await db.execute(
            select(func.count(UserPlatformRole.user_id)).where(UserPlatformRole.role_id == role.id)
        )
        owner_count = result.scalar() or 0

        if owner_count > 0 and not override:
            print("ERROR: A Platform Owner already exists.")
            print("Security rule enforcement: Bootstrap script is locked out after the first Platform Owner is created.")
            print("Future administrators must be invited exclusively through the Platform Identity dashboard.")
            print("If this is an emergency, use the --override flag.")
            sys.exit(1)

        # Find user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User with email {email} not found. Please register this account first.")
            return

        # Check if already assigned
        result = await db.execute(select(UserPlatformRole).where(
            UserPlatformRole.user_id == user.id,
            UserPlatformRole.role_id == role.id
        ))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"User {email} is already a Platform Owner.")
            return

        # Create Platform Identity if missing
        result = await db.execute(select(PlatformIdentity).where(PlatformIdentity.user_id == user.id))
        identity = result.scalar_one_or_none()
        if not identity:
            identity = PlatformIdentity(user_id=user.id, status="ACTIVE")
            db.add(identity)
            await db.flush()
        else:
            if identity.status != "ACTIVE":
                identity.status = "ACTIVE"
                db.add(identity)

        # Assign role
        assignment = UserPlatformRole(user_id=user.id, role_id=role.id)
        db.add(assignment)
        await db.commit()
        print(f"Success! User {email} has been bootstrapped as a Platform Owner.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bootstrap the initial Platform Owner.")
    parser.add_argument("email", type=str, help="Email of the user to promote.")
    parser.add_argument("--override", action="store_true", help="Force execution even if an owner already exists (Emergency use only).")
    
    args = parser.parse_args()
    asyncio.run(bootstrap(args.email, args.override))
