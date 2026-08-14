import { Election } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchPublic<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Visitor tokens are handled automatically by HttpOnly cookies, so we must include credentials
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
    ...options, 
    headers,
    credentials: 'include'
  });
  
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

export const publicApi = {
  getElection: (electionId: string) =>
    fetchPublic<Election>(`/public/elections/${electionId}`),
    
  getCandidate: (electionId: string, candidateId: string) =>
    fetchPublic<any>(`/public/elections/${electionId}/candidates/${candidateId}`),
    
  getCategories: (electionId: string) =>
    fetchPublic<any[]>(`/public/elections/${electionId}/categories`),
    
  initVisitorSession: (electionId: string) =>
    fetchPublic<{status: string, visitor_token: string}>(`/public/visitor-session/${electionId}`, {
        method: 'POST'
    })
};
