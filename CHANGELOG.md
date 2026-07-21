# Changelog
All notable changes to the VeroSeven Platform and OmniVote application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
