import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useRoles,
  useMembershipRoles,
  useReplaceMembershipRoles,
  useMyPermissions,
} from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { RequirePermission } from '../components/RequirePermission';
import { toast } from 'react-hot-toast';
import { EffectivePermissionsPanel } from '../components/EffectivePermissionsPanel';

export default function MembershipRolesPage() {
  const { id: organizationId, membershipId } = useParams<{
    id: string;
    membershipId: string;
  }>();
  const navigate = useNavigate();

  const { data: orgRoles } = useRoles(organizationId!);
  const { data: memberRoles, isLoading } = useMembershipRoles(
    organizationId!,
    membershipId!
  );
  const replaceRolesMutation = useReplaceMembershipRoles(organizationId!);
  const { hasPermission } = useMyPermissions(organizationId);

  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Need to sync local state when API data loads
  useEffect(() => {
    if (memberRoles) {
      setSelectedRoleIds(memberRoles.map((r) => r.id));
    }
  }, [memberRoles]);

  const handleSaveRoles = async () => {
    try {
      await replaceRolesMutation.mutateAsync({
        membershipId: membershipId!,
        roleIds: selectedRoleIds,
      });
      toast.success('Roles updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update roles');
    }
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const canEdit = hasPermission('member.update');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() =>
              navigate(`/dashboard/organizations/${organizationId}/members`)
            }
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            &larr; Back to Members
          </button>
          <h1 className="text-2xl font-bold mt-2">Member Access</h1>
        </div>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          Assigned Roles
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          onClick={() => setActiveTab('permissions')}
        >
          Effective Permissions
        </button>
      </div>

      <BaseCard className="p-6">
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Assign Roles</h3>
                <p className="text-sm text-zinc-500">
                  Select the roles to assign to this member.
                </p>
              </div>
              {canEdit && (
                <BaseButton
                  onClick={handleSaveRoles}
                  isLoading={replaceRolesMutation.isPending}
                  disabled={isLoading || replaceRolesMutation.isPending}
                >
                  Save Changes
                </BaseButton>
              )}
            </div>

            {isLoading ? (
              <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-40 rounded-xl" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orgRoles?.map((role) => {
                  const isSelected = selectedRoleIds.includes(role.id);
                  const isOwnerRole = role.name.toLowerCase() === 'owner';

                  return (
                    <label
                      key={role.id}
                      className={`relative flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      } ${!canEdit || (isOwnerRole && isSelected) ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      <div className="flex items-center h-5 mt-1">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => handleToggleRole(role.id)}
                          disabled={!canEdit || (isOwnerRole && isSelected)}
                        />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {role.name}{' '}
                          {role.is_system && (
                            <span className="text-xs text-zinc-500 ml-2">
                              (System)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-zinc-500 mt-1">
                          {role.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'permissions' && (
          <EffectivePermissionsPanel
            organizationId={organizationId!}
            assignedRoles={
              orgRoles?.filter((r) => selectedRoleIds.includes(r.id)) || []
            }
          />
        )}
      </BaseCard>
    </div>
  );
}
