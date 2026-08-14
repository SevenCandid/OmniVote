import React from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useElection } from '../hooks/useElections';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export const ElectionLayout: React.FC = () => {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();
  const navigate = useNavigate();

  const { data: election, isLoading } = useElection(
    organizationId!,
    electionId!
  );

  const navigation: Array<{ name: string; to: string; end?: boolean; disabled?: boolean }> = [
    {
      name: 'Overview',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}`,
      end: true,
    },
    {
      name: 'Positions',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/positions`,
    },
    {
      name: 'Candidates',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/candidates`,
    },
    {
      name: 'Settings',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/settings`,
    },
    {
      name: 'Voters',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/voters`,
    },
    {
      name: 'Ballot',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/ballot`,
    },
    {
      name: 'Voting',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/voting`,
    },
    {
      name: 'Results',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/results`,
    },
    {
      name: 'Analytics',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/analytics`,
    },
    {
      name: 'Audit',
      to: `/dashboard/organizations/${organizationId}/elections/${electionId}/audit`,
    },
  ];

  if (isLoading) {
    return <BaseLoader />;
  }

  if (!election) {
    return <div className="p-6">Election not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <button
          onClick={() =>
            navigate(`/dashboard/organizations/${organizationId}/elections`)
          }
          className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0"
          title="Back to Elections"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {election.title}
        </h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 capitalize ml-2">
          {election.status.replace('_', ' ')}
        </span>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.disabled ? '#' : item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  item.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : isActive
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`
              }
              onClick={(e) => {
                if (item.disabled) e.preventDefault();
              }}
            >
              {item.name}
              {item.disabled && (
                <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="mt-6">
        <Outlet />
      </main>
    </div>
  );
};

export default ElectionLayout;
