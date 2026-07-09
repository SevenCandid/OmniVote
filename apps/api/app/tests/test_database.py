import pytest
import uuid
import datetime
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from app.utils.uuid import generate_uuid7
from app.database.types import UTCDateTime
from app.database.health import check_db_health
from app.database.session import async_session_factory

def test_generate_uuid7():
    """Verify that generate_uuid7 generates a valid, RFC-compliant UUIDv7."""
    id1 = generate_uuid7()
    id2 = generate_uuid7()
    
    assert isinstance(id1, uuid.UUID)
    assert id1.version == 7
    # UUIDv7 should be time-ordered (chronological)
    assert id2 >= id1

def test_utc_datetime_type():
    """Verify that UTCDateTime enforces UTC conversion on bind and load parameters."""
    decorator = UTCDateTime()
    
    # Timezone-naive datetime should be forced to UTC
    naive_dt = datetime.datetime(2026, 7, 9, 12, 0, 0)
    bound_val = decorator.process_bind_param(naive_dt, None)
    assert bound_val.tzinfo == datetime.timezone.utc
    
    # Timezone-aware non-UTC datetime should be converted to UTC (e.g. UTC+2)
    tz_plus_two = datetime.timezone(datetime.timedelta(hours=2))
    aware_dt = datetime.datetime(2026, 7, 9, 12, 0, 0, tzinfo=tz_plus_two)
    bound_val = decorator.process_bind_param(aware_dt, None)
    assert bound_val.tzinfo == datetime.timezone.utc
    assert bound_val.hour == 10  # 12:00 UTC+2 is 10:00 UTC

@pytest.mark.anyio
async def test_database_health_helper():
    """Verify check_db_health utility successfully executes a database ping."""
    async with async_session_factory() as session:
        is_healthy = await check_db_health(session)
        assert is_healthy is True

def test_health_api_endpoint(client: TestClient):
    """Verify /health endpoint integrates and returns database connection state."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_sqlalchemy_exception_handler_middleware(client: TestClient):
    """
    Verify that global exception handler catches database errors,
    logs safely, and returns correct error schemas instead of leaks.
    """
    # We trigger a route that raises a database error to test handler output
    # Since we do not have business models, we can temporarily register a test route inside create_app
    # or test the handler function directly. Testing the endpoint is much cleaner.
    from fastapi import Request
    from app.exceptions.handlers import sqlalchemy_exception_handler
    
    # We can mock/create a dummy request and trigger the handler
    class MockRequest:
        def __init__(self):
            self.state = type("State", (), {"request_id": "req-test-123", "correlation_id": "corr-test-456"})()

    dummy_request = MockRequest()
    exc = IntegrityError("SELECT * FROM sensitive_table", params={"user": "admin"}, orig=Exception("constraint failed"))
    
    # Run the async handler in a test context
    import asyncio
    import json
    response = asyncio.run(sqlalchemy_exception_handler(dummy_request, exc))
    
    assert response.status_code == 500
    body = json.loads(response.body.decode("utf-8"))
    assert body["success"] is False
    assert body["message"] == "Database operation failed."
    assert body["error"]["code"] == "DATABASE_ERROR"
    # Ensure no query statements or parameters are leaked
    assert "sensitive_table" not in str(body)
    assert "admin" not in str(body)
