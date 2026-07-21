import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class PlatformSettingsBase(BaseModel):
    platform_name: str | None = None
    maintenance_mode: bool | None = None
    allow_public_registration: bool | None = None
    branding: dict | None = None
    theme_configuration: dict | None = None
    feature_toggles: dict | None = None
    public_urls: dict | None = None

class PlatformSettingsUpdate(PlatformSettingsBase):
    # Sensitive fields that can only be written to, never read.
    smtp_credentials: dict | None = None
    email_provider_api_keys: dict | None = None
    sms_provider_api_keys: dict | None = None
    storage_credentials: dict | None = None
    oauth_client_secrets: dict | None = None
    third_party_service_tokens: dict | None = None

class PlatformSettingsResponse(BaseModel):
    id: uuid.UUID
    platform_name: str
    maintenance_mode: bool
    allow_public_registration: bool
    branding: dict
    theme_configuration: dict
    feature_toggles: dict
    public_urls: dict
    
    # Flags indicating if the secret has been configured
    smtp_credentials_configured: bool
    email_provider_api_keys_configured: bool
    sms_provider_api_keys_configured: bool
    storage_credentials_configured: bool
    oauth_client_secrets_configured: bool
    third_party_service_tokens_configured: bool
    
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
