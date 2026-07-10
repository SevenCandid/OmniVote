import datetime

from sqlalchemy import Boolean, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.types import UTCDateTime


class TimestampMixin:
    """
    Mixin to inject created_at and updated_at UTC timestamps.
    Leverages UTCDateTime decorator to ensure strict UTC handling.
    """

    created_at: Mapped[datetime.datetime] = mapped_column(
        UTCDateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        UTCDateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )


class SoftDeleteMixin:
    """
    Mixin to inject is_deleted flag and deleted_at timestamp.
    Enables soft delete logic patterns instead of database hard deletes.
    """

    is_deleted: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    deleted_at: Mapped[datetime.datetime | None] = mapped_column(
        UTCDateTime, nullable=True, default=None
    )


class AuditMixin:
    """
    Mixin to trace actor IDs responsible for creating or updating records.
    Prepares standard auditing attributes (no relational connections defined).
    """

    created_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
