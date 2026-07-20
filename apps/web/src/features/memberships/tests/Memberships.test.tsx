import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemberList } from '../components/MemberList';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import UserInvitationsPage from '../pages/UserInvitationsPage';
import { MembershipStatus } from '../schemas/membershipSchema';
import { InvitationStatus } from '../schemas/invitationSchema';
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
      { 
        id: '1', 
        userId: 'user1', 
        organizationId: 'org1', 
        status: MembershipStatus.ACCEPTED, 
        created_at: '2026-01-01T00:00:00Z', 
        updated_at: '2026-01-01T00:00:00Z',
        user: { first_name: 'Test', last_name: 'Member', email: 'test@example.com' }
      },
    ];
    renderWithProviders(<MemberList members={members as any} isLoading={false} error={null} />);
    expect(screen.getByText('Test Member')).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });
});

describe('InviteMemberDialog Component', () => {
  it('validates required fields', async () => {
    const { getByText, getByRole } = renderWithProviders(
      <InviteMemberDialog isOpen={true} onClose={() => {}} organizationId="org1" />
    );
    
    fireEvent.click(getByRole('button', { name: /send invitation/i }));
    
    await waitFor(() => {
      expect(getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('calls invite mutation on valid submit', async () => {
    const mockInvite = vi.fn().mockResolvedValue({ invitation_token: 'mock-token' });
    vi.spyOn(membershipHooks, 'useInviteMember').mockReturnValue({
      mutateAsync: mockInvite,
      isPending: false,
    } as any);

    const { getByRole, getByPlaceholderText } = renderWithProviders(
      <InviteMemberDialog isOpen={true} onClose={() => {}} organizationId="org1" />
    );
    
    fireEvent.change(getByPlaceholderText(/recipient's email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(mockInvite).toHaveBeenCalledWith({
        organizationId: 'org1',
        data: { recipient_email: 'test@example.com', initial_roles: undefined }
      });
    });
  });
});

describe('UserInvitationsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays user pending invitations', () => {
    vi.spyOn(membershipHooks, 'useUserInvitations').mockReturnValue({
      data: [
        { 
          id: 'invite1', 
          organization_id: 'org1', 
          recipient_email: 'test@example.com',
          status: InvitationStatus.PENDING, 
          created_at: '2026-01-01T00:00:00Z',
          initial_roles: ['Member'],
          organization: { id: 'org1', name: 'Org 1' }
        }
      ],
      isLoading: false,
      error: null,
    } as any);
    
    vi.spyOn(membershipHooks, 'useAcceptInvitation').mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);
    vi.spyOn(membershipHooks, 'useDeclineInvitation').mockReturnValue({ mutateAsync: vi.fn(), isPending: false } as any);

    renderWithProviders(<UserInvitationsPage />);
    expect(screen.getByText('Org 1')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });
});
