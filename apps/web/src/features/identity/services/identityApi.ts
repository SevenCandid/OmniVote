import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
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
    // Basic logout on 401 for now. Later we can add refresh token logic.
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

export const identityApi = {
  // Auth
  register: (data: any) =>
    fetchWithAuth('/identity/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: async (data: any) => {
    // Login uses form-data instead of JSON
    const formData = new FormData();
    formData.append('username', data.email);
    formData.append('password', data.password);

    const response = await fetch(`${API_BASE_URL}/identity/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Login failed');
    }

    return response.json();
  },
  logout: () =>
    fetchWithAuth('/identity/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: '' }),
    }),
  verifyEmail: (token: string) =>
    fetchWithAuth('/identity/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  forgotPassword: (email: string) =>
    fetchWithAuth('/identity/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (data: any) =>
    fetchWithAuth('/identity/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Profile (mock endpoints for now since Part 2 didn't implement these, but we'll add them soon or just simulate)
  getProfile: () => fetchWithAuth('/identity/users/me'),
  updateProfile: (data: any) =>
    fetchWithAuth('/identity/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updatePassword: (data: any) =>
    fetchWithAuth('/identity/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
