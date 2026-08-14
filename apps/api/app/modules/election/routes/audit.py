import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.modules.rbac.dependencies import RequirePermission
from app.modules.election.schemas.audit import ElectionAuditLogEntry
from app.modules.election.services.audit_log_service import AuditLogService

router = APIRouter(tags=["Elections Audit"])

@router.get(
    "/{election_id}/audit",
    response_model=List[ElectionAuditLogEntry],
    summary="Get Election Audit Logs",
)
async def get_election_audit(
    organization_id: uuid.UUID,
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    _: dict = Depends(RequirePermission("audit.view")),
):
    """
    Retrieve the audit log events related to a specific election.
    Requires 'audit.view' permission on the organization.
    """
    service = AuditLogService(db)
    return await service.get_election_audit_logs(election_id)
