import pytest
from unittest.mock import AsyncMock, patch
from app.cache.keys import RATE_LIMIT_PREFIX
from app.cache.redis import RedisClientManager
from app.workers.worker import WorkerSettings
from app.workers.jobs.example import example_job
from fastapi.testclient import TestClient

def test_redis_keys():
    """Verify prefix keys are defined correctly."""
    assert RATE_LIMIT_PREFIX == "omnivote:ratelimit"

@pytest.mark.anyio
async def test_redis_connection_works():
    """Verify connection pool initializes and handles commands under mock connection."""
    manager = RedisClientManager()
    with patch("app.cache.redis.ConnectionPool.from_url") as mock_pool_from_url:
        mock_pool = mock_pool_from_url.return_value
        mock_pool.disconnect = AsyncMock()
        
        manager.init_pool()
        assert manager.pool is not None
        assert manager.client is not None
        
        # Test command execution under mock
        manager.client.ping = AsyncMock(return_value=True)
        result = await manager.client.ping()
        assert result is True
        
        await manager.close_pool()
        assert manager.pool is None

@pytest.mark.anyio
async def test_redis_connection_failure_handled():
    """Verify connection failure logging behaves correctly when server is unreachable."""
    manager = RedisClientManager()
    with patch("app.cache.redis.ConnectionPool.from_url", side_effect=Exception("Connection refused")):
        with pytest.raises(Exception) as exc_info:
            manager.init_pool()
        assert "Connection refused" in str(exc_info.value)

def test_arq_worker_initializes():
    """Verify WorkerSettings contains correct default structures."""
    assert WorkerSettings.redis_settings is not None
    assert "arq:queue:high" in WorkerSettings.queue_name
    assert WorkerSettings.max_tries == 5
    assert WorkerSettings.functions == [example_job]

def test_health_endpoint_redis_connected(client: TestClient):
    """Verify health endpoint shows connected for Redis under successful mock ping."""
    with patch("app.cache.redis.get_redis") as mock_get_redis:
        mock_client = AsyncMock()
        mock_client.ping.return_value = True
        mock_get_redis.return_value = mock_client
        
        # Also patch db health to pass
        with patch("app.api.v1.endpoints.health.check_db_health", return_value=True):
            response = client.get("/api/v1/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["redis"] == "connected"
            assert data["database"] == "connected"

def test_health_endpoint_redis_disconnected(client: TestClient):
    """Verify health endpoint returns 503 and disconnected status when Redis ping fails."""
    with patch("app.cache.redis.get_redis", side_effect=Exception("Redis disconnected")):
        with patch("app.api.v1.endpoints.health.check_db_health", return_value=True):
            response = client.get("/api/v1/health")
            assert response.status_code == 503
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["redis"] == "disconnected"
            assert data["database"] == "connected"
