import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/publicApi';
import { useVotingSession, useSaveDraft } from '../hooks/useVoting';
import { useCandidates } from '../hooks/useCandidates';
import { BaseButton } from '@/components/ui/BaseButton';
import { BaseDialog } from '@/components/ui/BaseDialog';
import { CandidateVotingCard } from '../components/voting/CandidateVotingCard';
import { Candidate } from '../types/candidate';
import { ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { VotingSelectionItem } from '../types/voting';

export default function VotingSessionPage() {
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
  const { mutateAsync: saveDraft, isPending: savingDraft } = useSaveDraft(organizationId!, electionId!, sessionId!);

  const categories = categoriesResp || [];
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selections, setSelections] = useState<VotingSelectionItem[]>([]);
  const [profileModalCandidate, setProfileModalCandidate] = useState<Candidate | null>(null);

  // Initialize selections from session once it loads
  useEffect(() => {
    if (session && selections.length === 0 && session.selections.length > 0) {
      setSelections(session.selections);
    }
  }, [session]);

  const currentCategory = categories[currentCategoryIndex];
  
  // Fetch candidates for current category
  const { data: candidatesResp, isLoading: loadingCandidates } = useCandidates(
    organizationId!, 
    electionId!, 
    currentCategory?.id || ''
  );
  // useCandidates returns Candidate[] not { items: Candidate[] } according to useCandidates.ts
  const candidates: Candidate[] = candidatesResp || [];

  if (loadingElection || loadingCategories || loadingSession) {
    return <div className="p-8 text-center animate-pulse">Loading voting session...</div>;
  }

  if (!election || !session || categories.length === 0) {
    return <div className="p-8 text-center text-red-500">Invalid session or election configuration.</div>;
  }

  const currentCategorySelections = selections.filter(s => s.category_id === currentCategory.id);
  const maxWinners = currentCategory.max_winners || 1;

  const handleToggleSelection = (candidateId: string) => {
    setSelections(prev => {
      const isSelected = prev.some(s => s.category_id === currentCategory.id && s.candidate_id === candidateId);
      
      if (isSelected) {
        // Deselect
        return prev.filter(s => !(s.category_id === currentCategory.id && s.candidate_id === candidateId));
      } else {
        // Select
        if (currentCategorySelections.length >= maxWinners) {
          // If FPTP (max 1), swap the selection. Otherwise, block it or swap if we implement a queue.
          if (maxWinners === 1) {
            const filtered = prev.filter(s => s.category_id !== currentCategory.id);
            return [...filtered, { category_id: currentCategory.id, candidate_id: candidateId }];
          } else {
            return prev; // Exceeds max winners, do nothing. (Could show a toast)
          }
        }
        return [...prev, { category_id: currentCategory.id, candidate_id: candidateId }];
      }
    });
  };

  const handleNext = async () => {
    try {
      // Save draft
      await saveDraft({ selections });
      
      if (currentCategoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        navigate(`/voting/${organizationId}/${electionId}/session/${sessionId}/review`);
      }
    } catch (error: any) {
      alert(error.message || "Failed to save your selections. Your session may have expired.");
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const progressPercentage = ((currentCategoryIndex) / categories.length) * 100;

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          <span>Position {currentCategoryIndex + 1} of {categories.length}</span>
          <span>{Math.round(progressPercentage)}% Completed</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Category Header */}
      <div className="text-center py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl sm:text-2xl font-extrabold">{currentCategory.name}</h2>
        <p className="text-[var(--color-neutral-secondary-light)] mt-2">
          {currentCategory.description || 'Select your preferred candidate'}
        </p>
        
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
          <AlertCircle size={16} />
          <span>
            {maxWinners === 1 
              ? 'Choose 1 candidate' 
              : `Choose up to ${maxWinners} candidates`}
          </span>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {loadingCandidates ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl">
            <p className="text-zinc-500">No candidates available for this position.</p>
          </div>
        ) : (
          candidates.map((candidate: Candidate) => (
            <CandidateVotingCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selections.some(s => s.candidate_id === candidate.id)}
              onToggleSelection={() => handleToggleSelection(candidate.id)}
              onViewProfile={setProfileModalCandidate}
            />
          ))
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-4 z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <BaseButton 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0 || savingDraft}
            className="rounded-full"
          >
            <ChevronLeft size={20} className="mr-1" />
            Previous
          </BaseButton>

          <BaseButton 
            onClick={handleNext}
            disabled={savingDraft || (maxWinners > 1 && currentCategorySelections.length > maxWinners)}
            className="rounded-full px-8"
          >
            {savingDraft ? 'Saving...' : currentCategoryIndex === categories.length - 1 ? 'Review Ballot' : 'Next'}
            {!savingDraft && <ChevronRight size={20} className="ml-1" />}
          </BaseButton>
        </div>
      </div>

      {/* Candidate Profile Modal */}
      <BaseDialog 
        isOpen={!!profileModalCandidate} 
        onClose={() => setProfileModalCandidate(null)}
        title={profileModalCandidate?.full_name || 'Candidate Profile'}
      >
        {profileModalCandidate && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
              {profileModalCandidate.photo && (
                <img src={profileModalCandidate.photo} alt="" className="w-24 h-24 rounded-xl object-cover" />
              )}
              <div>
                <div className="text-sm text-primary font-semibold uppercase tracking-wider mb-1">
                  Candidate #{profileModalCandidate.candidate_number}
                </div>
                <h3 className="text-xl font-bold">{profileModalCandidate.full_name}</h3>
                <p className="text-zinc-500">{currentCategory.name}</p>
              </div>
            </div>
            
            {profileModalCandidate.bio && (
              <div>
                <h4 className="font-semibold mb-2">Biography</h4>
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{profileModalCandidate.bio}</p>
              </div>
            )}
            
            {profileModalCandidate.manifesto && (
              <div>
                <h4 className="font-semibold mb-2">Manifesto</h4>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {profileModalCandidate.manifesto}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <BaseButton 
                onClick={() => {
                  handleToggleSelection(profileModalCandidate.id);
                  setProfileModalCandidate(null);
                }}
              >
                {selections.some(s => s.candidate_id === profileModalCandidate.id) ? 'Deselect Candidate' : 'Select Candidate'}
              </BaseButton>
            </div>
          </div>
        )}
      </BaseDialog>
    </div>
  );
}
