import { Role } from '../../rbac/schemas/rbacSchema';
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

export interface PlatformPermissionsResponse {
  success: boolean;
  data: {
    roles: Role[]; // Assuming platform roles share the same shape or similar
    permissions: string[];
    user_metadata?: any;
  };
}

export const platformApi = {
  /**
   * Fetches the platform roles and permissions for the currently authenticated user.
   * If the user is not a platform administrator, this should return a 403 or 404.
   */
  getMyPlatformPermissions: async (): Promise<PlatformPermissionsResponse> => {
    const data = await fetchWithAuth('/platform/me');
    // Wrap it in a `{ data: ... }` response so usePlatformPermissions logic works.
    // wait, the backend endpoint GET /api/v1/platform/me returns the data directly as a dictionary
    return { success: true, data };
  },
};
