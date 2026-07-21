import { useSessionStore } from '../../../stores/sessionStore';
import { Organization } from '../../organizations/schemas/organizationSchema';

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

export interface PlatformOrganization extends Organization {
  owner_email?: string;
  member_count?: number;
  created_at: string;
}

export interface PlatformOrganizationListResponse {
  items: PlatformOrganization[];
  total: number;
  skip: number;
  limit: number;
}

export const platformOrganizationsApi = {
  list: async (
    skip = 0,
    limit = 100,
    search?: string,
    status?: string,
    verificationStatus?: string
  ): Promise<PlatformOrganizationListResponse> => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (verificationStatus)
      params.append('verification_status', verificationStatus);

    return fetchWithAuth(`/platform/organizations/?${params.toString()}`);
  },

  get: async (id: string): Promise<PlatformOrganization> => {
    return fetchWithAuth(`/platform/organizations/${id}`);
  },

  updateStatus: async (
    id: string,
    status: string,
    reason?: string
  ): Promise<PlatformOrganization> => {
    return fetchWithAuth(`/platform/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  updateVerificationStatus: async (
    id: string,
    verificationStatus: string,
    reason?: string
  ): Promise<PlatformOrganization> => {
    return fetchWithAuth(`/platform/organizations/${id}/verification-status`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_status: verificationStatus, reason }),
    });
  },

  getAuditHistory: async (id: string, limit = 50): Promise<any[]> => {
    return fetchWithAuth(`/platform/organizations/${id}/audit?limit=${limit}`);
  },
};
