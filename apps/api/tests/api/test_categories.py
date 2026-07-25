import pytest
from fastapi.testclient import TestClient
import uuid
import asyncio

from app.database.session import async_session_factory
from app.modules.rbac.seed import seed_permissions

def get_auth_headers(client: TestClient, email: str) -> dict:
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": email,
            "password": "StrongPassword123!"
        }
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

async def ensure_db_seeded():
    async with async_session_factory() as session:
        await seed_permissions(session)

@pytest.fixture(scope="module")
def seeded_db():
    asyncio.run(ensure_db_seeded())

@pytest.fixture
def test_user_headers(client: TestClient, seeded_db) -> dict:
    return get_auth_headers(client, f"test_{uuid.uuid4().hex}@example.com")

@pytest.fixture
def test_organization(client: TestClient, test_user_headers: dict) -> dict:
    org_resp = client.post(
        "/api/v1/organizations/",
        headers=test_user_headers,
        json={
            "name": "Test Org",
            "slug": f"test-org-{uuid.uuid4().hex}"
        }
    )
    return org_resp.json()

@pytest.fixture
def test_election(client: TestClient, test_user_headers: dict, test_organization: dict) -> dict:
    org_id = test_organization["id"]
    elec_resp = client.post(
        f"/api/v1/organizations/{org_id}/elections/",
        headers=test_user_headers,
        json={
            "title": "Test Election for Categories",
            "description": "Category testing",
            "timezone": "UTC"
        }
    )
    return elec_resp.json()

def test_create_category(client: TestClient, test_user_headers: dict, test_election: dict):
    org_id = test_election["organization_id"]
    election_id = test_election["id"]

    payload = {
        "name": "President",
        "description": "The top position",
        "category_type": "position",
        "max_winners": 1,
        "voting_method": "first_past_the_post",
        "display_order": 0
    }

    response = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers,
        json=payload
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "President"
    assert data["category_type"] == "position"
    assert data["max_winners"] == 1
    assert "id" in data

def test_get_categories(client: TestClient, test_user_headers: dict, test_election: dict):
    org_id = test_election["organization_id"]
    election_id = test_election["id"]

    # Create category first
    payload = {"name": "Test Cat", "category_type": "category"}
    client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers,
        json=payload
    )

    response = client.get(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(c["name"] == "Test Cat" for c in data)

def test_update_category_order(client: TestClient, test_user_headers: dict, test_election: dict):
    org_id = test_election["organization_id"]
    election_id = test_election["id"]

    res1 = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers,
        json={"name": "Cat 1", "category_type": "category"}
    )
    res2 = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers,
        json={"name": "Cat 2", "category_type": "category"}
    )

    cat1_id = res1.json()["id"]

    order_payload = {"display_order": 1} # Swap cat1 to pos 1 (was 0)
    response = client.patch(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/{cat1_id}/order",
        headers=test_user_headers,
        json=order_payload
    )
    assert response.status_code == 200
    assert response.json()["display_order"] == 1

def test_soft_delete_category(client: TestClient, test_user_headers: dict, test_election: dict):
    org_id = test_election["organization_id"]
    election_id = test_election["id"]

    res = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers,
        json={"name": "To Delete"}
    )
    cat_id = res.json()["id"]

    del_res = client.delete(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/{cat_id}",
        headers=test_user_headers
    )
    assert del_res.status_code == 204

    # Fetching list should not include deleted
    list_res = client.get(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/categories/",
        headers=test_user_headers
    )
    data = list_res.json()
    assert not any(c["id"] == cat_id for c in data)
