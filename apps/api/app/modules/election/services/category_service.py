import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.election import ElectionStatus
from app.modules.election.models.category import ElectionCategory
from app.modules.election.schemas.category import ElectionCategoryCreate, ElectionCategoryUpdate
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.election_repository import ElectionRepository
from app.identity.services.audit_service import AuditService

class CategoryService:
    def __init__(self, db: AsyncSession, category_repository: CategoryRepository, election_repository: ElectionRepository):
        self.db = db
        self.category_repository = category_repository
        self.election_repository = election_repository
        self.audit_service = AuditService()

    async def _check_election_modifiable(self, organization_id: uuid.UUID, election_id: uuid.UUID):
        election = await self.election_repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        
        if election.status not in (ElectionStatus.DRAFT, ElectionStatus.CONFIGURED):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Cannot modify categories once election is published or live."
            )
        return election

    async def get_all(self, organization_id: uuid.UUID, election_id: uuid.UUID) -> List[ElectionCategory]:
        election = await self.election_repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        return await self.category_repository.get_all_by_election(election_id)

    async def get_by_id(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID) -> ElectionCategory:
        election = await self.election_repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        category = await self.category_repository.get_by_id(election_id, category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return category

    async def create(self, organization_id: uuid.UUID, election_id: uuid.UUID, data: ElectionCategoryCreate, current_user_id: uuid.UUID) -> ElectionCategory:
        await self._check_election_modifiable(organization_id, election_id)
        
        max_order = await self.category_repository.get_max_display_order(election_id)
        next_order = max_order + 1

        category = ElectionCategory(
            id=uuid.uuid4(),
            election_id=election_id,
            name=data.name,
            description=data.description,
            category_type=data.category_type,
            max_winners=data.max_winners,
            voting_method=data.voting_method,
            display_order=data.display_order if data.display_order is not None else next_order
        )

        created = await self.category_repository.create(category)
        
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type="election.category.created",
            metadata_payload={"election_id": str(election_id), "category_id": str(created.id), "name": created.name, "status": "success"}
        )
        await self.db.commit()
        return created

    async def update(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, data: ElectionCategoryUpdate, current_user_id: uuid.UUID) -> ElectionCategory:
        await self._check_election_modifiable(organization_id, election_id)
        
        category = await self.get_by_id(organization_id, election_id, category_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)
            
        await self.db.flush()
        await self.db.refresh(category)
        
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type="election.category.updated",
            metadata_payload={"election_id": str(election_id), "category_id": str(category.id), "status": "success"}
        )
        await self.db.commit()
        return category

    async def update_order(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, new_order: int, current_user_id: uuid.UUID) -> ElectionCategory:
        await self._check_election_modifiable(organization_id, election_id)
        
        category = await self.get_by_id(organization_id, election_id, category_id)
        
        # Simple swap logic: find category with new_order and set it to category.display_order
        all_categories = await self.category_repository.get_all_by_election(election_id)
        
        old_order = category.display_order
        target_category = next((c for c in all_categories if c.display_order == new_order), None)
        
        category.display_order = new_order
        if target_category:
            target_category.display_order = old_order
            
        await self.db.flush()
        await self.db.refresh(category)
        
        await self.db.commit()
        return category

    async def delete(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, current_user_id: uuid.UUID) -> None:
        await self._check_election_modifiable(organization_id, election_id)
        
        category = await self.get_by_id(organization_id, election_id, category_id)
        
        category.is_deleted = True
        category.deleted_at = datetime.now(timezone.utc)
        category.deleted_by = current_user_id
        
        await self.db.flush()
        
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type="election.category.deleted",
            metadata_payload={"election_id": str(election_id), "category_id": str(category.id), "status": "success"}
        )
        await self.db.commit()
