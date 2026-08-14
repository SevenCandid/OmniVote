import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';
import { useStartSession } from '../hooks/useVoting';
import { BaseButton } from '@/components/ui/BaseButton';
import { VerificationMethod } from '../types/voting';
import { ArrowRight, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function VotingWelcomePage() {
  const { organizationId, electionId } = useParams<{ organizationId: string; electionId: string }>();
  const navigate = useNavigate();
  const { data: election, isLoading } = useQuery({
    queryKey: ['public-election', electionId],
    queryFn: () => publicApi.getElection(electionId!),
    enabled: !!electionId,
  });
  const { mutateAsync: startSession, isPending } = useStartSession(organizationId!, electionId!);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">Loading Election Details...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Election Not Found</h2>
      </div>
    );
  }

  const handleStartVoting = async () => {
    try {
      setError(null);
      // For now we assume PUBLIC verification as placeholder.
      // In production, this would trigger verification flow first (login, OTP, etc.)
      const session: any = await startSession({
        verification_method: VerificationMethod.PUBLIC,
      });
      navigate(`/voting/${organizationId}/${electionId}/session/${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start voting session');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Welcome to {election.title}
        </h1>
        {election.description && (
          <p className="text-lg text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            {election.description}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h3 className="text-lg font-semibold border-b border-zinc-100 dark:border-zinc-800 pb-4">
          Before you begin
        </h3>
        
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
            <span className="text-sm">You will vote across all required positions/categories.</span>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <span className="text-sm">Estimated Time: 2–3 minutes. Your session will expire after 15 minutes of inactivity.</span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="text-purple-500 shrink-0 mt-0.5" size={20} />
            <span className="text-sm">
              Your ballot is anonymous {election.allow_anonymous_voting ? '(Enabled)' : '(Disabled)'}.
              Once submitted, your vote cannot be changed.
            </span>
          </li>
        </ul>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="pt-4">
          <BaseButton 
            className="w-full text-lg py-6 rounded-2xl group flex items-center justify-center"
            onClick={handleStartVoting}
            disabled={isPending}
          >
            {isPending ? 'Starting Session...' : 'Start Voting'}
            {!isPending && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />}
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
