import { useSessionStore } from '../../../stores/sessionStore';
import { z } from 'zod';

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

export const platformNotificationSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable().optional(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['INFO', 'WARNING', 'ALERT', 'SUCCESS']),
  is_read: z.boolean(),
  created_at: z.string(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const paginatedNotificationSchema = z.object({
  items: z.array(platformNotificationSchema),
  total: z.number(),
  unread_count: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type PlatformNotification = z.infer<typeof platformNotificationSchema>;
export type PaginatedNotificationResponse = z.infer<
  typeof paginatedNotificationSchema
>;

export const platformNotificationsApi = {
  getNotifications: async (
    limit: number = 50,
    skip: number = 0,
    unreadOnly: boolean = false
  ): Promise<PaginatedNotificationResponse> => {
    let url = `/platform/notifications?limit=${limit}&skip=${skip}`;
    if (unreadOnly) {
      url += `&unread_only=true`;
    }
    const data = await fetchWithAuth(url);
    return paginatedNotificationSchema.parse(data);
  },

  markAsRead: async (id: string): Promise<PlatformNotification> => {
    const data = await fetchWithAuth(`/platform/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return platformNotificationSchema.parse(data);
  },
};
