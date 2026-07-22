import {
  Election,
  ElectionCreate,
  ElectionUpdate,
  PaginatedElectionResponse,
} from '../types';
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

export const electionApi = {
  list: async (
    organizationId: string,
    skip = 0,
    limit = 50
  ): Promise<PaginatedElectionResponse> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections?skip=${skip}&limit=${limit}`
    );
  },

  get: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}`
    );
  },

  create: async (
    organizationId: string,
    data: ElectionCreate
  ): Promise<Election> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async ({
    organizationId,
    electionId,
    data,
  }: {
    organizationId: string;
    electionId: string;
    data: ElectionUpdate;
  }): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  },

  delete: async (organizationId: string, electionId: string): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Lifecycle Actions
  publish: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/publish`,
      {
        method: 'POST',
      }
    );
  },

  openVoting: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/open-voting`,
      {
        method: 'POST',
      }
    );
  },

  closeVoting: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/close-voting`,
      {
        method: 'POST',
      }
    );
  },

  archive: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/archive`,
      {
        method: 'POST',
      }
    );
  },

  cancel: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/cancel`,
      {
        method: 'POST',
      }
    );
  },
};
