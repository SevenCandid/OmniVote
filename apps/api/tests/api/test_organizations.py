import uuid
from fastapi.testclient import TestClient

def get_auth_headers(client: TestClient, email: str) -> dict:
    # Register
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "Owner"
        }
    )
    # Login
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": email,
            "password": "StrongPassword123!"
        }
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_organization(client: TestClient):
    unique_slug = f"test-org-{uuid.uuid4().hex[:8]}"
    headers = get_auth_headers(client, f"owner-{uuid.uuid4().hex[:4]}@example.com")
    payload = {
        "name": "Test Organization",
        "slug": unique_slug,
        "description": "A testing organization",
        "contact_email": "test@example.com",
    }
    
    response = client.post("/api/v1/organizations/", json=payload, headers=headers)
    assert response.status_code == 201
    
    data = response.json()
    assert data["name"] == "Test Organization"
    assert data["slug"] == unique_slug
    assert data["status"] == "active"
    assert "settings" in data
    assert "branding" in data
    assert "subscription" in data

def test_create_duplicate_organization(client: TestClient):
    unique_slug = f"dup-org-{uuid.uuid4().hex[:8]}"
    headers = get_auth_headers(client, f"owner-{uuid.uuid4().hex[:4]}@example.com")
    payload = {
        "name": "Duplicate Organization",
        "slug": unique_slug,
    }
    
    # First creation should succeed
    response1 = client.post("/api/v1/organizations/", json=payload, headers=headers)
    assert response1.status_code == 201
    
    # Second creation with same slug should fail with 409
    response2 = client.post("/api/v1/organizations/", json=payload, headers=headers)
    assert response2.status_code == 409
    
    error_data = response2.json()
    assert error_data["error"]["code"] == "CONFLICT"

def test_list_organizations(client: TestClient):
    email = f"owner-{uuid.uuid4().hex[:4]}@example.com"
    headers = get_auth_headers(client, email)
    
    # Create an org first so listing is not empty
    unique_slug = f"list-org-{uuid.uuid4().hex[:8]}"
    client.post(
        "/api/v1/organizations/",
        json={"name": "List Org", "slug": unique_slug},
        headers=headers
    )
    
    response = client.get("/api/v1/organizations/", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    
    # Check that eager loaded properties exist
    org = data[0]
    assert "settings" in org
    assert "branding" in org
    assert "subscription" in org
