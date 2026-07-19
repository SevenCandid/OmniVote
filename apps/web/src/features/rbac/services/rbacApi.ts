import { Role, Permission, RoleCreateInput, RoleUpdateInput, RolePermissionAssign, MembershipRoleAssign } from '../schemas/rbacSchema';
import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
        const issues = errorData.error.details.map((d: any) => `${d.field}: ${d.issue}`).join(', ');
        if (issues) {
          errorMessage += ` (${issues})`;
        }
      }
    } else if (errorData?.detail) {
      errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
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
  createRole: async (organizationId: string, data: RoleCreateInput): Promise<Role> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateRole: async (organizationId: string, roleId: string, data: RoleUpdateInput): Promise<Role> => {
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
  listRolePermissions: async (organizationId: string, roleId: string): Promise<Permission[]> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles/${roleId}/permissions`);
  },
  assignRolePermission: async (organizationId: string, roleId: string, data: RolePermissionAssign): Promise<void> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  removeRolePermission: async (organizationId: string, roleId: string, permissionId: string): Promise<void> => {
    return fetchWithConfig(`/organizations/${organizationId}/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
    });
  },

  // Membership Roles
  listMembershipRoles: async (organizationId: string, membershipId: string): Promise<Role[]> => {
    return fetchWithConfig(`/organizations/${organizationId}/memberships/${membershipId}/roles`);
  },
  assignMembershipRole: async (organizationId: string, membershipId: string, data: MembershipRoleAssign): Promise<void> => {
    return fetchWithConfig(`/organizations/${organizationId}/memberships/${membershipId}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  removeMembershipRole: async (organizationId: string, membershipId: string, roleId: string): Promise<void> => {
    return fetchWithConfig(`/organizations/${organizationId}/memberships/${membershipId}/roles/${roleId}`, {
      method: 'DELETE',
    });
  },
};
