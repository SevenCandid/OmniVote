import React from 'react';
import { useUserInvitations, useAcceptInvitation, useDeclineInvitation } from '../hooks/useMemberships';
import { InvitationStatus } from '../schemas/invitationSchema';
import { BaseCard } from '../../../components/ui/BaseCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { Mail, Building2 } from 'lucide-react';
import { BaseButton } from '../../../components/ui/BaseButton';
import { toast } from 'react-hot-toast';

export default function UserInvitationsPage() {
  const { data: invitations, isLoading, error } = useUserInvitations();
  const { mutateAsync: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutateAsync: declineInvitation, isPending: isDeclining } = useDeclineInvitation();

  const handleAccept = async (token: string) => {
    try {
      await acceptInvitation(token);
      toast.success('Invitation accepted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (token: string) => {
    try {
      await declineInvitation(token);
      toast.success('Invitation declined');
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Invitations</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
          Failed to load invitations: {error.message}
        </div>
      </div>
    );
  }

  const pendingInvitations = invitations?.filter((inv) => inv.status === InvitationStatus.PENDING) || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Invitations</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your pending organization invitations.
        </p>
      </div>

      {pendingInvitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No pending invitations"
          description="You don't have any pending invitations to join organizations."
        />
      ) : (
        <div className="space-y-4">
          {pendingInvitations.map((invitation) => (
            <BaseCard key={invitation.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{invitation.organization?.name || 'Unknown Organization'}</h3>
                  <div className="text-sm text-zinc-500 mt-1">
                    Roles offered: {invitation.initial_roles.join(', ') || 'Member'}
                    <br />
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <BaseButton
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => handleDecline(invitation.invitation_token)}
                  isLoading={isDeclining}
                  disabled={isAccepting}
                >
                  Decline
                </BaseButton>
                <BaseButton
                  className="flex-1 sm:flex-none"
                  onClick={() => handleAccept(invitation.invitation_token)}
                  isLoading={isAccepting}
                  disabled={isDeclining}
                >
                  Accept
                </BaseButton>
              </div>
            </BaseCard>
          ))}
        </div>
      )}
    </div>
  );
}
