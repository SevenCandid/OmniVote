import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { AlertCircle, Activity, Users, ExternalLink, BarChart3 } from 'lucide-react';
import { CategoryResultCard } from '../components/results/CategoryResultCard';
import { ElectionStatus } from '../types';
import { useRealtime } from '../../../hooks/useRealtime';
import { LiveBadge } from '../../../components/realtime/LiveBadge';
import { ConnectionStatus } from '../../../components/realtime/ConnectionStatus';
import LiveElectionIndicator from '../components/LiveElectionIndicator';

export default function PublicElectionResultsPage() {
  const { organizationId, electionId } = useParams<{
    organizationId: string;
    electionId: string;
  }>();

  // Fetch election details for header info
  const { data: election, isLoading: isElectionLoading } = useQuery({
    queryKey: ['public-election', electionId],
    queryFn: () => publicApi.getElection(electionId!),
    enabled: !!electionId,
  });

  const isLive = election?.status === ElectionStatus.VOTING_OPEN && (election as any).result_visibility === 'LIVE';

  // Fetch results
  const { data: results, isLoading: isResultsLoading, error: resultsError, refetch } = useQuery({
    queryKey: ['public-election-results', electionId],
    queryFn: () => publicApi.getElectionResults(organizationId!, electionId!),
    enabled: !!electionId && !!organizationId,
    refetchInterval: isLive ? 10000 : false, // Fallback polling if WS disconnects
  });

  // Subscribe to real-time election results channel
  useRealtime(electionId ? `election.${electionId}.results` : null, {
    onEvent: () => refetch(),
    enabled: isLive,
  });

  if (isElectionLoading || isResultsLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <BaseLoader />
      </div>
    );
  }

  if (resultsError) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center p-12 bg-[#18181b]/80 backdrop-blur-xl rounded-2xl border border-red-900/30 text-center shadow-lg max-w-lg w-full">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Results Unavailable</h3>
          <p className="mt-2 text-zinc-400">
            {resultsError instanceof Error && resultsError.message.includes('403')
              ? 'The results for this election are currently hidden or will be published after the election closes.'
              : 'An error occurred while fetching the results.'}
          </p>
        </div>
      </div>
    );
  }

  if (!results || !election) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      {/* Immersive Header Background */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/20 via-[#09090b] to-[#09090b] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 shadow-sm">
            <BarChart3 className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Official Election Results
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
              {election.title}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 bg-zinc-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-800">
            {isLive ? (
              <>
                <LiveBadge label="LIVE UPDATES ACTIVE" />
                <div className="w-px h-4 bg-zinc-700" />
                <ConnectionStatus compact />
              </>
            ) : (
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
                Final Results
              </span>
            )}
          </div>
        </div>

        {results.is_hidden ? (
          <LiveElectionIndicator isAdmin={false} status={results.status} />
        ) : (
          <>
            {/* Statistics Overview */}
            {results.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Total Votes Card */}
                <div className="relative bg-[#18181B]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-start space-x-4 overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-sm relative z-10">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Total Votes Cast</p>
                    <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {results.statistics.total_votes_cast.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Expected Voters Card */}
                <div className="relative bg-[#18181B]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-start space-x-4 overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-sm relative z-10">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Expected Voters</p>
                    <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {results.statistics.total_eligible_voters ? results.statistics.total_eligible_voters.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Turnout Card */}
                <div className="relative bg-[#18181B]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-start space-x-4 overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-sm relative z-10">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Turnout</p>
                    <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                      {results.statistics.turnout_percentage !== null 
                        ? `${results.statistics.turnout_percentage.toFixed(1)}%` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Categories */}
            <div className="space-y-8">
              {results.categories && results.categories.length > 0 ? (
                results.categories.map((category: any) => (
                  <CategoryResultCard key={category.category_id} category={category} />
                ))
              ) : (
                <div className="text-center py-12 bg-[#18181B]/80 backdrop-blur-xl rounded-2xl border border-zinc-800/80">
                  <p className="text-zinc-400">No categories found for this election.</p>
                </div>
              )}
            </div>
            
            <div className="text-xs text-zinc-600 text-center pt-12 pb-8 uppercase tracking-widest font-mono">
              Last updated: {new Date(results.generated_at).toLocaleString()}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
