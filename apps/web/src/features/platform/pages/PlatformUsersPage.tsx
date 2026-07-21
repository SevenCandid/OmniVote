import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  platformIdentityApi,
  PlatformUser,
} from '../services/platformIdentityApi';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Shield, Mail, ArrowRight } from 'lucide-react';

export function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await platformIdentityApi.listUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch platform users', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'warning';
      case 'REVOKED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return <BaseLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
            Platform Users
          </h1>
          <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
            Manage administrative access to the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <BaseButton
            variant="primary"
            onClick={() => navigate('/platform/invitations')}
            icon={<Mail size={16} />}
          >
            Invite User
          </BaseButton>
        </div>
      </div>

      <BaseCard>
        {users.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No Platform Users"
            description="You haven't assigned any platform roles yet."
            actionText="Invite User"
            onAction={() => navigate('/platform/invitations')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] uppercase bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Roles</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-default-light)] dark:divide-[var(--color-border-default-dark)]">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/platform/users/${user.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center uppercase shrink-0">
                          {user.first_name?.[0] || user.email[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] text-xs">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <BaseBadge
                              key={role.id}
                              variant="primary"
                              size="sm"
                            >
                              {role.name}
                            </BaseBadge>
                          ))
                        ) : (
                          <span className="text-zinc-500 italic text-xs">
                            No roles
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <BaseBadge
                        variant={getStatusColor(user.status)}
                        size="sm"
                      >
                        {user.status}
                      </BaseBadge>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BaseCard>
    </div>
  );
}
