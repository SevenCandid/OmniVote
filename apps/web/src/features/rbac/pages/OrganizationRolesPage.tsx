import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useRoles,
  useCreateRole,
  useReplaceRolePermissions,
} from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Shield } from 'lucide-react';
import { RequirePermission } from '../components/RequirePermission';
import { BaseDialog } from '../../../components/ui/BaseDialog';
import { RoleForm, RoleFormData } from '../components/RoleForm';
import { ProtectedBadge } from '../components/ProtectedBadge';
import { toast } from 'react-hot-toast';

export default function OrganizationRolesPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: roles, isLoading, error } = useRoles(organizationId!);
  const createMutation = useCreateRole(organizationId!);
  const replacePermissionsMutation = useReplaceRolePermissions(organizationId!);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (data: RoleFormData) => {
    try {
      const newRole = await createMutation.mutateAsync({
        name: data.name,
        description: data.description,
      });

      if (data.permissionIds.length > 0) {
        await replacePermissionsMutation.mutateAsync({
          roleId: newRole.id,
          permissionIds: data.permissionIds,
        });
      }

      toast.success('Role created successfully');
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(`Error creating role: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() =>
              navigate(`/dashboard/organizations/${organizationId}`)
            }
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; Back to Org
          </button>
          <h1 className="text-2xl font-bold mt-2">Roles</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage organization roles and their permissions.
          </p>
        </div>
        <RequirePermission
          permissionKey="organization.update"
          organizationId={organizationId}
        >
          <BaseButton onClick={() => setIsCreateOpen(true)}>
            + Create Role
          </BaseButton>
        </RequirePermission>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-20 rounded-2xl"
            />
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
            onClick={() =>
              navigate(
                `/dashboard/organizations/${organizationId}/roles/${role.id}`
              )
            }
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">{role.name}</h3>
              <ProtectedBadge isSystem={role.is_system} />
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
              {role.description || 'No description provided.'}
            </p>
            <div className="text-sm font-medium text-blue-600">
              Manage Role &rarr;
            </div>
          </BaseCard>
        ))}
      </div>

      <BaseDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Role"
        size="lg"
      >
        <div className="pt-4">
          <RoleForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={
              createMutation.isPending || replacePermissionsMutation.isPending
            }
            isCreate={true}
          />
        </div>
      </BaseDialog>
    </div>
  );
}
