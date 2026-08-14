import { useNavigate, useParams } from 'react-router-dom';
import { useElection, useCategories, useElectionRevenue } from '../hooks/useElections';
import { useCandidates } from '../hooks/useCandidates';
import {
  Calendar,
  Globe,
  Clock,
  Eye,
  ShieldCheck,
  Users,
  Settings,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { BaseButton } from '../../../components/ui/BaseButton';

function CategoryCandidatesPreview({ orgId, electionId, categoryId }: { orgId: string, electionId: string, categoryId: string }) {
  const { data: candidates, isLoading } = useCandidates(orgId, electionId, categoryId);
  
  if (isLoading) return <p className="text-xs text-gray-400 mt-2">Loading candidates...</p>;
  if (!candidates || candidates.length === 0) return <p className="text-xs text-gray-400 mt-2">No candidates added</p>;
  
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {candidates.slice(0, 5).map(candidate => (
        <span key={candidate.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {candidate.full_name}
        </span>
      ))}
      {candidates.length > 5 && (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500 dark:bg-gray-900/50">
          +{candidates.length - 5} more
        </span>
      )}
    </div>
  );
}

export default function ElectionOverviewPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();
  const navigate = useNavigate();
  
  const { data: election, isLoading: isElectionLoading } = useElection(
    organizationId!,
    electionId!
  );
  
  const { data: categories, isLoading: isCategoriesLoading } = useCategories(
    organizationId!,
    electionId!
  );

  const { data: revenue, isLoading: isRevenueLoading } = useElectionRevenue(
    organizationId!,
    electionId!
  );

  if (isElectionLoading) return <BaseLoader />;
  if (!election) return <div>Election not found</div>;

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details Form View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Election Details</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor}`}>
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
                  <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {election.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Visibility</p>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Globe size={16} className="text-gray-400" />
                    <span className="capitalize">{election.visibility.replace('_', ' ')}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Public URL</p>
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
          
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Positions Overview ({categories?.length || 0})</h3>
            </div>
            <div className="p-0">
              {isCategoriesLoading ? (
                <div className="p-6 text-center text-gray-500">Loading positions...</div>
              ) : categories && categories.length > 0 ? (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {categories.map((category: any) => (
                    <li key={category.id} className="p-4 flex flex-col hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                        )}
                      </div>
                      <CategoryCandidatesPreview orgId={organizationId!} electionId={electionId!} categoryId={category.id} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">No positions created yet.</div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Settings size={18} className="text-gray-500" />
                Configuration Features
              </h3>
            </div>
            <div className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
              {!election.allow_anonymous_voting && !election.automatically_publish_results && !election.require_voter_verification ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No configuration features enabled.
                </div>
              ) : (
                <>
                  {election.allow_anonymous_voting && (
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="font-medium">Anonymous Voting</p>
                          <p className="text-sm text-gray-500">Votes are untraceable to voters.</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Enabled
                      </span>
                    </div>
                  )}

                  {election.automatically_publish_results && (
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20">
                          <Eye size={18} />
                        </div>
                        <div>
                          <p className="font-medium">Auto-Publish Results</p>
                          <p className="text-sm text-gray-500">Results are visible once voting closes.</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Enabled
                      </span>
                    </div>
                  )}

                  {election.require_voter_verification && (
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="font-medium">Voter Verification</p>
                          <p className="text-sm text-gray-500">Extra verification step required to vote.</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        Enabled
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Schedule & Timeline & Lifecycle */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Eye size={18} className="text-gray-500" />
              Voter Access
            </h3>
            <p className="text-sm text-gray-500">Manage the election lifecycle and distribute voting access links.</p>
            <BaseButton
              onClick={() => navigate(`/dashboard/organizations/${organizationId}/elections/${electionId}/voting`)}
              className="w-full"
            >
              Manage Voting
            </BaseButton>
          </div>

          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4 shadow-sm opacity-75">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BarChart3 size={18} className="text-gray-500" />
                Analytics
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Deep insights into voter turnout, engagement metrics, and geographic distribution will be available here soon.
            </p>
          </div>

          {election.is_paid && (
            <div className="bg-white dark:bg-[#18181B] rounded-xl border border-emerald-200 dark:border-emerald-800/30 p-6 flex flex-col gap-4 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-[#18181B]">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <DollarSign size={18} className="text-emerald-500" />
                Revenue Dashboard
              </h3>
              
              {isRevenueLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500">
                      {election.currency || 'USD'} {revenue?.total_revenue?.toLocaleString() || 0}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">Total Raised</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-100 dark:border-emerald-800/30">
                    <div>
                      <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        {revenue?.total_transactions || 0}
                      </span>
                      <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Transactions</span>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        {election.currency || 'USD'} {election.cost_per_vote || 0}
                      </span>
                      <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Cost per vote</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                Schedule
              </h3>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-8">
                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#18181B] ${election.registration_opens_at ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <p className="font-medium text-sm">Registration Opens</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.registration_opens_at ? format(new Date(election.registration_opens_at), 'MMM d, yyyy h:mm a') : 'Not Set'}
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#18181B] ${election.registration_closes_at ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <p className="font-medium text-sm">Registration Closes</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.registration_closes_at ? format(new Date(election.registration_closes_at), 'MMM d, yyyy h:mm a') : 'Not Set'}
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-[var(--color-primary)] border-2 border-white dark:border-[#18181B]"></div>
                  <p className="font-medium text-sm">Voting Opens</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.voting_opens_at ? format(new Date(election.voting_opens_at), 'MMM d, yyyy h:mm a') : 'Not Set'}
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-orange-500 border-2 border-white dark:border-[#18181B]"></div>
                  <p className="font-medium text-sm">Voting Closes</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.voting_closes_at ? format(new Date(election.voting_closes_at), 'MMM d, yyyy h:mm a') : 'Not Set'}
                  </div>
                </div>
                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#18181B] ${election.results_publish_at ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <p className="font-medium text-sm">Results Published</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <Clock size={14} />
                    {election.results_publish_at ? format(new Date(election.results_publish_at), 'MMM d, yyyy h:mm a') : 'Manual'}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                Timezone: <span className="font-medium text-gray-700 dark:text-gray-300">{election.timezone}</span>
              </div>
            </div>
          </div>
          
          {/* Removed ElectionLifecycleActions as it's now in the Voting tab */}
        </div>
      </div>
    </div>
  );
}
