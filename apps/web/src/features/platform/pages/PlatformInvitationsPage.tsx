import { useState, useEffect } from 'react';
import {
  platformIdentityApi,
  PlatformInvitation,
  PlatformRole,
} from '../services/platformIdentityApi';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Mail, Plus, X, AlertCircle } from 'lucide-react';

export function PlatformInvitationsPage() {
  const [invitations, setInvitations] = useState<PlatformInvitation[]>([]);
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set()
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invData, rolesData] = await Promise.all([
        platformIdentityApi.listInvitations(),
        platformIdentityApi.listRoles(),
      ]);
      setInvitations(invData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || selectedRoleIds.size === 0) {
      setError('Please provide an email and select at least one role.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await platformIdentityApi.createInvitation(
        email,
        Array.from(selectedRoleIds)
      );

      // Reset and close
      setEmail('');
      setSelectedRoleIds(new Set());
      setShowInviteForm(false);

      // Refresh list
      const invData = await platformIdentityApi.listInvitations();
      setInvitations(invData);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await platformIdentityApi.revokeInvitation(id);
      const invData = await platformIdentityApi.listInvitations();
      setInvitations(invData);
    } catch (error) {
      console.error('Failed to revoke invitation', error);
    }
  };

  const toggleRoleSelection = (roleId: string) => {
    const newSelection = new Set(selectedRoleIds);
    if (newSelection.has(roleId)) {
      newSelection.delete(roleId);
    } else {
      newSelection.add(roleId);
    }
    setSelectedRoleIds(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ACCEPTED':
        return 'success';
      case 'EXPIRED':
        return 'neutral';
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
            Platform Invitations
          </h1>
          <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
            Invite users to join the platform administration team.
          </p>
        </div>
        <div className="flex gap-3">
          <BaseButton
            variant="primary"
            onClick={() => setShowInviteForm(true)}
            icon={<Plus size={16} />}
          >
            Create Invitation
          </BaseButton>
        </div>
      </div>

      {showInviteForm && (
        <BaseCard className="border-blue-200 dark:border-blue-900 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mail size={18} className="text-blue-500" /> Invite New Platform
              User
            </h2>
            <button
              onClick={() => setShowInviteForm(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] focus:outline-none focus:border-blue-500"
                placeholder="colleague@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Platform Roles
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={selectedRoleIds.has(role.id)}
                      onChange={() => toggleRoleSelection(role.id)}
                    />
                    <div>
                      <div className="font-semibold text-sm">{role.name}</div>
                      <div className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                        {role.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
              <BaseButton
                variant="secondary"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </BaseButton>
              <BaseButton type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Invitation'}
              </BaseButton>
            </div>
          </form>
        </BaseCard>
      )}

      <BaseCard>
        {invitations.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No Invitations"
            description="You haven't sent any platform invitations yet."
            actionText="Create Invitation"
            onAction={() => setShowInviteForm(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] uppercase bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Intended Roles</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created / Expires</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-default-light)] dark:divide-[var(--color-border-default-dark)]">
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                      {inv.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {inv.roles.map((role) => (
                          <BaseBadge key={role.id} variant="primary" size="sm">
                            {role.name}
                          </BaseBadge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <BaseBadge variant={getStatusColor(inv.status)} size="sm">
                        {inv.status}
                      </BaseBadge>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                      <div>{new Date(inv.created_at).toLocaleDateString()}</div>
                      <div className="text-zinc-400">
                        Exp: {new Date(inv.expires_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'PENDING' && (
                        <BaseButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevoke(inv.id)}
                        >
                          Revoke
                        </BaseButton>
                      )}
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
