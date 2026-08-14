import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.database import get_db
from app.modules.rbac.dependencies import require_permissions
from app.modules.election.schemas.analytics import ElectionAnalyticsResponse
from app.modules.election.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get(
    "/{election_id}/analytics",
    response_model=ElectionAnalyticsResponse,
    summary="Get Election Analytics",
)
async def get_election_analytics(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _=Depends(require_permissions(["election:read"])),
):
    service = AnalyticsService(db)
    return await service.get_election_analytics(election_id)
