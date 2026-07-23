import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.notification_dispatcher import NotificationDispatcher
from app.models.notification import NotificationType
from app.modules.rbac.repositories.rbac_repository import RBACRepository

class ElectionNotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.dispatcher = NotificationDispatcher(db)
        self.rbac_repo = RBACRepository(db)

    async def _get_election_managers(self, organization_id: uuid.UUID) -> list[uuid.UUID]:
        """
        Resolves the audience for election notifications.
        Audience: Organization Owner, Administrators, and any members with election management permissions.
        """
        # We query users who have any of these permissions
        manager_permissions = [
            "election.create",
            "election.edit",
            "election.delete",
            "election.publish",
            "election.open_voting",
            "election.close_voting",
            "election.archive",
            "election.cancel"
        ]
        users = await self.rbac_repo.get_users_with_any_permission(organization_id, manager_permissions)
        return [user.id for user in users]

    async def notify_election_managers(
        self,
        organization_id: uuid.UUID,
        title: str,
        message: str,
        type: NotificationType,
        metadata: dict | None = None
    ) -> None:
        manager_ids = await self._get_election_managers(organization_id)
        
        # Deduplicate just in case
        manager_ids = list(set(manager_ids))
        
        for user_id in manager_ids:
            await self.dispatcher.dispatch(
                title=title,
                message=message,
                type=type,
                user_id=user_id,
                metadata=metadata
            )
