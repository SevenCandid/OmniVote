import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.election.models.election import Election, ElectionStatus
from app.modules.election.schemas.election import ElectionCreate, ElectionUpdate
from app.modules.election.services.election_service import ElectionService
from app.modules.election.repositories.election_repository import ElectionRepository

@pytest.fixture
def election_repository():
    # Factory function to create repository with a specific session
    return lambda session: ElectionRepository(session)

@pytest.fixture
def election_service(election_repository):
    # Factory function to create service with a specific session
    return lambda session: ElectionService(session, election_repository(session))

@pytest.mark.asyncio
async def test_create_election(election_service):
    from app.database.session import async_session_factory
    async with async_session_factory() as session:
        service = election_service(session)
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        create_data = ElectionCreate(
            title="Test Election",
            description="A test election",
            timezone="UTC"
        )
        election = await service.create(org_id, create_data, user_id)
    
    assert election.id is not None
    assert election.title == "Test Election"
    assert election.slug.startswith("test-election")
    assert election.public_id is not None
    assert election.status == ElectionStatus.DRAFT
    assert election.organization_id == org_id
    assert election.created_by == user_id

@pytest.mark.asyncio
async def test_update_election(election_service):
    from app.database.session import async_session_factory
    async with async_session_factory() as session:
        service = election_service(session)
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        create_data = ElectionCreate(title="Original Title", timezone="UTC")
        election = await service.create(org_id, create_data, user_id)
        
        update_data = ElectionUpdate(title="Updated Title")
        updated_election = await service.update(election.id, org_id, update_data, user_id)
    
    assert updated_election.title == "Updated Title"
    assert updated_election.slug.startswith("updated-title")

@pytest.mark.asyncio
async def test_election_lifecycle(election_service):
    from app.database.session import async_session_factory
    async with async_session_factory() as session:
        service = election_service(session)
        org_id = uuid.uuid4()
        user_id = uuid.uuid4()
        create_data = ElectionCreate(title="Lifecycle Test", timezone="UTC")
        election = await service.create(org_id, create_data, user_id)
        assert election.status == ElectionStatus.DRAFT
        
        # Draft -> Published
        published_election = await service.publish(election.id, org_id, user_id)
        assert published_election.status == ElectionStatus.PUBLISHED
        
        # Published -> Voting Open
        open_election = await service.open_voting(election.id, org_id, user_id)
        assert open_election.status == ElectionStatus.VOTING_OPEN
        
        # Voting Open -> Voting Closed
        closed_election = await service.close_voting(election.id, org_id, user_id)
        assert closed_election.status == ElectionStatus.VOTING_CLOSED
