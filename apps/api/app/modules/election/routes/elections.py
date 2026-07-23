import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db_session
from app.identity.api.v1.auth import get_current_user
from app.identity.models.user import User
from app.modules.rbac.services.authorization_service import AuthorizationService
from app.modules.election.schemas.election import ElectionCreate, ElectionUpdate, ElectionResponse, PaginatedElectionResponse
from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.services.election_service import ElectionService
from app.modules.rbac.dependencies import RequirePermission

router = APIRouter()

def get_election_service(db: AsyncSession = Depends(get_db_session)) -> ElectionService:
    repository = ElectionRepository(db)
    return ElectionService(db, repository)

@router.get("", response_model=PaginatedElectionResponse)
async def list_elections(
    organization_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.view"))
):
    items, total = await election_service.list_by_organization(organization_id, skip, limit)
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("", response_model=ElectionResponse, status_code=status.HTTP_201_CREATED)
async def create_election(
    organization_id: uuid.UUID,
    data: ElectionCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.create"))
):
    election = await election_service.create(organization_id, data, current_user.id)
    await db.commit()
    return election

@router.get("/{election_id}", response_model=ElectionResponse)
async def get_election(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.view"))
):
    return await election_service.get_by_id(election_id, organization_id)

@router.patch("/{election_id}", response_model=ElectionResponse)
async def update_election(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    data: ElectionUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.edit"))
):
    election = await election_service.update(election_id, organization_id, data, current_user.id)
    await db.commit()
    return election

@router.delete("/{election_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_election(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.delete"))
):
    await election_service.delete(election_id, organization_id, current_user.id)
    await db.commit()

# Lifecycle endpoints
@router.post("/{election_id}/publish", response_model=ElectionResponse)
async def publish_election(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.publish"))
):
    election = await election_service.publish(election_id, organization_id, current_user.id)
    await db.commit()
    return election

@router.post("/{election_id}/open-voting", response_model=ElectionResponse)
async def open_voting(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.open_voting"))
):
    election = await election_service.open_voting(election_id, organization_id, current_user.id)
    await db.commit()
    return election

@router.post("/{election_id}/pause-voting", response_model=ElectionResponse)
async def pause_voting(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.pause_voting"))
):
    election = await election_service.pause_voting(election_id, organization_id, current_user.id)
    await db.commit()
    return election

@router.post("/{election_id}/resume-voting", response_model=ElectionResponse)
async def resume_voting(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.resume_voting"))
):
    election = await election_service.resume_voting(election_id, organization_id, current_user.id)
    await db.commit()
    return election

@router.post("/{election_id}/close-voting", response_model=ElectionResponse)
async def close_voting(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.close_voting"))
):
    election = await election_service.close_voting(election_id, organization_id, current_user.id)
    await db.commit()
    return election

@router.post("/{election_id}/archive", response_model=ElectionResponse)
async def archive_election(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.archive"))
):
    election = await election_service.archive(election_id, organization_id, current_user.id)
    await db.commit()
    return election

@router.post("/{election_id}/cancel", response_model=ElectionResponse)
async def cancel_election(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    election_service: ElectionService = Depends(get_election_service),
    auth_context: dict = Depends(RequirePermission("election.cancel"))
):
    election = await election_service.cancel(election_id, organization_id, current_user.id)
    await db.commit()
    return election
