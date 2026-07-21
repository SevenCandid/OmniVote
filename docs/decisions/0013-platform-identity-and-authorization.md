# ADR 013: Platform Identity and Authorization Layer

**Date**: 2026-07-21
**Status**: Approved

## Context
As OmniVote scales to support multiple organizations, a distinct "Platform Administration" layer is required for VeroSeven staff. This layer must provide administrative capabilities over the entire system (organizations, support sessions, system-wide roles, user management).

Initially, there was a temptation to implement platform-level authorization using simple mock checks (e.g., checking if the user's email domain is `@veroseven.com`), feature flags, or frontend-only validation. This approach is highly insecure and brittle. We also considered extending the existing Organization RBAC engine. However, mixing Platform Identity with Organization Membership creates complex boundaries and potential for privilege escalation, as well-intentioned changes to Organization roles could inadvertently grant system-wide access.

## Decision
We decided to implement a completely separate **Platform Identity Layer** that acts as the single source of truth for platform authentication, platform authorization, platform roles, and platform permissions. 

1. **Strict Separation from Organization RBAC**: The Platform Identity module uses its own data models (`PlatformRole`, `PlatformPermission`, `PlatformRolePermission`, `UserPlatformRole`) to remain independent of `Organization`, `Membership`, and `Role` entities.
2. **Dedicated `/api/v1/platform/me` Endpoint**: We implemented a dedicated endpoint to resolve a user's platform identity. It aggregates the user's platform roles and distinct platform permissions, providing a clean JSON response consumed by the frontend platform guards.
3. **True Backend Authorization**: We explicitly forbade mock platform authorization. The `RequirePlatformPermission` dependency enforces access control at the API route level using the user's computed platform permissions, ensuring production-grade security.

## Consequences
- **Security**: Platform-level actions are cryptographically and authoritatively protected by the backend. There is zero reliance on "security by obscurity" or frontend domain-based hiding.
- **Maintainability**: Modifying Organization RBAC will not accidentally affect Platform Administration.
- **Testability**: The distinct separation requires its own dedicated test suite (e.g., `test_platform_identity.py`) to verify platform-specific role assignments and permission evaluations.
- **Overhead**: Requires managing parallel tables (`rbac_platform_roles`, `rbac_platform_permissions`), though they share identical design patterns with their organizational counterparts, minimizing cognitive load for developers.
