# RBAC Administration UI

This module provides the frontend administration experience for the VeroSeven Role-Based Access Control (RBAC) platform capability.

## Overview

The RBAC UI allows organization administrators to:
- View the catalog of available permissions.
- Create and manage custom roles.
- Assign permissions to roles.
- Assign roles to organization members.

## Components

- **`RequirePermission`**: A context/wrapper component that conditionally renders its children based on whether the current user's membership holds the required permission. It integrates with the backend by checking effective permissions.

## Pages

- **`OrganizationRolesPage`**: List of custom and system roles for a given organization.
- **`RoleDetailsPage`**: View role metadata and manage the assigned permissions for that role.
- **`MembershipRolesPage`**: Manage the roles assigned to a specific member.
- **`SystemPermissionsPage`**: A read-only catalog of all system permissions grouped by category.

## Hooks & State Management

All state and data fetching are powered by React Query (`useRbac.ts`) to easily cache, invalidate, and synchronize with the authoritative backend engine.

- `useMyPermissions(organizationId)`: Resolves the effective permissions for the current user in real-time by aggregating their membership role assignments. Used strictly for UX enhancements (hiding buttons/links) while the backend remains the strict enforcer.
