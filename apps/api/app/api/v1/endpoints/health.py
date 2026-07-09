from typing import Any
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db_session
from app.database.health import check_db_health

router = APIRouter()

@router.get("/health", response_model=dict, status_code=200)
async def health_check(db: AsyncSession = Depends(get_db_session)) -> Any:
    is_healthy = await check_db_health(db)
    if not is_healthy:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": "disconnected"
            }
        )
    return {
        "status": "healthy",
        "service": "omnivote-api",
        "database": "connected"
    }

