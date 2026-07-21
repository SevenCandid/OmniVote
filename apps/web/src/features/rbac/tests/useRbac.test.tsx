import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRoles } from '../hooks/useRbac';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

vi.mock('../services/rbacApi', () => ({
  rbacApi: {
    listRoles: vi
      .fn()
      .mockResolvedValue([{ id: '1', name: 'Admin', is_system: true }]),
  },
}));

describe('useRbac Hooks', () => {
  it('should fetch roles for an organization', async () => {
    const { result } = renderHook(() => useRoles('org-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe('Admin');
  });
});
