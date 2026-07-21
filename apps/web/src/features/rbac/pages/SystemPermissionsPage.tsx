import React, { useMemo } from 'react';
import { usePermissions } from '../hooks/useRbac';
import { BaseCard } from '../../../components/ui/BaseCard';
import { Shield } from 'lucide-react';
import { Permission } from '../schemas/rbacSchema';

export default function SystemPermissionsPage() {
  const { data: permissions, isLoading, error } = usePermissions();

  const groupedPermissions = useMemo(() => {
    if (!permissions) return {};
    return permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }, [permissions]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-blue-600" />
          System Permissions Catalog
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          A complete catalog of all permissions available within the VeroSeven
          Platform. (Read-only)
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-32 rounded-2xl"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
          Failed to load permissions: {error.message}
        </div>
      )}

      {!isLoading &&
        !error &&
        Object.keys(groupedPermissions).map((category) => (
          <BaseCard key={category} className="overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-semibold text-lg capitalize">
                {category} Permissions
              </h2>
            </div>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {groupedPermissions[category].map((perm) => (
                <li
                  key={perm.id}
                  className="p-4 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <p className="font-semibold">
                    {perm.display_name}{' '}
                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded ml-2">
                      {perm.key}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    {perm.description}
                  </p>
                </li>
              ))}
            </ul>
          </BaseCard>
        ))}
    </div>
  );
}
