from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.modules.rbac.dependencies import RequirePlatformPermission
from app.schemas.platform_statistics import PlatformStatisticsResponse, PlatformActivityLogResponse
from app.services.platform_statistics_service import PlatformStatisticsService

router = APIRouter()

@router.get("/statistics", response_model=PlatformStatisticsResponse)
async def get_platform_statistics(
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("platform.configure")),
):
    """Get global platform statistics."""
    service = PlatformStatisticsService(db)
    return await service.get_global_statistics()

@router.get("/activity", response_model=list[PlatformActivityLogResponse])
async def get_platform_activity(
    limit: int = Query(5, ge=1, le=50),
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("platform.configure")),
):
    """Get recent platform activity."""
    service = PlatformStatisticsService(db)
    return await service.get_recent_activity(limit)
