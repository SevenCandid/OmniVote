import uuid
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.modules.election.repositories.voter_repository import VoterRepository
from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.models.voter import EligibleVoter
from app.modules.election.schemas.voter import EligibleVoterCreate, EligibleVoterUpdate

class VoterService:
    def __init__(self, db: AsyncSession, repository: VoterRepository, election_repo: ElectionRepository):
        self.db = db
        self.repository = repository
        self.election_repo = election_repo

    async def _verify_election_access(self, election_id: uuid.UUID, organization_id: uuid.UUID):
        election = await self.election_repo.get_by_id(election_id)
        if not election or election.organization_id != organization_id or election.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Election not found or access denied."
            )
        return election

    async def get_by_id(self, voter_id: uuid.UUID, election_id: uuid.UUID, organization_id: uuid.UUID) -> EligibleVoter:
        await self._verify_election_access(election_id, organization_id)
        voter = await self.repository.get_by_id(voter_id)
        if not voter or voter.election_id != election_id or voter.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voter not found.")
        return voter

    async def list_by_election(self, election_id: uuid.UUID, organization_id: uuid.UUID, skip: int = 0, limit: int = 50) -> Tuple[List[EligibleVoter], int]:
        await self._verify_election_access(election_id, organization_id)
        return await self.repository.list_by_election(election_id, skip, limit)

    async def create(self, election_id: uuid.UUID, organization_id: uuid.UUID, data: EligibleVoterCreate, current_user_id: uuid.UUID) -> EligibleVoter:
        await self._verify_election_access(election_id, organization_id)
        
        # Check uniqueness of identifier
        existing = await self.repository.get_by_identifier(election_id, data.voter_identifier)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Voter with identifier '{data.voter_identifier}' already exists in this election."
            )

        voter = EligibleVoter(
            election_id=election_id,
            voter_identifier=data.voter_identifier,
            full_name=data.full_name,
            phone_number=data.phone_number,
            email=data.email,
            gender=data.gender,
            group_id=data.group_id,
            created_by=current_user_id
        )
        
        await self.repository.create(voter)
        return voter

    async def bulk_create(self, election_id: uuid.UUID, organization_id: uuid.UUID, data_list: List[EligibleVoterCreate], current_user_id: uuid.UUID) -> dict:
        await self._verify_election_access(election_id, organization_id)
        
        # To handle bulk efficiently and report errors, we'll process in memory first
        success_count = 0
        errors = []
        
        # In a real enterprise app, we'd use a temporary table or Arq background task for massive lists.
        # Since this is MVP bulk import, we'll fetch existing identifiers to prevent duplicates.
        existing_voters, _ = await self.repository.list_by_election(election_id, skip=0, limit=100000)
        existing_identifiers = {v.voter_identifier for v in existing_voters}
        
        to_insert = []
        seen_in_batch = set()
        
        for idx, item in enumerate(data_list):
            if item.voter_identifier in existing_identifiers:
                errors.append(f"Row {idx+1}: Identifier '{item.voter_identifier}' already exists.")
                continue
            
            if item.voter_identifier in seen_in_batch:
                errors.append(f"Row {idx+1}: Identifier '{item.voter_identifier}' is duplicated in the uploaded list.")
                continue
                
            seen_in_batch.add(item.voter_identifier)
            to_insert.append(
                EligibleVoter(
                    election_id=election_id,
                    voter_identifier=item.voter_identifier,
                    full_name=item.full_name,
                    phone_number=item.phone_number,
                    email=item.email,
                    gender=item.gender,
                    group_id=item.group_id,
                    created_by=current_user_id
                )
            )

        if to_insert:
            await self.repository.bulk_create(to_insert)
            success_count = len(to_insert)
            
        return {
            "success_count": success_count,
            "errors": errors
        }

    async def update(self, voter_id: uuid.UUID, election_id: uuid.UUID, organization_id: uuid.UUID, data: EligibleVoterUpdate, current_user_id: uuid.UUID) -> EligibleVoter:
        voter = await self.get_by_id(voter_id, election_id, organization_id)
        
        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_by"] = current_user_id
        
        updated_voter = await self.repository.update(voter, update_data)
        return updated_voter

    async def delete(self, voter_id: uuid.UUID, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID):
        voter = await self.get_by_id(voter_id, election_id, organization_id)
        await self.repository.soft_delete(voter, current_user_id)
