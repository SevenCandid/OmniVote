import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ShieldAlert, Activity, User, Monitor, Info } from 'lucide-react';
import { useElectionAudit } from '../hooks/useElectionAudit';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export default function ElectionAuditPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

  const { data: logs, isLoading, error } = useElectionAudit(
    organizationId!,
    electionId!
  );

  if (isLoading) return <BaseLoader />;
  if (error || !logs) return <div className="p-6 text-red-500">Failed to load audit logs.</div>;

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('security') || eventType.includes('auth')) {
      return <ShieldAlert size={20} className="text-red-500" />;
    }
    if (eventType.includes('vote') || eventType.includes('ballot')) {
      return <Activity size={20} className="text-blue-500" />;
    }
    if (eventType.includes('user') || eventType.includes('member')) {
      return <User size={20} className="text-purple-500" />;
    }
    if (eventType.includes('system') || eventType.includes('session')) {
      return <Monitor size={20} className="text-green-500" />;
    }
    return <Info size={20} className="text-gray-500" />;
  };

  const getEventBadgeColor = (eventType: string) => {
    if (eventType.includes('security')) return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
    if (eventType.includes('vote')) return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (eventType.includes('user')) return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    if (eventType.includes('session')) return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
    return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security & Audit Logs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A chronological record of all important events, changes, and access requests related to this election.
          </p>
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#18181B] px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-800">
          {logs.length} Total Events
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <ShieldAlert className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Audit Logs Found</h3>
            <p>There are no recorded events for this election yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors flex gap-6">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(log.event_type)}
                </div>
                
                <div className="flex-grow space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-2 ${getEventBadgeColor(log.event_type)}`}>
                        {log.event_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {log.metadata_payload?.description || 'Event recorded'}
                      </p>
                    </div>
                    <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium" dateTime={log.created_at}>
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </time>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.ip_address && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">IP Address:</span> {log.ip_address}
                      </div>
                    )}
                    {log.user_agent && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={log.user_agent}>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">User Agent:</span> {log.user_agent}
                      </div>
                    )}
                  </div>
                  
                  {log.metadata_payload && Object.keys(log.metadata_payload).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800 text-xs">
                      <ul className="space-y-1.5">
                        {Object.entries(log.metadata_payload)
                          .filter(([key]) => key !== 'description')
                          .map(([key, value]) => {
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
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
