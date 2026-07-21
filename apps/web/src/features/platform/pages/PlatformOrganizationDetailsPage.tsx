import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import {
  platformOrganizationsApi,
  PlatformOrganization,
} from '../services/platformOrganizationsApi';
import {
  ArrowLeft,
  ShieldAlert,
  Building,
  Users,
  Activity,
  Clock,
} from 'lucide-react';

export function PlatformOrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<PlatformOrganization | null>(
    null
  );
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (orgId: string) => {
    setIsLoading(true);
    try {
      const [orgRes, auditRes] = await Promise.all([
        platformOrganizationsApi.get(orgId),
        platformOrganizationsApi.getAuditHistory(orgId),
      ]);
      setOrganization(orgRes);
      setAuditLogs(auditRes);
    } catch (error) {
      console.error('Failed to fetch organization details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!organization) return;
    const newStatus = organization.status === 'active' ? 'suspended' : 'active';
    const reason = window.prompt(
      `Please enter a reason to ${newStatus} this organization:`
    );

    if (reason === null) return; // Cancelled

    setIsUpdating(true);
    try {
      const updatedOrg = await platformOrganizationsApi.updateStatus(
        organization.id,
        newStatus,
        reason
      );
      setOrganization(updatedOrg);
      // Refresh audit logs
      const updatedLogs = await platformOrganizationsApi.getAuditHistory(
        organization.id
      );
      setAuditLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update organization status.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">Loading organization details...</div>
    );
  }

  if (!organization) {
    return <div className="p-8 text-center">Organization not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <BaseButton
          variant="ghost"
          size="icon"
          onClick={() => navigate('/platform/organizations')}
        >
          <ArrowLeft size={20} />
        </BaseButton>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{organization.name}</h1>
            {organization.status === 'active' ? (
              <BaseBadge variant="success">Active</BaseBadge>
            ) : (
              <BaseBadge variant="error">{organization.status}</BaseBadge>
            )}
            {organization.verification_status === 'verified' && (
              <BaseBadge variant="success">Verified</BaseBadge>
            )}
          </div>
          <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            {organization.slug}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <BaseButton
            variant={organization.status === 'active' ? 'danger' : 'primary'}
            disabled={isUpdating}
            onClick={handleStatusToggle}
            leftIcon={<ShieldAlert size={16} />}
          >
            {organization.status === 'active'
              ? 'Suspend Organization'
              : 'Reactivate Organization'}
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <BaseCard className="p-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-default-light)] dark:text-[var(--color-text-default-dark)]">
              <Building size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="block text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-1">
                  Legal Name
                </span>
                <span className="font-medium">
                  {organization.legal_name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-1">
                  Created At
                </span>
                <span className="font-medium">
                  {new Date(organization.created_at).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>
              <div>
                <span className="block text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-1">
                  Website
                </span>
                <span className="font-medium">
                  {organization.website || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-1">
                  Country
                </span>
                <span className="font-medium">
                  {organization.country || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-1">
                  Primary Owner
                </span>
                <span className="font-medium">
                  {organization.owner_email || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="block text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-1">
                  Subscription
                </span>
                <span className="font-medium capitalize">
                  {organization.subscription?.current_plan || 'Free'}
                </span>
              </div>
            </div>
          </BaseCard>

          <BaseCard className="p-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-default-light)] dark:text-[var(--color-text-default-dark)]">
              <Activity size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Audit History</h2>
            </div>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                No recent audit logs found for this organization.
              </p>
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-4 p-3 bg-[var(--color-surface-muted-light)]/30 dark:bg-[var(--color-surface-muted-dark)]/30 rounded-lg border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]"
                  >
                    <Clock
                      size={16}
                      className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] shrink-0 mt-0.5"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{log.event_type}</p>
                      <p className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] text-xs mt-1">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}{' '}
                        • User ID: {log.user_id || 'System'}
                      </p>
                      {log.metadata && log.metadata.reason && (
                        <p className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] italic mt-1 text-xs">
                          Reason: {log.metadata.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BaseCard>
        </div>

        <div className="space-y-6">
          <BaseCard className="p-6">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-default-light)] dark:text-[var(--color-text-default-dark)]">
              <Users size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Statistics</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
                <span className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] text-sm">
                  Active Members
                </span>
                <span className="font-bold text-lg">
                  {organization.member_count}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] text-sm">
                  Total Elections
                </span>
                <span
                  className="font-bold text-lg opacity-50"
                  title="Not available in this view"
                >
                  --
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  );
}
