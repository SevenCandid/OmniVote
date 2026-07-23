import uuid
import re
from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.election import Election, ElectionStatus
from app.modules.election.schemas.election import ElectionCreate, ElectionUpdate
from app.modules.election.repositories.election_repository import ElectionRepository
from app.identity.services.audit_service import AuditService
from app.modules.election.services.election_edit_policy import ElectionEditPolicy
from app.modules.election.services.election_notification_service import ElectionNotificationService
from app.models.notification import NotificationType

def generate_slug(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

class ElectionService:
    def __init__(self, db: AsyncSession, repository: ElectionRepository):
        self.db = db
        self.repository = repository
        self.audit_service = AuditService()
        self.notification_service = ElectionNotificationService(db)

    def _validate_schedule(self, data: dict, existing_election: Optional[Election] = None):
        reg_open = data.get("registration_opens_at") or (existing_election.registration_opens_at if existing_election else None)
        reg_close = data.get("registration_closes_at") or (existing_election.registration_closes_at if existing_election else None)
        vote_open = data.get("voting_opens_at") or (existing_election.voting_opens_at if existing_election else None)
        vote_close = data.get("voting_closes_at") or (existing_election.voting_closes_at if existing_election else None)
        results_pub = data.get("results_publish_at") or (existing_election.results_publish_at if existing_election else None)

        if reg_open and reg_close and reg_close <= reg_open:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration close must be after registration open.")
        
        if vote_open and vote_close and vote_close <= vote_open:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Voting close must be after voting open.")
            
        if reg_close and vote_open and reg_close > vote_open:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration cannot close after voting opens.")
            
        if results_pub and vote_close and results_pub < vote_close:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Results cannot be published before voting closes.")

    async def _ensure_unique_slug(self, organization_id: uuid.UUID, base_slug: str, exclude_id: Optional[uuid.UUID] = None) -> str:
        slug = base_slug
        counter = 1
        while True:
            existing = await self.repository.get_by_slug(organization_id, slug)
            if not existing or (exclude_id and existing.id == exclude_id):
                return slug
            slug = f"{base_slug}-{counter}"
            counter += 1

    async def create(self, organization_id: uuid.UUID, data: ElectionCreate, current_user_id: uuid.UUID) -> Election:
        self._validate_schedule(data.model_dump(exclude_unset=True))
        
        base_slug = generate_slug(data.title)
        unique_slug = await self._ensure_unique_slug(organization_id, base_slug)

        # Generate a short public ID
        public_id = str(uuid.uuid4())[:8]

        election = Election(
            organization_id=organization_id,
            slug=unique_slug,
            public_id=public_id,
            status=ElectionStatus.DRAFT,
            created_by=current_user_id,
            **data.model_dump()
        )
        await self.repository.create(election)

        await self.audit_service.log_event(
            db=self.db,
            event_type="election_created",
            user_id=current_user_id,
            metadata_payload={"title": election.title, "organization_id": str(organization_id), "election_id": str(election.id)}
        )
        return election

    async def update(self, election_id: uuid.UUID, organization_id: uuid.UUID, data: ElectionUpdate, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        
        update_data = data.model_dump(exclude_unset=True)
        
        try:
            ElectionEditPolicy.validate_update(election, update_data)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
            
        self._validate_schedule(update_data, existing_election=election)
        
        if "title" in update_data and update_data["title"] != election.title:
            base_slug = generate_slug(update_data["title"])
            update_data["slug"] = await self._ensure_unique_slug(organization_id, base_slug, exclude_id=election.id)

        for key, value in update_data.items():
            setattr(election, key, value)

        election.updated_by = current_user_id
        election.updated_at = datetime.utcnow()
        await self.repository.update(election)

        await self.audit_service.log_event(
            db=self.db,
            event_type="election_updated",
            user_id=current_user_id,
            metadata_payload={"updated_fields": list(update_data.keys()), "organization_id": str(organization_id), "election_id": str(election.id)}
        )
        return election

    async def get_by_id(self, election_id: uuid.UUID, organization_id: uuid.UUID) -> Election:
        return await self._get_or_404(election_id, organization_id)

    async def list_by_organization(self, organization_id: uuid.UUID, skip: int = 0, limit: int = 50) -> Tuple[List[Election], int]:
        return await self.repository.list_by_organization(organization_id, skip, limit)

    async def delete(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> None:
        election = await self._get_or_404(election_id, organization_id)
        election.is_deleted = True
        election.deleted_at = datetime.utcnow()
        election.deleted_by = current_user_id
        
        # Free up the slug
        election.slug = f"deleted-{election.id}-{election.slug}"
        await self.repository.soft_delete(election)

        await self.audit_service.log_event(
            db=self.db,
            event_type="election_deleted",
            user_id=current_user_id,
            metadata_payload={"organization_id": str(organization_id), "election_id": str(election.id)}
        )

    # Lifecycle Management
    async def _transition_status(self, election: Election, new_status: ElectionStatus, current_user_id: uuid.UUID, valid_from: List[ElectionStatus]):
        if election.status not in valid_from:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition to {new_status} from {election.status}"
            )
        
        old_status = election.status
        election.status = new_status
        election.updated_by = current_user_id
        election.updated_at = datetime.utcnow()
        await self.repository.update(election)

        await self.audit_service.log_event(
            db=self.db,
            event_type=f"election_{new_status.value}",
            user_id=current_user_id,
            metadata_payload={
                "old_status": old_status.value,
                "new_status": new_status.value,
                "organization_id": str(election.organization_id),
                "election_id": str(election.id)
            }
        )
        
        # Dispatch notification
        notification_type_map = {
            ElectionStatus.PUBLISHED: NotificationType.INFO,
            ElectionStatus.VOTING_OPEN: NotificationType.SUCCESS,
            ElectionStatus.VOTING_PAUSED: NotificationType.WARNING,
            ElectionStatus.VOTING_CLOSED: NotificationType.INFO,
            ElectionStatus.ARCHIVED: NotificationType.INFO,
            ElectionStatus.CANCELLED: NotificationType.WARNING,
        }
        
        if new_status in notification_type_map:
            title_map = {
                ElectionStatus.PUBLISHED: f"Election '{election.title}' published",
                ElectionStatus.VOTING_OPEN: f"Voting opened for '{election.title}'",
                ElectionStatus.VOTING_PAUSED: f"Voting paused for '{election.title}'",
                ElectionStatus.VOTING_CLOSED: f"Voting closed for '{election.title}'",
                ElectionStatus.ARCHIVED: f"Election '{election.title}' archived",
                ElectionStatus.CANCELLED: f"Election '{election.title}' cancelled",
            }
            message_map = {
                ElectionStatus.PUBLISHED: f"The election '{election.title}' is now published and visible to voters.",
                ElectionStatus.VOTING_OPEN: f"Voting is now open for the election '{election.title}'.",
                ElectionStatus.VOTING_PAUSED: f"Voting has been temporarily paused for the election '{election.title}'.",
                ElectionStatus.VOTING_CLOSED: f"Voting has concluded for the election '{election.title}'.",
                ElectionStatus.ARCHIVED: f"The election '{election.title}' has been archived.",
                ElectionStatus.CANCELLED: f"The election '{election.title}' has been cancelled.",
            }
            
            await self.notification_service.notify_election_managers(
                organization_id=election.organization_id,
                title=title_map[new_status],
                message=message_map[new_status],
                type=notification_type_map[new_status],
                metadata={"election_id": str(election.id)}
            )
            
        return election

    async def publish(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        # Note: Depending on requirements, we might allow Draft -> Published directly, or require Configured first.
        # Allowing Draft/Configured -> Published.
        return await self._transition_status(election, ElectionStatus.PUBLISHED, current_user_id, [ElectionStatus.DRAFT, ElectionStatus.CONFIGURED])

    async def open_voting(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        return await self._transition_status(election, ElectionStatus.VOTING_OPEN, current_user_id, [ElectionStatus.PUBLISHED])

    async def pause_voting(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        return await self._transition_status(election, ElectionStatus.VOTING_PAUSED, current_user_id, [ElectionStatus.VOTING_OPEN])

    async def resume_voting(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        return await self._transition_status(election, ElectionStatus.VOTING_OPEN, current_user_id, [ElectionStatus.VOTING_PAUSED])

    async def close_voting(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        return await self._transition_status(election, ElectionStatus.VOTING_CLOSED, current_user_id, [ElectionStatus.VOTING_OPEN, ElectionStatus.VOTING_PAUSED])

    async def archive(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        return await self._transition_status(election, ElectionStatus.ARCHIVED, current_user_id, [
            ElectionStatus.DRAFT, ElectionStatus.CONFIGURED, ElectionStatus.PUBLISHED, 
            ElectionStatus.RESULTS_PUBLISHED, ElectionStatus.VOTING_CLOSED, ElectionStatus.CANCELLED
        ])

    async def cancel(self, election_id: uuid.UUID, organization_id: uuid.UUID, current_user_id: uuid.UUID) -> Election:
        election = await self._get_or_404(election_id, organization_id)
        return await self._transition_status(election, ElectionStatus.CANCELLED, current_user_id, [
            ElectionStatus.DRAFT, ElectionStatus.CONFIGURED, ElectionStatus.PUBLISHED, ElectionStatus.VOTING_OPEN, ElectionStatus.VOTING_PAUSED
        ])

    async def _get_or_404(self, election_id: uuid.UUID, organization_id: uuid.UUID) -> Election:
        election = await self.repository.get_by_id_and_org(election_id, organization_id)
        if not election:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Election not found")
        return election
