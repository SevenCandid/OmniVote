import { useParams } from 'react-router-dom';
import { useElectionAnalytics } from '../hooks/useElectionAnalytics';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users, UserCheck, Activity, Eye, MousePointerClick } from 'lucide-react';

export default function ElectionAnalyticsPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

  const { data: analytics, isLoading, error } = useElectionAnalytics(
    organizationId!,
    electionId!
  );

  if (isLoading) return <BaseLoader />;
  if (error || !analytics) return <div className="p-6 text-red-500">Failed to load analytics data.</div>;

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</p>
          <p className="text-[var(--color-primary)] font-medium">
            Votes: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Registered Voters</p>
            <p className="text-xl font-bold">{analytics.total_voters}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Votes Cast</p>
            <p className="text-xl font-bold">{analytics.total_votes_cast}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Turnout Percentage</p>
            <div className="flex items-end gap-2">
              <p className="text-xl font-bold">{analytics.turnout_percentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Visitors</p>
            <p className="text-xl font-bold">{analytics.engagement.total_visitors}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnout Over Time Chart */}
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Votes Over Time</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.turnout_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-default-light)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {analytics.turnout_over_time.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-primary)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Metrics Panel */}
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Voter Engagement</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MousePointerClick size={16} /> Active Voting Sessions
                </span>
                <span className="font-semibold">{analytics.engagement.active_sessions}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (analytics.engagement.active_sessions / (analytics.engagement.total_visitors || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <UserCheck size={16} /> Completed Ballots
                </span>
                <span className="font-semibold">{analytics.engagement.completed_ballots}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (analytics.engagement.completed_ballots / (analytics.engagement.total_visitors || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Activity size={16} /> Bounce Rate
                </span>
                <span className="font-semibold text-red-500">{analytics.engagement.bounce_rate}%</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Visitors who left without starting a session.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      {analytics.category_turnout && analytics.category_turnout.length > 0 && (
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Category Turnout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.category_turnout.map((cat, idx) => (
              <div key={cat.category_id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <p className="font-medium mb-2 text-sm">{cat.category_name}</p>
                <div className="flex items-end justify-between">
                  <p className="text-xl font-bold" style={{ color: COLORS[idx % COLORS.length] }}>
                    {cat.total_votes} <span className="text-xs text-gray-400 font-normal">votes</span>
                  </p>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {analytics.total_voters > 0 
                      ? Math.round((cat.total_votes / analytics.total_voters) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-3">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${analytics.total_voters > 0 ? (cat.total_votes / analytics.total_voters) * 100 : 0}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
