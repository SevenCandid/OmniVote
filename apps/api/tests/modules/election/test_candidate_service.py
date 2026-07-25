import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from fastapi import HTTPException

from app.modules.election.services.candidate_service import CandidateService
from app.modules.election.models.candidate import CandidateStatus
from app.modules.election.models.election import ElectionStatus
from app.modules.election.schemas.candidate import ElectionCandidateCreate

@pytest.fixture
def mock_candidate_repo():
    return AsyncMock()

@pytest.fixture
def mock_category_repo():
    return AsyncMock()

@pytest.fixture
def mock_election_repo():
    return AsyncMock()

@pytest.fixture
def candidate_service(mock_candidate_repo, mock_category_repo, mock_election_repo):
    return CandidateService(
        db=AsyncMock(),
        candidate_repository=mock_candidate_repo,
        category_repository=mock_category_repo,
        election_repository=mock_election_repo
    )

@pytest.mark.asyncio
async def test_create_candidate_success(candidate_service, mock_election_repo, mock_category_repo, mock_candidate_repo):
    org_id = uuid4()
    election_id = uuid4()
    category_id = uuid4()
    user_id = uuid4()
    
    mock_election = MagicMock()
    mock_election.organization_id = org_id
    mock_election.status = ElectionStatus.DRAFT
    mock_election_repo.get_by_id.return_value = mock_election
    
    mock_category = MagicMock()
    mock_category.election_id = election_id
    mock_category_repo.get_by_id.return_value = mock_category
    
    # Mock existing candidates to check numbering
    mock_candidate_repo.get_all_by_category.return_value = []
    
    new_candidate_mock = MagicMock()
    new_candidate_mock.candidate_number = 1
    mock_candidate_repo.create.return_value = new_candidate_mock
    
    data = ElectionCandidateCreate(full_name="John Doe")
    result = await candidate_service.create(org_id, election_id, category_id, data, user_id)
    
    assert mock_candidate_repo.create.called
    assert result == new_candidate_mock

@pytest.mark.asyncio
async def test_create_candidate_live_election_fails(candidate_service, mock_election_repo, mock_category_repo):
    org_id = uuid4()
    election_id = uuid4()
    category_id = uuid4()
    user_id = uuid4()
    
    mock_election = MagicMock()
    mock_election.organization_id = org_id
    mock_election.status = ElectionStatus.LIVE
    mock_election_repo.get_by_id.return_value = mock_election
    
    data = ElectionCandidateCreate(full_name="John Doe")
    
    with pytest.raises(HTTPException) as exc:
        await candidate_service.create(org_id, election_id, category_id, data, user_id)
        
    assert exc.value.status_code == 400
    assert "Cannot modify ballot" in exc.value.detail
