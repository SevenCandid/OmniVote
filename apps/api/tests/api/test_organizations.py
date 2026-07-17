import uuid
from fastapi.testclient import TestClient

def test_create_organization(client: TestClient):
    unique_slug = f"test-org-{uuid.uuid4().hex[:8]}"
    payload = {
        "name": "Test Organization",
        "slug": unique_slug,
        "description": "A testing organization",
        "contact_email": "test@example.com",
    }
    
    response = client.post("/api/v1/organizations/", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["name"] == "Test Organization"
    assert data["slug"] == unique_slug
    assert data["status"] == "pending_verification"
    assert "settings" in data
    assert "branding" in data
    assert "subscription" in data

def test_create_duplicate_organization(client: TestClient):
    unique_slug = f"dup-org-{uuid.uuid4().hex[:8]}"
    payload = {
        "name": "Duplicate Organization",
        "slug": unique_slug,
    }
    
    # First creation should succeed
    response1 = client.post("/api/v1/organizations/", json=payload)
    assert response1.status_code == 201
    
    # Second creation with same slug should fail with 409
    response2 = client.post("/api/v1/organizations/", json=payload)
    assert response2.status_code == 409
    
    error_data = response2.json()
    assert error_data["error"]["code"] == "CONFLICT"

def test_list_organizations(client: TestClient):
    response = client.get("/api/v1/organizations/")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    # At least the one from test_create_organization or our manual tests should be here
    assert len(data) >= 1
    
    # Check that eager loaded properties exist
    org = data[0]
    assert "settings" in org
    assert "branding" in org
    assert "subscription" in org
