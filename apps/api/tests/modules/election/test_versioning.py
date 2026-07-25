import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.modules.election.services.election_service import ElectionService
from app.modules.election.services.voting_service import VotingService
from app.modules.election.schemas.election import ElectionCreate
from app.modules.election.models.election import ElectionType

@pytest.mark.asyncio
async def test_election_service_assigns_version():
    mock_repo = AsyncMock()
    mock_repo.get_by_slug.return_value = None
    
    mock_db = AsyncMock()
    
    service = ElectionService(mock_db, mock_repo)
    service.audit_service = AsyncMock()
    service.notification_service = AsyncMock()
    
    org_id = uuid4()
    user_id = uuid4()
    
    create_data = ElectionCreate(
        title="Versioning Test",
        election_type=ElectionType.CUSTOM
    )
    
    election = await service.create(org_id, create_data, user_id)
    
    # Assert voting_engine_version is 1
    assert election.voting_engine_version == 1
    mock_repo.create.assert_called_once()
    
@pytest.mark.asyncio
async def test_voting_service_assigns_ballot_version():
    mock_session_repo = AsyncMock()
    mock_selection_repo = AsyncMock()
    mock_ballot_repo = AsyncMock()
    mock_ballot_selection_repo = AsyncMock()
    mock_election_repo = AsyncMock()
    mock_category_repo = AsyncMock()
    mock_candidate_repo = AsyncMock()
    
    service = VotingService(
        db=AsyncMock(),
        voting_session_repository=mock_session_repo,
        voting_selection_repository=mock_selection_repo,
        ballot_repository=mock_ballot_repo,
        ballot_selection_repository=mock_ballot_selection_repo,
        election_repository=mock_election_repo,
        category_repository=mock_category_repo,
        candidate_repository=mock_candidate_repo
    )
    
    session_id = uuid4()
    mock_session = MagicMock()
    mock_session.election_id = uuid4()
    mock_session.selections = []
    from app.modules.election.models.voting_session import VotingSessionStatus
    mock_session.status = VotingSessionStatus.ACTIVE
    import datetime
    mock_session.expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    
    mock_session_repo.get_by_id_with_selections.return_value = mock_session
    mock_category_repo.get_all_by_election.return_value = []
    
    # Setup mock for created ballot
    created_ballot = MagicMock()
    created_ballot.id = uuid4()
    mock_ballot_repo.create.return_value = created_ballot
    
    await service.submit_ballot(session_id)
    
    # Check that ballot was created with ballot_schema_version=1
    mock_ballot_repo.create.assert_called_once()
    args, kwargs = mock_ballot_repo.create.call_args
    passed_ballot = args[0]
    
    assert passed_ballot.ballot_schema_version == 1
