import {
  Election,
  ElectionCreate,
  ElectionUpdate,
  PaginatedElectionResponse,
} from '../types';
import { useSessionStore } from '../../../stores/sessionStore';

export interface TurnoutDataPoint {
  date: string;
  votes: number;
}

export interface EngagementMetrics {
  total_visitors: number;
  active_sessions: number;
  completed_ballots: number;
  bounce_rate: number;
}

export interface CategoryTurnout {
  category_id: string;
  category_name: string;
  total_votes: number;
}

export interface ElectionAnalyticsResponse {
  election_id: string;
  total_voters: number;
  total_votes_cast: number;
  turnout_percentage: number;
  turnout_over_time: TurnoutDataPoint[];
  category_turnout: CategoryTurnout[];
  engagement: EngagementMetrics;
}

export interface ElectionAuditLogEntry {
  id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata_payload: any | null;
  created_at: string;
}

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

  pauseVoting: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/pause-voting`,
      {
        method: 'POST',
      }
    );
  },

  resumeVoting: async (
    organizationId: string,
    electionId: string
  ): Promise<Election> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/resume-voting`,
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

  getRevenue: async (
    organizationId: string,
    electionId: string
  ): Promise<{ total_revenue: number, total_transactions: number }> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/revenue`,
      {
        method: 'GET',
      }
    );
  },

  getAnalytics: async (
    organizationId: string,
    electionId: string
  ): Promise<ElectionAnalyticsResponse> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/analytics`,
      {
        method: 'GET',
      }
    );
  },

  getAuditLogs: async (
    organizationId: string,
    electionId: string
  ): Promise<ElectionAuditLogEntry[]> => {
    return fetchWithConfig(
      `/organizations/${organizationId}/elections/${electionId}/audit`,
      {
        method: 'GET',
      }
    );
  },
};
