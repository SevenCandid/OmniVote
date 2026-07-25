import uuid
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db_session

# Depending on identity, we can get current user or allow unauthenticated.
from app.identity.api.dependencies import get_current_user_optional
from app.identity.models.user import User

from app.modules.election.schemas.voting import (
    StartSessionRequest,
    VotingSessionResponse,
    DraftSelectionUpdate,
    BallotReview,
    SubmitBallotRequest,
    SubmitBallotResponse
)
from app.modules.election.services.voting_service import VotingService
from app.modules.election.repositories.voting_session_repository import VotingSessionRepository, VotingSelectionRepository
from app.modules.election.repositories.ballot_repository import BallotRepository, BallotSelectionRepository
from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.candidate_repository import CandidateRepository

router = APIRouter()

def get_voting_service(db: AsyncSession = Depends(get_db_session)) -> VotingService:
    return VotingService(
        db,
        voting_session_repository=VotingSessionRepository(db),
        voting_selection_repository=VotingSelectionRepository(db),
        ballot_repository=BallotRepository(db),
        ballot_selection_repository=BallotSelectionRepository(db),
        election_repository=ElectionRepository(db),
        category_repository=CategoryRepository(db),
        candidate_repository=CandidateRepository(db)
    )

@router.post("/voting/session", response_model=VotingSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_voting_session(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    request: StartSessionRequest,
    service: VotingService = Depends(get_voting_service),
    current_user: User | None = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    return await service.start_session(election_id, request, user_id=user_id)

@router.get("/voting/session/{session_id}", response_model=VotingSessionResponse)
async def get_voting_session(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    session_id: uuid.UUID,
    service: VotingService = Depends(get_voting_service)
):
    # Depending on auth model, verify session ownership
    return await service.get_active_session(session_id)

@router.patch("/voting/session/{session_id}/draft", response_model=VotingSessionResponse)
async def save_draft_selections(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    session_id: uuid.UUID,
    request: DraftSelectionUpdate,
    service: VotingService = Depends(get_voting_service)
):
    return await service.save_draft_selections(session_id, request)

@router.post("/voting/session/{session_id}/submit", response_model=SubmitBallotResponse)
async def submit_ballot(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    session_id: uuid.UUID,
    request: SubmitBallotRequest,
    service: VotingService = Depends(get_voting_service)
):
    ballot = await service.submit_ballot(session_id)
    return SubmitBallotResponse(
        receipt_code=ballot.receipt_code,
        cast_at=ballot.cast_at
    )
