# Current Sprint

**Sprint Name:** Sprint 2.0.4 — Role-Based Access Control (RBAC) Foundation
**Status:** Completed ✅

---

## 1. Objective
Design and implement the foundation for Role-Based Access Control (RBAC). This sprint establishes a reusable authorization engine that determines what authenticated users are allowed to do within an organization, strictly based on their Membership.

---

## 2. Deliverables
### Part 1: Architecture & Domain
- [x] **RBAC Architecture Documentation**: Created `rbac-platform.md` detailing the authorization strategy and module structure.
- [x] **Domain Model**: Defined `Permission`, `Role`, `RolePermission`, and `MembershipRole`.
- [x] **Permission Naming**: Established the `resource.action` convention (e.g. `organization.view`).
- [x] **Documentation Updates**: Updated `domain-model.md` and `domain-services.md`.

### Part 2: Backend Database & Service Implementation
- [x] **Database Models**: Implemented SQLAlchemy models for Roles, Permissions, RolePermissions, and MembershipRoles.
- [x] **RBAC Service**: Logic for assigning roles and resolving permissions for a membership.
- [x] **Authorization Dependencies**: FastAPI dependencies (`RequirePermission`) to guard routes using computed permissions.
- [x] **Data Seeding**: Seeding default system roles (`Owner`, `Admin`, `Member`) and permission matrices.

### Part 3: Frontend & Management Integration
- [x] **Organization Page Enhancements**: Implemented save profile actions and navigation.
- [x] **Confirm Dialog UX**: Custom styled confirmations and toasts to replace native alert/confirm popups.
- [x] **Cascaded Membership Removals**: Deleting an invitation now cascades and removes associated active membership.
- [x] **Eager loading database queries**: Prevented N+1 queries by eager loading User relations when querying memberships.

---

## 3. Up Next
**Sprint 2.0.5 — RBAC Administration & Advanced Role Management**
