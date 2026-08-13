import { useParams } from 'react-router-dom';
import { useElection, useCategories } from '../hooks/useElections';
import { useCandidates } from '../hooks/useCandidates';
import { BaseLoader } from '@/components/ui/BaseLoader';
import { CandidateVotingCard } from '../components/voting/CandidateVotingCard';
import { Candidate } from '../types/candidate';
import { AlertTriangle, Users, ShieldCheck, Info } from 'lucide-react';
import { useState } from 'react';

// Wrapper component to load candidates for each category in the preview
const CategoryPreviewSection = ({ orgId, electionId, category }: { orgId: string, electionId: string, category: any }) => {
  const { data: candidates, isLoading } = useCandidates(orgId, electionId, category.id);
  const [selections, setSelections] = useState<string[]>([]);
  
  if (isLoading) return <div className="h-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />;
  
  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-red-200 bg-red-50 text-red-600 rounded-2xl dark:bg-red-900/10 dark:border-red-800/30">
        <AlertTriangle className="mx-auto mb-2" size={24} />
        <p className="font-medium">No candidates in this position</p>
        <p className="text-sm mt-1">This position will appear empty on the ballot. Please add candidates.</p>
      </div>
    );
  }

  const handleToggle = (id: string) => {
    setSelections(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= (category.max_winners || 1)) {
        if (category.max_winners === 1) return [id];
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-4">
      {candidates.map((candidate: Candidate) => (
        <CandidateVotingCard
          key={candidate.id}
          candidate={candidate}
          isSelected={selections.includes(candidate.id)}
          onToggleSelection={() => handleToggle(candidate.id)}
          onViewProfile={() => {
            alert("This is a preview. The full profile modal will open here for voters.");
          }}
        />
      ))}
    </div>
  );
};

export default function ElectionBallotPage() {
  const { id: organizationId, electionId } = useParams<{
    id: string;
    electionId: string;
  }>();

  const { data: election, isLoading: isElectionLoading } = useElection(
    organizationId!,
    electionId!
  );

  const { data: categories, isLoading: isCategoriesLoading } = useCategories(
    organizationId!,
    electionId!
  );

  if (isElectionLoading || isCategoriesLoading) return <BaseLoader />;
  if (!election) return <div>Election not found</div>;

  const hasNoCategories = !categories || categories.length === 0;

  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex items-start gap-4 shadow-sm">
           <div className={`p-3 rounded-xl ${election.allow_anonymous_voting ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
              <Users size={24} />
           </div>
           <div>
              <h3 className="font-semibold text-lg">Anonymous Voting</h3>
              <p className="text-sm text-gray-500 mt-1">
                {election.allow_anonymous_voting 
                  ? "Voters will not be tied to their ballots. Full anonymity is enabled."
                  : "Voters will be identifiable through their ballot submissions."}
              </p>
           </div>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex items-start gap-4 shadow-sm">
           <div className={`p-3 rounded-xl ${election.require_voter_verification ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
              <ShieldCheck size={24} />
           </div>
           <div>
              <h3 className="font-semibold text-lg">Voter Verification</h3>
              <p className="text-sm text-gray-500 mt-1">
                {election.require_voter_verification 
                  ? `Enabled. Using method: ${election.public_verification_method?.replace('_', ' ') || 'Default'}`
                  : "Anyone with the link can attempt to vote."}
              </p>
           </div>
        </div>
      </div>

      {hasNoCategories && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 p-6 rounded-xl flex items-start gap-4 text-red-800 dark:text-red-400">
          <AlertTriangle size={24} className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Invalid Ballot Configuration</h3>
            <p className="mt-1 text-sm">
              You have not created any positions/categories for this election. Voters will not be able to cast a ballot until you set up at least one position and add candidates.
            </p>
          </div>
        </div>
      )}

      {/* Ballot Preview */}
      <div className="bg-zinc-50 dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="bg-white dark:bg-zinc-900 p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Ballot Preview</h2>
            <p className="text-sm text-zinc-500 mt-1">This is an interactive preview of how the ballot appears to voters.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">
            <Info size={16} /> Interactive Mode
          </div>
        </div>

        <div className="p-6 md:p-10">
          {hasNoCategories ? (
             <div className="text-center py-20 text-zinc-400">
               <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                 <AlertTriangle size={32} />
               </div>
               <p>The ballot is currently empty.</p>
             </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-12">
              {categories.map((category: any, index: number) => (
                <div key={category.id} className="space-y-6">
                  {/* Step Indicator Simulation */}
                  <div className="flex justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    <span>Position {index + 1} of {categories.length}</span>
                  </div>

                  <div className="text-center pb-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-2xl font-black">{category.name}</h3>
                    <p className="text-zinc-500 mt-2">
                      {category.description || 'Select your preferred candidate'}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                      <span>Choose {category.max_winners === 1 ? '1 candidate' : `up to ${category.max_winners} candidates`}</span>
                    </div>
                  </div>

                  <CategoryPreviewSection 
                    orgId={organizationId!} 
                    electionId={electionId!} 
                    category={category} 
                  />
                </div>
              ))}

              <div className="pt-8 flex justify-center">
                <button disabled className="px-8 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-bold rounded-full cursor-not-allowed">
                  Submit Ballot (Disabled in preview)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
