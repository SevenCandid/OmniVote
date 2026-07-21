import { useEffect, useState } from 'react';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BaseAuditTimeline } from '../../../components/ui/BaseAuditTimeline';
import { platformDashboardApi } from '../api/platformDashboardApi';
import { PlatformAuditLog } from '../schemas/platformDashboardSchema';
import { Search } from 'lucide-react';

export function PlatformAuditPage() {
  const [logs, setLogs] = useState<PlatformAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 500);
    return () => clearTimeout(handler);
  }, [filter]);

  useEffect(() => {
    fetchLogs(debouncedFilter);
  }, [debouncedFilter]);

  const fetchLogs = async (eventType?: string) => {
    try {
      setLoading(true);
      const data = await platformDashboardApi.getAuditLogs(50, 0, eventType || undefined);
      setLogs(data.items);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
            Audit Center
          </h1>
          <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
            Review detailed platform security and operational logs.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter by event type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <BaseCard>
        <BaseAuditTimeline
          events={logs.map(log => ({
            id: log.id,
            event_type: log.event_type,
            user_id: log.user_id,
            ip_address: log.ip_address,
            metadata_payload: log.metadata,
            created_at: log.timestamp,
          }))}
          isLoading={loading}
          hasMore={false}
        />
      </BaseCard>
    </div>
  );
}
