from typing import Any

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.health import check_db_health
from app.database.session import get_db_session

router = APIRouter()


@router.get("/health", response_model=dict, status_code=200)
async def health_check(db: AsyncSession = Depends(get_db_session)) -> Any:
    # Check Database connection
    db_healthy = await check_db_health(db)

    # Check Redis connection
    redis_healthy = False
    try:
        from app.cache.redis import get_redis

        redis_client = get_redis()
        redis_healthy = await redis_client.ping()
    except Exception:
        pass

    is_healthy = db_healthy and redis_healthy
    status_code = (
        status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    )

    content = {
        "status": "healthy" if is_healthy else "unhealthy",
        "service": "omnivote-api",
        "database": "connected" if db_healthy else "disconnected",
        "redis": "connected" if redis_healthy else "disconnected",
    }

    if status_code != status.HTTP_200_OK:
        return JSONResponse(status_code=status_code, content=content)

    return content
