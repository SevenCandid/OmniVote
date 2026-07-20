# Developer Guide — Authorization & RBAC Systems

This guide describes how to work with the Role-Based Access Control (RBAC), authorization, invitation, and ownership subsystems in OmniVote.

---

## 1. Permission Resolution Algorithm
OmniVote uses a Membership-based authorization model. Access is never associated directly with a User or an Organization, but rather with the User's active `Membership` in a specific Organization.

```
User (id)
  └── Membership (org_id)
        └── MembershipRole (assigned roles)
              └── Role (permissions list)
```

At authorization time, permissions are resolved dynamically:
1. Lookup the active `Membership` for the authenticated `User` and `Organization`.
2. Retrieve all active `Role` assignments linked to that `Membership`.
3. Eager load and merge the `Permission` records mapped to those `Roles`.
4. Return a flat list of permission strings (e.g. `['organization.view', 'election.create']`).

---

## 2. RequirePermission Dependency
We protect backend endpoints using FastAPI's dependency injection system via `RequirePermission`.

### Usage:
Import the dependency and inject it into your path operations:
```python
from app.modules.rbac.dependencies import RequirePermission

@router.get("/{organization_id}/settings")
async def get_settings(
    organization_id: uuid.UUID,
    current_user = Depends(RequireUser()),
    _ = Depends(RequirePermission("organization.view"))
):
    ...
```

* **Note**: The dependency expects the path parameter to be named exactly `organization_id` to resolve the current context.

---

## 3. AuthorizationService
The `AuthorizationService` (defined in `app/modules/rbac/services/authorization_service.py`) contains helper functions to evaluate and check permissions programmatically outside HTTP requests (e.g., in background tasks or event handlers).

```python
from app.modules.rbac.services.authorization_service import AuthorizationService

auth_service = AuthorizationService(db_session)
has_access = await auth_service.check_permission(
    user_id=user_id,
    organization_id=org_id,
    permission_key="election.publish"
)
```

---

## 4. Invitation Workflow
Invitations are treated as a separate context (`Invitation`) distinct from active memberships.

### Sequence Flow:
1. **Creation**: An administrator sends an invitation containing recipient email and initial roles.
2. **Database State**: An `Invitation` is stored with status `PENDING`. No membership record is created yet.
3. **Acceptance**:
   - **Existing Users**: Log in, view invitations, and click **Accept**.
   - **New Users**: Land on signup page via link token, complete signup, and auto-accept.
4. **Transition**: The system checks for an existing membership row. If found (e.g. they were previously removed), it reactivates it (status set to `ACCEPTED`, `removed_at` set to `None`). Otherwise, it inserts a new `Membership` row and assigns the roles.
5. **Revocation/Cascade**: Revoking or deleting an accepted invitation cascades and deletes the active membership.

---

## 5. Ownership Transfer Workflow
Ownership is a reserved system role (`Owner`) that possesses root capabilities (including organization update and delete permissions).

* **Invariants**:
  1. Every organization must always have at least one active membership with the `Owner` role.
  2. Users cannot delete the last owner role.
* **Transfer**:
  - Executed via a dedicated `POST /api/v1/organizations/{id}/transfer-ownership` endpoint.
  - This is an atomic transaction: the `Owner` role is added to the target membership, and removed from the active sender membership, preserving the single-owner invariant.
