from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "OmniVote API"
    ENV: str = "development"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Database Configurations
    DATABASE_URL: str = "postgresql+asyncpg://postgres:securepassword@localhost:5432/omnivote"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_TIMEOUT: float = 30.0
    DATABASE_POOL_RECYCLE: int = 1800

    @model_validator(mode="after")
    def validate_database_url(self) -> "Settings":
        if self.ENV != "testing":
            if not self.DATABASE_URL or not self.DATABASE_URL.startswith("postgresql"):
                raise ValueError(
                    f"DATABASE_URL must be a PostgreSQL connection string for active environment '{self.ENV}'. "
                    "In-memory SQLite fallbacks are disabled in non-test modes to prevent silent data loss."
                )
        return self
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "placeholder_secret_key_change_me_in_production"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str) and v.startswith("["):
            import json
            return json.loads(v)
        return [str(v)]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
