import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.repositories.organization_repository import OrganizationRepository
from app.schemas.platform_organization import PlatformOrganizationResponse, PlatformOrganizationStatusUpdate, PlatformOrganizationVerificationUpdate
from app.identity.services.audit_service import AuditService
from app.modules.rbac.repositories.rbac_repository import RBACRepository
from app.identity.models.user import User

class PlatformOrganizationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = OrganizationRepository(session)
        self.audit_service = AuditService()

    async def list_organizations(
        self, skip: int = 0, limit: int = 100, search: str | None = None, status: str | None = None, verification_status: str | None = None
    ) -> tuple[int, list[PlatformOrganizationResponse]]:
        """List all organizations globally."""
        total, orgs = await self.repository.list_platform_organizations(skip, limit, search, status, verification_status)
        
        response_orgs = []
        for org in orgs:
            # For list, we might omit owner email or member count to save queries, 
            # or do them efficiently. Let's do it individually for now or just return base models if acceptable.
            # But the schema requires created_at, which org has.
            # We'll just return with member_count=0 for the list to be efficient, or add it if needed.
            org_dict = org.__dict__.copy()
            org_dict["created_at"] = org.created_at
            org_dict["member_count"] = 0
            response_orgs.append(PlatformOrganizationResponse.model_validate(org_dict))
            
        return total, response_orgs

    async def get_organization_details(self, org_id: uuid.UUID) -> PlatformOrganizationResponse:
        """Fetch full details for an organization."""
        org = await self.repository.get_by_id(org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        stats = await self.repository.get_organization_statistics(org_id)
        
        # Get owner email
        rbac_repo = RBACRepository(self.session)
        owners = await rbac_repo.get_users_with_role_in_organization(org_id, "Owner")
        owner_email = owners[0].email if owners else None

        org_dict = org.__dict__.copy()
        org_dict["created_at"] = org.created_at
        org_dict["member_count"] = stats["member_count"]
        org_dict["owner_email"] = owner_email

        return PlatformOrganizationResponse.model_validate(org_dict)

    async def update_organization_status(
        self, org_id: uuid.UUID, status_update: PlatformOrganizationStatusUpdate, current_user: User
    ) -> PlatformOrganizationResponse:
        """Suspend or Reactivate an organization."""
        org = await self.repository.get_by_id(org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        old_status = org.status
        org.status = status_update.status
        await self.repository.update(org)

        # Audit log
        await self.audit_service.log_event(
            db=self.session,
            event_type="platform.organization.status_changed",
            user_id=current_user.id,
            metadata_payload={
                "organization_id": str(org_id),
                "old_status": str(old_status.value),
                "new_status": str(status_update.status.value),
                "reason": status_update.reason
            }
        )

        await self.session.commit()
        return await self.get_organization_details(org_id)

    async def update_organization_verification_status(
        self, org_id: uuid.UUID, verification_update: PlatformOrganizationVerificationUpdate, current_user: User
    ) -> PlatformOrganizationResponse:
        """Approve, reject, or request more info for an organization."""
        org = await self.repository.get_by_id(org_id)
        if not org:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

        old_status = org.verification_status
        org.verification_status = verification_update.verification_status
        await self.repository.update(org)

        # Audit log
        await self.audit_service.log_event(
            db=self.session,
            event_type="platform.organization.verification_changed",
            user_id=current_user.id,
            metadata_payload={
                "organization_id": str(org_id),
                "old_status": str(old_status.value),
                "new_status": str(verification_update.verification_status.value),
                "reason": verification_update.reason
            }
        )

        await self.session.commit()
        return await self.get_organization_details(org_id)

    async def get_organization_audit_history(self, org_id: uuid.UUID, limit: int = 50) -> list[dict]:
        """Fetch recent audit events for this organization. 
        In a real implementation, you'd filter SecurityEvents by organization_id in metadata_payload.
        For now, we will return a mock list or query jsonb if supported."""
        from app.identity.models.security import SecurityEvent as AuditLog
        from sqlalchemy import select, desc
        
        # Filter where metadata_payload ->> 'organization_id' == org_id
        # We can just fetch globally and filter, or use raw sql
        # Let's do a simple jsonb path extraction if it's postgres
        # But SQLite doesn't support the same json operators easily in SQLAlchemy without dialect checks.
        # We'll just fetch all for org_id if there is a column, but there isn't.
        # So we'll fetch recent global events and filter in memory since this is a demo.
        
        stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(500)
        result = await self.session.execute(stmt)
        logs = result.scalars().all()
        
        org_logs = [
            {
                "id": str(log.id),
                "timestamp": log.created_at.isoformat(),
                "event_type": log.event_type,
                "user_id": str(log.user_id) if log.user_id else None,
                "ip_address": log.ip_address,
                "metadata": log.metadata_payload
            }
            for log in logs
            if log.metadata_payload and log.metadata_payload.get("organization_id") == str(org_id)
        ]
        
        return org_logs[:limit]
