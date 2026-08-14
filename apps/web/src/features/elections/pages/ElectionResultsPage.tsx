import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useElection } from '../hooks/useElections';
import { useElectionResults } from '../hooks/useResults';
import { electionResultApi } from '../api/resultApi';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { AlertCircle, Download, ExternalLink, RefreshCw, Activity, Users, FileSpreadsheet, FileText } from 'lucide-react';
import { CategoryResultCard } from '../components/results/CategoryResultCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { ElectionStatus } from '../types';
import { useRealtime } from '../../../hooks/useRealtime';
import { LiveBadge } from '../../../components/realtime/LiveBadge';
import { ConnectionStatus } from '../../../components/realtime/ConnectionStatus';
import LiveElectionIndicator from '../components/LiveElectionIndicator';

export default function ElectionResultsPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: election, isLoading: isElectionLoading } = useElection(
    organizationId!,
    electionId!
  );

  const isLive = election?.status === ElectionStatus.VOTING_OPEN && (election as any).result_visibility === 'LIVE';

  const { data: results, isLoading: isResultsLoading, error: resultsError, refetch, isRefetching } = useElectionResults(
    organizationId!,
    electionId!,
    isLive
  );

  // Subscribe to real-time election results channel
  useRealtime(electionId ? `election.${electionId}.results` : null, {
    onEvent: () => refetch(),
    enabled: isLive,
  });

  if (isElectionLoading || isResultsLoading) return <BaseLoader />;

  if (resultsError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-900/30 text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Failed to Load Results</h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm">
          {resultsError instanceof Error ? resultsError.message : 'An error occurred while fetching the results.'}
        </p>
      </div>
    );
  }

  if (!results || !election) return <div>Data not found</div>;

  const handleExportCsv = async () => {
    try {
      setIsExportingCsv(true);
      setError(null);
      const blob = await electionResultApi.exportCsv(organizationId!, electionId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${election.slug}-results.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      setError(null);
      const blob = await electionResultApi.exportExcel(organizationId!, electionId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${election.slug}-results.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      setError(null);
      const blob = await electionResultApi.exportPdf(organizationId!, electionId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${election.slug}-results.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Election Results
            </h2>
            {isLive && <LiveBadge label="LIVE UPDATES" />}
            <ConnectionStatus compact />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {election.title}
          </p>
        </div>

        {!results.is_hidden && (
          <div className="flex flex-wrap gap-2">
            <BaseButton 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
            {isRefetching ? 'Refreshing...' : 'Refresh'}
          </BaseButton>
          
          <BaseButton 
            variant="outline" 
            size="sm" 
            onClick={handleExportCsv}
            disabled={isExportingCsv}
          >
            <Download className="w-4 h-4 mr-1.5" />
            {isExportingCsv ? 'Exporting...' : 'Export CSV'}
          </BaseButton>

          <BaseButton 
            variant="outline" 
            size="sm" 
            onClick={handleExportExcel}
            disabled={isExportingExcel}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            {isExportingExcel ? 'Exporting...' : 'Export Excel'}
          </BaseButton>

          <BaseButton 
            variant="outline" 
            size="sm" 
            onClick={handleExportPdf}
            disabled={isExportingPdf}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            {isExportingPdf ? 'Exporting...' : 'Export PDF'}
          </BaseButton>

        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {results.is_hidden ? (
        <LiveElectionIndicator isAdmin={true} />
      ) : (
        <>
          {/* Statistics Cards */}
          {results.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Total Votes Card */}
              <div className="relative bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-start space-x-4 overflow-hidden group hover:border-indigo-500/30 transition-all">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
                <div className="p-3 bg-indigo-100/80 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200/50 dark:border-indigo-500/20 shadow-sm relative z-10">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Votes Cast</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">
                    {results.statistics.total_votes_cast.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Eligible Voters Card */}
              <div className="relative bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-start space-x-4 overflow-hidden group hover:border-emerald-500/30 transition-all">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                <div className="p-3 bg-emerald-100/80 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm relative z-10">
                  <Users className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Eligible Voters</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">
                    {results.statistics.total_eligible_voters 
                      ? results.statistics.total_eligible_voters.toLocaleString() 
                      : '∞'}
                  </p>
                </div>
              </div>

              {/* Turnout Card */}
              <div className="relative bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex items-start space-x-4 overflow-hidden group hover:border-blue-500/30 transition-all">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                <div className="p-3 bg-blue-100/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200/50 dark:border-blue-500/20 shadow-sm relative z-10">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Voter Turnout</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1 tracking-tight">
                    {results.statistics.turnout_percentage !== null 
                      ? `${results.statistics.turnout_percentage.toFixed(1)}%` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 mt-8">
            {results.categories && results.categories.length > 0 ? (
              results.categories.map((category) => (
                <CategoryResultCard key={category.category_id} category={category} />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No categories found for this election.</p>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-400 text-center pt-4">
            Results generated at: {new Date(results.generated_at).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}
