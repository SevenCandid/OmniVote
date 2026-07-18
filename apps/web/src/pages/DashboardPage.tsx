import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Award,
  Plus,
  Upload,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { BaseCard } from '../components/ui/BaseCard';
import { BaseBadge } from '../components/ui/BaseBadge';
import { BaseButton } from '../components/ui/BaseButton';
import { useSessionStore } from '../stores/sessionStore';
import { organizationApi } from '../features/organizations/services/organizationApi';

export default function DashboardPage() {
  const { user } = useSessionStore();
  const [orgCount, setOrgCount] = useState(0);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgs = await organizationApi.list();
        setOrgCount(orgs.length);
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
      }
    };
    fetchOrgs();
  }, []);

  // Metric stats
  const stats = [
    {
      title: 'Total Turnout',
      value: '0',
      desc: 'Votes cast across all events',
      trend: '0%',
      icon: TrendingUp,
      variant: 'primary' as const,
    },
    {
      title: 'Registered Voters',
      value: '0',
      desc: 'Imported whitelisted entities',
      trend: '0%',
      icon: Users,
      variant: 'success' as const,
    },
    {
      title: 'Active Elections',
      value: '0',
      desc: 'Events currently open',
      trend: '0',
      icon: CheckCircle,
      variant: 'info' as const,
    },
    {
      title: 'Organizations',
      value: orgCount.toString(),
      desc: 'Tenants you belong to',
      trend: 'Total',
      icon: Users,
      variant: 'warning' as const,
    },
  ];

  // Recharts Chart mock data
  const data: any[] = [];

  const recentActivity: any[] = [];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Welcome banner */}
      <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-indigo-500/10 border border-primary/20 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold font-sans">Welcome Back, {user?.first_name || 'User'}!</h2>
          <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
            OmniVote platform metrics are online. You belong to {orgCount} organization{orgCount !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <BaseButton
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Create Event
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={14} /> Import Voters
          </BaseButton>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <BaseCard key={i} className="flex flex-col justify-between h-36">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-zinc-400" />
                  <span className="text-xs font-semibold text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                    {stat.title}
                  </span>
                </div>
                <BaseBadge variant={stat.variant}>{stat.trend}</BaseBadge>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold font-sans leading-none">
                  {stat.value}
                </span>
                <p className="text-[11px] text-[var(--color-neutral-muted-light)] mt-1">
                  {stat.desc}
                </p>
              </div>
            </BaseCard>
          );
        })}
      </section>

      {/* Chart and Quick Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Turnout Chart */}
        <BaseCard className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">
              Turnout Analytics (Cumulative)
            </h3>
            <span className="text-xs text-[var(--color-neutral-muted-light)]">
              Live Broadcast
            </span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTurnout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#71717A" />
                <YAxis stroke="#71717A" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="turnout"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorTurnout)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </BaseCard>

        {/* Quick Actions List */}
        <BaseCard className="flex flex-col gap-4">
          <h3 className="text-base font-bold">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">Verify Audit Trails</p>
                  <p className="text-[10px] text-[var(--color-neutral-muted-light)]">
                    Decrypt election logs
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-zinc-400 group-hover:text-primary transition-colors"
              />
            </button>

            <button className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-left group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-primary flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">Add Nominee</p>
                  <p className="text-[10px] text-[var(--color-neutral-muted-light)]">
                    Append to public poll candidates
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-zinc-400 group-hover:text-primary transition-colors"
              />
            </button>
          </div>
        </BaseCard>
      </section>

      {/* Recent activity */}
      <section>
        <BaseCard className="flex flex-col gap-4">
          <h3 className="text-base font-bold">Recent System Logs</h3>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] text-[var(--color-neutral-muted-light)] font-semibold">
                  <th className="py-3 px-4">Event Context</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold">{log.event}</td>
                    <td className="py-3 px-4">{log.user}</td>
                    <td className="py-3 px-4 text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-neutral-muted-light)]">
                      {log.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden flex flex-col gap-4">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-zinc-50/50 dark:bg-zinc-800/10 flex flex-col gap-2 text-xs"
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{log.event}</span>
                  <span className="text-[10px] text-[var(--color-neutral-muted-light)] font-normal">
                    {log.time}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                  <p>
                    <span className="font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                      Triggered By:
                    </span>{' '}
                    {log.user}
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
                      Action:
                    </span>{' '}
                    {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </BaseCard>
      </section>
    </div>
  );
}
