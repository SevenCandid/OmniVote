import { useMutation } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchPayment<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

export function useInitiatePayment(electionId: string) {
  return useMutation({
    mutationFn: (data: { amount: number; currency: string; provider: string }) => 
      fetchPayment(`/voting/payments/${electionId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}
