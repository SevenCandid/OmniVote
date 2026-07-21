import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { BaseBadge } from '../../../components/ui/BaseBadge';
import {
  platformOrganizationsApi,
  PlatformOrganization,
} from '../services/platformOrganizationsApi';
import { Search, Building, ShieldAlert, ArrowRight } from 'lucide-react';

export function PlatformOrganizationsPage() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<PlatformOrganization[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchOrganizations();
  }, [search, statusFilter]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      // Basic debounce would be good, but we'll fetch direct for simplicity
      const response = await platformOrganizationsApi.list(
        0,
        50,
        search,
        statusFilter
      );
      setOrganizations(response.items);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <BaseBadge variant="success">Active</BaseBadge>;
      case 'suspended':
        return <BaseBadge variant="error">Suspended</BaseBadge>;
      case 'archived':
        return <BaseBadge variant="default">Archived</BaseBadge>;
      default:
        return <BaseBadge variant="default">{status}</BaseBadge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            Manage customer organizations, subscriptions, and platform access.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <BaseInput
            type="search"
            placeholder="Search organizations by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <select
          className="px-3 py-2 bg-[var(--color-surface-default-light)] dark:bg-[var(--color-surface-default-dark)] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-[var(--color-text-default-light)] dark:text-[var(--color-text-default-dark)]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <BaseCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-surface-muted-light)]/50 dark:bg-[var(--color-surface-muted-dark)]/50 text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
              <tr>
                <th className="px-6 py-3 font-semibold rounded-tl-xl">
                  Organization
                </th>
                <th className="px-6 py-3 font-semibold">Verification</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Created</th>
                <th className="px-6 py-3 font-semibold rounded-tr-xl">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default-light)] dark:divide-[var(--color-border-default-dark)]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]"
                  >
                    Loading organizations...
                  </td>
                </tr>
              ) : organizations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Building
                        size={32}
                        className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-2"
                      />
                      <p className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                        No organizations found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-[var(--color-surface-muted-light)]/30 dark:hover:bg-[var(--color-surface-muted-dark)]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text-default-light)] dark:text-[var(--color-text-default-dark)]">
                        {org.name}
                      </div>
                      <div className="text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                        {org.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {org.verification_status === 'verified' ? (
                          <BaseBadge variant="success">Verified</BaseBadge>
                        ) : org.verification_status === 'rejected' ? (
                          <BaseBadge variant="error">Rejected</BaseBadge>
                        ) : (
                          <BaseBadge variant="warning">Unverified</BaseBadge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(org.status)}</td>
                    <td className="px-6 py-4 text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                      {new Date(org.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <BaseButton
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/platform/organizations/${org.id}`)
                        }
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Manage
                      </BaseButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  );
}
