import React, { useState } from 'react';
import { BaseCard } from './BaseCard';
import { BaseBadge } from './BaseBadge';

export interface AuditEvent {
  id: string;
  user_id?: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  metadata_payload?: Record<string, any>;
  created_at: string;
}

interface BaseAuditTimelineProps {
  events: AuditEvent[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const BaseAuditTimeline: React.FC<BaseAuditTimelineProps> = ({
  events,
  isLoading,
  onLoadMore,
  hasMore,
}) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  if (isLoading && events.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[var(--color-surface-dark)] border border-gray-200 dark:border-gray-800 rounded-xl">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          No audit events found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          No security or audit events have been recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {events.map((event, eventIdx) => {
            const isExpanded = expandedEventId === event.id;
            const date = new Date(event.created_at);

            return (
              <li key={event.id}>
                <div className="relative pb-8">
                  {eventIdx !== events.length - 1 ? (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div>
                      <div className="relative px-1">
                        <div className="h-8 w-8 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-[var(--color-canvas-dark)]">
                          <svg
                            className="w-4 h-4 text-[var(--color-primary)]"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 py-1.5">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                              {event.event_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-xs whitespace-nowrap">
                            {date.toLocaleDateString()}{' '}
                            {date.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs">
                          {event.ip_address && (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                />
                              </svg>
                              {event.ip_address}
                            </span>
                          )}
                          {event.metadata_payload && (
                            <button
                              onClick={() =>
                                setExpandedEventId(isExpanded ? null : event.id)
                              }
                              className="text-[var(--color-primary)] hover:underline focus:outline-none flex items-center gap-1"
                            >
                              {isExpanded ? 'Hide Details' : 'Show Details'}
                              <svg
                                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          )}
                        </div>

                        {isExpanded && event.metadata_payload && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800 text-xs">
                            <ul className="space-y-1.5">
                              {Object.entries(event.metadata_payload).map(
                                ([key, value]) => {
                                  const formattedKey = key
                                    .replace(/_/g, ' ')
                                    .replace(/\b\w/g, (l) => l.toUpperCase());
                                  let formattedValue = String(value);
                                  if (Array.isArray(value)) {
                                    formattedValue = value.join(', ');
                                  } else if (
                                    typeof value === 'object' &&
                                    value !== null
                                  ) {
                                    formattedValue = JSON.stringify(value);
                                  }
                                  return (
                                    <li
                                      key={key}
                                      className="flex flex-col sm:flex-row sm:gap-2"
                                    >
                                      <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[120px]">
                                        {formattedKey}:
                                      </span>
                                      <span className="text-gray-600 dark:text-gray-400 break-all sm:break-normal">
                                        {formattedValue}
                                      </span>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};
