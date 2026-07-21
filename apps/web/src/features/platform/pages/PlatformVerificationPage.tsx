import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  platformOrganizationsApi,
  PlatformOrganization,
} from '../services/platformOrganizationsApi';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ShieldCheck, Check, X, FileQuestion, ArrowRight } from 'lucide-react';

export function PlatformVerificationPage() {
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingOrganizations();
  }, []);

  const fetchPendingOrganizations = async () => {
    try {
      setLoading(true);
      // Fetch only pending_verification orgs
      const data = await platformOrganizationsApi.list(
        0,
        100,
        undefined,
        undefined,
        'pending_verification'
      );
      setOrganizations(data.items);
    } catch (error) {
      console.error('Failed to fetch pending organizations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (
    orgId: string,
    action: 'verified' | 'rejected' | 'more_info_requested',
    reason?: string
  ) => {
    try {
      setActionLoading(orgId);
      await platformOrganizationsApi.updateVerificationStatus(
        orgId,
        action,
        reason
      );
      // Remove the processed org from the list
      setOrganizations((prev) => prev.filter((org) => org.id !== orgId));
    } catch (error) {
      console.error(`Failed to update verification status to ${action}`, error);
    } finally {
      setActionLoading(null);
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
            Verification Center
          </h1>
          <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
            Review and approve organizations requesting platform access.
          </p>
        </div>
      </div>

      <BaseCard>
        {organizations.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="All Caught Up!"
            description="There are no organizations pending verification at this time."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] uppercase bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Organization</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-default-light)] dark:divide-[var(--color-border-default-dark)]">
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] transition-colors group cursor-pointer"
                    onClick={(e) => {
                      // Prevent navigating if clicking an action button
                      if ((e.target as HTMLElement).closest('.actions-cell'))
                        return;
                      navigate(`/platform/organizations/${org.id}`);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center uppercase shrink-0">
                          {org.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                            {org.name}
                          </div>
                          <div className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] text-xs">
                            {org.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                        {org.contact_email || org.owner_email || 'No email provided'}
                      </div>
                      <div className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] text-xs">
                        {org.country || 'Unknown location'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] whitespace-nowrap">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right actions-cell">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BaseButton
                          variant="success"
                          size="sm"
                          icon={<Check size={14} />}
                          disabled={actionLoading === org.id}
                          onClick={() => handleVerifyAction(org.id, 'verified')}
                        >
                          Approve
                        </BaseButton>
                        <BaseButton
                          variant="danger"
                          size="sm"
                          icon={<X size={14} />}
                          disabled={actionLoading === org.id}
                          onClick={() => handleVerifyAction(org.id, 'rejected')}
                        >
                          Reject
                        </BaseButton>
                        <BaseButton
                          variant="secondary"
                          size="sm"
                          icon={<FileQuestion size={14} />}
                          disabled={actionLoading === org.id}
                          onClick={() =>
                            handleVerifyAction(org.id, 'more_info_requested', 'Additional documents required.')
                          }
                        >
                          Request Info
                        </BaseButton>
                      </div>
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
