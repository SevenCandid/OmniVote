import { useSessionStore } from '../../../stores/sessionStore';
import { ElectionResult } from '../types';

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
    throw new Error('Authentication expired. Please log in again.');
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

export const electionResultApi = {
  /**
   * Get results for an election
   */
  getResults: async (organizationId: string, electionId: string): Promise<ElectionResult> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/results`);
  },

  /**
   * Export results as CSV
   */
  exportCsv: async (organizationId: string, electionId: string): Promise<Blob> => {
    const { accessToken } = useSessionStore.getState();
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/elections/${electionId}/results/export`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    
    if (!response.ok) {
      throw new Error('Failed to download CSV export');
    }
    
    return response.blob();
  },
  
  /**
   * Export results as Excel
   */
  exportExcel: async (organizationId: string, electionId: string): Promise<Blob> => {
    const { accessToken } = useSessionStore.getState();
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/elections/${electionId}/results/export?format=excel`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    
    if (!response.ok) {
      throw new Error('Failed to download Excel export');
    }
    
    return response.blob();
  },
  
  /**
   * Export results as PDF
   */
  exportPdf: async (organizationId: string, electionId: string): Promise<Blob> => {
    const { accessToken } = useSessionStore.getState();
    const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/elections/${electionId}/results/export?format=pdf`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    
    if (!response.ok) {
      throw new Error('Failed to download PDF export');
    }
    
    return response.blob();
  },
};
