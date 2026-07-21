import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

export interface PlatformSettingsResponse {
  id: string;
  platform_name: string;
  maintenance_mode: boolean;
  allow_public_registration: boolean;
  branding: Record<string, any>;
  theme_configuration: Record<string, any>;
  feature_toggles: Record<string, any>;
  public_urls: Record<string, any>;
  
  smtp_credentials_configured: boolean;
  email_provider_api_keys_configured: boolean;
  sms_provider_api_keys_configured: boolean;
  storage_credentials_configured: boolean;
  oauth_client_secrets_configured: boolean;
  third_party_service_tokens_configured: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface PlatformSettingsUpdate {
  platform_name?: string;
  maintenance_mode?: boolean;
  allow_public_registration?: boolean;
  branding?: Record<string, any>;
  theme_configuration?: Record<string, any>;
  feature_toggles?: Record<string, any>;
  public_urls?: Record<string, any>;
  
  // Sensitive configuration (Write-only)
  smtp_credentials?: Record<string, any>;
  email_provider_api_keys?: Record<string, any>;
  sms_provider_api_keys?: Record<string, any>;
  storage_credentials?: Record<string, any>;
  oauth_client_secrets?: Record<string, any>;
  third_party_service_tokens?: Record<string, any>;
}

export const platformSettingsApi = {
  getSettings: async (): Promise<PlatformSettingsResponse> => {
    return fetchWithAuth('/platform/settings');
  },
  
  updateSettings: async (data: PlatformSettingsUpdate): Promise<PlatformSettingsResponse> => {
    return fetchWithAuth('/platform/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};
