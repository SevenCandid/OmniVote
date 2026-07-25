import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { BaseButton } from '@/components/ui/BaseButton';
import { CheckCircle2, Download, Home, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useElection } from '../hooks/useElections';

export default function VotingSuccessPage() {
  const { organizationId, electionId } = useParams<{ organizationId: string; electionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: election } = useElection(organizationId!, electionId!);
  
  const receiptCode = location.state?.receipt_code || 'UNAVAILABLE';
  const castAt = location.state?.cast_at ? new Date(location.state.cast_at) : new Date();

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8 animate-fade-in max-w-2xl mx-auto">
      
      {/* Success Animation & Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 mb-4 animate-scale-in">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Vote Submitted Successfully!
        </h1>
        <p className="text-lg text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          Thank you for participating in {election?.title || 'this election'}. Your ballot has been securely recorded.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm print:shadow-none print:border-black print:text-black">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            <h3 className="font-semibold">Voting Receipt</h3>
          </div>
          <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">
            OFFICIAL
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Receipt Code</p>
            <p className="text-2xl font-mono font-bold tracking-widest bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl text-center border border-zinc-100 dark:border-zinc-700">
              {receiptCode}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Date Cast</p>
              <p className="font-medium">{format(castAt, 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Time Cast</p>
              <p className="font-medium">{format(castAt, 'h:mm a')}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500">
          Please save this receipt code. It is the only way to verify that your ballot was included in the final tally without revealing your identity.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full pt-4 print:hidden">
        <BaseButton 
          variant="outline" 
          className="flex-1 py-4 text-lg"
          onClick={handlePrintReceipt}
        >
          <Download size={20} className="mr-2" />
          Save/Print Receipt
        </BaseButton>
        <BaseButton 
          className="flex-1 py-4 text-lg"
          onClick={() => navigate('/')}
        >
          <Home size={20} className="mr-2" />
          Return Home
        </BaseButton>
      </div>

    </div>
  );
}
