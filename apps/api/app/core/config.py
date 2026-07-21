from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "OmniVote API"
    ENV: str = "development"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # Database Configurations
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:securepassword@localhost:5432/omnivote"
    )
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: float = 30.0
    DATABASE_POOL_RECYCLE: int = 1800

    # Redis Configurations
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str | None = None
    REDIS_DB: int = 0
    REDIS_URL: str = ""

    # SMTP Configurations
    SMTP_TLS: bool = False
    SMTP_SSL: bool = False
    SMTP_PORT: int | None = 1025
    SMTP_HOST: str | None = "omnivote-mail"
    SMTP_USER: str | None = ""
    SMTP_PASSWORD: str | None = ""
    EMAILS_FROM_EMAIL: str | None = "noreply@veroseven.com"
    EMAILS_FROM_NAME: str | None = "VeroSeven Identity Platform"

    @model_validator(mode="after")
    def validate_and_build_urls(self) -> "Settings":
        if self.ENV != "testing":
            if not self.DATABASE_URL or not self.DATABASE_URL.startswith("postgresql"):
                raise ValueError(
                    f"DATABASE_URL must be a PostgreSQL connection string for active environment '{self.ENV}'. "
                    "In-memory SQLite fallbacks are disabled in non-test modes to prevent silent data loss."
                )

        if not self.REDIS_URL:
            if self.REDIS_PASSWORD:
                self.REDIS_URL = f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
            else:
                self.REDIS_URL = (
                    f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
                )
        return self

    SECRET_KEY: str = "placeholder_secret_key_change_me_in_production"
    SECRET_MANAGER_KEY: str = "EFaRY_O4EMhUC_FCI-cQlt4gEdD7mhvnBPtW85k3oSU="

    # CORS Origins
    BACKEND_CORS_ORIGINS: str | list[str] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str) and v.startswith("["):
            import json

            return json.loads(v)
        return [str(v)]

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )


settings = Settings()
