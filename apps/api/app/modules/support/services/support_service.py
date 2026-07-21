import uuid
import datetime
from typing import Sequence
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timezone

from app.modules.support.models.support import SupportRequest, SupportSession, SupportRequestStatus, SessionStatus
from app.modules.support.repositories.support_repository import SupportRepository
from app.modules.support.schemas.support import SupportRequestCreate, EmergencySessionCreate
from app.identity.services.audit_service import AuditService


class SupportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SupportRepository(db)
        self.audit = AuditService()

    async def create_request(
        self, organization_id: uuid.UUID, requester_id: uuid.UUID, data: SupportRequestCreate
    ) -> SupportRequest:
        request = SupportRequest(
            organization_id=organization_id,
            requested_by=requester_id,
            request_type=data.request_type,
            description=data.description,
            status=SupportRequestStatus.PENDING
        )
        created = await self.repo.create_support_request(request)
        await self.db.commit()

        # Audit creation
        await self.audit.log_event(
            db=self.db,
            event_type="support_request_created",
            user_id=requester_id,
            metadata_payload={
                "organization_id": str(organization_id),
                "support_request_id": str(created.id),
                "request_type": data.request_type
            }
        )
        return created

    async def accept_request(
        self, request_id: uuid.UUID, admin_user_id: uuid.UUID, duration_minutes: int = 60
    ) -> SupportSession:
        request = await self.repo.get_support_request_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support request not found.")

        if request.status != SupportRequestStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Support request cannot be accepted. Current status: {request.status}"
            )

        now = datetime.datetime.now(timezone.utc)
        request.status = SupportRequestStatus.ACCEPTED
        request.resolved_at = now
        await self.repo.update_support_request(request)

        # Create active Support Session
        session = SupportSession(
            platform_user_id=admin_user_id,
            organization_id=request.organization_id,
            support_request_id=request.id,
            access_level="Platform Support",
            reason=f"Accepted support request: {request.description[:100]}",
            expires_at=now + datetime.timedelta(minutes=duration_minutes),
            status=SessionStatus.ACTIVE
        )
        created_session = await self.repo.create_support_session(session)
        await self.db.commit()

        # Audit acceptance and session start
        await self.audit.log_event(
            db=self.db,
            event_type="support_request_accepted",
            user_id=admin_user_id,
            metadata_payload={
                "organization_id": str(request.organization_id),
                "support_request_id": str(request.id),
                "support_session_id": str(created_session.id)
            }
        )
        return created_session

    async def reject_request(self, request_id: uuid.UUID, admin_user_id: uuid.UUID) -> SupportRequest:
        request = await self.repo.get_support_request_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support request not found.")

        if request.status != SupportRequestStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Support request cannot be rejected. Current status: {request.status}"
            )

        request.status = SupportRequestStatus.REJECTED
        request.resolved_at = datetime.datetime.now(timezone.utc)
        updated = await self.repo.update_support_request(request)
        await self.db.commit()

        # Audit rejection
        await self.audit.log_event(
            db=self.db,
            event_type="support_request_rejected",
            user_id=admin_user_id,
            metadata_payload={
                "organization_id": str(request.organization_id),
                "support_request_id": str(request.id)
            }
        )
        return updated

    async def start_emergency_session(
        self, admin_user_id: uuid.UUID, data: EmergencySessionCreate
    ) -> SupportSession:
        now = datetime.datetime.now(timezone.utc)
        session = SupportSession(
            platform_user_id=admin_user_id,
            organization_id=data.organization_id,
            support_request_id=None,
            access_level="Emergency Support Access",
            reason=data.reason,
            expires_at=now + datetime.timedelta(minutes=data.duration_minutes),
            status=SessionStatus.ACTIVE
        )
        created_session = await self.repo.create_support_session(session)
        await self.db.commit()

        # Audit emergency session start
        await self.audit.log_event(
            db=self.db,
            event_type="emergency_support_session_started",
            user_id=admin_user_id,
            metadata_payload={
                "organization_id": str(data.organization_id),
                "support_session_id": str(created_session.id),
                "reason": data.reason
            }
        )
        return created_session

    async def terminate_session(self, session_id: uuid.UUID, user_id: uuid.UUID) -> SupportSession:
        session = await self.repo.get_support_session_by_id(session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support session not found.")

        if session.status != SessionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Support session is not active. Current status: {session.status}"
            )

        session.status = SessionStatus.TERMINATED
        session.ended_at = datetime.datetime.now(timezone.utc)
        updated = await self.repo.update_support_session(session)
        await self.db.commit()

        # Audit session termination
        await self.audit.log_event(
            db=self.db,
            event_type="support_session_ended",
            user_id=user_id,
            metadata_payload={
                "organization_id": str(session.organization_id),
                "support_session_id": str(session.id)
            }
        )
        return updated

    async def list_requests_by_org(self, organization_id: uuid.UUID) -> Sequence[SupportRequest]:
        return await self.repo.list_support_requests_by_org(organization_id)

    async def list_all_requests(self) -> Sequence[SupportRequest]:
        return await self.repo.list_all_support_requests()
