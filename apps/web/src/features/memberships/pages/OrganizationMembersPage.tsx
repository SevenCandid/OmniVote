import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrganizationMembers, useRemoveMembership } from '../hooks/useMemberships';
import { MemberList } from '../components/MemberList';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import { BaseButton } from '../../../components/ui/BaseButton';
import { useOrganization } from '../../organizations/hooks/useOrganizations';

export default function OrganizationMembersPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: organization } = useOrganization(organizationId!);
  const { data: members, isLoading, error } = useOrganizationMembers(organizationId!);
  const { mutateAsync: removeMembership, isPending: isRemoving } = useRemoveMembership();

  const handleRemoveMember = async (membershipId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await removeMembership({ organizationId: organizationId!, membershipId });
      } catch (err) {
        console.error('Failed to remove member', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/dashboard/organizations/${organizationId}`)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Org
            </button>
          </div>
          <h1 className="text-2xl font-bold mt-2">Organization Members</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {organization ? `Manage members for ${organization.name}` : 'Manage organization members'}
          </p>
        </div>
        <div className="flex gap-3">
          <BaseButton variant="secondary" onClick={() => navigate(`/dashboard/organizations/${organizationId}/members/invitations`)}>
            View Invitations
          </BaseButton>
          <BaseButton onClick={() => setIsInviteOpen(true)}>
            + Invite Member
          </BaseButton>
        </div>
      </div>

      <MemberList
        members={members}
        isLoading={isLoading}
        error={error}
        emptyMessage="Your organization has no members yet."
        onRemoveMember={handleRemoveMember}
        isRemoving={isRemoving}
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
