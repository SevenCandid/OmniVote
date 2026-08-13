import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.v1.auth import get_current_user
from app.identity.models.user import User
from app.modules.rbac.dependencies import RequirePermission
from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.repositories.voter_repository import VoterRepository
from app.modules.election.services.voter_service import VoterService
from app.modules.election.schemas.voter import (
    EligibleVoterCreate,
    EligibleVoterUpdate,
    EligibleVoterResponse,
    PaginatedVoterResponse,
)

router = APIRouter()

def get_voter_service(db: AsyncSession = Depends(get_db_session)) -> VoterService:
    repository = VoterRepository(db)
    election_repo = ElectionRepository(db)
    return VoterService(db, repository, election_repo)

@router.get("", response_model=PaginatedVoterResponse)
async def list_voters(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    voter_service: VoterService = Depends(get_voter_service),
    auth_context: dict = Depends(RequirePermission("election.view"))
):
    items, total = await voter_service.list_by_election(election_id, organization_id, skip, limit)
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("", response_model=EligibleVoterResponse, status_code=status.HTTP_201_CREATED)
async def create_voter(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    data: EligibleVoterCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    voter_service: VoterService = Depends(get_voter_service),
    auth_context: dict = Depends(RequirePermission("election.edit"))
):
    voter = await voter_service.create(election_id, organization_id, data, current_user.id)
    await db.commit()
    return voter

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
async def bulk_create_voters(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    data: List[EligibleVoterCreate],
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    voter_service: VoterService = Depends(get_voter_service),
    auth_context: dict = Depends(RequirePermission("election.edit"))
):
    result = await voter_service.bulk_create(election_id, organization_id, data, current_user.id)
    # The transaction commit is handled inside the repository for bulk_create,
    # but we can do it here for consistency if we removed it from repo.
    # We kept it in repo for safety, but we can commit any other changes.
    return result

@router.get("/{voter_id}", response_model=EligibleVoterResponse)
async def get_voter(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    voter_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    voter_service: VoterService = Depends(get_voter_service),
    auth_context: dict = Depends(RequirePermission("election.view"))
):
    return await voter_service.get_by_id(voter_id, election_id, organization_id)

@router.patch("/{voter_id}", response_model=EligibleVoterResponse)
async def update_voter(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    voter_id: uuid.UUID,
    data: EligibleVoterUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    voter_service: VoterService = Depends(get_voter_service),
    auth_context: dict = Depends(RequirePermission("election.edit"))
):
    voter = await voter_service.update(voter_id, election_id, organization_id, data, current_user.id)
    await db.commit()
    return voter

@router.delete("/{voter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_voter(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    voter_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    voter_service: VoterService = Depends(get_voter_service),
    auth_context: dict = Depends(RequirePermission("election.edit"))
):
    await voter_service.delete(voter_id, election_id, organization_id, current_user.id)
    await db.commit()
