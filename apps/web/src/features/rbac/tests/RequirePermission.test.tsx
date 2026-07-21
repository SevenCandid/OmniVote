import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequirePermission } from '../components/RequirePermission';
import * as useRbacHooks from '../hooks/useRbac';

describe('RequirePermission', () => {
  it('shows fallback when permission is denied', () => {
    vi.spyOn(useRbacHooks, 'useMyPermissions').mockReturnValue({
      permissions: [],
      hasPermission: () => false,
      isLoading: false,
    });

    render(
      <RequirePermission
        permissionKey="test.perm"
        organizationId="123"
        fallback={<div data-testid="fallback" />}
      >
        <div data-testid="content" />
      </RequirePermission>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('shows content when permission is granted', () => {
    vi.spyOn(useRbacHooks, 'useMyPermissions').mockReturnValue({
      permissions: ['test.perm'],
      hasPermission: (k) => k === 'test.perm',
      isLoading: false,
    });

    render(
      <RequirePermission
        permissionKey="test.perm"
        organizationId="123"
        fallback={<div data-testid="fallback" />}
      >
        <div data-testid="content" />
      </RequirePermission>
    );

    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});
