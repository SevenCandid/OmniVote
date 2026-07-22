import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { SupportSession } from '../schemas/supportSchema';
import { useTerminateSupportSession } from '../api/supportApi';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface PlatformSessionsTableProps {
  sessions: SupportSession[];
  isLoading: boolean;
  error: Error | null;
}

export function PlatformSessionsTable({
  sessions,
  isLoading,
  error,
}: PlatformSessionsTableProps) {
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(
    null
  );
  const navigate = useNavigate();

  const { mutateAsync: terminateSession, isPending } =
    useTerminateSupportSession();

  const handleTerminate = async () => {
    if (!selectedSession) return;

    try {
      await terminateSession(selectedSession.id);
      toast.success('Support session terminated.');
      setSelectedSession(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to terminate session');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading sessions...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load support sessions.
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Support Sessions
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          There are currently no support sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            <th className="p-4 font-medium">Session ID</th>
            <th className="p-4 font-medium">Org ID</th>
            <th className="p-4 font-medium">Reason</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Expires At</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="p-4 text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">
                {session.id.split('-')[0]}...
              </td>
              <td className="p-4 text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">
                {session.organization_id.split('-')[0]}...
              </td>
              <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                {session.reason}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${
                      session.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                  {session.status.toLowerCase()}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                {new Date(session.expires_at).toLocaleString()}
              </td>
              <td className="p-4 flex space-x-2">
                {session.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/organizations/${session.organization_id}`
                        )
                      }
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Access Org
                    </button>
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Terminate
                    </button>
                  </>
                )}
                {session.status !== 'ACTIVE' && (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        onConfirm={handleTerminate}
        title="Terminate Support Session"
        description="Are you sure you want to terminate this support session immediately? You will lose platform admin access to this organization."
        confirmText="Terminate"
        variant="danger"
        isConfirming={isPending}
      />
    </div>
  );
}
