from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db_session
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User
from app.modules.rbac.dependencies import RequirePlatformPermission
from app.schemas.platform_settings import PlatformSettingsResponse, PlatformSettingsUpdate
from app.services.platform_settings_service import PlatformSettingsService

router = APIRouter()

@router.get(
    "",
    response_model=PlatformSettingsResponse,
    dependencies=[Depends(RequirePlatformPermission("platform.configure"))],
)
async def get_platform_settings(
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve global platform settings.
    Sensitive secrets are never returned in plaintext.
    """
    service = PlatformSettingsService(db)
    settings = await service.get_settings()
    return service.get_public_view(settings)


@router.patch(
    "",
    response_model=PlatformSettingsResponse,
    dependencies=[Depends(RequirePlatformPermission("platform.configure"))],
)
async def update_platform_settings(
    update_data: PlatformSettingsUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    """
    Update global platform settings.
    Sensitive secrets provided in plaintext here will be encrypted by the SecretManager
    before being stored in the database.
    """
    service = PlatformSettingsService(db)
    
    # Exclude None values so we only update what's provided
    update_dict = update_data.model_dump(exclude_unset=True)
    
    settings = await service.update_settings(update_dict)
    return service.get_public_view(settings)
