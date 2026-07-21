from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization, OrganizationVerificationStatus
from app.identity.models.user import User
from app.modules.rbac.models.rbac import PlatformIdentity
from app.identity.models.security import SecurityEvent
from app.schemas.platform_statistics import PlatformStatisticsResponse, PlatformActivityLogResponse

class PlatformStatisticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_global_statistics(self) -> PlatformStatisticsResponse:
        # Total Organizations
        stmt_total_orgs = select(func.count(Organization.id)).where(Organization.is_deleted == False)  # pylint: disable=not-callable
        total_orgs = await self.db.scalar(stmt_total_orgs) or 0

        # Verified Organizations
        stmt_verified_orgs = select(func.count(Organization.id)).where(  # pylint: disable=not-callable
            Organization.is_deleted == False,
            Organization.verification_status == OrganizationVerificationStatus.VERIFIED
        )
        verified_orgs = await self.db.scalar(stmt_verified_orgs) or 0

        # Pending Verification
        stmt_pending_orgs = select(func.count(Organization.id)).where(  # pylint: disable=not-callable
            Organization.is_deleted == False,
            Organization.verification_status == OrganizationVerificationStatus.PENDING_VERIFICATION
        )
        pending_orgs = await self.db.scalar(stmt_pending_orgs) or 0

        # Platform Users
        stmt_platform_users = select(func.count(PlatformIdentity.id)).where(  # pylint: disable=not-callable
            PlatformIdentity.status == "ACTIVE"
        )
        platform_users = await self.db.scalar(stmt_platform_users) or 0

        # Standard Users
        # Exclude users who have a PlatformIdentity record
        stmt_standard_users = select(func.count(User.id)).where(  # pylint: disable=not-callable
            User.is_deleted == False,
            User.id.not_in(select(PlatformIdentity.user_id))
        )
        standard_users = await self.db.scalar(stmt_standard_users) or 0

        # Mocks for now
        active_support_sessions = 0
        open_support_requests = 0

        return PlatformStatisticsResponse(
            total_organizations=total_orgs,
            verified_organizations=verified_orgs,
            pending_verification=pending_orgs,
            platform_users=platform_users,
            standard_users=standard_users,
            active_support_sessions=active_support_sessions,
            open_support_requests=open_support_requests
        )

    async def get_recent_activity(self, limit: int = 5) -> list[PlatformActivityLogResponse]:
        # Fetch the most recent platform-level security events
        # We look for event_type starting with "platform." or just anything recent for now
        stmt = select(SecurityEvent).order_by(desc(SecurityEvent.created_at)).limit(limit)
        result = await self.db.execute(stmt)
        events = result.scalars().all()

        return [
            PlatformActivityLogResponse(
                id=event.id,
                timestamp=event.created_at,
                event_type=event.event_type,
                user_id=event.user_id,
                ip_address=event.ip_address,
                metadata=event.metadata_payload
            ) for event in events
        ]
