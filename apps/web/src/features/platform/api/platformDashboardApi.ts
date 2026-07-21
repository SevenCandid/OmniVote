import { useSessionStore } from '../../../stores/sessionStore';
import {
  PlatformStatistics,
  PlatformActivityLog,
  platformStatisticsSchema,
  platformActivityLogSchema,
  PaginatedAuditResponse,
  paginatedAuditSchema,
} from '../schemas/platformDashboardSchema';
import { z } from 'zod';

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
export const platformDashboardApi = {
  getStatistics: async (): Promise<PlatformStatistics> => {
    const data = await fetchWithAuth('/platform/dashboard/statistics');
    return platformStatisticsSchema.parse(data);
  },

  getActivity: async (limit: number = 5): Promise<PlatformActivityLog[]> => {
    const data = await fetchWithAuth(
      `/platform/dashboard/activity?limit=${limit}`
    );
    return z.array(platformActivityLogSchema).parse(data);
  },

  getAuditLogs: async (limit: number = 50, skip: number = 0, eventType?: string): Promise<PaginatedAuditResponse> => {
    let url = `/platform/dashboard/audit?limit=${limit}&skip=${skip}`;
    if (eventType) {
      url += `&event_type=${encodeURIComponent(eventType)}`;
    }
    const data = await fetchWithAuth(url);
    return paginatedAuditSchema.parse(data);
  },
};
