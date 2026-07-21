from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import exc

from app.models.platform_settings import PlatformSettings
from app.services.secret_manager import secret_manager
from pydantic import BaseModel

class PlatformSettingsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_settings(self) -> PlatformSettings:
        """
        Retrieves the singleton PlatformSettings instance.
        If it doesn't exist, it creates one.
        """
        result = await self.db.execute(select(PlatformSettings))
        settings = result.scalars().first()
        if not settings:
            settings = PlatformSettings()
            self.db.add(settings)
            try:
                await self.db.commit()
                await self.db.refresh(settings)
            except exc.IntegrityError:
                await self.db.rollback()
                result = await self.db.execute(select(PlatformSettings))
                settings = result.scalars().first()
        return settings

    async def update_settings(self, update_data: dict) -> PlatformSettings:
        """
        Updates the global platform settings.
        Expects a dictionary where keys map to the PlatformSettings fields.
        Secrets are expected to be plaintext in the dictionary and will be encrypted before saving.
        """
        settings = await self.get_settings()
        
        # Plaintext configurations
        if "platform_name" in update_data:
            settings.platform_name = update_data["platform_name"]
        if "maintenance_mode" in update_data:
            settings.maintenance_mode = update_data["maintenance_mode"]
        if "allow_public_registration" in update_data:
            settings.allow_public_registration = update_data["allow_public_registration"]
        if "branding" in update_data:
            settings.branding = update_data["branding"]
        if "theme_configuration" in update_data:
            settings.theme_configuration = update_data["theme_configuration"]
        if "feature_toggles" in update_data:
            settings.feature_toggles = update_data["feature_toggles"]
        if "public_urls" in update_data:
            settings.public_urls = update_data["public_urls"]

        # Sensitive Secrets - these should only be updated if a new plaintext value is provided
        # The update_data dictionary might contain keys like "smtp_credentials" or "storage_credentials".
        if "smtp_credentials" in update_data:
            # We encrypt the dict using secret_manager
            settings.smtp_credentials_encrypted = secret_manager.encrypt_dict(update_data["smtp_credentials"])
        if "email_provider_api_keys" in update_data:
            settings.email_provider_api_keys_encrypted = secret_manager.encrypt_dict(update_data["email_provider_api_keys"])
        if "sms_provider_api_keys" in update_data:
            settings.sms_provider_api_keys_encrypted = secret_manager.encrypt_dict(update_data["sms_provider_api_keys"])
        if "storage_credentials" in update_data:
            settings.storage_credentials_encrypted = secret_manager.encrypt_dict(update_data["storage_credentials"])
        if "oauth_client_secrets" in update_data:
            settings.oauth_client_secrets_encrypted = secret_manager.encrypt_dict(update_data["oauth_client_secrets"])
        if "third_party_service_tokens" in update_data:
            settings.third_party_service_tokens_encrypted = secret_manager.encrypt_dict(update_data["third_party_service_tokens"])

        self.db.add(settings)
        await self.db.commit()
        await self.db.refresh(settings)
        return settings

    def get_decrypted_secret(self, settings: PlatformSettings, field_name: str) -> dict:
        """
        Helper method for other services to retrieve the decrypted value of a secret.
        The field_name should be the logical name, e.g., 'smtp_credentials'.
        """
        encrypted_field_name = f"{field_name}_encrypted"
        encrypted_val = getattr(settings, encrypted_field_name, None)
        if encrypted_val:
            return secret_manager.decrypt_dict(encrypted_val)
        return {}

    def get_public_view(self, settings: PlatformSettings) -> dict:
        """
        Returns a dictionary suitable for public API responses.
        It NEVER includes the decrypted secrets. It only includes statuses
        such as 'is_configured'.
        """
        return {
            "id": settings.id,
            "platform_name": settings.platform_name,
            "maintenance_mode": settings.maintenance_mode,
            "allow_public_registration": settings.allow_public_registration,
            "branding": settings.branding,
            "theme_configuration": settings.theme_configuration,
            "feature_toggles": settings.feature_toggles,
            "public_urls": settings.public_urls,
            "smtp_credentials_configured": bool(settings.smtp_credentials_encrypted),
            "email_provider_api_keys_configured": bool(settings.email_provider_api_keys_encrypted),
            "sms_provider_api_keys_configured": bool(settings.sms_provider_api_keys_encrypted),
            "storage_credentials_configured": bool(settings.storage_credentials_encrypted),
            "oauth_client_secrets_configured": bool(settings.oauth_client_secrets_encrypted),
            "third_party_service_tokens_configured": bool(settings.third_party_service_tokens_encrypted),
            "created_at": settings.created_at,
            "updated_at": settings.updated_at
        }
