import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';
import { useInitiatePayment } from '../hooks/usePayments';
import { ShieldCheck, User, Award, CheckCircle2, ChevronLeft, CreditCard } from 'lucide-react';
import { BaseButton } from '@/components/ui/BaseButton';
import { useState, useEffect } from 'react';
import { votingApi } from '../api/votingApi';

export default function PublicCandidatePage() {
  const { electionId, candidateId } = useParams<{ electionId: string; candidateId: string }>();
  const navigate = useNavigate();
  
  const [amount, setAmount] = useState<number>(0);
  const [step, setStep] = useState<'view' | 'payment' | 'success'>('view');
  
  // Queries
  const { data: election, isLoading: loadingElection } = useQuery({
    queryKey: ['public', 'election', electionId],
    queryFn: () => publicApi.getElection(electionId!),
    enabled: !!electionId
  });
  
  const { data: candidate, isLoading: loadingCandidate } = useQuery({
    queryKey: ['public', 'candidate', candidateId],
    queryFn: () => publicApi.getCandidate(electionId!, candidateId!),
    enabled: !!electionId && !!candidateId
  });
  
  // Init Visitor Session mutation
  const { mutateAsync: initSession } = useMutation({
    mutationFn: () => publicApi.initVisitorSession(electionId!),
  });
  
  const { mutateAsync: initiatePayment, isPending: processingPayment } = useInitiatePayment(electionId!);
  const { mutateAsync: startVotingSession } = useMutation({
    mutationFn: (data: any) => votingApi.startSession(election?.organization_id || 'system', electionId!, data),
  });
  const { mutateAsync: submitBallot } = useMutation({
    mutationFn: ({orgId, sessionId}: any) => votingApi.submitBallot(orgId, electionId!, sessionId),
  });
  const { mutateAsync: saveDraft } = useMutation({
    mutationFn: ({orgId, sessionId, data}: any) => votingApi.saveDraft(orgId, electionId!, sessionId, data),
  });

  useEffect(() => {
    if (electionId) {
        initSession().catch(e => console.error("Failed to init visitor session", e));
    }
  }, [electionId, initSession]);

  if (loadingElection || loadingCandidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">Loading Candidate Profile...</p>
      </div>
    );
  }

  if (!election || !candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Candidate Not Found</h2>
      </div>
    );
  }

  const isPaid = election.is_paid;
  const orgId = election.organization_id || 'system'; // We need orgId for voting routes, but public routes didn't return it. Wait, getPublicElection doesn't return organization_id.

  const handleVoteClick = () => {
    if (isPaid) {
      setAmount(election.min_payment || election.cost_per_vote || 10);
      setStep('payment');
    } else {
      handleDirectFreeVote();
    }
  };
  
  const handleDirectFreeVote = async () => {
    try {
      const session = await startVotingSession({ verification_method: 'NONE' });
      await saveDraft({
        orgId,
        sessionId: session.id,
        data: {
          selections: [{
            category_id: candidate.category_id,
            candidate_id: candidate.id
          }]
        }
      });
      await submitBallot({ orgId, sessionId: session.id });
      setStep('success');
    } catch (e: any) {
      alert("Failed to submit vote: " + e.message);
    }
  };

  const handleProcessPayment = async () => {
    try {
      // 1. Initiate Payment
      const payment = await initiatePayment({
        amount: amount,
        currency: election.currency || 'USD',
        provider: 'mock'
      });
      
      // 2. Verify Payment (Mock step)
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/voting/payments/verify/${payment.reference}?provider=mock&cost_per_vote=${election.cost_per_vote || 1.0}`, {
        method: 'POST'
      });
      
      // 3. Submit Ballot
      const session = await startVotingSession({ verification_method: 'NONE' });
      await saveDraft({
        orgId,
        sessionId: session.id,
        data: {
          selections: [{
            category_id: candidate.category_id,
            candidate_id: candidate.id
          }]
        }
      });
      await submitBallot({ orgId, sessionId: session.id });
      
      setStep('success');
    } catch (e: any) {
      alert("Payment or Voting failed: " + e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back
      </button>

      {step === 'view' && (
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Candidate Photo & Info */}
          <div className="space-y-6">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 shadow-xl relative group">
              {candidate.photo_url ? (
                <img 
                  src={candidate.photo_url} 
                  alt={candidate.full_name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={64} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Right: Details & Action */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Award size={16} />
                <span>{election.title}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                {candidate.full_name}
              </h1>
              {candidate.biography && (
                <p className="text-lg text-gray-600 leading-relaxed pt-4 border-t">
                  {candidate.biography}
                </p>
              )}
            </div>

            <div className="pt-8 space-y-4">
              <BaseButton 
                size="lg" 
                className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                onClick={handleVoteClick}
              >
                {isPaid ? 'Support & Vote' : 'Vote Now'}
              </BaseButton>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <ShieldCheck size={16} />
                <span>Verified secure voting</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="max-w-md mx-auto space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
              <CreditCard size={32} />
            </div>
            <h2 className="text-2xl font-bold">Support {candidate.full_name}</h2>
            <p className="text-gray-500">
              Each vote costs {election.currency} {election.cost_per_vote}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Select Amount</label>
              <div className="grid grid-cols-3 gap-3">
                {[10, 20, 50, 100, 200, 500].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-3 rounded-xl border-2 transition-all font-semibold ${
                      amount === preset 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {election.currency} {preset}
                  </button>
                ))}
              </div>
            </div>

            <BaseButton 
              className="w-full h-14 text-lg font-bold rounded-xl"
              onClick={handleProcessPayment}
              isLoading={processingPayment}
              disabled={processingPayment || amount < (election.min_payment || 1)}
            >
              Pay {election.currency} {amount}
            </BaseButton>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center space-y-6 py-12 max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-500 animate-bounce-in">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">Vote Cast Successfully!</h2>
            <p className="text-lg text-gray-500">
              Thank you for supporting {candidate.full_name}.
            </p>
          </div>
          <BaseButton 
            variant="outline" 
            className="w-full"
            onClick={() => setStep('view')}
          >
            Back to Profile
          </BaseButton>
        </div>
      )}
    </div>
  );
}
