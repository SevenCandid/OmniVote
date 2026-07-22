import { useEffect, useState } from 'react';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { platformDashboardApi } from '../api/platformDashboardApi';
import { PlatformStatistics } from '../schemas/platformDashboardSchema';
import {
  TrendingUp,
  Building2,
  Users,
  LifeBuoy,
  BadgeCheck,
  Vote,
  Activity,
  Server,
} from 'lucide-react';

export function PlatformAnalyticsPage() {
  const [stats, setStats] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await platformDashboardApi.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch platform stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <BaseLoader />;
  }

  const statCards = [
    {
      title: 'Total Organizations',
      value: stats.total_organizations,
      icon: Building2,
      trend: stats.org_growth_percentage,
      trendLabel: 'vs last 30 days',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Platform Users',
      value: stats.platform_users,
      icon: Users,
      trend: stats.user_growth_percentage,
      trendLabel: 'vs last 30 days',
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      title: 'Standard Users',
      value: stats.standard_users,
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Support Sessions',
      value: stats.active_support_sessions,
      icon: LifeBuoy,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Open Support Requests',
      value: stats.open_support_requests,
      icon: LifeBuoy,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Pending Verifications',
      value: stats.pending_verification,
      icon: BadgeCheck,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Total Elections',
      value: stats.total_elections,
      icon: Vote,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Active Elections',
      value: stats.active_elections,
      icon: Activity,
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
          Platform Analytics
        </h1>
        <p className="text-sm text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
          Comprehensive overview of platform growth, support, and engagement
          metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <BaseCard key={idx} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon size={20} className={card.color} />
                </div>
                {card.trend !== undefined && (
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    {card.trend}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] text-sm font-medium">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] mt-1">
                  {card.value.toLocaleString()}
                </p>
                {card.trendLabel && (
                  <p className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] mt-1">
                    {card.trendLabel}
                  </p>
                )}
              </div>
            </BaseCard>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] mb-4">
          System Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.system_health || {}).map(([key, value]) => (
            <BaseCard key={key} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Server
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--color-neutral-muted-light)] dark:text-[var(--color-neutral-muted-dark)] uppercase tracking-wider font-semibold truncate">
                  {key.replace('_', ' ')}
                </p>
                <p className="text-sm font-medium text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)] truncate mt-0.5 capitalize">
                  {String(value)}
                </p>
              </div>
            </BaseCard>
          ))}
        </div>
      </div>
    </div>
  );
}
