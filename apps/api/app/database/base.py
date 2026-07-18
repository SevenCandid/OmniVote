import uuid

from sqlalchemy import MetaData, Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.utils.uuid import generate_uuid7


# Strict naming convention to ensure deterministic constraint generation for migrations
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=NAMING_CONVENTION)


class Base(DeclarativeBase):
    metadata = metadata


class BaseModel(Base):
    """
    Abstract base model that standardizes primary keys using UUID version 7.
    Uses SQLAlchemy's native Uuid type which maps to PG native UUID columns in production,
    and falls back to standard strings in SQLite test runs.
    """

    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=generate_uuid7,
        sort_order=-100,  # Ensures primary key is generated first in schema mappings
    )

# Import all models here so Alembic can find them for autogenerate
from app.identity.models.user import User
from app.identity.models.credential import Credential
from app.identity.models.session import Session
from app.identity.models.security import SecurityEvent
from app.identity.models.tokens import VerificationToken, PasswordResetToken
