import asyncio
import os
import sys

# Add the app directory to the python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import delete
from app.database.session import async_session_factory
from app.identity.models.user import User
from app.models.organization import Organization

async def main():
    async with async_session_factory() as db:
        await db.execute(delete(Organization))
        await db.execute(delete(User))
        await db.commit()
        print("All users and organizations have been deleted.")

if __name__ == "__main__":
    asyncio.run(main())
