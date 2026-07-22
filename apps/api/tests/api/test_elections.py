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

def test_election_lifecycle(client: TestClient):
    asyncio.run(ensure_db_seeded())
    
    owner_email = f"owner-election-{uuid.uuid4().hex[:4]}@example.com"
    headers = get_auth_headers(client, owner_email)
    
    # 1. Create Organization
    org_slug = f"election-org-{uuid.uuid4().hex[:8]}"
    org_resp = client.post(
        "/api/v1/organizations/",
        json={"name": "Election Test Org", "slug": org_slug},
        headers=headers
    )
    assert org_resp.status_code == 201
    org_id = org_resp.json()["id"]
    
    # 2. Create Election
    create_resp = client.post(
        f"/api/v1/organizations/{org_id}/elections",
        json={
            "title": "Presidential Election 2026",
            "description": "Select the new president",
            "timezone": "UTC"
        },
        headers=headers
    )
    assert create_resp.status_code == 201
    election = create_resp.json()
    assert election["title"] == "Presidential Election 2026"
    assert election["status"] == "draft"
    election_id = election["id"]
    
    # 3. Get Elections List
    list_resp = client.get(
        f"/api/v1/organizations/{org_id}/elections",
        headers=headers
    )
    assert list_resp.status_code == 200
    assert len(list_resp.json()["items"]) == 1
    
    # 4. Get Single Election
    get_resp = client.get(
        f"/api/v1/organizations/{org_id}/elections/{election_id}",
        headers=headers
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == election_id
    
    # 5. Update Election
    update_resp = client.patch(
        f"/api/v1/organizations/{org_id}/elections/{election_id}",
        json={"title": "Updated Election Title"},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Election Title"
    
    # 6. Publish Election
    publish_resp = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/publish",
        headers=headers
    )
    assert publish_resp.status_code == 200
    assert publish_resp.json()["status"] == "published"
    
    # 7. Open Voting
    open_resp = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/open-voting",
        headers=headers
    )
    assert open_resp.status_code == 200
    assert open_resp.json()["status"] == "voting_open"
    
    # 8. Close Voting
    close_resp = client.post(
        f"/api/v1/organizations/{org_id}/elections/{election_id}/close-voting",
        headers=headers
    )
    assert close_resp.status_code == 200
    assert close_resp.json()["status"] == "voting_closed"