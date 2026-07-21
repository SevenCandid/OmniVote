import {
  Role,
  Permission,
  RoleCreateInput,
  RoleUpdateInput,
  RolePermissionAssign,
  MembershipRoleAssign,
} from '../schemas/rbacSchema';
import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchWithConfig(endpoint: string, options: RequestInit = {}) {
  const { accessToken, logout } = useSessionStore.getState();

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    let errorMessage = 'An error occurred during the API request';

    if (errorData?.message) {
      errorMessage = errorData.message;
      if (errorData?.error?.details && Array.isArray(errorData.error.details)) {
        const issues = errorData.error.details
          .map((d: any) => `${d.field}: ${d.issue}`)
          .join(', ');
        if (issues) {
          errorMessage += ` (${issues})`;
        }
      }
    } else if (errorData?.detail) {
      errorMessage =
        typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const rbacApi = {
  // Roles
  listRoles: async (organizationId: string): Promise<Role[]> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles`);
  },
  getRole: async (organizationId: string, roleId: string): Promise<Role> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles/${roleId}`);
  },
  createRole: async (
    organizationId: string,
    data: RoleCreateInput
  ): Promise<Role> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateRole: async (
    organizationId: string,
    roleId: string,
    data: RoleUpdateInput
  ): Promise<Role> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteRole: async (organizationId: string, roleId: string): Promise<void> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  },

  // Permissions (Catalog)
  listPermissions: async (): Promise<Permission[]> => {
    return fetchWithConfig(`/permissions`);
  },
  getPermission: async (permissionId: string): Promise<Permission> => {
    return fetchWithConfig(`/permissions/${permissionId}`);
  },

  // Role Permissions
  listRolePermissions: async (
    organizationId: string,
    roleId: string
  ): Promise<Permission[]> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/roles/${roleId}/permissions`
    );
  },
  assignRolePermission: async (
    organizationId: string,
    roleId: string,
    data: RolePermissionAssign
  ): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/roles/${roleId}/permissions`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  removeRolePermission: async (
    organizationId: string,
    roleId: string,
    permissionId: string
  ): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/roles/${roleId}/permissions/${permissionId}`,
      {
        method: 'DELETE',
      }
    );
  },
  replaceRolePermissions: async (
    organizationId: string,
    roleId: string,
    permissionIds: string[]
  ): Promise<Permission[]> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/roles/${roleId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: permissionIds }),
      }
    );
  },

  // Membership Roles
  listMembershipRoles: async (
    organizationId: string,
    membershipId: string
  ): Promise<Role[]> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/memberships/${membershipId}/roles`
    );
  },
  assignMembershipRole: async (
    organizationId: string,
    membershipId: string,
    data: MembershipRoleAssign
  ): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/memberships/${membershipId}/roles`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
  removeMembershipRole: async (
    organizationId: string,
    membershipId: string,
    roleId: string
  ): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/memberships/${membershipId}/roles/${roleId}`,
      {
        method: 'DELETE',
      }
    );
  },
  replaceMembershipRoles: async (
    organizationId: string,
    membershipId: string,
    roleIds: string[]
  ): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/memberships/${membershipId}/roles`,
      {
        method: 'PUT',
        body: JSON.stringify({ role_ids: roleIds }),
      }
    );
  },
  getEffectivePermissions: async (
    organizationId: string,
    membershipId: string
  ): Promise<{ roles: Role[]; permissions: string[] }> => {
    // The backend doesn't have a direct endpoint for another member's effective permissions.
    // However, we can fetch their roles and then just return the roles (the frontend will handle deduplication if needed).
    // Wait, the backend DOES have `/me/effective-permissions`.
    // Let's just implement a helper in the UI for another member, no API endpoint here since we don't have one on backend.
    throw new Error('Not implemented on backend');
  },
};
