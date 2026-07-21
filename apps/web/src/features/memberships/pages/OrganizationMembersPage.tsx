import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useOrganizationMembers,
  useRemoveMembership,
} from '../hooks/useMemberships';
import { MemberList } from '../components/MemberList';
import { InviteMemberDialog } from '../components/InviteMemberDialog';
import { BaseButton } from '../../../components/ui/BaseButton';
import { useOrganization } from '../../organizations/hooks/useOrganizations';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { RequirePermission } from '../../rbac/components/RequirePermission';

export default function OrganizationMembersPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: organization } = useOrganization(organizationId!);
  const {
    data: members,
    isLoading,
    error,
  } = useOrganizationMembers(organizationId!);
  const { mutateAsync: removeMembership, isPending: isRemoving } =
    useRemoveMembership();

  const [removingMembershipId, setRemovingMembershipId] = useState<
    string | null
  >(null);

  const handleRemoveMember = (membershipId: string) => {
    setRemovingMembershipId(membershipId);
  };

  const handleConfirmRemove = async () => {
    if (!removingMembershipId) return;
    try {
      await removeMembership({
        organizationId: organizationId!,
        membershipId: removingMembershipId,
      });
      toast.success('Member removed successfully');
      setRemovingMembershipId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
      console.error('Failed to remove member', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate(`/dashboard/organizations/${organizationId}`)
              }
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Org
            </button>
          </div>
          <h1 className="text-2xl font-bold mt-2">Organization Members</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {organization
              ? `Manage members for ${organization.name}`
              : 'Manage organization members'}
          </p>
        </div>
        <div className="flex gap-3">
          <RequirePermission
            permissionKey="member.invite"
            organizationId={organizationId}
          >
            <BaseButton
              variant="secondary"
              onClick={() =>
                navigate(
                  `/dashboard/organizations/${organizationId}/members/invitations`
                )
              }
            >
              View Invitations
            </BaseButton>
          </RequirePermission>
          <RequirePermission
            permissionKey="member.invite"
            organizationId={organizationId}
          >
            <BaseButton onClick={() => setIsInviteOpen(true)}>
              + Invite Member
            </BaseButton>
          </RequirePermission>
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

      <ConfirmDialog
        isOpen={!!removingMembershipId}
        onClose={() => setRemovingMembershipId(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        description="Are you sure you want to remove this member from the organization? This will revoke all their roles and permissions."
        confirmText="Remove"
        variant="danger"
        isConfirming={isRemoving}
      />
    </div>
  );
}
