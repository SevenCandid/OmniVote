import { useParams } from 'react-router-dom';
import { useElection, useElectionLifecycle } from '../hooks/useElections';
import { BaseCard } from '@/components/ui/BaseCard';
import { BaseButton } from '@/components/ui/BaseButton';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ExternalLink, Play, Pause, Square, CheckCircle, Clock, Eye } from 'lucide-react';
import { ElectionStatus, ResultVisibility } from '../types';
import { useUpdateElection } from '../hooks/useElections';

export default function ElectionVotingPage() {
  const { id: organizationId, electionId } = useParams<{ id: string; electionId: string }>();
  const { data: election, isLoading } = useElection(organizationId!, electionId!);
  
  const lifecycle = useElectionLifecycle();
  const updateElection = useUpdateElection();

  if (isLoading || !election) {
    return <div className="p-8 text-center animate-pulse">Loading voting settings...</div>;
  }

  const votingUrl = `${window.location.origin}/voting/${organizationId}/${electionId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(votingUrl);
    // Could add a toast here
  };

  const getStatusDisplay = () => {
    switch (election.status) {
      case ElectionStatus.DRAFT:
        return { label: 'Draft', color: 'bg-gray-100 text-gray-800', description: 'Election is not yet published.' };
      case ElectionStatus.PUBLISHED:
        return { label: 'Published', color: 'bg-blue-100 text-blue-800', description: 'Election is published but voting is not yet open.' };
      case ElectionStatus.VOTING_OPEN:
        return { label: 'Voting Open', color: 'bg-green-100 text-green-800', description: 'Voters can currently cast their ballots.' };
      case ElectionStatus.VOTING_PAUSED:
        return { label: 'Voting Paused', color: 'bg-yellow-100 text-yellow-800', description: 'Voting is temporarily suspended.' };
      case ElectionStatus.VOTING_CLOSED:
        return { label: 'Closed', color: 'bg-red-100 text-red-800', description: 'Voting has concluded.' };
      default:
        return { label: election.status, color: 'bg-gray-100 text-gray-800', description: '' };
    }
  };

  const statusDisplay = getStatusDisplay();

  const handleAction = async (action: 'publish' | 'open' | 'pause' | 'resume' | 'close') => {
    const params = { organizationId: organizationId!, electionId: electionId! };
    try {
      if (action === 'publish') await lifecycle.publish.mutateAsync(params);
      if (action === 'open') await lifecycle.openVoting.mutateAsync(params);
      if (action === 'pause') await lifecycle.pauseVoting.mutateAsync(params);
      if (action === 'resume') await lifecycle.resumeVoting.mutateAsync(params);
      if (action === 'close') await lifecycle.closeVoting.mutateAsync(params);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handlePublishResults = async () => {
    try {
      await updateElection.mutateAsync({
        organizationId: organizationId!,
        electionId: electionId!,
        data: { result_visibility: ResultVisibility.PUBLIC }
      });
    } catch (err: any) {
      alert(`Failed to publish results: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Voting Control Center</h2>
          <p className="text-[var(--color-neutral-secondary-light)] mt-1">Manage the active voting lifecycle and distribute links.</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm ${statusDisplay.color}`}>
          Status: {statusDisplay.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lifecycle Controls */}
        <div className="lg:col-span-2 space-y-6">
          <BaseCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Lifecycle Controls</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{statusDisplay.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <BaseButton
                onClick={() => handleAction('publish')}
                disabled={election.status !== ElectionStatus.DRAFT || lifecycle.publish.isPending}
                variant={election.status === ElectionStatus.DRAFT ? 'primary' : 'outline'}
                className={election.status !== ElectionStatus.DRAFT ? 'opacity-50' : ''}
              >
                <CheckCircle size={18} className="mr-2" /> Publish Election
              </BaseButton>

              <BaseButton
                onClick={() => handleAction(election.status === ElectionStatus.VOTING_PAUSED ? 'resume' : 'open')}
                disabled={!(election.status === ElectionStatus.PUBLISHED || election.status === ElectionStatus.VOTING_PAUSED) || lifecycle.openVoting.isPending || lifecycle.resumeVoting.isPending}
                className={election.status === ElectionStatus.PUBLISHED || election.status === ElectionStatus.VOTING_PAUSED ? 'bg-green-600 hover:bg-green-700' : 'opacity-50'}
                variant={election.status === ElectionStatus.PUBLISHED || election.status === ElectionStatus.VOTING_PAUSED ? 'primary' : 'outline'}
              >
                <Play size={18} className="mr-2" /> {election.status === ElectionStatus.VOTING_PAUSED ? 'Resume Voting' : 'Open Voting'}
              </BaseButton>

              <BaseButton
                onClick={() => handleAction('pause')}
                disabled={election.status !== ElectionStatus.VOTING_OPEN || lifecycle.pauseVoting.isPending}
                variant="outline"
                className={election.status === ElectionStatus.VOTING_OPEN ? 'text-yellow-600 border-yellow-600 hover:bg-yellow-50' : 'opacity-50'}
              >
                <Pause size={18} className="mr-2" /> Pause Voting
              </BaseButton>

              <BaseButton
                onClick={() => handleAction('close')}
                disabled={!(election.status === ElectionStatus.VOTING_OPEN || election.status === ElectionStatus.VOTING_PAUSED) || lifecycle.closeVoting.isPending}
                variant="outline"
                className={(election.status === ElectionStatus.VOTING_OPEN || election.status === ElectionStatus.VOTING_PAUSED) ? 'text-red-600 border-red-600 hover:bg-red-50' : 'opacity-50'}
              >
                <Square size={18} className="mr-2" /> End Voting
              </BaseButton>

              <BaseButton
                onClick={handlePublishResults}
                disabled={election.result_visibility === ResultVisibility.PUBLIC || updateElection.isPending}
                className={election.result_visibility !== ResultVisibility.PUBLIC ? 'bg-blue-600 hover:bg-blue-700' : 'opacity-50'}
                variant={election.result_visibility !== ResultVisibility.PUBLIC ? 'primary' : 'outline'}
              >
                <Eye size={18} className="mr-2" /> Publish Results
              </BaseButton>
            </div>
          </BaseCard>
          
          {/* Turnout Telemetry Placeholder */}
          <BaseCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Live Turnout</h3>
            <div className="flex items-center justify-center p-12 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
              <div className="text-center">
                <Clock size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">Turnout telemetry will appear here once voting opens.</p>
              </div>
            </div>
          </BaseCard>
        </div>

        {/* Right Column: Distribution Link & QR */}
        <div className="space-y-6">
          <BaseCard className="p-6 text-center">
            <h3 className="text-lg font-bold mb-4">Distribution</h3>
            
            <div className="bg-white p-4 rounded-2xl inline-block shadow-sm border border-gray-100 mb-6">
              <QRCodeSVG 
                value={votingUrl} 
                size={200}
                level="Q"
                includeMargin={false}
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Scan QR Code or copy link below:</p>
              
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 p-2 rounded-lg border border-gray-200 dark:border-zinc-800">
                <input 
                  type="text" 
                  readOnly 
                  value={votingUrl} 
                  className="flex-1 bg-transparent text-sm outline-none px-2 text-gray-600 dark:text-gray-400 truncate"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-600"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
              </div>
              
              <a 
                href={votingUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Open Voting Portal <ExternalLink size={16} className="ml-1.5" />
              </a>
            </div>
          </BaseCard>
        </div>

      </div>
    </div>
  );
}
