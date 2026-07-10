import pytest
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, engine
from app.database.mixins import AuditMixin, SoftDeleteMixin, TimestampMixin
from app.database.session import async_session_factory


class DummyModel(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = "dummy_model_for_tests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)


@pytest.mark.anyio
async def test_mixins_database_behavior():
    """Verify that columns from mixins are correctly mapped and read/write to database."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        record = DummyModel(id=100, created_by="test-agent")
        session.add(record)
        await session.commit()

        # Query the database back
        query_result = await session.get(DummyModel, 100)
        assert query_result is not None
        assert query_result.created_by == "test-agent"
        assert query_result.is_deleted is False
        assert query_result.created_at is not None
        assert query_result.updated_at is not None
