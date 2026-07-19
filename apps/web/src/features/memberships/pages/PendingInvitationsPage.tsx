import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePendingInvitations } from '../hooks/useMemberships';
import { InvitationList } from '../components/InvitationList';
import { useOrganization } from '../../organizations/hooks/useOrganizations';
import { BaseButton } from '../../../components/ui/BaseButton';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import { useState } from 'react';

export default function PendingInvitationsPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: organization } = useOrganization(organizationId!);
  const { data: pendingInvitations, isLoading, error } = usePendingInvitations(organizationId!);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/dashboard/organizations/${organizationId}/members`)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Members
            </button>
          </div>
          <h1 className="text-2xl font-bold mt-2">Pending Invitations</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {organization ? `View outstanding invitations for ${organization.name}` : 'View outstanding invitations'}
          </p>
        </div>
        <div className="flex gap-3">
          <BaseButton onClick={() => setIsInviteOpen(true)}>
            + Invite Member
          </BaseButton>
        </div>
      </div>

      <InvitationList
        invitations={pendingInvitations}
        isLoading={isLoading}
        error={error}
        emptyMessage="No pending invitations."
      />

      {organizationId && (
        <InviteMemberDialog
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          organizationId={organizationId}
        />
      )}
    </div>
  );
}
