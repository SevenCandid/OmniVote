# Release Notes — v0.2.4-alpha

We are pleased to release **v0.2.4-alpha**, completing the **Role-Based Access Control (RBAC) Foundation** for OmniVote. This release establishes a secure, robust, and clean authorization engine that scopes user permissions strictly to their active organizational membership, locking down tenant boundary lines.

## 🚀 Key Features & Upgrades

### 1. Fine-Grained RBAC Foundation
* Introduced the core entities `Permission`, `Role`, `RolePermission`, and `MembershipRole` to separate user identity from organizational rights.
* Implemented the FastAPI authorization dependency guard (`RequirePermission`), enabling route protection with simple, declarative scopes (e.g. `RequirePermission("organization.delete")`).
* Configured automated database seeding for default system roles (`Owner`, `Admin`, `Member`) and their standard permissions.

### 2. Secure Ownership Semantics
* Reserved the `Owner` system role, preventing manual deletion or modification in the UI.
* Configured the system to automatically assign the `Owner` role to organization creators.
* Built checks on the backend and frontend to enforce that every organization must have at least one active owner membership at all times.

### 3. Invitation Cleanup Cascades
* Modified the invitation revocation service to cascade and remove the user's active membership in the organization when an invitation record is deleted, ensuring database consistency.
* Resolved unique database constraint errors on the `memberships` table when re-inviting removed users by automatically reactivating their existing membership record instead of inserting duplicates.

### 4. Frontend UX Enhancements
* Created a reusable `ConfirmDialog` modal component built on top of `BaseDialog`, replacing all native browser dialogs (`window.confirm`/`alert()`) on the memberships and roles pages.
* Added toast notifications (`react-hot-toast`) for modern UI error and success alerting.
* Eager loaded nested user tables on the backend to render names and emails in the Organization Members list rather than raw user UUIDs.
* Implemented scroll isolation on the dashboard layout: the sidebar layout and company footer remain fixed in place while only the main content area scrolls.

---

## 🔒 Security Hardening & Audit
* Secured organization profile update and delete endpoints with backend RBAC dependencies.
* Restricted organization editing capability on the frontend using `RequirePermission` components so regular members are blocked from update actions.
* Wrapped role assignment and membership removal triggers in permission checks.

---

## 🛠️ Installation & Setup
To run with updated roles and permission models:
1. Run database migrations:
   ```bash
   docker exec -it omnivote-api alembic upgrade head
   ```
2. Re-seed default permissions and system roles:
   ```bash
   docker exec -it omnivote-api python -m app.modules.rbac.seed
   ```
