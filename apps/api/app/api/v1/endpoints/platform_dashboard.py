from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.modules.rbac.dependencies import RequirePlatformPermission
from app.schemas.platform_statistics import PlatformStatisticsResponse, PlatformActivityLogResponse, PlatformAuditLogResponse
from app.services.platform_statistics_service import PlatformStatisticsService
from pydantic import BaseModel

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
class PaginatedAuditResponse(BaseModel):
    items: list[PlatformAuditLogResponse]
    total: int
    skip: int
    limit: int

@router.get("/audit", response_model=PaginatedAuditResponse)
async def get_platform_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    event_type: str | None = Query(None),
    db: AsyncSession = Depends(get_db_session),
    auth_context: dict = Depends(RequirePlatformPermission("platform.configure")),
):
    """Get paginated platform audit logs."""
    service = PlatformStatisticsService(db)
    total, items = await service.get_audit_logs(limit=limit, skip=skip, event_type=event_type)
    return PaginatedAuditResponse(items=items, total=total, skip=skip, limit=limit)
