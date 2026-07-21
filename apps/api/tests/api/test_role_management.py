import uuid
import asyncio
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.database.session import async_session_factory
from app.modules.rbac.seed import seed_permissions
from app.modules.rbac.models.rbac import PlatformRole, UserPlatformRole, Role, Permission
from app.identity.models.user import User
from app.identity.models.security import SecurityEvent


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


async def get_permission_by_key(key: str) -> str:
    async with async_session_factory() as session:
        from sqlalchemy import select
        res = await session.execute(select(Permission).where(Permission.key == key))
        perm = res.scalar_one()
        return str(perm.id)


async def count_audit_events(event_type: str) -> int:
    async with async_session_factory() as session:
        from sqlalchemy import select, func
        res = await session.execute(
            select(func.count()).select_from(SecurityEvent).where(SecurityEvent.event_type == event_type)
        )
        return res.scalar() or 0


def test_role_management_lifecycle_and_protections(client: TestClient):
    # 1. Seed DB
    asyncio.run(ensure_db_seeded())

    # 2. Register Owner A and create organization
    owner_email = f"owner-a-{uuid.uuid4().hex[:4]}@example.com"
    owner_headers = get_auth_headers(client, owner_email)

    org_slug = f"test-org-{uuid.uuid4().hex[:8]}"
    org_resp = client.post(
        "/api/v1/organizations/",
        json={"name": "Role Test Org", "slug": org_slug},
        headers=owner_headers
    )
    assert org_resp.status_code == 201
    org_id = org_resp.json()["id"]

    # 3. Retrieve effective permissions of Owner A
    eff_resp = client.get(
        f"/api/v1/organizations/{org_id}/memberships/me/effective-permissions",
        headers=owner_headers
    )
    assert eff_resp.status_code == 200
    eff_data = eff_resp.json()
    assert eff_data["organization_id"] == org_id
    assert "organization.view" in eff_data["permissions"]
    assert "member.update" in eff_data["permissions"]

    # 3b. Test /my-permissions alias endpoint
    alias_resp = client.get(
        f"/api/v1/organizations/{org_id}/memberships/my-permissions",
        headers=owner_headers
    )
    assert alias_resp.status_code == 200
    assert alias_resp.json()["organization_id"] == org_id

    # Retrieve all roles for the organization
    roles_resp = client.get(
        f"/api/v1/organizations/{org_id}/roles",
        headers=owner_headers
    )
    assert roles_resp.status_code == 200
    roles = roles_resp.json()

    owner_role = next(r for r in roles if r["name"] == "Owner" and r["is_system"] is True)
    admin_role = next(r for r in roles if r["name"] == "Admin" and r["is_system"] is True)
    member_role = next(r for r in roles if r["name"] == "Member" and r["is_system"] is True)

    # 4. Verify system roles are protected from modification and deletion
    edit_resp = client.patch(
        f"/api/v1/organizations/{org_id}/roles/{owner_role['id']}",
        json={"name": "Owner Updated"},
        headers=owner_headers
    )
    assert edit_resp.status_code == 403

    del_resp = client.delete(
        f"/api/v1/organizations/{org_id}/roles/{owner_role['id']}",
        headers=owner_headers
    )
    assert del_resp.status_code == 403

    # 5. Create a custom organization role
    create_resp = client.post(
        f"/api/v1/organizations/{org_id}/roles",
        json={"name": "Election Auditor", "description": "Audits election results"},
        headers=owner_headers
    )
    assert create_resp.status_code == 201
    custom_role = create_resp.json()
    assert custom_role["name"] == "Election Auditor"
    assert custom_role["is_system"] is False
    assert custom_role["organization_id"] == org_id

    # 5b. Verify audit event was recorded for role creation
    created_audit_count = asyncio.run(count_audit_events("role.created"))
    assert created_audit_count >= 1, "Expected at least one 'role.created' audit event"

    # 5c. Duplicate name rejection
    dup_resp = client.post(
        f"/api/v1/organizations/{org_id}/roles",
        json={"name": "Election Auditor", "description": "Duplicate"},
        headers=owner_headers
    )
    assert dup_resp.status_code == 409, f"Expected 409 for duplicate role name, got {dup_resp.status_code}"

    # 6. Assign results.view permission via POST (single add)
    results_view_id = asyncio.run(get_permission_by_key("results.view"))
    assign_resp = client.post(
        f"/api/v1/organizations/{org_id}/roles/{custom_role['id']}/permissions",
        json={"permission_id": results_view_id},
        headers=owner_headers
    )
    assert assign_resp.status_code == 201

    # Verify permission assigned audit event
    perm_assign_count = asyncio.run(count_audit_events("role.permission_assigned"))
    assert perm_assign_count >= 1, "Expected 'role.permission_assigned' audit event"

    # 6b. PUT (bulk replace) permissions — replace with organization.view only
    org_view_id = asyncio.run(get_permission_by_key("organization.view"))
    put_perm_resp = client.put(
        f"/api/v1/organizations/{org_id}/roles/{custom_role['id']}/permissions",
        json={"permission_ids": [org_view_id]},
        headers=owner_headers
    )
    assert put_perm_resp.status_code == 200
    replaced_perms = put_perm_resp.json()
    assert len(replaced_perms) == 1
    assert replaced_perms[0]["key"] == "organization.view"

    # Verify replace audit event
    perm_replace_count = asyncio.run(count_audit_events("role.permissions_replaced"))
    assert perm_replace_count >= 1, "Expected 'role.permissions_replaced' audit event"

    # 7. Register user B (Member) and invite to organization
    member_email = f"member-b-{uuid.uuid4().hex[:4]}@example.com"
    member_headers = get_auth_headers(client, member_email)

    invite_resp = client.post(
        f"/api/v1/organizations/{org_id}/members/invite",
        json={"recipient_email": member_email, "initial_roles": [member_role["id"]]},
        headers=owner_headers
    )
    assert invite_resp.status_code == 201
    token = invite_resp.json()["invitation_token"]

    accept_resp = client.post(
        f"/api/v1/invitations/{token}/accept",
        headers=member_headers
    )
    assert accept_resp.status_code == 200
    member_membership_id = accept_resp.json()["id"]

    # Verify B has member role permissions (which lack member.update)
    eff_b_resp = client.get(
        f"/api/v1/organizations/{org_id}/memberships/me/effective-permissions",
        headers=member_headers
    )
    assert eff_b_resp.status_code == 200
    assert "member.update" not in eff_b_resp.json()["permissions"]

    # Promote B to Admin via single role assignment POST
    assign_admin_resp = client.post(
        f"/api/v1/organizations/{org_id}/memberships/{member_membership_id}/roles",
        json={"role_id": admin_role["id"]},
        headers=owner_headers
    )
    assert assign_admin_resp.status_code == 201

    # Verify membership.role_assigned audit event
    role_assign_count = asyncio.run(count_audit_events("membership.role_assigned"))
    assert role_assign_count >= 1, "Expected 'membership.role_assigned' audit event"

    # B now has Admin role — verify organization.delete is NOT in their permissions
    eff_b_updated = client.get(
        f"/api/v1/organizations/{org_id}/memberships/me/effective-permissions",
        headers=member_headers
    )
    assert "organization.delete" not in eff_b_updated.json()["permissions"]

    # B tries privilege escalation: assign organization.delete permission to custom role
    org_delete_id = asyncio.run(get_permission_by_key("organization.delete"))
    escalation_resp = client.post(
        f"/api/v1/organizations/{org_id}/roles/{custom_role['id']}/permissions",
        json={"permission_id": org_delete_id},
        headers=member_headers
    )
    assert escalation_resp.status_code == 403

    # Verify blocked audit event
    blocked_count = asyncio.run(count_audit_events("role.protected_action_blocked"))
    assert blocked_count >= 1, "Expected 'role.protected_action_blocked' audit event"

    # B tries to assign Owner role (privilege escalation via role assignment)
    escalation_role_resp = client.post(
        f"/api/v1/organizations/{org_id}/memberships/{member_membership_id}/roles",
        json={"role_id": owner_role["id"]},
        headers=member_headers
    )
    assert escalation_role_resp.status_code == 403

    # 7b. Test PUT bulk replace for membership roles (Owner A replaces B's roles with just Admin)
    put_roles_resp = client.put(
        f"/api/v1/organizations/{org_id}/memberships/{member_membership_id}/roles",
        json={"role_ids": [admin_role["id"]]},
        headers=owner_headers
    )
    assert put_roles_resp.status_code == 200

    # Verify membership.roles_replaced audit event
    roles_replace_count = asyncio.run(count_audit_events("membership.roles_replaced"))
    assert roles_replace_count >= 1, "Expected 'membership.roles_replaced' audit event"

    # 8. Test Last Owner Protection
    eff_a_data = client.get(
        f"/api/v1/organizations/{org_id}/memberships/me/effective-permissions",
        headers=owner_headers
    ).json()
    owner_membership_id = eff_a_data["membership_id"]

    last_owner_resp = client.delete(
        f"/api/v1/organizations/{org_id}/memberships/{owner_membership_id}/roles/{owner_role['id']}",
        headers=owner_headers
    )
    assert last_owner_resp.status_code == 409

    # 8b. Last Owner Protection via PUT bulk replace
    put_last_owner_resp = client.put(
        f"/api/v1/organizations/{org_id}/memberships/{owner_membership_id}/roles",
        json={"role_ids": [member_role["id"]]},  # Trying to swap Owner for Member
        headers=owner_headers
    )
    assert put_last_owner_resp.status_code == 409

    # 9. Clean up custom role
    delete_custom_resp = client.delete(
        f"/api/v1/organizations/{org_id}/roles/{custom_role['id']}",
        headers=owner_headers
    )
    assert delete_custom_resp.status_code == 204

    # Verify role.deleted audit event
    deleted_audit_count = asyncio.run(count_audit_events("role.deleted"))
    assert deleted_audit_count >= 1, "Expected 'role.deleted' audit event"
