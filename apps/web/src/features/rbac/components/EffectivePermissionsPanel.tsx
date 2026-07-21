import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { rbacApi } from '../services/rbacApi';
import { rbacKeys } from '../hooks/useRbac';
import { Role, Permission } from '../schemas/rbacSchema';
import { ChevronDown, ChevronRight, Key } from 'lucide-react';

interface EffectivePermissionsPanelProps {
  organizationId: string;
  assignedRoles: Role[];
}

export function EffectivePermissionsPanel({
  organizationId,
  assignedRoles,
}: EffectivePermissionsPanelProps) {
  // Fetch permissions for each assigned role
  const rolePermissionQueries = useQueries({
    queries: assignedRoles.map((role) => ({
      queryKey: rbacKeys.rolePermissions(organizationId, role.id),
      queryFn: () => rbacApi.listRolePermissions(organizationId, role.id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = rolePermissionQueries.some((q) => q.isLoading);
  const [expandedCategories, setExpandedCategories] = React.useState<
    Record<string, boolean>
  >({});

  const { effectivePermissions, groupedPermissions } = useMemo(() => {
    const allPerms: Record<string, Permission> = {};
    const sources: Record<string, string[]> = {}; // Map permission ID to role names that grant it

    rolePermissionQueries.forEach((q, index) => {
      if (q.data) {
        const roleName = assignedRoles[index].name;
        q.data.forEach((perm) => {
          allPerms[perm.id] = perm;
          if (!sources[perm.id]) sources[perm.id] = [];
          if (!sources[perm.id].includes(roleName))
            sources[perm.id].push(roleName);
        });
      }
    });

    const permsArray = Object.values(allPerms);

    const grouped = permsArray.reduce(
      (acc, perm) => {
        const cat = perm.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );

    return {
      effectivePermissions: allPerms,
      groupedPermissions: grouped,
      sources,
    };
  }, [rolePermissionQueries, assignedRoles]);

  if (isLoading) {
    return (
      <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 h-64 rounded-xl" />
    );
  }

  if (assignedRoles.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl text-zinc-500">
        <Key className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p>No roles assigned. This member has no permissions.</p>
      </div>
    );
  }

  const categories = Object.keys(groupedPermissions).sort();

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50 p-4 rounded-xl text-sm">
        <strong>Effective Permissions</strong> are the combined set of all
        permissions granted by the member's assigned roles.
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {categories.map((category) => {
          const perms = groupedPermissions[category];
          const isExpanded = expandedCategories[category] !== false;

          return (
            <div key={category} className="bg-white dark:bg-[#18181B]">
              <div
                className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer select-none"
                onClick={() =>
                  setExpandedCategories((prev) => ({
                    ...prev,
                    [category]: !isExpanded,
                  }))
                }
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
                <span className="font-semibold text-sm capitalize">
                  {category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {perms.length}
                </span>
              </div>

              {isExpanded && (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 p-1">
                  {perms.map((perm) => (
                    <div key={perm.id} className="p-3">
                      <div className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                        {perm.display_name}
                        <span className="font-mono text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                          {perm.key}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {perm.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
