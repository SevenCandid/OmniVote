import { useState, useEffect } from 'react';
import {
  platformIdentityApi,
  PlatformRole,
} from '../services/platformIdentityApi';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { Shield } from 'lucide-react';

export function PlatformRolesPage() {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await platformIdentityApi.listRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch platform roles', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BaseLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
          Platform Roles
        </h1>
        <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
          View available roles that can be assigned to platform users. Editing
          roles is currently managed via database seeders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <BaseCard key={role.id} className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Shield
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                  {role.name}
                </h3>
              </div>
            </div>
            <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] flex-1">
              {role.description || 'No description provided.'}
            </p>
            <div className="mt-4 pt-4 border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] flex justify-between items-center">
              <span>Role ID:</span>
              <span className="font-mono">{role.id.split('-')[0]}...</span>
            </div>
          </BaseCard>
        ))}
      </div>
    </div>
  );
}
