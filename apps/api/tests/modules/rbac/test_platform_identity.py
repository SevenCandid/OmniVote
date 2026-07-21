import uuid
import asyncio
import pytest
from fastapi.testclient import TestClient

from app.database.session import async_session_factory
from app.identity.models.user import User
from app.modules.rbac.models.rbac import (
    PlatformRole,
    PlatformPermission,
    PlatformRolePermission,
    UserPlatformRole,
    Role,
    MembershipRole,
)
from app.modules.membership.models.membership import Membership, MembershipStatus


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


async def setup_platform_roles():
    async with async_session_factory() as db:
        from sqlalchemy import select
        
        # We can rely on the database being seeded by fixtures or auto-seeding.
        # Fetch the existing roles created by seed_platform_roles
        res_owner = await db.execute(select(PlatformRole).where(PlatformRole.name == "Platform Owner"))
        owner_role = res_owner.scalar_one()
        
        res_support = await db.execute(select(PlatformRole).where(PlatformRole.name == "Support Administrator"))
        support_role = res_support.scalar_one()
        
        return {
            "roles": {"owner": owner_role.id, "support": support_role.id},
        }

async def assign_platform_role(email: str, role_id: uuid.UUID):
    async with async_session_factory() as db:
        from sqlalchemy import select
        user_res = await db.execute(select(User).where(User.email == email))
        user = user_res.scalar_one()
        db.add(UserPlatformRole(user_id=user.id, role_id=role_id))
        await db.commit()
        return user.id


def test_get_platform_identity_success_owner(client: TestClient):
    roles_data = asyncio.run(setup_platform_roles())
    email = f"owner-{uuid.uuid4().hex[:4]}@example.com"
    headers = get_auth_headers(client, email)
    
    user_id = asyncio.run(assign_platform_role(email, roles_data["roles"]["owner"]))
    
    response = client.get("/api/v1/platform/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["platform"]["is_platform_user"] is True
    assert len(data["platform"]["roles"]) == 1
    assert data["platform"]["roles"][0]["name"] == "Platform Owner"
    assert "organization.manage" in data["platform"]["permissions"]
    assert "platform.configure" in data["platform"]["permissions"]


def test_get_platform_identity_multiple_roles(client: TestClient):
    roles_data = asyncio.run(setup_platform_roles())
    email = f"multi-{uuid.uuid4().hex[:4]}@example.com"
    headers = get_auth_headers(client, email)
    
    asyncio.run(assign_platform_role(email, roles_data["roles"]["owner"]))
    asyncio.run(assign_platform_role(email, roles_data["roles"]["support"]))
    
    response = client.get("/api/v1/platform/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data["platform"]["roles"]) == 2
    # Platform owner already has all permissions, including support.operate, so total permissions should match owner permissions
    # In seed.py PLATFORM_PERMISSIONS has 6 items
    assert len(data["platform"]["permissions"]) >= 6
    assert "support.operate" in data["platform"]["permissions"]


def test_get_platform_identity_non_platform_user_forbidden(client: TestClient):
    email = f"normal-{uuid.uuid4().hex[:4]}@example.com"
    headers = get_auth_headers(client, email)
    
    response = client.get("/api/v1/platform/me", headers=headers)
    assert response.status_code == 403
    assert "access to the Platform" in response.text


async def assign_org_role(email: str, org_id: uuid.UUID):
    async with async_session_factory() as db:
        from sqlalchemy import select
        user_res = await db.execute(select(User).where(User.email == email))
        user = user_res.scalar_one()
        
        membership = Membership(user_id=user.id, organization_id=org_id, status=MembershipStatus.ACCEPTED)
        db.add(membership)
        await db.flush()
        
        role = Role(name="Owner", organization_id=org_id, is_system=True)
        db.add(role)
        await db.flush()
        
        db.add(MembershipRole(membership_id=membership.id, role_id=role.id))
        await db.commit()


def test_get_platform_identity_organization_admin_forbidden(client: TestClient):
    email = f"orgadmin-{uuid.uuid4().hex[:4]}@example.com"
    headers = get_auth_headers(client, email)
    
    # Create an org to assign to the user
    org_resp = client.post(
        "/api/v1/organizations/",
        json={"name": "Test Org", "slug": f"test-{uuid.uuid4().hex[:6]}"},
        headers=headers
    )
    assert org_resp.status_code == 201
    
    # Check platform route is forbidden
    response = client.get("/api/v1/platform/me", headers=headers)
    assert response.status_code == 403

