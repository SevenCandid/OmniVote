import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '../../../stores/sessionStore';
import {
  SupportRequest,
  SupportSession,
  SupportRequestCreate,
  EmergencySessionCreate,
} from '../schemas/supportSchema';

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

export const supportKeys = {
  all: ['support'] as const,
  requests: (orgId?: string) =>
    orgId ? [...supportKeys.all, 'requests', orgId] : [...supportKeys.all, 'requests'],
  sessions: () => [...supportKeys.all, 'sessions'],
};

// --- Customer Hooks ---

export function useOrgSupportRequests(organizationId: string) {
  return useQuery({
    queryKey: supportKeys.requests(organizationId),
    queryFn: async (): Promise<SupportRequest[]> => {
      return fetchWithAuth(`/organizations/${organizationId}/support/requests`);
    },
    enabled: !!organizationId,
  });
}

export function useOrgSupportSessions(organizationId: string) {
  return useQuery({
    queryKey: [...supportKeys.sessions(), organizationId],
    queryFn: async (): Promise<SupportSession[]> => {
      return fetchWithAuth(`/organizations/${organizationId}/support/sessions`);
    },
    enabled: !!organizationId,
  });
}

export function useCreateSupportRequest(organizationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SupportRequestCreate): Promise<SupportRequest> => {
      return fetchWithAuth(`/organizations/${organizationId}/support/requests`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: supportKeys.requests(organizationId),
      });
    },
  });
}

// --- Platform Admin Hooks ---

export function useAllSupportRequests() {
  return useQuery({
    queryKey: supportKeys.requests(),
    queryFn: async (): Promise<SupportRequest[]> => {
      return fetchWithAuth('/support/requests');
    },
  });
}

export function useAllSupportSessions() {
  return useQuery({
    queryKey: supportKeys.sessions(),
    queryFn: async (): Promise<SupportSession[]> => {
      return fetchWithAuth('/support/sessions');
    },
  });
}

export function useAcceptSupportRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      durationMinutes,
    }: {
      requestId: string;
      durationMinutes: number;
    }): Promise<SupportSession> => {
      return fetchWithAuth(
        `/support/requests/${requestId}/accept?duration_minutes=${durationMinutes}`,
        { method: 'POST' }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.requests() });
      queryClient.invalidateQueries({ queryKey: supportKeys.sessions() });
    },
  });
}

export function useRejectSupportRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string): Promise<SupportRequest> => {
      return fetchWithAuth(`/support/requests/${requestId}/reject`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.requests() });
    },
  });
}

export function useStartEmergencySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmergencySessionCreate): Promise<SupportSession> => {
      return fetchWithAuth('/support/emergency-sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.sessions() });
    },
  });
}

export function useTerminateSupportSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string): Promise<SupportSession> => {
      return fetchWithAuth(`/support/sessions/${sessionId}/terminate`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.sessions() });
    },
  });
}
