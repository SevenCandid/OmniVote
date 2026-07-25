import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user_optional, get_current_user
from app.identity.models.user import User
from app.modules.rbac.dependencies import RequirePermission
from app.modules.election.schemas.results import ElectionResultSchema
from app.modules.election.services.result_service import ResultService
from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.candidate_repository import CandidateRepository
from app.modules.election.repositories.ballot_repository import BallotRepository
from app.modules.election.services.export_service import ExportService

router = APIRouter()

def get_result_service(db: AsyncSession = Depends(get_db_session)) -> ResultService:
    return ResultService(
        db=db,
        election_repository=ElectionRepository(db),
        category_repository=CategoryRepository(db),
        candidate_repository=CandidateRepository(db),
        ballot_repository=BallotRepository(db)
    )

@router.get("/{election_id}/results", response_model=ElectionResultSchema)
async def get_election_results(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
    result_service: ResultService = Depends(get_result_service),
):
    # Depending on visibility, user might not need to be authenticated.
    # ResultService will check the rules and raise 403 if they don't have access.
    # Pass user_id if they are authenticated
    user_id = current_user.id if current_user else None
    return await result_service.get_live_results(election_id, user_id=user_id)

@router.get("/{election_id}/results/live", response_model=ElectionResultSchema)
async def get_election_live_results(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
    result_service: ResultService = Depends(get_result_service),
):
    """
    Same as /results but explicitly intended for live polling clients.
    They both fetch from the cached ResultService logic.
    """
    user_id = current_user.id if current_user else None
    return await result_service.get_live_results(election_id, user_id=user_id)

@router.get("/{election_id}/results/export")
async def export_election_results(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    format: str = Query("csv", description="Format to export (csv, excel, pdf)"),
    db: AsyncSession = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_current_user_optional),
    result_service: ResultService = Depends(get_result_service),
):
    """
    Export election results.
    """
    user_id = current_user.id if current_user else None
    results = await result_service.get_live_results(election_id, user_id=user_id)
    
    if format.lower() == "excel":
        file_stream = ExportService.generate_excel(results)
        return StreamingResponse(
            file_stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=results_{election_id}.xlsx"}
        )
    elif format.lower() == "pdf":
        file_stream = ExportService.generate_pdf(results)
        return StreamingResponse(
            file_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=results_{election_id}.pdf"}
        )
    else:
        file_stream = ExportService.generate_csv(results)
        return StreamingResponse(
            file_stream,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=results_{election_id}.csv"}
        )
