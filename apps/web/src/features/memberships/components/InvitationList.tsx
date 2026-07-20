import React from 'react';
import { Invitation, InvitationStatus } from '../schemas/invitationSchema';
import { BaseCard } from '../../../components/ui/BaseCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { Mail, Copy, CheckCircle } from 'lucide-react';
import { BaseButton } from '../../../components/ui/BaseButton';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { RevokeInvitationModal } from './RevokeInvitationModal';

interface InvitationListProps {
  invitations: Invitation[] | undefined;
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
  onRevoke?: (invitationId: string) => void;
  isRevoking?: boolean;
}

export function InvitationList({
  invitations,
  isLoading,
  error,
  emptyMessage = 'No invitations found.',
  onRevoke,
  isRevoking,
}: InvitationListProps) {
  const [revokingId, setRevokingId] = React.useState<string | null>(null);

  const handleConfirmRevoke = () => {
    if (revokingId && onRevoke) {
      onRevoke(revokingId);
      setRevokingId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
        Failed to load invitations: {error.message}
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No invitations"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <BaseCard key={invitation.id} className="flex items-center justify-between p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-medium">{invitation.recipient_email}</span>
              <InvitationStatusBadge status={invitation.status} />
            </div>
            <div className="text-sm text-zinc-500">
              Sent: {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : 'N/A'}
              <br />
              Roles: {invitation.initial_roles.join(', ') || 'None'}
            </div>
          </div>
          <div className="flex gap-2">
            {invitation.status === InvitationStatus.PENDING && (
              <CopyLinkButton token={invitation.invitation_token} />
            )}
            {onRevoke && (
              <BaseButton
                variant="danger"
                size="sm"
                onClick={() => setRevokingId(invitation.id)}
              >
                {invitation.status === InvitationStatus.PENDING ? 'Revoke' : 'Delete'}
              </BaseButton>
            )}
          </div>
        </BaseCard>
      ))}

      {onRevoke && (
        <RevokeInvitationModal
          isOpen={!!revokingId}
          onClose={() => setRevokingId(null)}
          onConfirm={handleConfirmRevoke}
          isRevoking={!!isRevoking}
        />
      )}
    </div>
  );
}

function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  switch (status) {
    case InvitationStatus.ACCEPTED:
      return <BaseBadge variant="success">Accepted</BaseBadge>;
    case InvitationStatus.PENDING:
      return <BaseBadge variant="warning">Pending</BaseBadge>;
    case InvitationStatus.EXPIRED:
      return <BaseBadge variant="error">Expired</BaseBadge>;
    case InvitationStatus.DECLINED:
      return <BaseBadge variant="neutral">Declined</BaseBadge>;
    default:
      return <BaseBadge variant="neutral">{status}</BaseBadge>;
  }
}

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <BaseButton
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      title="Copy Invite Link"
      className="flex items-center gap-1.5"
    >
      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Copy Link'}
    </BaseButton>
  );
}
