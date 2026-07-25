import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.election import ElectionStatus
from app.modules.election.models.candidate import ElectionCandidate, CandidateStatus
from app.modules.election.schemas.candidate import ElectionCandidateCreate, ElectionCandidateUpdate
from app.modules.election.repositories.candidate_repository import CandidateRepository
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.election_repository import ElectionRepository
from app.identity.services.audit_service import AuditService

class CandidateService:
    def __init__(
        self, 
        db: AsyncSession, 
        candidate_repository: CandidateRepository, 
        category_repository: CategoryRepository,
        election_repository: ElectionRepository
    ):
        self.db = db
        self.candidate_repository = candidate_repository
        self.category_repository = category_repository
        self.election_repository = election_repository
        self.audit_service = AuditService()

    async def _check_modifiable(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID):
        election = await self.election_repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        
        # Lock ballot if LIVE, CLOSED, or ARCHIVED
        if election.status in (ElectionStatus.VOTING_OPEN, ElectionStatus.VOTING_PAUSED, ElectionStatus.VOTING_CLOSED, ElectionStatus.COUNTING, ElectionStatus.RESULTS_PUBLISHED, ElectionStatus.ARCHIVED):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Ballot is locked. Cannot modify candidates while election is live or closed."
            )

        category = await self.category_repository.get_by_id(election_id, category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        return election, category

    async def _ensure_contiguous_numbers(self, category_id: uuid.UUID):
        """Ensures all candidates in a category are contiguously numbered starting from 1."""
        candidates = await self.candidate_repository.get_all_by_category(category_id)
        updates = {}
        for idx, candidate in enumerate(candidates):
            expected_number = idx + 1
            if candidate.candidate_number != expected_number:
                updates[candidate.id] = expected_number
        
        if updates:
            await self.candidate_repository.bulk_update_numbers(updates)

    async def get_all(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID) -> List[ElectionCandidate]:
        election = await self.election_repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        return await self.candidate_repository.get_all_by_category(category_id)

    async def get_by_id(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, candidate_id: uuid.UUID) -> ElectionCandidate:
        election = await self.election_repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        candidate = await self.candidate_repository.get_by_id(category_id, candidate_id)
        if not candidate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
        return candidate

    async def create(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, data: ElectionCandidateCreate, current_user_id: uuid.UUID) -> ElectionCandidate:
        await self._check_modifiable(organization_id, election_id, category_id)
        
        # Ensure candidate number logic
        max_num = await self.candidate_repository.get_max_candidate_number(category_id)
        candidate_number = data.candidate_number if data.candidate_number else max_num + 1

        if candidate_number > max_num + 1:
            candidate_number = max_num + 1 # Cannot skip numbers
            
        if data.candidate_number and await self.candidate_repository.check_candidate_number_exists(category_id, candidate_number):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate number already exists")

        candidate = ElectionCandidate(
            id=uuid.uuid4(),
            election_category_id=category_id,
            candidate_number=candidate_number,
            full_name=data.full_name,
            short_name=data.short_name,
            photo=data.photo,
            bio=data.bio,
            manifesto=data.manifesto,
        )

        created = await self.candidate_repository.create(candidate)
        
        await self._ensure_contiguous_numbers(category_id)
        
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type="election.candidate.created",
            metadata_payload={"election_id": str(election_id), "category_id": str(category_id), "candidate_id": str(created.id), "status": "success"}
        )
        await self.db.commit()
        return created

    async def update(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, candidate_id: uuid.UUID, data: ElectionCandidateUpdate, current_user_id: uuid.UUID) -> ElectionCandidate:
        await self._check_modifiable(organization_id, election_id, category_id)
        
        candidate = await self.get_by_id(organization_id, election_id, category_id, candidate_id)
        
        old_status = candidate.status
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(candidate, key, value)
            
        await self.db.flush()
        await self.db.refresh(candidate)
        
        event_type = "election.candidate.updated"
        if data.status and data.status == CandidateStatus.WITHDRAWN and old_status != CandidateStatus.WITHDRAWN:
            event_type = "election.candidate.withdrawn"
            
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type=event_type,
            metadata_payload={"election_id": str(election_id), "category_id": str(category_id), "candidate_id": str(candidate.id), "status": "success"}
        )
        await self.db.commit()
        return candidate

    async def reorder(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, candidate_id: uuid.UUID, new_number: int, current_user_id: uuid.UUID) -> ElectionCandidate:
        await self._check_modifiable(organization_id, election_id, category_id)
        
        target = await self.get_by_id(organization_id, election_id, category_id, candidate_id)
        all_candidates = await self.candidate_repository.get_all_by_category(category_id)
        
        if new_number < 1 or new_number > len(all_candidates):
            new_number = max(1, min(new_number, len(all_candidates)))
            
        old_number = target.candidate_number
        if old_number == new_number:
            return target

        # Shift algorithm
        updates = {}
        for c in all_candidates:
            if c.id == target.id:
                updates[c.id] = new_number
            elif old_number < new_number:
                # Target moved down, shift everything in between UP (decrement)
                if old_number < c.candidate_number <= new_number:
                    updates[c.id] = c.candidate_number - 1
            elif old_number > new_number:
                # Target moved up, shift everything in between DOWN (increment)
                if new_number <= c.candidate_number < old_number:
                    updates[c.id] = c.candidate_number + 1

        await self.candidate_repository.bulk_update_numbers(updates)
        
        await self.db.flush()
        await self.db.refresh(target)
        
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type="election.candidate.reordered",
            metadata_payload={"candidate_id": str(target.id), "old_number": old_number, "new_number": new_number, "status": "success"}
        )
        
        await self.db.commit()
        return target

    async def delete(self, organization_id: uuid.UUID, election_id: uuid.UUID, category_id: uuid.UUID, candidate_id: uuid.UUID, current_user_id: uuid.UUID) -> None:
        await self._check_modifiable(organization_id, election_id, category_id)
        
        candidate = await self.get_by_id(organization_id, election_id, category_id, candidate_id)
        
        candidate.is_deleted = True
        candidate.deleted_at = datetime.now(timezone.utc)
        candidate.deleted_by = current_user_id
        
        await self.db.flush()
        
        # After deletion, must ensure contiguous numbers of the remaining candidates!
        await self._ensure_contiguous_numbers(category_id)
        
        await self.audit_service.log_event_no_commit(
            db=self.db,
            user_id=current_user_id,
            event_type="election.candidate.deleted",
            metadata_payload={"election_id": str(election_id), "candidate_id": str(candidate.id), "status": "success"}
        )
        await self.db.commit()
