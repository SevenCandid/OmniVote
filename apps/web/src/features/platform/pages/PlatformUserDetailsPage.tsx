import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  platformIdentityApi,
  PlatformUser,
  PlatformRole,
} from '../services/platformIdentityApi';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { Shield, ArrowLeft, Key, User, Calendar, Activity } from 'lucide-react';

export function PlatformUserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allRoles, setAllRoles] = useState<PlatformRole[]>([]);

  // State for edit mode
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [userData, permsData, rolesData] = await Promise.all([
        platformIdentityApi.getUser(id),
        platformIdentityApi.getEffectivePermissions(id),
        platformIdentityApi.listRoles(),
      ]);
      setUser(userData);
      setPermissions(permsData.permissions);
      setAllRoles(rolesData);
      setSelectedRoleIds(new Set(userData.roles.map((r) => r.id)));
    } catch (error) {
      console.error('Failed to fetch user details', error);
      navigate('/platform/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id || !user) return;
    try {
      setSaving(true);
      const updatedUser = await platformIdentityApi.updateUser(id, {
        status: newStatus,
      });
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update status', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!id || !user) return;
    try {
      setSaving(true);
      const updatedUser = await platformIdentityApi.updateUser(id, {
        roles: Array.from(selectedRoleIds),
      });
      setUser(updatedUser);
      setIsEditingRoles(false);
      // Refresh permissions
      const permsData = await platformIdentityApi.getEffectivePermissions(id);
      setPermissions(permsData.permissions);
    } catch (error) {
      console.error('Failed to update roles', error);
    } finally {
      setSaving(false);
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

  if (loading || !user) {
    return <BaseLoader />;
  }

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

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/platform/users')}
            className="p-2 -ml-2 text-[var(--color-neutral-muted-light)] hover:text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-muted-dark)] dark:hover:text-[var(--color-neutral-primary-dark)] hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                {user.first_name} {user.last_name}
              </h1>
              <BaseBadge variant={getStatusColor(user.status)}>
                {user.status}
              </BaseBadge>
            </div>
            <p className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] flex items-center gap-2 mt-1">
              <User size={14} /> {user.email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {user.status === 'ACTIVE' ? (
            <BaseButton
              variant="danger"
              onClick={() => handleUpdateStatus('SUSPENDED')}
              disabled={saving}
            >
              Suspend Access
            </BaseButton>
          ) : (
            <BaseButton
              variant="success"
              onClick={() => handleUpdateStatus('ACTIVE')}
              disabled={saving}
            >
              Restore Access
            </BaseButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <BaseCard>
            <h2 className="text-sm font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Identity Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mb-1">
                  User ID
                </p>
                <p className="text-sm font-mono text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Platform Joined Date
                </p>
                <p className="text-sm text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mb-1 flex items-center gap-1">
                  <Activity size={12} /> Last Login
                </p>
                <p className="text-sm text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </BaseCard>
        </div>

        {/* Right Column - Roles & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          <BaseCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className="text-purple-500" /> Assigned
                Platform Roles
              </h2>
              {!isEditingRoles ? (
                <BaseButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingRoles(true)}
                >
                  Edit Roles
                </BaseButton>
              ) : (
                <div className="flex gap-2">
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEditingRoles(false);
                      setSelectedRoleIds(new Set(user.roles.map((r) => r.id)));
                    }}
                  >
                    Cancel
                  </BaseButton>
                  <BaseButton
                    variant="primary"
                    size="sm"
                    onClick={handleSaveRoles}
                    disabled={saving}
                  >
                    Save Roles
                  </BaseButton>
                </div>
              )}
            </div>

            {isEditingRoles ? (
              <div className="space-y-3">
                {allRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      checked={selectedRoleIds.has(role.id)}
                      onChange={() => toggleRoleSelection(role.id)}
                    />
                    <div>
                      <div className="font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                        {role.name}
                      </div>
                      <div className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                        {role.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <BaseBadge
                      key={role.id}
                      variant="primary"
                      className="text-sm py-1.5 px-3"
                    >
                      {role.name}
                    </BaseBadge>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] italic">
                    No platform roles assigned.
                  </p>
                )}
              </div>
            )}
          </BaseCard>

          <BaseCard>
            <h2 className="text-sm font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Key size={16} className="text-yellow-500" /> Effective
              Permissions
            </h2>
            <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mb-4">
              These are the calculated permissions based on all assigned
              platform roles. This list is read-only.
            </p>

            {permissions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {permissions.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] text-sm text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] font-mono border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    {perm}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] italic">
                No active permissions.
              </p>
            )}
          </BaseCard>
        </div>
      </div>
    </div>
  );
}
