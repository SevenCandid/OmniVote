import { Membership } from '../schemas/membershipSchema';
import { Invitation, InvitationDetails, InviteMemberInput } from '../schemas/invitationSchema';
import { useSessionStore } from '../../../stores/sessionStore';

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
        const issues = errorData.error.details.map((d: any) => `${d.field}: ${d.issue}`).join(', ');
        if (issues) {
          errorMessage += ` (${issues})`;
        }
      }
    } else if (errorData?.detail) {
      errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
    }
    
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const membershipApi = {
  getOrganizationMembers: async (organizationId: string): Promise<Membership[]> => {
    return fetchWithConfig(`/organizations/${organizationId}/members`);
  },

  getOrganizationInvitations: async (organizationId: string): Promise<Invitation[]> => {
    return fetchWithConfig(`/organizations/${organizationId}/members/invitations`);
  },

  getUserOrganizations: async (): Promise<Membership[]> => {
    return fetchWithConfig(`/users/me/organizations`);
  },

  getUserInvitations: async (): Promise<Invitation[]> => {
    return fetchWithConfig(`/users/me/invitations`);
  },

  inviteMember: async (organizationId: string, data: InviteMemberInput): Promise<Invitation> => {
    return fetchWithConfig(`/organizations/${organizationId}/members/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getInvitationDetails: async (token: string): Promise<InvitationDetails> => {
    return fetchWithConfig(`/invitations/${token}`);
  },

  acceptInvitation: async (token: string): Promise<Membership> => {
    return fetchWithConfig(`/invitations/${token}/accept`, {
      method: 'POST',
    });
  },

  declineInvitation: async (token: string): Promise<Invitation> => {
    return fetchWithConfig(`/invitations/${token}/decline`, {
      method: 'POST',
    });
  },

  removeMembership: async (organizationId: string, membershipId: string): Promise<void> => {
    return fetchWithConfig(`/memberships/${membershipId}?organization_id=${organizationId}`, {
      method: 'DELETE',
    });
  },
};
