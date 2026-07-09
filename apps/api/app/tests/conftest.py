import os
# Force test environment settings before importing any app components
os.environ["ENV"] = "testing"

import asyncio
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from app.factory import create_app
from app.database import Base, engine

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
def client() -> Generator[TestClient, None, None]:
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

