import React, { useState } from 'react';
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
  Pause,
} from 'lucide-react';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface ElectionLifecycleActionsProps {
  election: Election;
}

export const ElectionLifecycleActions: React.FC<
  ElectionLifecycleActionsProps
> = ({ election }) => {
  const { hasPermission } = useMyPermissions(election.organization_id);
  const lifecycle = useElectionLifecycle();

  const canPublish = hasPermission('election.publish');
  const canOpenVoting = hasPermission('election.open_voting');
  const canPauseVoting = hasPermission('election.pause_voting');
  const canResumeVoting = hasPermission('election.resume_voting');
  const canCloseVoting = hasPermission('election.close_voting');
  const canArchive = hasPermission('election.archive');
  const canCancel = hasPermission('election.cancel');

  const hasAnyActionPermission =
    canPublish ||
    canOpenVoting ||
    canPauseVoting ||
    canResumeVoting ||
    canCloseVoting ||
    canArchive ||
    canCancel;

  if (!hasAnyActionPermission) return null;

  const [pendingAction, setPendingAction] = useState<{
    action:
      | 'publish'
      | 'openVoting'
      | 'pauseVoting'
      | 'resumeVoting'
      | 'closeVoting'
      | 'archive'
      | 'cancel';
    title: string;
    description: string;
    variant: 'primary' | 'danger';
  } | null>(null);

  const handleActionClick = (
    action:
      | 'publish'
      | 'openVoting'
      | 'pauseVoting'
      | 'resumeVoting'
      | 'closeVoting'
      | 'archive'
      | 'cancel'
  ) => {
    let title = '';
    let description = '';
    let variant: 'primary' | 'danger' = 'primary';

    switch (action) {
      case 'publish':
        title = 'Publish Election';
        description =
          'Are you sure you want to publish this election? Voters will be able to see it, and some configurations will be locked.';
        break;
      case 'openVoting':
        title = 'Open Voting';
        description =
          'Are you sure you want to open voting? Voters will be able to cast their ballots.';
        break;
      case 'pauseVoting':
        title = 'Pause Voting';
        description =
          'Are you sure you want to pause voting? Voters will temporarily not be able to cast ballots.';
        variant = 'danger';
        break;
      case 'resumeVoting':
        title = 'Resume Voting';
        description =
          'Are you sure you want to resume voting? Voters will be able to cast their ballots again.';
        break;
      case 'closeVoting':
        title = 'Close Voting';
        description =
          'Are you sure you want to close voting? This action cannot be easily undone, and no further ballots can be cast.';
        variant = 'danger';
        break;
      case 'archive':
        title = 'Archive Election';
        description =
          'Are you sure you want to archive this election? It will be moved to the archive.';
        break;
      case 'cancel':
        title = 'Cancel Election';
        description =
          'Are you sure you want to cancel this election? This is permanent and cannot be undone.';
        variant = 'danger';
        break;
    }

    setPendingAction({ action, title, description, variant });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const action = pendingAction.action;
    try {
      await lifecycle[action].mutateAsync({
        organizationId: election.organization_id,
        electionId: election.id,
      });
      setPendingAction(null);
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
          {(election.status === 'draft' || election.status === 'configured') &&
            canPublish && (
              <button
                onClick={() => handleActionClick('publish')}
                disabled={lifecycle.publish.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={16} />
                Publish Election
              </button>
            )}

          {election.status === 'published' && canOpenVoting && (
            <button
              onClick={() => handleActionClick('openVoting')}
              disabled={lifecycle.openVoting.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors"
            >
              <Play size={16} />
              Open Voting
            </button>
          )}

          {election.status === 'voting_open' && canPauseVoting && (
            <button
              onClick={() => handleActionClick('pauseVoting')}
              disabled={lifecycle.pauseVoting.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 disabled:opacity-50 transition-colors"
            >
              <Pause size={16} />
              Pause Voting
            </button>
          )}

          {election.status === 'voting_paused' && canResumeVoting && (
            <button
              onClick={() => handleActionClick('resumeVoting')}
              disabled={lifecycle.resumeVoting.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 transition-colors"
            >
              <Play size={16} />
              Resume Voting
            </button>
          )}

          {(election.status === 'voting_open' ||
            election.status === 'voting_paused') &&
            canCloseVoting && (
              <button
                onClick={() => handleActionClick('closeVoting')}
                disabled={lifecycle.closeVoting.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 disabled:opacity-50 transition-colors"
              >
                <StopCircle size={16} />
                Close Voting
              </button>
            )}

          {[
            'draft',
            'configured',
            'published',
            'voting_open',
            'voting_paused',
          ].includes(election.status) &&
            canCancel && (
              <button
                onClick={() => handleActionClick('cancel')}
                disabled={lifecycle.cancel.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors ml-auto"
              >
                <XCircle size={16} />
                Cancel Election
              </button>
            )}

          {['results_published', 'cancelled', 'voting_closed'].includes(
            election.status
          ) &&
            canArchive && (
              <button
                onClick={() => handleActionClick('archive')}
                disabled={lifecycle.archive.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors ml-auto"
              >
                <Archive size={16} />
                Archive Election
              </button>
            )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        title={pendingAction?.title || ''}
        description={pendingAction?.description || ''}
        variant={pendingAction?.variant || 'primary'}
        isConfirming={
          pendingAction ? lifecycle[pendingAction.action].isPending : false
        }
      />
    </div>
  );
};
