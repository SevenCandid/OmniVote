import asyncio
from sqlalchemy import select
from app.database.session import async_session_maker
from app.modules.election.models.election import Election

async def run():
    async with async_session_maker() as db:
        res = await db.execute(select(Election).where(Election.public_id == '019ffd05-d301-71c2-a143-a4770ff53270'))
        e = res.scalar_one_or_none()
        if e:
            print(f"Status: {e.status.value}")
            print(f"Visibility: {e.result_visibility.value}")
            print(f"Allow Admin Live Results: {e.allow_admin_live_results}")
        else:
            print("Not found")

if __name__ == "__main__":
    asyncio.run(run())
