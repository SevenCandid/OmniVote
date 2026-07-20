# Sprint 2.0.4 Retrospective

## Sprint Summary
Sprint 2.0.4 successfully delivered the **Role-Based Access Control (RBAC) Foundation**, completing the authorization model for OmniVote. The sprint focused on adding fine-grained resource permissions, seeding system roles, guarding endpoints with backend authorization policies, securing ownership flows, and building custom dialog structures for the UI.

## Objectives Achieved
* **RBAC Engine**: Created a complete roles-and-permissions hierarchy database design linking permissions to roles, and roles to memberships.
* **Backend Security Guards**: Implemented the `RequirePermission` dependency that intercepts HTTP requests, checks user membership status, resolves permissions, and guards route actions.
* **UX Enhancements**: Created the custom React `ConfirmDialog` modal component, replacing all standard `window.confirm` and browser `alert` triggers on memberships and roles pages with clean modal overlays and toasts.
* **Robust Invitation Life Cycle**: Added cascaded deletion of memberships on invitation revocation, enabling full clean-up when an owner revokes or deletes an invitation history record.
* **Isolated Scroll Panels**: Redesigned the main dashboard viewports to enable scroll isolation, locking the sidebar layout and company footer (VeroSeven) in place while letting only the main content area scroll.

## Architecture Decisions
* **centralized Permission Resolution**: We ensured that users do not own permissions directly; instead, permissions are resolved strictly through active memberships and roles.
* **Owner Role Preservations**: We made the `Owner` role a reserved, read-only system role that cannot be manually edited or removed in the UI to prevent lock-outs.
* **SQL Query Optimization**: Configured eager loading (`selectinload(Membership.user)`) inside database repository queries to avoid N+1 query loops.

## Challenges
* **Duplicate Key Violations**: Encountered unique constraint conflicts on the `memberships` table when re-inviting removed users because database rows were kept in a `REMOVED` status. Resolved this by modifying the accept invitation flow to reactivate existing records instead of attempting insertions.
* **Unvalidated Membership Joins**: Found that listing organizations joined memberships without checking status, meaning removed or pending users could still see organizations in their list. Fixed this by adding status validation filters.

## Lessons Learned
* **Soft Deletes vs. Constraints**: Keeping soft-deleted or deactivated memberships in the table requires handling reactivation paths during creation flows.
* **Component-Level Permission Rules**: When designing frontend buttons for management actions, they must be wrapped with frontend checks (like `RequirePermission` in React) so regular members do not see administrative options.

## Technical Debt
* **Advanced Role Management UI**: The current scope covers assignment and basic filtering; custom role creation and custom permission groups are planned for Sprint 2.0.5.
* **Role Hierarchy Rules**: Implement nested role inheritances (e.g., Administrator automatically inherits all Member permissions).

## Readiness for Sprint 2.0.5
The platform is fully ready for **Sprint 2.0.5 — RBAC Administration & Advanced Role Management**. The foundational authorization rules and guards are locked in, and the database schema is production-ready.
