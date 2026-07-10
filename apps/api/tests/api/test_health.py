from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    """Test that the health endpoint returns 200 OK and conforms to the format."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert data == {
        "status": "healthy",
        "service": "omnivote-api",
        "database": "connected",
        "redis": "connected",
    }


def test_error_handler_wrapper(client: TestClient):
    """Test that requesting an invalid endpoint returns a standardized error format."""
    response = client.get("/api/v1/invalid-endpoint-path")
    assert response.status_code == 404

    data = response.json()
    assert data["success"] is False
    assert "message" in data
    assert data["error"]["code"] == "NOT_FOUND"
    assert isinstance(data["error"]["details"], list)

    assert "metadata" in data
    assert "timestamp" in data["metadata"]
    assert "request_id" in data["metadata"]
    assert "correlation_id" in data["metadata"]

    # Traceability headers check
    assert "X-Request-ID" in response.headers
    assert "X-Correlation-ID" in response.headers
