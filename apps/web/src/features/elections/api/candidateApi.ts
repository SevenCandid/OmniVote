import { useSessionStore } from '../../../stores/sessionStore';
import { 
  Candidate, 
  CandidateCreate, 
  CandidateUpdate, 
  CandidateReorderRequest 
} from '../types/candidate';

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

export const candidateApi = {
  createCandidate: async (orgId: string, electionId: string, categoryId: string, data: CandidateCreate): Promise<Candidate> => {
    return fetchWithConfig(`/organizations/${orgId}/elections/${electionId}/categories/${categoryId}/candidates/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCandidates: async (orgId: string, electionId: string, categoryId: string): Promise<Candidate[]> => {
    return fetchWithConfig(`/organizations/${orgId}/elections/${electionId}/categories/${categoryId}/candidates/`);
  },

  getCandidate: async (orgId: string, electionId: string, categoryId: string, candidateId: string): Promise<Candidate> => {
    return fetchWithConfig(`/organizations/${orgId}/elections/${electionId}/categories/${categoryId}/candidates/${candidateId}`);
  },

  updateCandidate: async (orgId: string, electionId: string, categoryId: string, candidateId: string, data: CandidateUpdate): Promise<Candidate> => {
    return fetchWithConfig(`/organizations/${orgId}/elections/${electionId}/categories/${categoryId}/candidates/${candidateId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  reorderCandidate: async (orgId: string, electionId: string, categoryId: string, candidateId: string, data: CandidateReorderRequest): Promise<Candidate> => {
    return fetchWithConfig(`/organizations/${orgId}/elections/${electionId}/categories/${categoryId}/candidates/${candidateId}/reorder`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteCandidate: async (orgId: string, electionId: string, categoryId: string, candidateId: string): Promise<void> => {
    return fetchWithConfig(`/organizations/${orgId}/elections/${electionId}/categories/${categoryId}/candidates/${candidateId}`, {
      method: 'DELETE',
    });
  },
};
