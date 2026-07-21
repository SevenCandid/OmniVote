import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.detail || 'An error occurred'
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export interface PlatformRole {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  status: string;
  roles: PlatformRole[];
  created_at: string;
  last_login_at?: string;
}

export interface PlatformInvitation {
  id: string;
  email: string;
  status: string;
  roles: PlatformRole[];
  inviter_id: string;
  expires_at: string;
  created_at: string;
}

export const platformIdentityApi = {
  // Roles
  listRoles: async (): Promise<PlatformRole[]> => {
    return fetchWithAuth('/platform/roles');
  },

  // Users
  listUsers: async (): Promise<PlatformUser[]> => {
    return fetchWithAuth('/platform/users');
  },

  getUser: async (userId: string): Promise<PlatformUser> => {
    return fetchWithAuth(`/platform/users/${userId}`);
  },

  updateUser: async (
    userId: string,
    data: { status?: string; roles?: string[] }
  ): Promise<PlatformUser> => {
    return fetchWithAuth(`/platform/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getEffectivePermissions: async (
    userId: string
  ): Promise<{ permissions: string[] }> => {
    return fetchWithAuth(`/platform/users/${userId}/permissions`);
  },

  // Invitations
  listInvitations: async (): Promise<PlatformInvitation[]> => {
    return fetchWithAuth('/platform/invitations');
  },

  createInvitation: async (
    email: string,
    roles: string[]
  ): Promise<PlatformInvitation> => {
    return fetchWithAuth('/platform/invitations', {
      method: 'POST',
      body: JSON.stringify({ email, roles }),
    });
  },

  revokeInvitation: async (
    invitationId: string
  ): Promise<PlatformInvitation> => {
    return fetchWithAuth(`/platform/invitations/${invitationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'REVOKED' }),
    });
  },
};
