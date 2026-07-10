import os
import sys

# Ensure api root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Force test environment settings before importing any app components
os.environ["ENV"] = "testing"

import asyncio
pytest_plugins = ["tests.fixtures.auth_fixtures"]
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.factory import create_app


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Setup sqlite tables for unit testing
    async def _create_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    asyncio.run(_create_tables())
    yield

    # Teardown tables after test session completes
    async def _drop_tables():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    asyncio.run(_drop_tables())


@pytest.fixture(scope="module")
def client() -> Generator[TestClient]:
    app = create_app()
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="function", autouse=True)
def mock_redis_connection():
    from unittest.mock import AsyncMock, patch

    # Mock get_redis globally during pytest execution to simulate a running Redis server
    with patch("app.cache.redis.get_redis") as mock_get_redis:
        mock_client = AsyncMock()
        mock_client.ping.return_value = True
        mock_get_redis.return_value = mock_client
        yield
