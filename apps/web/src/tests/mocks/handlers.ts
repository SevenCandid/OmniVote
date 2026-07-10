import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock API Health Check Endpoint
  http.get('*/api/v1/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      service: 'omnivote-api',
      database: 'connected',
      redis: 'connected',
    });
  }),

  // Mock User Identity Endpoint (Future)
  http.get('*/api/v1/users/me', () => {
    return HttpResponse.json({
      id: 'mock-user-123',
      email: 'mock.voter@veroseven.com',
      name: 'Mock Voter',
      is_active: true,
    });
  }),

  // Mock Organization Endpoint (Future)
  http.get('*/api/v1/organizations', () => {
    return HttpResponse.json([
      {
        id: 'mock-org-123',
        name: 'VeroSeven Innovations',
        slug: 'veroseven',
      },
    ]);
  }),
];
