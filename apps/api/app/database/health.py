import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()


async def check_db_health(session: AsyncSession) -> bool:
    """
    Ping the active database to verify connection health.
    Returns True if healthy, False otherwise.
    """
    try:
        # Executes SELECT 1 using connection pool session
        await session.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error("database_health_check_failed", error=str(e))
        return False
