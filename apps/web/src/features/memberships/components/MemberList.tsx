import React from 'react';
import { Membership, MembershipStatus } from '../schemas/membershipSchema';
import { BaseCard } from '../../../components/ui/BaseCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { Users } from 'lucide-react';
import { BaseButton } from '../../../components/ui/BaseButton';
import { useNavigate, useParams } from 'react-router-dom';

interface MemberListProps {
  members: Membership[] | undefined;
  isLoading: boolean;
  error: Error | null;
  emptyMessage?: string;
  onRemoveMember?: (membershipId: string) => void;
  isRemoving?: boolean;
}

export function MemberList({
  members,
  isLoading,
  error,
  emptyMessage = 'No members found.',
  onRemoveMember,
  isRemoving,
}: MemberListProps) {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
        Failed to load members: {error.message}
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <BaseCard key={member.id} className="flex items-center justify-between p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-medium">User: {member.user_id}</span>
              <MembershipStatusBadge status={member.status} />
            </div>
            <div className="text-sm text-zinc-500">
              Joined: {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="flex gap-2">
            {member.status !== MembershipStatus.REMOVED && organizationId && (
              <BaseButton
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/dashboard/organizations/${organizationId}/members/${member.id}/roles`)}
              >
                Manage Roles
              </BaseButton>
            )}
            {onRemoveMember && member.status !== MembershipStatus.REMOVED && (
              <BaseButton
                variant="danger"
                size="sm"
                onClick={() => onRemoveMember(member.id)}
                isLoading={isRemoving}
              >
                Remove
              </BaseButton>
            )}
          </div>
        </BaseCard>
      ))}
    </div>
  );
}

function MembershipStatusBadge({ status }: { status: MembershipStatus }) {
  switch (status) {
    case MembershipStatus.ACCEPTED:
      return <BaseBadge variant="success">Accepted</BaseBadge>;
    case MembershipStatus.PENDING:
      return <BaseBadge variant="warning">Pending</BaseBadge>;
    case MembershipStatus.SUSPENDED:
      return <BaseBadge variant="error">Suspended</BaseBadge>;
    case MembershipStatus.REMOVED:
      return <BaseBadge variant="neutral">Removed</BaseBadge>;
    default:
      return <BaseBadge variant="neutral">{status}</BaseBadge>;
  }
}
