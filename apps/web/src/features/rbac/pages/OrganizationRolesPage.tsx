import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoles, useCreateRole } from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { Shield } from 'lucide-react';
import { RequirePermission } from '../components/RequirePermission';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { BaseInput } from '../../../components/ui/BaseInput';

export default function OrganizationRolesPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: roles, isLoading, error } = useRoles(organizationId!);
  const createMutation = useCreateRole(organizationId!);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const handleCreate = async () => {
    if (!newRoleName) return;
    try {
      await createMutation.mutateAsync({ name: newRoleName, description: newRoleDesc });
      setIsCreateOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
    } catch (err: any) {
      alert(`Error creating role: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate(`/dashboard/organizations/${organizationId}`)}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; Back to Org
          </button>
          <h1 className="text-2xl font-bold mt-2">Roles</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage organization roles and their permissions.
          </p>
        </div>
        <RequirePermission permissionKey="organization.update" organizationId={organizationId}>
          <BaseButton onClick={() => setIsCreateOpen(true)}>
            + Create Role
          </BaseButton>
        </RequirePermission>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-20 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
          Failed to load roles: {error.message}
        </div>
      )}

      {!isLoading && !error && (!roles || roles.length === 0) && (
        <EmptyState
          icon={Shield}
          title="No roles found"
          description="Create a role to get started with custom access control."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles?.map((role) => (
          <BaseCard 
            key={role.id} 
            className="p-6 cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => navigate(`/dashboard/organizations/${organizationId}/roles/${role.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">{role.name}</h3>
              {role.is_system && (
                <BaseBadge variant="neutral">System</BaseBadge>
              )}
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
              {role.description || 'No description provided.'}
            </p>
          </BaseCard>
        ))}
      </div>

      <BaseDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Role">
        <div className="space-y-4 pt-4">
          <BaseInput
            label="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. Election Manager"
          />
          <BaseInput
            label="Description"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
            placeholder="Role description..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <BaseButton variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</BaseButton>
            <BaseButton 
              onClick={handleCreate} 
              disabled={!newRoleName || createMutation.isPending}
              isLoading={createMutation.isPending}
            >
              Create
            </BaseButton>
          </div>
        </div>
      </BaseDialog>
    </div>
  );
}
