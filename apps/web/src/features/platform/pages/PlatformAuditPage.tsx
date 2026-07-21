import { useEffect, useState } from 'react';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { platformDashboardApi } from '../api/platformDashboardApi';
import { PlatformAuditLog } from '../schemas/platformDashboardSchema';
import { FileText, Search } from 'lucide-react';

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
        {loading ? (
          <BaseLoader />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Audit Logs"
            description="No audit events found matching the criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] uppercase bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Event Type</th>
                  <th className="px-6 py-4 font-medium">User ID</th>
                  <th className="px-6 py-4 font-medium">IP Address</th>
                  <th className="px-6 py-4 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-default-light)] dark:divide-[var(--color-border-default-dark)]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[var(--color-surface-muted-light)] dark:hover:bg-[var(--color-surface-muted-dark)] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                      {log.user_id || 'System'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)]">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <div className="text-xs font-mono bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 overflow-x-auto max-w-xs whitespace-pre">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      ) : (
                        <span className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] text-xs italic">
                          None
                        </span>
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
