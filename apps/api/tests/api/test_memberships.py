import uuid
from fastapi.testclient import TestClient

def get_auth_headers(client: TestClient, email: str) -> tuple[str, dict]:
    # Register
    reg_resp = client.post(
        "/api/v1/identity/auth/register",
        json={
            "email": email,
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    user_id = reg_resp.json()["id"]
    # Login
    login_resp = client.post(
        "/api/v1/identity/auth/login",
        data={
            "username": email,
            "password": "StrongPassword123!"
        }
    )
    token = login_resp.json()["access_token"]
    return user_id, {"Authorization": f"Bearer {token}"}

def test_membership_lifecycle(client: TestClient):
    owner_email = f"owner-{uuid.uuid4().hex[:4]}@example.com"
    owner_id, owner_headers = get_auth_headers(client, owner_email)
    
    invitee_email = f"invitee-{uuid.uuid4().hex[:4]}@example.com"
    invitee_id, invitee_headers = get_auth_headers(client, invitee_email)

    # 1. Owner creates Organization
    org_slug = f"org-{uuid.uuid4().hex[:8]}"
    org_resp = client.post(
        "/api/v1/organizations/",
        json={"name": "Membership Org", "slug": org_slug},
        headers=owner_headers
    )
    assert org_resp.status_code == 201
    org_id = org_resp.json()["id"]

    # 2. Owner invites target Invitee user
    invite_resp = client.post(
        f"/api/v1/organizations/{org_id}/members/invite",
        json={"recipient_email": invitee_email, "initial_roles": ["Member"]},
        headers=owner_headers
    )
    assert invite_resp.status_code == 201
    invitation_id = invite_resp.json()["id"]
    token = invite_resp.json()["invitation_token"]

    # 3. Target user lists their pending invitations
    invitations_resp = client.get("/api/v1/users/me/invitations", headers=invitee_headers)
    assert invitations_resp.status_code == 200
    invitations = invitations_resp.json()
    assert any(inv["id"] == invitation_id for inv in invitations)

    # 4. Target user accepts the invitation
    accept_resp = client.post(f"/api/v1/invitations/{token}/accept", headers=invitee_headers)
    assert accept_resp.status_code == 200
    membership_id = accept_resp.json()["id"]
    assert accept_resp.json()["status"] == "accepted"

    # 5. List members in Organization
    members_resp = client.get(f"/api/v1/organizations/{org_id}/members", headers=owner_headers)
    assert members_resp.status_code == 200
    members = members_resp.json()
    assert any(member["id"] == membership_id for member in members)
    
    # 6. Target user lists their organizations
    user_orgs_resp = client.get("/api/v1/users/me/organizations", headers=invitee_headers)
    assert user_orgs_resp.status_code == 200
    assert len(user_orgs_resp.json()) >= 1

    # 7. Owner removes the target user's membership
    remove_resp = client.delete(f"/api/v1/memberships/{membership_id}?organization_id={org_id}", headers=owner_headers)
    assert remove_resp.status_code == 204
