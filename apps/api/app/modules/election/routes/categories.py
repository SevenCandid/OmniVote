import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.v1.auth import get_current_user
from app.modules.rbac.dependencies import RequirePermission
from app.identity.models import User
from app.modules.election.schemas.category import (
    ElectionCategoryCreate,
    ElectionCategoryUpdate,
    ElectionCategoryResponse,
    ElectionCategoryOrderUpdate
)
from app.modules.election.services.category_service import CategoryService
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.election_repository import ElectionRepository

router = APIRouter(prefix="/{election_id}/categories", tags=["Election Categories"])


def get_category_service(db: AsyncSession = Depends(get_db_session)) -> CategoryService:
    return CategoryService(
        db=db,
        category_repository=CategoryRepository(db),
        election_repository=ElectionRepository(db)
    )


@router.post("/", response_model=ElectionCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    data: ElectionCategoryCreate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    return await service.create(organization_id, election_id, data, current_user.id)


@router.get("/", response_model=List[ElectionCategoryResponse])
async def list_categories(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.view")),
):
    return await service.get_all(organization_id, election_id)


@router.get("/{category_id}", response_model=ElectionCategoryResponse)
async def get_category(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.view")),
):
    return await service.get_by_id(organization_id, election_id, category_id)


@router.patch("/{category_id}", response_model=ElectionCategoryResponse)
async def update_category(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    data: ElectionCategoryUpdate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    return await service.update(organization_id, election_id, category_id, data, current_user.id)


@router.patch("/{category_id}/order", response_model=ElectionCategoryResponse)
async def update_category_order(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    data: ElectionCategoryOrderUpdate,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    return await service.update_order(organization_id, election_id, category_id, data.display_order, current_user.id)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    category_id: uuid.UUID,
    service: CategoryService = Depends(get_category_service),
    current_user: User = Depends(get_current_user),
    _: None = Depends(RequirePermission("election.edit")),
):
    await service.delete(organization_id, election_id, category_id, current_user.id)
