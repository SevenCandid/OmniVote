from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.database.engine import engine

# Thread-safe async session factory
async_session_factory = async_sessionmaker(
    bind=engine, expire_on_commit=False, class_=AsyncSession
)


async def get_db_session() -> AsyncGenerator[AsyncSession]:
    """
    Exposes an async session generator for FastAPI path dependency injections.
    Leverages async context manager to guarantee proper connection closing.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
