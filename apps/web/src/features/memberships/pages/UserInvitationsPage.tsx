import React from 'react';
import {
  useUserInvitations,
  useAcceptInvitation,
  useDeclineInvitation,
  useRevokeInvitation,
} from '../hooks/useMemberships';
import { InvitationStatus } from '../schemas/invitationSchema';
import { BaseCard } from '../../../components/ui/BaseCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { Mail, Building2 } from 'lucide-react';
import { BaseButton } from '../../../components/ui/BaseButton';
import { toast } from 'react-hot-toast';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import { useState } from 'react';
import { useSessionStore } from '../../../stores/sessionStore';
import { InvitationList } from '../components/InvitationList';

export default function UserInvitationsPage() {
  const user = useSessionStore((state) => state.user);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { data: invitations, isLoading, error } = useUserInvitations();
  const { mutateAsync: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutateAsync: declineInvitation, isPending: isDeclining } =
    useDeclineInvitation();
  const { mutateAsync: revokeInvitation, isPending: isRevoking } =
    useRevokeInvitation();

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

  const handleRevoke = async (invitationId: string) => {
    try {
      await revokeInvitation(invitationId);
      toast.success('Invitation revoked successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Invitations</h1>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-24 rounded-2xl"
          />
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

  const receivedInvitations =
    invitations?.filter(
      (inv) =>
        inv.recipient_email === user?.email ||
        inv.recipient_user_id === user?.id
    ) || [];

  const sentInvitations =
    invitations?.filter((inv) => inv.invited_by === user?.id) || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Invitations</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your pending organization invitations.
          </p>
        </div>
        <BaseButton onClick={() => setIsInviteOpen(true)}>
          + Invite Member
        </BaseButton>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === 'received'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          onClick={() => setActiveTab('received')}
        >
          Received Invitations
          {activeTab === 'received' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors relative ${
            activeTab === 'sent'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Sent Invitations
          {activeTab === 'sent' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
          )}
        </button>
      </div>

      {activeTab === 'received' ? (
        receivedInvitations.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No received invitations"
            description="You haven't received any organization invitations."
          />
        ) : (
          <div className="space-y-4">
            {receivedInvitations.map((invitation) => (
              <BaseCard
                key={invitation.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {invitation.organization?.name || 'Unknown Organization'}
                    </h3>
                    <div className="text-sm text-zinc-500 mt-1">
                      Status:{' '}
                      <BaseBadge
                        variant={
                          invitation.status === InvitationStatus.PENDING
                            ? 'warning'
                            : invitation.status === InvitationStatus.ACCEPTED
                              ? 'success'
                              : invitation.status === InvitationStatus.DECLINED
                                ? 'neutral'
                                : 'error'
                        }
                      >
                        {invitation.status}
                      </BaseBadge>
                      <br />
                      Roles offered:{' '}
                      {invitation.initial_roles.join(', ') || 'Member'}
                      <br />
                      Sent:{' '}
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {invitation.status === InvitationStatus.PENDING && (
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
                )}
              </BaseCard>
            ))}
          </div>
        )
      ) : (
        <InvitationList
          invitations={sentInvitations}
          isLoading={false}
          error={null}
          emptyMessage="You haven't sent any invitations yet."
          onRevoke={handleRevoke}
          isRevoking={isRevoking}
        />
      )}

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
}
