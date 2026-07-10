import structlog
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.config import settings

logger = structlog.get_logger()

# Configure dialect-specific engine parameters
if settings.ENV == "testing":
    # SQLite in-memory configuration for test cycles
    # StaticPool is required to ensure concurrent connections share the same in-memory DB
    engine_url = "sqlite+aiosqlite:///:memory:"
    engine_kwargs = {
        "poolclass": StaticPool,
        "connect_args": {"check_same_thread": False},
        "echo": settings.DATABASE_ECHO,
    }
    logger.info("database_engine_init", database="sqlite_in_memory", env=settings.ENV)
else:
    # PostgreSQL production/development connection configurations
    # Settings validation ensures DATABASE_URL starts with postgresql
    engine_url = settings.DATABASE_URL
    engine_kwargs = {
        "pool_size": settings.DATABASE_POOL_SIZE,
        "max_overflow": settings.DATABASE_MAX_OVERFLOW,
        "pool_timeout": settings.DATABASE_POOL_TIMEOUT,
        "pool_recycle": settings.DATABASE_POOL_RECYCLE,
        "echo": settings.DATABASE_ECHO,
    }
    # Log startup safely (strip credentials from connection string before logging)
    safe_url = engine_url.split("@")[-1] if "@" in engine_url else "configured_url"
    logger.info(
        "database_engine_init",
        database="postgresql",
        host_info=safe_url,
        env=settings.ENV,
    )

# Create the async engine
engine = create_async_engine(engine_url, **engine_kwargs)
