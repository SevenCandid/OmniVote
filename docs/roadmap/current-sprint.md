# Current Sprint

**Sprint Name:** Sprint 2.0.4 — Role-Based Access Control (RBAC) Foundation
**Status:** In Progress 🟡

---

## 1. Objective
Design and implement the foundation for Role-Based Access Control (RBAC). This sprint establishes a reusable authorization engine that determines what authenticated users are allowed to do within an organization, strictly based on their Membership.

---

## 2. Deliverables
### Part 1: Architecture & Domain (In Progress)
- [x] **RBAC Architecture Documentation**: Created `rbac-platform.md` detailing the authorization strategy and module structure.
- [x] **Domain Model**: Defined `Permission`, `Role`, `RolePermission`, and `MembershipRole`.
- [x] **Permission Naming**: Established the `resource.action` convention (e.g. `organization.view`).
- [x] **Documentation Updates**: Updated `domain-model.md` and `domain-services.md`.

### Future Parts
- [ ] **Backend Database Models**: Implement models for Roles, Permissions, and assignment tables.
- [ ] **RBAC Service**: Logic for assigning roles and resolving permissions for a membership.
- [ ] **Authorization Dependencies**: FastAPI dependencies to guard routes using computed permissions.
- [ ] **Data Seeding**: Seeding default system roles (e.g., Owner, Administrator).

*(Note: Frontend UI for role management is explicitly OUT OF SCOPE for this foundation sprint).*

---

## 3. Up Next
**Sprint 2.0.5 — Core Event Engine**
