import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useRole, 
  useRolePermissions, 
  usePermissions, 
  useAssignRolePermission, 
  useRemoveRolePermission,
  useDeleteRole
} from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { RequirePermission } from '../components/RequirePermission';

export default function RoleDetailsPage() {
  const { id: organizationId, roleId } = useParams<{ id: string, roleId: string }>();
  const navigate = useNavigate();

  const { data: role, isLoading: roleLoading } = useRole(organizationId!, roleId!);
  const { data: rolePermissions, isLoading: permsLoading } = useRolePermissions(organizationId!, roleId!);
  const { data: allPermissions } = usePermissions();

  const assignPermMutation = useAssignRolePermission(organizationId!);
  const removePermMutation = useRemoveRolePermission(organizationId!);
  const deleteRoleMutation = useDeleteRole(organizationId!);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedPermId, setSelectedPermId] = useState('');

  const availablePermissions = allPermissions?.filter(
    (p) => !rolePermissions?.some((rp) => rp.id === p.id)
  );

  const handleAssign = async () => {
    if (!selectedPermId) return;
    try {
      await assignPermMutation.mutateAsync({ roleId: roleId!, data: { permission_id: selectedPermId } });
      setIsAssignOpen(false);
      setSelectedPermId('');
    } catch (e: any) {
      alert(`Error assigning permission: ${e.message}`);
    }
  };

  const handleRemove = async (permId: string) => {
    if (window.confirm("Remove this permission from the role?")) {
      try {
        await removePermMutation.mutateAsync({ roleId: roleId!, permissionId: permId });
      } catch (e: any) {
        alert(`Error removing permission: ${e.message}`);
      }
    }
  };

  const handleDeleteRole = async () => {
    if (window.confirm("Are you sure you want to delete this role? This cannot be undone.")) {
      try {
        await deleteRoleMutation.mutateAsync(roleId!);
        navigate(`/dashboard/organizations/${organizationId}/roles`);
      } catch (e: any) {
        alert(`Error deleting role: ${e.message}`);
      }
    }
  };

  if (roleLoading) {
    return <div className="p-6">Loading role...</div>;
  }

  if (!role) {
    return <div className="p-6">Role not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate(`/dashboard/organizations/${organizationId}/roles`)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; Back to Roles
          </button>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold">{role.name}</h1>
            {role.is_system && <BaseBadge variant="neutral">System</BaseBadge>}
          </div>
          <p className="text-zinc-500">{role.description}</p>
        </div>
        
        <RequirePermission permissionKey="organization.update" organizationId={organizationId}>
          {!role.is_system && (
            <div className="flex gap-3">
              <BaseButton variant="danger" onClick={handleDeleteRole} isLoading={deleteRoleMutation.isPending}>
                Delete Role
              </BaseButton>
            </div>
          )}
        </RequirePermission>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-bold">Assigned Permissions</h2>
        <RequirePermission permissionKey="organization.update" organizationId={organizationId}>
          {!role.is_system && (
            <BaseButton onClick={() => setIsAssignOpen(true)}>
              + Add Permission
            </BaseButton>
          )}
        </RequirePermission>
      </div>

      <BaseCard className="overflow-hidden">
        {permsLoading ? (
          <div className="p-6 text-zinc-500">Loading permissions...</div>
        ) : !rolePermissions || rolePermissions.length === 0 ? (
          <div className="p-6 text-zinc-500">No permissions assigned.</div>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rolePermissions.map((perm) => (
              <li key={perm.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <div>
                  <p className="font-semibold">{perm.display_name} <span className="text-xs font-mono text-zinc-400 ml-2">{perm.key}</span></p>
                  <p className="text-sm text-zinc-500">{perm.description}</p>
                </div>
                <RequirePermission permissionKey="organization.update" organizationId={organizationId}>
                  {!role.is_system && (
                    <BaseButton variant="danger" size="sm" onClick={() => handleRemove(perm.id)} isLoading={removePermMutation.isPending}>
                      Remove
                    </BaseButton>
                  )}
                </RequirePermission>
              </li>
            ))}
          </ul>
        )}
      </BaseCard>

      <BaseDialog isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Permission">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Permission</label>
            <select
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2"
              value={selectedPermId}
              onChange={(e) => setSelectedPermId(e.target.value)}
            >
              <option value="">-- Choose a permission --</option>
              {availablePermissions?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name} ({p.key})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <BaseButton variant="secondary" onClick={() => setIsAssignOpen(false)}>Cancel</BaseButton>
            <BaseButton 
              onClick={handleAssign} 
              disabled={!selectedPermId || assignPermMutation.isPending}
              isLoading={assignPermMutation.isPending}
            >
              Assign
            </BaseButton>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
