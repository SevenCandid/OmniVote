import React, { useState } from 'react';
import {
  useAllSupportRequests,
  useAllSupportSessions,
} from '../../support/api/supportApi';
import { BaseButton } from '../../../components/ui/BaseButton';
import { PlatformRequestsTable } from '../../support/components/PlatformRequestsTable';
import { PlatformSessionsTable } from '../../support/components/PlatformSessionsTable';
import { EmergencySessionDialog } from '../../support/components/EmergencySessionDialog';

export default function PlatformSupportPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'sessions'>(
    'requests'
  );
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const {
    data: requests,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useAllSupportRequests();

  const {
    data: sessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useAllSupportSessions();

  const activeSessionsCount =
    sessions?.filter((s) => s.status === 'ACTIVE').length || 0;
  const pendingRequestsCount =
    requests?.filter((r) => r.status === 'PENDING').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage organization support requests and active support sessions.
          </p>
        </div>
        <div className="flex gap-3">
          <BaseButton onClick={() => setIsEmergencyOpen(true)} variant="danger">
            <span className="mr-2">⚠️</span> Start Emergency Session
          </BaseButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Pending Requests
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {pendingRequestsCount}
          </div>
        </div>
        <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Active Sessions
          </h3>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {activeSessionsCount}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Support Requests
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'sessions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Support Sessions
          </button>
        </div>

        {activeTab === 'requests' ? (
          <PlatformRequestsTable
            requests={requests || []}
            isLoading={isLoadingRequests}
            error={requestsError as Error | null}
          />
        ) : (
          <PlatformSessionsTable
            sessions={sessions || []}
            isLoading={isLoadingSessions}
            error={sessionsError as Error | null}
          />
        )}
      </div>

      <EmergencySessionDialog
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
