import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';
import { useCategories } from '../hooks/useElections';
import { useVotingSession, useSubmitBallot } from '../hooks/useVoting';
import { useInitiatePayment } from '../hooks/usePayments';
import { BaseButton } from '@/components/ui/BaseButton';
import { CheckCircle2, ChevronLeft, AlertTriangle, CreditCard, User } from 'lucide-react';
import { VotingSelectionItem } from '../types/voting';
import { useCandidates } from '../hooks/useCandidates';
import { useState } from 'react';

const CandidateReviewName = ({ organizationId, electionId, categoryId, candidateId }: { organizationId: string, electionId: string, categoryId: string, candidateId: string }) => {
  const { data: candidates } = useCandidates(organizationId, electionId, categoryId);
  const candidate = candidates?.find(c => c.id === candidateId);
  
  if (!candidate) return <span className="font-medium text-sm sm:text-base">Candidate ID: {candidateId.substring(0, 8)}...</span>;
  
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
        {candidate.photo ? <img src={candidate.photo} className="w-full h-full object-cover" /> : <User size={16} className="text-zinc-400" />}
      </div>
      <span className="font-medium text-sm sm:text-base">{candidate.full_name}</span>
    </div>
  );
};

export default function VotingReviewPage() {
  const { organizationId, electionId, sessionId } = useParams<{ organizationId: string; electionId: string; sessionId: string }>();
  const navigate = useNavigate();

  const { data: election, isLoading: loadingElection } = useQuery({
    queryKey: ['public-election', electionId],
    queryFn: () => publicApi.getElection(electionId!),
    enabled: !!electionId,
  });
  const { data: categoriesResp, isLoading: loadingCategories } = useQuery({
    queryKey: ['public-categories', electionId],
    queryFn: () => publicApi.getCategories(electionId!),
    enabled: !!electionId,
  });
  const { data: session, isLoading: loadingSession } = useVotingSession(organizationId!, electionId!, sessionId);
  const { mutateAsync: submitBallot, isPending: submitting } = useSubmitBallot(organizationId!, electionId!, sessionId!);
  const { mutateAsync: initiatePayment } = useInitiatePayment(electionId!);
  
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Note: We need all candidates across all categories to render the review page properly.
  // In a real implementation we could have a `useAllElectionCandidates` hook, but for now we'll
  // assume the candidates are fetched per category in the underlying components. Since we only
  // need their names and photos here, we might need to rely on what's available or fetch them all.
  // We'll create a simple way to render it: if we don't have candidate details, we'll just show the ID.
  // Since CandidateVotingCard loaded them earlier, some might be in React Query cache.
  // To keep it simple, we'll just show Candidate details we can fetch or a placeholder.
  
  if (loadingElection || loadingCategories || loadingSession) {
    return <div className="p-8 text-center animate-pulse">Loading review...</div>;
  }

  if (!election || !session || !categoriesResp) {
    return <div className="p-8 text-center text-red-500">Invalid session data.</div>;
  }

  const categories = categoriesResp;
  const selections = session.selections || [];

  const handleEdit = (categoryIndex?: number) => {
    navigate(`/voting/${organizationId}/${electionId}/session/${sessionId}${categoryIndex !== undefined ? `?step=${categoryIndex}` : ''}`);
  };

  const executeSubmit = async () => {
    try {
      const response: any = await submitBallot();
      navigate(`/voting/${organizationId}/${electionId}/session/${sessionId}/success`, {
        state: { receipt_code: response.receipt_code, cast_at: response.cast_at }
      });
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit ballot. Please try again: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitClick = () => {
    if (election.is_paid) {
      setShowPayment(true);
    } else {
      executeSubmit();
    }
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    try {
      const totalAmount = selections.length * (election.cost_per_vote || 1.0);
      const payment = await initiatePayment({
        amount: totalAmount,
        currency: election.currency || 'USD',
        provider: 'mock'
      });
      
      // Mock verify
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/voting/payments/verify/${payment.reference}?provider=mock&cost_per_vote=${election.cost_per_vote || 1.0}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      await executeSubmit();
    } catch (e: any) {
      alert("Payment failed: " + e.message);
      setProcessing(false);
    }
  };

  // Find missed categories
  const missedCategories = categories.filter(c => 
    !selections.some((s: VotingSelectionItem) => s.category_id === c.id) && c.category_type === 'position'
  );

  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Review Your Ballot
        </h1>
        <p className="text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] max-w-lg mx-auto">
          Please review your selections carefully. Once you submit your ballot, it cannot be changed.
        </p>
      </div>

      {missedCategories.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl flex items-start gap-3 border border-amber-200 dark:border-amber-800/30">
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold mb-1">You have left some positions blank:</p>
            <ul className="list-disc list-inside">
              {missedCategories.map(c => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
            <p className="mt-2">You may still submit your ballot, or go back to make selections.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category, index) => {
          const categorySelections = selections.filter((s: VotingSelectionItem) => s.category_id === category.id);
          
          return (
            <div key={category.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-lg font-bold">{category.name}</h3>
                <button 
                  onClick={() => handleEdit(index)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Edit
                </button>
              </div>

              {categorySelections.length === 0 ? (
                <p className="text-zinc-500 italic text-sm">No candidate selected (Abstain)</p>
              ) : (
                <div className="space-y-3">
                  {categorySelections.map((sel: VotingSelectionItem) => (
                    <div key={sel.candidate_id} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      <CandidateReviewName 
                        organizationId={organizationId!} 
                        electionId={electionId!} 
                        categoryId={sel.category_id} 
                        candidateId={sel.candidate_id} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showPayment ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <CreditCard size={32} />
              </div>
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <p className="text-zinc-500">
                You have selected {selections.length} candidates.
              </p>
              <div className="text-4xl font-black py-4 border-y border-zinc-100 dark:border-zinc-800">
                {election.currency} {selections.length * (election.cost_per_vote || 1.0)}
              </div>
            </div>
            
            <div className="space-y-3">
              <BaseButton 
                className="w-full h-14 text-lg font-bold"
                onClick={handleProcessPayment}
                isLoading={processing}
                disabled={processing}
              >
                Pay Now
              </BaseButton>
              <BaseButton 
                variant="ghost" 
                className="w-full h-12"
                onClick={() => setShowPayment(false)}
                disabled={processing}
              >
                Cancel
              </BaseButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-4 z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <BaseButton 
            variant="outline" 
            onClick={() => handleEdit(categories.length - 1)}
            disabled={submitting}
            className="rounded-full"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Voting
          </BaseButton>

          <BaseButton 
            onClick={handleSubmitClick}
            disabled={submitting || processing}
            className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
          >
            {submitting ? 'Submitting...' : election.is_paid ? 'Proceed to Payment' : 'Submit Final Ballot'}
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
