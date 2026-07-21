import uuid
import asyncio
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.database.session import async_session_factory
from app.modules.rbac.seed import seed_permissions
from app.modules.rbac.models.rbac import PlatformRole, UserPlatformRole
from app.identity.models.user import User

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

async def make_platform_owner(email: str):
    async with async_session_factory() as session:
        from sqlalchemy import select
        user_stmt = select(User).where(User.email == email)
        user_res = await session.execute(user_stmt)
        user = user_res.scalar_one()

        role_stmt = select(PlatformRole).where(PlatformRole.name == "Platform Owner")
        role_res = await session.execute(role_stmt)
        role = role_res.scalar_one()

        upr = UserPlatformRole(user_id=user.id, role_id=role.id)
        session.add(upr)
        await session.commit()

async def ensure_db_seeded():
    async with async_session_factory() as session:
        await seed_permissions(session)

def test_support_and_platform_rbac_flow(client: TestClient):
    # 1. Run seed script inside test database context
    asyncio.run(ensure_db_seeded())

    # 2. Register customer user and create an organization
    customer_email = f"customer-{uuid.uuid4().hex[:4]}@example.com"
    customer_headers = get_auth_headers(client, customer_email)
    
    org_slug = f"cust-org-{uuid.uuid4().hex[:8]}"
    org_payload = {
        "name": "Customer Org",
        "slug": org_slug,
    }
    org_resp = client.post("/api/v1/organizations/", json=org_payload, headers=customer_headers)
    assert org_resp.status_code == 201
    org_id = org_resp.json()["id"]

    # 3. Create a Support Request from customer
    req_payload = {
        "description": "I need assistance setting up custom domain.",
        "request_type": "GENERAL"
    }
    req_resp = client.post(
        f"/api/v1/organizations/{org_id}/support/requests",
        json=req_payload,
        headers=customer_headers
    )
    assert req_resp.status_code == 201
    req_data = req_resp.json()
    assert req_data["description"] == req_payload["description"]
    assert req_data["status"] == "PENDING"
    request_id = req_data["id"]

    # 4. Register a platform admin user
    admin_email = f"admin-{uuid.uuid4().hex[:4]}@example.com"
    admin_headers = get_auth_headers(client, admin_email)

    # 5. Admin tries to list requests but lacks platform roles
    list_resp = client.get("/api/v1/support/requests", headers=admin_headers)
    assert list_resp.status_code == 403  # Forbidden

    # 6. Assign Platform Owner role to the admin globally
    asyncio.run(make_platform_owner(admin_email))

    # 7. Admin lists support requests (now has Platform Owner role)
    list_resp2 = client.get("/api/v1/support/requests", headers=admin_headers)
    assert list_resp2.status_code == 200
    requests_list = list_resp2.json()
    assert any(r["id"] == request_id for r in requests_list)

    # 8. Admin accepts the support request
    accept_resp = client.post(
        f"/api/v1/support/requests/{request_id}/accept?duration_minutes=30",
        headers=admin_headers
    )
    assert accept_resp.status_code == 200
    session_data = accept_resp.json()
    assert session_data["status"] == "ACTIVE"
    assert session_data["access_level"] == "Platform Support"
    session_id = session_data["id"]

    # 9. Verify that Platform Admin (without membership) can now access customer org view route
    view_org_resp = client.get(
        f"/api/v1/organizations/{org_id}/roles",
        headers=admin_headers
    )
    assert view_org_resp.status_code == 200

    # 10. Verify that Platform Admin CANNOT update the customer organization details
    # (Platform Support role has read-only organization.view, not organization.update)
    update_org_resp = client.patch(
        f"/api/v1/organizations/{org_id}",
        json={"name": "Attacked name"},
        headers=admin_headers
    )
    assert update_org_resp.status_code == 403  # Forbidden

    # 11. Admin terminates the session explicitly
    term_resp = client.post(
        f"/api/v1/support/sessions/{session_id}/terminate",
        headers=admin_headers
    )
    assert term_resp.status_code == 200
    assert term_resp.json()["status"] == "TERMINATED"

    # 12. View org route should now be forbidden again
    view_org_resp2 = client.get(
        f"/api/v1/organizations/{org_id}/roles",
        headers=admin_headers
    )
    assert view_org_resp2.status_code == 403  # Forbidden

    # 13. Test Emergency Session access
    emergency_payload = {
        "organization_id": org_id,
        "reason": "Investigating active system failure",
        "duration_minutes": 15
    }
    em_resp = client.post(
        "/api/v1/support/emergency-sessions",
        json=emergency_payload,
        headers=admin_headers
    )
    assert em_resp.status_code == 201
    em_data = em_resp.json()
    assert em_data["status"] == "ACTIVE"
    assert em_data["access_level"] == "Emergency Support Access"

    # 14. View org route should be accessible under emergency session
    view_org_resp3 = client.get(
        f"/api/v1/organizations/{org_id}/roles",
        headers=admin_headers
    )
    assert view_org_resp3.status_code == 200

