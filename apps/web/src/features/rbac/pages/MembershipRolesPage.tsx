import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useRoles,
  useMembershipRoles,
  useAssignMembershipRole,
  useRemoveMembershipRole
} from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { RequirePermission } from '../components/RequirePermission';

export default function MembershipRolesPage() {
  const { id: organizationId, membershipId } = useParams<{ id: string, membershipId: string }>();
  const navigate = useNavigate();

  const { data: orgRoles } = useRoles(organizationId!);
  const { data: memberRoles, isLoading } = useMembershipRoles(organizationId!, membershipId!);

  const assignMutation = useAssignMembershipRole(organizationId!);
  const removeMutation = useRemoveMembershipRole(organizationId!);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const availableRoles = orgRoles?.filter(
    (r) => !memberRoles?.some((mr) => mr.id === r.id)
  );

  const handleAssign = async () => {
    if (!selectedRoleId) return;
    try {
      await assignMutation.mutateAsync({ membershipId: membershipId!, data: { role_id: selectedRoleId } });
      setIsAssignOpen(false);
      setSelectedRoleId('');
    } catch (e: any) {
      alert(`Error assigning role: ${e.message}`);
    }
  };

  const handleRemove = async (roleId: string) => {
    if (window.confirm("Remove this role from the member?")) {
      try {
        await removeMutation.mutateAsync({ membershipId: membershipId!, roleId });
      } catch (e: any) {
        alert(`Error removing role: ${e.message}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate(`/dashboard/organizations/${organizationId}/members`)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; Back to Members
          </button>
          <h1 className="text-2xl font-bold mt-2">Manage Member Roles</h1>
        </div>
        <RequirePermission permissionKey="member.update" organizationId={organizationId}>
          <BaseButton onClick={() => setIsAssignOpen(true)}>
            + Assign Role
          </BaseButton>
        </RequirePermission>
      </div>

      <BaseCard className="overflow-hidden mt-6">
        {isLoading ? (
          <div className="p-6 text-zinc-500">Loading roles...</div>
        ) : !memberRoles || memberRoles.length === 0 ? (
          <div className="p-6 text-zinc-500">No roles assigned to this member.</div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {memberRoles.map((role) => (
              <li key={role.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <div>
                  <p className="font-semibold">{role.name}</p>
                  <p className="text-sm text-zinc-500">{role.description}</p>
                </div>
                <RequirePermission permissionKey="member.update" organizationId={organizationId}>
                  <BaseButton variant="danger" size="sm" onClick={() => handleRemove(role.id)} isLoading={removeMutation.isPending}>
                    Remove
                  </BaseButton>
                </RequirePermission>
              </li>
            ))}
          </ul>
        )}
      </BaseCard>

      <BaseDialog isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Role">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Role</label>
            <select
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            >
              <option value="">-- Choose a role --</option>
              {availableRoles?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.is_system ? '(System)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <BaseButton variant="secondary" onClick={() => setIsAssignOpen(false)}>Cancel</BaseButton>
            <BaseButton 
              onClick={handleAssign} 
              disabled={!selectedRoleId || assignMutation.isPending}
              isLoading={assignMutation.isPending}
            >
              Assign
            </BaseButton>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
