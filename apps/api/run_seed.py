import asyncio
from app.database.session import async_session_factory
from app.modules.rbac.seed import seed_permissions

async def run():
    async with async_session_factory() as db:
        await seed_permissions(db)
        await db.commit()
        print("Permissions seeded successfully")

if __name__ == "__main__":
    asyncio.run(run())
