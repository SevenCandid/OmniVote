# ADR 011: Platform Administration and Organization Support Access Model

## Status
Approved

## Context
The VeroSeven platform supports two distinct authorization contexts:
1. Global Platform Administration (managing organizations, users, verifications, and global configurations).
2. Tenant-level Organization Administration (managing elections, survey configurations, tenant settings, and tenant memberships).

Previously, these layers were mixed, or platform administrators had to be explicitly added as organization members to support organizations or view organization configurations. This created visual noise (admins showing up in membership counts and member directories) and potential security/audit risks due to overly broad permissions.

Furthermore, customer support interventions require strict security controls: they must be explicitly requested or authorized, temporary in duration, auditable, and operate under a controlled read-only scope rather than assuming full tenant Owner permissions.

## Decision
We decouple Platform RBAC completely from Organization RBAC and establish a customer-initiated temporary support access model:

1. **Platform RBAC Layer**:
   * Add dedicated platform permissions (`organization.manage`, `platform.configure`, `user.manage`, `organization.verify`, `support.operate`, `security.operate`).
   * Add global platform roles (`Platform Owner`, `Platform Administrator`, `Support Administrator`, `Security Administrator`) mapped to users via `UserPlatformRole` without requiring tenant membership.
   * Secure platform-level routes using a new `RequirePlatformPermission` dependency.

2. **Temporary Support Access**:
   * Organizations submit support requests (`SupportRequest`) detailing their issues.
   * Platform administrators with `support.operate` permissions accept the request, establishing a temporary `SupportSession` with a fixed expiration time (e.g., 60 minutes) and specific reason.
   * Platform administrators can also launch an "Emergency Support Session" directly, requiring them to document a reason and triggering high-priority audit events.

3. **RBAC Guard Bypass Integration**:
   * Update the standard `RequirePermission` dependency: if a user is not an active member of the target organization, the guard checks for an active temporary `SupportSession` mapping the user to that organization.
   * If a session is active, the guard resolves permissions using a newly introduced system role `Platform Support`.
   * The `Platform Support` role is seeded globally with read-only permissions (`organization.view`, `member.view`, `election.view`, `results.view`, `audit.view`) to prevent support personnel from performing destructive actions (like updating settings or launching/deleting elections).

4. **Security & Auditing**:
   * Every action taken by a platform administrator while operating under an active support session is intercepted, checked against the restricted `Platform Support` permissions, and logged under the security event type `support_access_action`.
   * Support session lifecycle events (`support_request_created`, `support_request_accepted`, `support_request_rejected`, `emergency_support_session_started`, `support_session_ended`) are written to the global security audit trail.

## Consequences
* Decoupling: Platform administrators do not belong to customer organizations, do not affect membership counts, and are not visible in customer member lists.
* Security: Access is strictly bounded by duration and limited to read-only capabilities (`Platform Support` role).
* Compliance: A clear audit trail is generated for all actions performed during active support sessions.
