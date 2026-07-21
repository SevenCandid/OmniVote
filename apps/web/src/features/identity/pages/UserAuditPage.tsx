import React, { useState } from 'react';
import { BaseAuditTimeline } from '../../../components/ui/BaseAuditTimeline';
import { usePersonalAuditLogs } from '../hooks/useAudit';

export const UserAuditPage: React.FC = () => {
  const [limit, setLimit] = useState(50);
  const [eventType, setEventType] = useState<string>('');

  const { data, isLoading, isFetching } = usePersonalAuditLogs(0, limit, eventType || undefined);

  const handleLoadMore = () => {
    setLimit((prev) => prev + 50);
  };

  const hasMore = data ? data.total > data.items.length : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review your personal account activity and security events across the platform.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[var(--color-surface-dark)] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex-1 max-w-sm">
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Event Type
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md"
          >
            <option value="">All Events</option>
            <option value="user_login">Login</option>
            <option value="user_logout">Logout</option>
            <option value="user_password_changed">Password Changed</option>
            <option value="user_profile_updated">Profile Updated</option>
            <option value="membership_invitation_accepted">Invitation Accepted</option>
            <option value="support_access_action">Support Access</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--color-surface-dark)] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <BaseAuditTimeline
          events={data?.items || []}
          isLoading={isLoading || isFetching}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};
