import { 
  StartSessionRequest, 
  VotingSession, 
  DraftSelectionUpdate, 
  SubmitBallotResponse 
} from '../types/voting';
import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchWithConfig<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { accessToken } = useSessionStore.getState();
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = 'An error occurred';
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.detail || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  return response.json();
}

export const votingApi = {
  startSession: (organizationId: string, electionId: string, data: StartSessionRequest) =>
    fetchWithConfig<VotingSession>(`/organizations/${organizationId}/elections/${electionId}/voting/session`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSession: (organizationId: string, electionId: string, sessionId: string) =>
    fetchWithConfig<VotingSession>(`/organizations/${organizationId}/elections/${electionId}/voting/session/${sessionId}`),

  saveDraft: (organizationId: string, electionId: string, sessionId: string, data: DraftSelectionUpdate) =>
    fetchWithConfig<VotingSession>(`/organizations/${organizationId}/elections/${electionId}/voting/session/${sessionId}/draft`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  submitBallot: (organizationId: string, electionId: string, sessionId: string) =>
    fetchWithConfig<SubmitBallotResponse>(`/organizations/${organizationId}/elections/${electionId}/voting/session/${sessionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};
