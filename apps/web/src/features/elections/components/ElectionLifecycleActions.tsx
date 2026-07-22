import React from 'react';
import { useElectionLifecycle } from '../hooks/useElections';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { Election } from '../types';
import {
  Play,
  StopCircle,
  Archive,
  XCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface ElectionLifecycleActionsProps {
  election: Election;
}

export const ElectionLifecycleActions: React.FC<
  ElectionLifecycleActionsProps
> = ({ election }) => {
  const { hasPermission } = useMyPermissions(election.organization_id);
  const lifecycle = useElectionLifecycle();

  const canManage = hasPermission('election.manage_lifecycle');

  if (!canManage) return null;

  const handleAction = async (
    action: 'publish' | 'openVoting' | 'closeVoting' | 'archive' | 'cancel'
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action.replace(/([A-Z])/g, ' $1').toLowerCase()} this election?`
      )
    ) {
      return;
    }

    try {
      await lifecycle[action].mutateAsync({
        organizationId: election.organization_id,
        electionId: election.id,
      });
    } catch (error) {
      console.error(`Failed to ${action} election:`, error);
      alert(
        `Failed to perform action: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <AlertTriangle size={18} className="text-orange-500" />
        <h3 className="font-semibold text-lg">Lifecycle Actions</h3>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-500 mb-6">
          Manage the active state of this election. Some actions are
          irreversible.
        </p>

        <div className="flex flex-wrap gap-4">
          {(election.status === 'draft' ||
            election.status === 'configured') && (
            <button
              onClick={() => handleAction('publish')}
              disabled={lifecycle.publish.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
            >
              <CheckCircle size={16} />
              Publish Election
            </button>
          )}

          {election.status === 'published' && (
            <button
              onClick={() => handleAction('openVoting')}
              disabled={lifecycle.openVoting.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors"
            >
              <Play size={16} />
              Open Voting
            </button>
          )}

          {election.status === 'voting_open' && (
            <button
              onClick={() => handleAction('closeVoting')}
              disabled={lifecycle.closeVoting.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 disabled:opacity-50 transition-colors"
            >
              <StopCircle size={16} />
              Close Voting
            </button>
          )}

          {['draft', 'configured', 'published'].includes(election.status) && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={lifecycle.cancel.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors ml-auto"
            >
              <XCircle size={16} />
              Cancel Election
            </button>
          )}

          {['results_published', 'cancelled'].includes(election.status) && (
            <button
              onClick={() => handleAction('archive')}
              disabled={lifecycle.archive.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ml-auto"
            >
              <Archive size={16} />
              Archive Election
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
