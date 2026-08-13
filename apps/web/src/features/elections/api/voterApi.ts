import { EligibleVoter, EligibleVoterCreate, PaginatedVoterResponse } from '../types/voter';
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
    } else if (errorData?.detail) {
      errorMessage =
        typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
    }

    // Custom Error structure
    const error: any = new Error(errorMessage);
    error.response = { data: errorData };
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const voterApi = {
  list: async (
    organizationId: string,
    electionId: string,
    skip = 0,
    limit = 50
  ): Promise<PaginatedVoterResponse> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/voters?skip=${skip}&limit=${limit}`
    );
  },

  create: async (
    organizationId: string,
    electionId: string,
    data: EligibleVoterCreate
  ): Promise<EligibleVoter> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/voters`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  bulkCreate: async (
    organizationId: string,
    electionId: string,
    data: EligibleVoterCreate[]
  ): Promise<any> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/voters/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  delete: async (
    organizationId: string,
    electionId: string,
    voterId: string
  ): Promise<void> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/voters/${voterId}`,
      {
        method: 'DELETE',
      }
    );
  },
};
