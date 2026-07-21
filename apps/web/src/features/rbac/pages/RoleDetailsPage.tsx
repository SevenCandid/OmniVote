import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useRole,
  useRolePermissions,
  useUpdateRole,
  useReplaceRolePermissions,
  useDeleteRole,
  useMyPermissions,
} from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { ProtectedBadge } from '../components/ProtectedBadge';
import { RoleForm, RoleFormData } from '../components/RoleForm';
import { RequirePermission } from '../components/RequirePermission';
import { toast } from 'react-hot-toast';

export default function RoleDetailsPage() {
  const { id: organizationId, roleId } = useParams<{
    id: string;
    roleId: string;
  }>();
  const navigate = useNavigate();

  const { data: role, isLoading: roleLoading } = useRole(
    organizationId!,
    roleId!
  );
  const { data: rolePermissions, isLoading: permsLoading } = useRolePermissions(
    organizationId!,
    roleId!
  );
  const { hasPermission } = useMyPermissions(organizationId);

  const updateRoleMutation = useUpdateRole(organizationId!);
  const replacePermsMutation = useReplaceRolePermissions(organizationId!);
  const deleteRoleMutation = useDeleteRole(organizationId!);

  const canEdit =
    hasPermission('organization.update') && role && !role.is_system;

  const handleSave = async (data: RoleFormData) => {
    try {
      // Update Name & Description
      await updateRoleMutation.mutateAsync({
        roleId: roleId!,
        data: { name: data.name, description: data.description },
      });

      // Update Permissions (Bulk Replace)
      await replacePermsMutation.mutateAsync({
        roleId: roleId!,
        permissionIds: data.permissionIds,
      });

      toast.success('Role updated successfully');
    } catch (e: any) {
      toast.error(`Error updating role: ${e.message}`);
    }
  };

  const handleDeleteRole = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this role? This cannot be undone.'
      )
    ) {
      try {
        await deleteRoleMutation.mutateAsync(roleId!);
        toast.success('Role deleted successfully');
        navigate(`/dashboard/organizations/${organizationId}/roles`);
      } catch (e: any) {
        toast.error(`Error deleting role: ${e.message}`);
      }
    }
  };

  if (roleLoading || permsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-10 w-1/3 rounded-xl" />
        <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-64 rounded-xl" />
      </div>
    );
  }

  if (!role) {
    return <div className="p-6 text-center text-zinc-500">Role not found</div>;
  }

  const initialFormData: Partial<RoleFormData> = {
    name: role.name,
    description: role.description || '',
    permissionIds: rolePermissions?.map((p) => p.id) || [],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() =>
              navigate(`/dashboard/organizations/${organizationId}/roles`)
            }
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; Back to Roles
          </button>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-bold">{role.name}</h1>
            <ProtectedBadge isSystem={role.is_system} />
          </div>
        </div>

        <RequirePermission
          permissionKey="organization.update"
          organizationId={organizationId}
        >
          {!role.is_system && (
            <div className="flex gap-3">
              <BaseButton
                variant="danger"
                onClick={handleDeleteRole}
                isLoading={deleteRoleMutation.isPending}
              >
                Delete Role
              </BaseButton>
            </div>
          )}
        </RequirePermission>
      </div>

      {role.is_system && (
        <div className="bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50 p-4 rounded-xl text-sm">
          <strong>System Role:</strong> This role is managed by the platform and
          cannot be modified or deleted.
        </div>
      )}

      <BaseCard className="p-6">
        <RoleForm
          initialData={initialFormData}
          onSubmit={handleSave}
          disabled={!canEdit}
          isLoading={
            updateRoleMutation.isPending || replacePermsMutation.isPending
          }
        />
      </BaseCard>
    </div>
  );
}
