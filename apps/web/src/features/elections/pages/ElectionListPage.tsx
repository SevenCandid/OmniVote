import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useElections } from '../hooks/useElections';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { Plus, Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function ElectionListPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useElections(organizationId!);
  const { hasPermission } = useMyPermissions(organizationId!);

  const canCreate = hasPermission('election.create');
  const elections = response?.items || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Elections</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your organization's elections.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() =>
              navigate(
                `/dashboard/organizations/${organizationId}/elections/new`
              )
            }
            className="px-6 py-2 rounded-full bg-[var(--color-primary)] text-white font-medium hover:bg-opacity-90 flex items-center gap-2"
          >
            <Plus size={18} />
            New Election
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-800 h-40 rounded-2xl"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
          Failed to load elections. Please try again.
        </div>
      )}

      {!isLoading && !error && elections.length === 0 && (
        <div className="text-center py-24 bg-gray-50 dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No elections found</h3>
          <p className="text-gray-500 mt-2 max-w-md">
            Get started by creating your first election to manage candidates,
            voters, and ballots.
          </p>
          {canCreate && (
            <button
              onClick={() =>
                navigate(
                  `/dashboard/organizations/${organizationId}/elections/new`
                )
              }
              className="mt-6 px-6 py-2 rounded-full border border-gray-300 dark:border-gray-700 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Create Election
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && elections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              onClick={() =>
                navigate(
                  `/dashboard/organizations/${organizationId}/elections/${election.id}`
                )
              }
              className="p-6 bg-white dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-primary)] cursor-pointer transition-all hover:shadow-md flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <h3
                  className="font-semibold text-lg line-clamp-1 flex-1 pr-2"
                  title={election.title}
                >
                  {election.title}
                </h3>
                <span className="shrink-0 px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                  {election.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                {election.description || 'No description provided.'}
              </p>
              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/60">
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 capitalize">
                    <Settings size={14} />
                    {election.election_type.replace('_', ' ')}
                  </span>
                  <span>{election.visibility}</span>
                </div>
                {election.voting_opens_at && (
                  <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                    <Calendar size={14} />
                    Voting:{' '}
                    {format(new Date(election.voting_opens_at), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
