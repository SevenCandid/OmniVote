import { Organization, OrganizationCreateInput, OrganizationUpdateInput } from '../schemas/organizationSchema';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchWithConfig(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || 'An error occurred during the API request');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const organizationApi = {
  list: async (skip = 0, limit = 100): Promise<Organization[]> => {
    return fetchWithConfig(`/organizations/?skip=${skip}&limit=${limit}`);
  },

  get: async (id: string): Promise<Organization> => {
    return fetchWithConfig(`/organizations/${id}`);
  },

  create: async (data: OrganizationCreateInput): Promise<Organization> => {
    return fetchWithConfig('/organizations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async ({ id, data }: { id: string; data: OrganizationUpdateInput }): Promise<Organization> => {
    return fetchWithConfig(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithConfig(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },
};
