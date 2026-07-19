import uuid
from fastapi.testclient import TestClient

def test_membership_lifecycle(client: TestClient):
    # 1. Create User
    client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": "member@example.com",
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "Member"
        }
    )
    # Login
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": "member@example.com",
            "password": "StrongPassword123!"
        }
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get User ID
    me_resp = client.get("/api/v1/identity/users/me", headers=headers)
    user_id = me_resp.json()["id"]

    # 3. Create Org
    org_slug = f"org-{uuid.uuid4().hex[:8]}"
    org_resp = client.post(
        "/api/v1/organizations/",
        json={"name": "Membership Org", "slug": org_slug},
        headers=headers
    )
    org_id = org_resp.json()["id"]

    # 4. Invite User (since user is creating org, maybe they are automatically added, but let's test the endpoint explicitly)
    invite_resp = client.post(
        f"/api/v1/organizations/{org_id}/members/invite",
        json={"user_id": user_id, "organization_id": org_id},
        headers=headers
    )
    assert invite_resp.status_code == 201
    membership_id = invite_resp.json()["id"]

    # 5. List Pending
    pending_resp = client.get(f"/api/v1/organizations/{org_id}/members/pending", headers=headers)
    assert pending_resp.status_code == 200
    assert len(pending_resp.json()) >= 1

    # 6. Accept Invite
    accept_resp = client.post(f"/api/v1/memberships/{membership_id}/accept", headers=headers)
    assert accept_resp.status_code == 200
    assert accept_resp.json()["status"] == "accepted"

    # 7. List Members
    members_resp = client.get(f"/api/v1/organizations/{org_id}/members", headers=headers)
    assert members_resp.status_code == 200
    assert len(members_resp.json()) >= 1
    
    # 8. List User Orgs
    user_orgs_resp = client.get("/api/v1/users/me/organizations", headers=headers)
    assert user_orgs_resp.status_code == 200
    assert len(user_orgs_resp.json()) >= 1

    # 9. Remove Membership
    remove_resp = client.delete(f"/api/v1/memberships/{membership_id}?organization_id={org_id}", headers=headers)
    assert remove_resp.status_code == 204
