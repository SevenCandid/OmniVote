import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemberList } from '../components/MemberList';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import UserInvitationsPage from '../pages/UserInvitationsPage';
import { MembershipStatus } from '../schemas/membershipSchema';
import * as membershipHooks from '../hooks/useMemberships';

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('MemberList Component', () => {
  it('displays loading state', () => {
    const { container } = renderWithProviders(<MemberList members={[]} isLoading={true} error={null} />);
    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);
  });

  it('displays empty state', () => {
    renderWithProviders(<MemberList members={[]} isLoading={false} error={null} />);
    expect(screen.getByText('No members')).toBeInTheDocument();
  });

  it('displays error state', () => {
    renderWithProviders(<MemberList members={[]} isLoading={false} error={new Error('Test error')} />);
    expect(screen.getByText('Failed to load members: Test error')).toBeInTheDocument();
  });

  it('displays members', () => {
    const members = [
      { id: '1', user_id: 'user1', organization_id: 'org1', status: MembershipStatus.ACCEPTED, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    ];
    renderWithProviders(<MemberList members={members as any} isLoading={false} error={null} />);
    expect(screen.getByText('User: user1')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('calls onRemoveMember with correct id', () => {
    const onRemove = vi.fn();
    const members = [
      { id: '1', user_id: 'user1', organization_id: 'org1', status: MembershipStatus.ACCEPTED, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
    ];
    renderWithProviders(<MemberList members={members as any} isLoading={false} error={null} onRemoveMember={onRemove} />);
    
    fireEvent.click(screen.getByText('Remove'));
    expect(onRemove).toHaveBeenCalledWith('1');
  });
});

describe('InviteMemberDialog Component', () => {
  it('validates required fields', async () => {
    const { getByText, getByRole } = renderWithProviders(
      <InviteMemberDialog isOpen={true} onClose={() => {}} organizationId="org1" />
    );
    
    fireEvent.click(getByRole('button', { name: /send invitation/i }));
    
    await waitFor(() => {
      expect(getByText('User ID is required')).toBeInTheDocument();
    });
  });

  it('calls invite mutation on valid submit', async () => {
    const mockInvite = vi.fn().mockResolvedValue({});
    vi.spyOn(membershipHooks, 'useInviteMember').mockReturnValue({
      mutateAsync: mockInvite,
      isPending: false,
    } as any);

    const { getByRole, getByPlaceholderText } = renderWithProviders(
      <InviteMemberDialog isOpen={true} onClose={() => {}} organizationId="org1" />
    );
    
    // Use a valid UUID to bypass Zod validation
    fireEvent.change(getByPlaceholderText(/uuid/i), { target: { value: '123e4567-e89b-12d3-a456-426614174000' } });
    fireEvent.click(getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(mockInvite).toHaveBeenCalledWith({
        organizationId: 'org1',
        data: { user_id: '123e4567-e89b-12d3-a456-426614174000' }
      });
    });
  });
});

describe('UserInvitationsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays user pending invitations', () => {
    vi.spyOn(membershipHooks, 'useUserOrganizations').mockReturnValue({
      data: [
        { id: 'invite1', organization_id: 'org1', status: MembershipStatus.PENDING, created_at: '2026-01-01T00:00:00Z' }
      ],
      isLoading: false,
      error: null,
    } as any);
    
    vi.spyOn(membershipHooks, 'useAcceptInvitation').mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.spyOn(membershipHooks, 'useDeclineInvitation').mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);

    renderWithProviders(<UserInvitationsPage />);
    expect(screen.getByText('Organization ID: org1')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });
});
