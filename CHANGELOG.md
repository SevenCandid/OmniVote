# Changelog
All notable changes to the VeroSeven Platform and OmniVote application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v3.3.0] - 2026-08-14

### Added
- **Live Election Indicator**: Both the Admin Dashboard and the Public Results page now display a beautiful animated, radar-pulsing "Live Election in Progress" indicator while an election is active, replacing the previous 403 error or crash states.
- **Admin Live Results Toggle**: New `allow_admin_live_results` configuration field added to the Election creation form. When enabled, admins can see live vote counts on their dashboard while the election is running. This setting is immutable after election creation to preserve integrity.
- **Graceful Hidden-Results API**: The `GET /results` endpoint no longer returns 403 when results are hidden. It now returns a 200 response with `is_hidden: true` and zeroed statistics, enabling the frontend to render a proper state rather than an error.
- **Alembic Auto-Migration on Deploy**: Added `release_command = 'alembic upgrade head'` to `fly.toml` so database migrations now run automatically on every Fly.io deployment.

### Fixed
- **CORS + 500 Error on Results Endpoint**: Fixed `ModuleNotFoundError` caused by incorrect import path (`app.modules.organization.models.membership` → `app.modules.membership.models.membership`), which was crashing the results endpoint and stripping CORS headers.
- **Null Statistics Crash**: Fixed frontend crash (`Cannot read properties of null`) by returning a zeroed `ElectionStatisticsSchema` object instead of `None` when results are hidden.
- **Migration NOT NULL Violation**: Fixed Alembic migration for `allow_admin_live_results` to use `server_default='false'`, enabling safe addition of the column to existing election rows.

### Security
- Admin results visibility is locked at election creation time and cannot be changed after publishing, preventing mid-election configuration tampering.

---

## [v3.2.0] - 2026-07-25

### Added
- Multi-tenant organization management
- Election engine
- Category management
- Candidate management
- Voting session wizard
- Ballot processing
- Public voting architecture
- Paid voting architecture
- Vote wallet
- Results engine
- Event-driven architecture
- Architecture v1.1 documentation

### Changed
- Unified election configuration model
- Improved voting workflows
- Enhanced security architecture

### Security
- Immutable ballots
- Visitor session architecture
- Audit logging
- Replay protection

## [v3.1.0] - 2026-07-22

### Added
- **Election Engine Foundation**: Established the core domain models and lifecycle APIs for universal voting events (Elections, Polls, Awards, Contests).
- **Election Lifecycle Management**: Implemented strict state transitions (Draft -> Configured -> Published -> Voting Open -> Voting Paused -> Closed -> Archived) controlled by centralized edit policies.
- **Election Management UI**: Created React pages for Election Creation, Overview, Editing, and List views with full RBAC integration.
- **Pause/Resume Voting**: Added manual capabilities to temporarily pause active elections and resume them safely.
- **Election Audit & Validation**: Integrated election operations with the platform audit system and schedule validators.
- **Organization Details Layout**: Completed a responsive, persistent sidebar layout for navigating organization-level settings and management screens.
- **Profile & General Settings**: Implemented end-to-end functionality for updating organization profiles (industry, size, description) and general settings (currency, timezone configuration).
- **Organization Branding**: Added a dedicated branding page to customize organization primary colors with an interactive live preview component.
- **Tenant Audit Logging**: Instrumented the `OrganizationService` to emit detailed security and audit events for all organization mutations (updates, branding changes, settings modifications).
- **Audit Logs UI Improvements**: Transformed raw JSON metadata in the audit logs timeline into human-readable, formatted natural language lists.

### Fixed
- **Audit Logs CORS / 500 Error**: Resolved a SQLAlchemy database driver type mismatch (`astext` vs `as_string()`) that was causing a 500 Internal Server Error when querying audit logs.

## [v3.0.0] - 2026-07-21

### Added
- **Platform Analytics & Dashboard**: Centralized dashboard for platform owners to view organization growth, user growth, support metrics, and system health.
- **Verification Center**: Dedicated workflow to approve, reject, or request more information for organizations pending verification.
- **Audit Center**: Aggregated platform-wide audit logs, support logs, and verification history.
- **Platform Notifications**: In-app notification center for platform administrators with future-ready architecture for external providers.
- **Platform Settings & Secret Management**: Secure, encrypted-at-rest configuration management using `SecretManager` (Fernet) for storing SMTP credentials, OAuth keys, and other sensitive third-party provider tokens.
- **Platform User Management**: Invite, activate, and manage roles and permissions for internal platform users.

### Security
- **Secret Encryption at Rest**: Environment-managed encryption keys for storing integration secrets, preventing credential leakage in database dumps.
- **Write-Only UI for Secrets**: The Platform Settings UI never displays decrypted secrets; it only accepts new values and overwrites existing ones securely.

## [v0.2.4-alpha] - 2026-07-21

### Added
- **RBAC Administration APIs**: Fully functional CRUD endpoints for Organization Custom Roles (`/api/v1/organizations/{organization_id}/roles`).
- **Role Assignments API**: Endpoints to manage role assignment to members (`/api/v1/memberships/{membership_id}/roles`) using a secure, bulk-replacement strategy.
- **Permission Assignments API**: Endpoints to atomically manage permissions on custom roles (`/api/v1/organizations/{organization_id}/roles/{role_id}/permissions`).
- **Effective Permissions API**: Endpoints for users to check their own effective permissions (`/api/v1/organizations/{organization_id}/my-permissions`), avoiding N+1 checks on the frontend.
- **RBAC Administration UI**: A comprehensive frontend interface in the Organization Settings to manage Roles, Permissions, and Member Role assignments.
- **Support Session Role Injection**: Platform Admins entering a tenant via Support Sessions temporarily inherit `Platform Support` roles without mutating tenant data.

### Security
- **Privilege Escalation Prevention**: `AuthorizationService` mathematically enforces that users cannot assign roles or permissions they do not themselves possess.
- **Last Owner Protection**: Organizations are prevented from removing the `Owner` role from the last remaining Owner, preventing tenant orphaning.
- **System Role Immutability**: Built-in roles (`Owner`, `Admin`, `Member`) are protected from modification or deletion at the API level.
- **Audit Logging Integration**: All role/permission mutations and intercepted privilege escalations are logged via the `AuditService`.
