import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
import datetime
from fastapi import HTTPException

from app.modules.election.services.voting_service import VotingService
from app.modules.election.models.election import ElectionStatus
from app.modules.election.models.voting_session import VotingSessionStatus, VerificationMethod
from app.modules.election.schemas.voting import StartSessionRequest, DraftSelectionUpdate, VotingSelectionItem

@pytest.fixture
def mock_session_repo():
    return AsyncMock()

@pytest.fixture
def mock_selection_repo():
    return AsyncMock()

@pytest.fixture
def mock_ballot_repo():
    return AsyncMock()

@pytest.fixture
def mock_ballot_selection_repo():
    return AsyncMock()

@pytest.fixture
def mock_election_repo():
    return AsyncMock()

@pytest.fixture
def mock_category_repo():
    return AsyncMock()

@pytest.fixture
def mock_candidate_repo():
    return AsyncMock()

@pytest.fixture
def voting_service(
    mock_session_repo, mock_selection_repo, mock_ballot_repo,
    mock_ballot_selection_repo, mock_election_repo,
    mock_category_repo, mock_candidate_repo
):
    return VotingService(
        db=AsyncMock(),
        voting_session_repository=mock_session_repo,
        voting_selection_repository=mock_selection_repo,
        ballot_repository=mock_ballot_repo,
        ballot_selection_repository=mock_ballot_selection_repo,
        election_repository=mock_election_repo,
        category_repository=mock_category_repo,
        candidate_repository=mock_candidate_repo
    )

@pytest.mark.asyncio
async def test_start_session_election_not_open(voting_service, mock_election_repo):
    election_id = uuid4()
    mock_election = MagicMock()
    mock_election.status = ElectionStatus.DRAFT
    mock_election_repo.get_by_id.return_value = mock_election
    
    with pytest.raises(HTTPException) as exc:
        await voting_service.start_session(election_id, StartSessionRequest(verification_method=VerificationMethod.PUBLIC))
    
    assert exc.value.status_code == 400
    assert "not open" in exc.value.detail

@pytest.mark.asyncio
async def test_start_session_success(voting_service, mock_election_repo, mock_session_repo):
    election_id = uuid4()
    mock_election = MagicMock()
    mock_election.status = ElectionStatus.VOTING_OPEN
    mock_election_repo.get_by_id.return_value = mock_election
    
    mock_session_repo.get_active_session_for_identifier.return_value = None
    
    new_session = MagicMock()
    mock_session_repo.create.return_value = new_session
    mock_session_repo.get_by_id_with_selections.return_value = new_session
    
    req = StartSessionRequest(verification_method=VerificationMethod.PUBLIC, voter_identifier="voter123")
    res = await voting_service.start_session(election_id, req)
    
    assert res == new_session
    assert mock_session_repo.create.called

@pytest.mark.asyncio
async def test_submit_ballot_over_max_winners(voting_service, mock_session_repo, mock_category_repo):
    session_id = uuid4()
    election_id = uuid4()
    cat_id = uuid4()
    
    session_mock = MagicMock()
    session_mock.election_id = election_id
    session_mock.status = VotingSessionStatus.ACTIVE
    session_mock.expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    # 2 selections for a category
    sel1 = MagicMock()
    sel1.category_id = cat_id
    sel2 = MagicMock()
    sel2.category_id = cat_id
    session_mock.selections = [sel1, sel2]
    
    mock_session_repo.get_by_id_with_selections.return_value = session_mock
    
    cat_mock = MagicMock()
    cat_mock.id = cat_id
    cat_mock.max_winners = 1 # Only 1 allowed, but 2 selected
    cat_mock.name = "President"
    mock_category_repo.get_all_by_election.return_value = [cat_mock]
    
    with pytest.raises(HTTPException) as exc:
        await voting_service.submit_ballot(session_id)
        
    assert exc.value.status_code == 400
    assert "exceeds max winners" in exc.value.detail
