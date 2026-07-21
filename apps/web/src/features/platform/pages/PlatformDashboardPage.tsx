import {
  ShieldAlert,
  Building2,
  LifeBuoy,
  BadgeCheck,
  Users,
  Activity,
} from 'lucide-react';
import { usePlatformPermissions } from '../hooks/usePlatformPermissions';
import {
  usePlatformStatistics,
  usePlatformActivity,
} from '../hooks/usePlatformDashboard';

export default function PlatformDashboardPage() {
  // We don't need to manually check isPlatformAdmin here since the stats hook does it internally,
  // and the page is protected by PlatformLayout.
  usePlatformPermissions();
  const { data: stats, isLoading: isLoadingStats } = usePlatformStatistics();
  const { data: activity, isLoading: isLoadingActivity } =
    usePlatformActivity(5);

  const metrics = [
    {
      label: 'Total Organizations',
      value: stats?.total_organizations ?? '---',
      icon: Building2,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Verified Organizations',
      value: stats?.verified_organizations ?? '---',
      icon: BadgeCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Pending Verification',
      value: stats?.pending_verification ?? '---',
      icon: ShieldAlert,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'Platform Users',
      value: stats?.platform_users ?? '---',
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Standard Users',
      value: stats?.standard_users ?? '---',
      icon: Users,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      label: 'Active Support Sessions',
      value: stats?.active_support_sessions ?? '---',
      icon: LifeBuoy,
      color: 'text-pink-500',
      bg: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      label: 'Open Support Requests',
      value: stats?.open_support_requests ?? '---',
      icon: LifeBuoy,
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] text-sm mt-1">
          Monitor system health, organizations, and administrative requests.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] shadow-sm flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mb-1">
                  {metric.label}
                </p>
                {isLoadingStats ? (
                  <div className="h-7 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-semibold">{metric.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-[#18181B] rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] shadow-sm overflow-hidden flex flex-col h-96">
          <div className="p-4 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Recent Platform Activity
            </h2>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {isLoadingActivity ? (
              // Skeleton rows
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4 animate-pulse" />
                    <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : activity && activity.length > 0 ? (
              activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] pb-3 last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                    <ShieldAlert size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.event_type}</p>
                    <p className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-0.5">
                      {new Date(item.timestamp).toLocaleString()}{' '}
                      {item.ip_address ? `• IP: ${item.ip_address}` : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-10">
                No recent activity.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] shadow-sm p-4 h-fit">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
              Invite Platform User
            </button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
              Review Pending Orgs
            </button>
            <button className="w-full text-left px-4 py-2 text-sm font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
              Platform Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
