from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin

class PlatformSettings(BaseModel, TimestampMixin):
    """
    Singleton table storing global platform configuration.
    Contains both plaintext configuration and encrypted secrets.
    """
    __tablename__ = "platform_settings"

    # --- Plaintext Configuration ---
    platform_name: Mapped[str] = mapped_column(String(255), default="OmniVote", server_default="OmniVote", nullable=False)
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    allow_public_registration: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    
    branding: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    theme_configuration: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    feature_toggles: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")
    public_urls: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="{}")

    # --- Sensitive Secrets (Encrypted at Rest via SecretManager) ---
    # These fields store the AES-encrypted Base64 ciphertexts of the JSON configurations.
    smtp_credentials_encrypted: Mapped[str | None] = mapped_column(String, nullable=True)
    email_provider_api_keys_encrypted: Mapped[str | None] = mapped_column(String, nullable=True)
    sms_provider_api_keys_encrypted: Mapped[str | None] = mapped_column(String, nullable=True)
    storage_credentials_encrypted: Mapped[str | None] = mapped_column(String, nullable=True)
    oauth_client_secrets_encrypted: Mapped[str | None] = mapped_column(String, nullable=True)
    third_party_service_tokens_encrypted: Mapped[str | None] = mapped_column(String, nullable=True)
