import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BaseAuditTimeline } from '../../../components/ui/BaseAuditTimeline';
import { useOrganizationAuditLogs } from '../hooks/useOrganizationAudit';
import { useOrganization } from '../hooks/useOrganizations';

export const OrganizationAuditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [limit, setLimit] = useState(50);
  const [eventType, setEventType] = useState<string>('');

  const { data, isLoading, isFetching } = useOrganizationAuditLogs(
    id || '',
    0,
    limit,
    eventType || undefined
  );
  const { data: organization } = useOrganization(id || '');

  const mappedEvents = React.useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((event) => {
      if (
        event.metadata_payload &&
        event.metadata_payload.organization_id &&
        organization
      ) {
        const { organization_id, ...restPayload } = event.metadata_payload;
        return {
          ...event,
          metadata_payload: {
            ...restPayload,
            organization: `${organization.name} (${organization_id})`,
          },
        };
      }
      return event;
    });
  }, [data?.items, organization]);

  const handleLoadMore = () => {
    setLimit((prev) => prev + 50);
  };

  const hasMore = data ? data.total > data.items.length : false;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          &larr; Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Organization Audit Logs
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review security events and administrative actions within this
            organization.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-[var(--color-surface-dark)] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex-1 max-w-sm">
          <label
            htmlFor="eventType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Filter by Event Type
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm rounded-md"
          >
            <option value="">All Events</option>
            <option value="organization_created">Organization Created</option>
            <option value="organization_updated">Organization Updated</option>
            <option value="membership_invitation_created">
              Invitation Created
            </option>
            <option value="membership_role_assigned">Role Assigned</option>
            <option value="membership_removed">Member Removed</option>
            <option value="support_access_action">Support Access</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--color-surface-dark)] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <BaseAuditTimeline
          events={mappedEvents}
          isLoading={isLoading || isFetching}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
};
