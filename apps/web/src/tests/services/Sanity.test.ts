import { describe, it, expect } from 'vitest';

describe('MSW Services Integration Test', () => {
  it('intercepts /api/v1/health successfully using MSW', async () => {
    const res = await fetch('/api/v1/health');
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      status: 'healthy',
      service: 'omnivote-api',
      database: 'connected',
      redis: 'connected',
    });
  });
});
