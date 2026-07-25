import { useSessionStore } from '../../../stores/sessionStore';
import { 
  ElectionCategory, 
  ElectionCategoryCreate, 
  ElectionCategoryUpdate 
} from '../types';

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

export const electionCategoryApi = {
  /**
   * Get all categories for an election
   */
  getAll: async (organizationId: string, electionId: string): Promise<ElectionCategory[]> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/categories/`);
  },

  /**
   * Get a single category by ID
   */
  getById: async (organizationId: string, electionId: string, categoryId: string): Promise<ElectionCategory> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/categories/${categoryId}`);
  },

  /**
   * Create a new category
   */
  create: async (organizationId: string, electionId: string, data: ElectionCategoryCreate): Promise<ElectionCategory> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/categories/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing category
   */
  update: async (
    organizationId: string,
    electionId: string,
    categoryId: string,
    data: ElectionCategoryUpdate
  ): Promise<ElectionCategory> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update the order of a category
   */
  updateOrder: async (
    organizationId: string,
    electionId: string,
    categoryId: string,
    newOrder: number
  ): Promise<ElectionCategory> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/categories/${categoryId}/order`, {
      method: 'PATCH',
      body: JSON.stringify({ display_order: newOrder }),
    });
  },

  /**
   * Delete a category
   */
  delete: async (organizationId: string, electionId: string, categoryId: string): Promise<void> => {
    return fetchWithConfig(`/organizations/${organizationId}/elections/${electionId}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};
