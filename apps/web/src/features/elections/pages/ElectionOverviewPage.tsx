import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useElection } from '../hooks/useElections';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import {
  Calendar,
  Settings,
  Globe,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { ElectionLifecycleActions } from '../components/ElectionLifecycleActions';

export default function ElectionOverviewPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();
  const navigate = useNavigate();
  const { data: election, isLoading } = useElection(
    organizationId!,
    electionId!
  );
  const { hasPermission } = useMyPermissions(organizationId!);

  if (isLoading) return <BaseLoader />;
  if (!election) return <div>Election not found</div>;

  const canEdit = hasPermission('election.update');

  // Calculate relative stats/placeholders
  const statusColor =
    election.status === 'published' || election.status === 'voting_open'
      ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      : election.status === 'draft' ||
          election.status === 'configured' ||
          election.status === 'voting_paused'
        ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
        : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Positions</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full text-blue-600">
            <FileText size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Candidates</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Registered Voters
            </p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-full text-emerald-600">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Votes Cast</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>
          <div className="bg-[var(--color-primary)]/10 p-3 rounded-full text-[var(--color-primary)]">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Election Details</h3>
              {canEdit && (
                <button
                  onClick={() =>
                    navigate(
                      `/dashboard/organizations/${organizationId}/elections/${electionId}/edit`
                    )
                  }
                  className="text-sm text-[var(--color-primary)] font-medium hover:underline"
                >
                  Edit Details
                </button>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor}`}
                  >
                    {election.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                  <p className="font-medium capitalize">
                    {election.election_type.replace('_', ' ')}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {election.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Visibility
                  </p>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Globe size={16} className="text-gray-400" />
                    <span className="capitalize">
                      {election.visibility.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Public URL
                  </p>
                  <a
                    href={`/e/${election.public_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-primary)] hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    /e/{election.public_id}
                    <Eye size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Settings size={18} className="text-gray-500" />
                Configuration Features
              </h3>
            </div>
            <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${election.allow_anonymous_voting ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
                  >
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Anonymous Voting</p>
                    <p className="text-sm text-gray-500">
                      Votes are untraceable to voters.
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${election.allow_anonymous_voting ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                >
                  {election.allow_anonymous_voting ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${election.automatically_publish_results ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
                  >
                    <Eye size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Auto-Publish Results</p>
                    <p className="text-sm text-gray-500">
                      Results are visible once voting closes.
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${election.automatically_publish_results ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                >
                  {election.automatically_publish_results
                    ? 'Enabled'
                    : 'Disabled'}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${election.require_voter_verification ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Voter Verification</p>
                    <p className="text-sm text-gray-500">
                      Extra verification step required to vote.
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${election.require_voter_verification ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}
                >
                  {election.require_voter_verification ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Schedule & Timeline */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                Schedule
              </h3>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                {/* Registration Opens */}
                <div className="relative pl-6">
                  <div
                    className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#18181B] ${election.registration_opens_at ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}
                  ></div>
                  <p className="font-medium text-sm">Registration Opens</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.registration_opens_at
                      ? format(
                          new Date(election.registration_opens_at),
                          'MMM d, yyyy h:mm a'
                        )
                      : 'Not Set'}
                  </div>
                </div>

                {/* Registration Closes */}
                <div className="relative pl-6">
                  <div
                    className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#18181B] ${election.registration_closes_at ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}
                  ></div>
                  <p className="font-medium text-sm">Registration Closes</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.registration_closes_at
                      ? format(
                          new Date(election.registration_closes_at),
                          'MMM d, yyyy h:mm a'
                        )
                      : 'Not Set'}
                  </div>
                </div>

                {/* Voting Opens */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--color-primary)] border-2 border-white dark:border-[#18181B]"></div>
                  <p className="font-medium text-sm">Voting Opens</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.voting_opens_at
                      ? format(
                          new Date(election.voting_opens_at),
                          'MMM d, yyyy h:mm a'
                        )
                      : 'Not Set'}
                  </div>
                </div>

                {/* Voting Closes */}
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-orange-500 border-2 border-white dark:border-[#18181B]"></div>
                  <p className="font-medium text-sm">Voting Closes</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.voting_closes_at
                      ? format(
                          new Date(election.voting_closes_at),
                          'MMM d, yyyy h:mm a'
                        )
                      : 'Not Set'}
                  </div>
                </div>

                {/* Results Published */}
                <div className="relative pl-6">
                  <div
                    className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#18181B] ${election.results_publish_at ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  ></div>
                  <p className="font-medium text-sm">Results Published</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.results_publish_at
                      ? format(
                          new Date(election.results_publish_at),
                          'MMM d, yyyy h:mm a'
                        )
                      : 'Manual'}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                Timezone:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {election.timezone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Actions */}
      <ElectionLifecycleActions election={election} />
    </div>
  );
}
