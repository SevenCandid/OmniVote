# 9. Membership-Based Authorization & Global Permissions

Date: 2026-07-20

## Status

Approved

## Context

In multi-tenant SaaS environments, securing API endpoints requires resolving who is performing the request, which tenant (Organization) they are executing it against, and what rights they have. Overloading the `User` model with permissions is anti-pattern because a user can hold different roles in different organizations (e.g., an Owner in one organization and a regular Member in another).

## Decision

We decided to implement a Membership-based authorization model using global permission definitions:

1. **Global Permissions Matrix**: Permissions are globally defined (e.g. `organization.view`, `member.invite`, `election.create`) using a hierarchical dot-notation naming standard (`resource.action`).
2. **Dynamic Resolution**: Endpoint authorization is computed dynamically at request time using a dependency guard:
   `User` → `Active Membership (for current org)` → `Assigned Roles` → `Role Permissions` → `Action Decision`.
3. **Reserved Owner Role**: The `Owner` role is seeded as a reserved system role containing permissions to update/delete organizations and transfer ownership.
4. **Backend Enforcement**: No frontend permission check is trusted as the final authority. The backend FastAPI route policies (using the `RequirePermission` dependency) evaluate and enforce permissions for every API endpoint.

## Consequences

- **Positive**: Strict tenant isolation. A user's access rights are scoped strictly to the current organization context.
- **Positive**: Simplified RBAC configuration. Adding new features only requires declaring permissions in the global database seed list and wrapping the route with the matching `RequirePermission` dependency.
- **Negative**: Requires lookup of memberships and permissions on every authenticated API call, requiring efficient queries (and caching/eager loading) to prevent performance degradation.
