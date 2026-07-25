import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.v1.auth import get_current_user
from app.modules.rbac.dependencies import RequirePermission
from app.identity.models import User
from app.modules.election.schemas.candidate import (
    ElectionCandidateCreate,
    ElectionCandidateUpdate,
    ElectionCandidateResponse,
    ElectionCandidateReorder
)
from app.modules.election.services.candidate_service import CandidateService
from app.modules.election.repositories.candidate_repository import CandidateRepository
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.election_repository import ElectionRepository

router = APIRouter(prefix="/{election_id}/categories/{category_id}/candidates", tags=["Election Candidates"])

def get_candidate_service(db: AsyncSession = Depends(get_db_session)) -> CandidateService:
    return CandidateService(
        db=db,
        candidate_repository=CandidateRepository(db),
        category_repository=CategoryRepository(db),
        election_repository=ElectionRepository(db)
    )

@router.post("/", response_model=ElectionCandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    data: ElectionCandidateCreate,
    service: CandidateService = Depends(get_candidate_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    return await service.create(organization_id, election_id, category_id, data, current_user.id)

@router.get("/", response_model=List[ElectionCandidateResponse])
async def list_candidates(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    service: CandidateService = Depends(get_candidate_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.view")),
):
    return await service.get_all(organization_id, election_id, category_id)

@router.get("/{candidate_id}", response_model=ElectionCandidateResponse)
async def get_candidate(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    candidate_id: uuid.UUID,
    service: CandidateService = Depends(get_candidate_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.view")),
):
    return await service.get_by_id(organization_id, election_id, category_id, candidate_id)

@router.patch("/{candidate_id}", response_model=ElectionCandidateResponse)
async def update_candidate(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    candidate_id: uuid.UUID,
    data: ElectionCandidateUpdate,
    service: CandidateService = Depends(get_candidate_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    return await service.update(organization_id, election_id, category_id, candidate_id, data, current_user.id)

@router.post("/{candidate_id}/reorder", response_model=ElectionCandidateResponse)
async def reorder_candidate(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    candidate_id: uuid.UUID,
    data: ElectionCandidateReorder,
    service: CandidateService = Depends(get_candidate_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    return await service.reorder(organization_id, election_id, category_id, candidate_id, data.new_candidate_number, current_user.id)

@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    candidate_id: uuid.UUID,
    service: CandidateService = Depends(get_candidate_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    await service.delete(organization_id, election_id, category_id, candidate_id, current_user.id)
