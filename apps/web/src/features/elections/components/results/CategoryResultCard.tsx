import { CategoryResult } from '../../types';
import { CandidateResultRow } from './CandidateResultRow';
import { Users, BarChart3 } from 'lucide-react';

interface CategoryResultCardProps {
  category: CategoryResult;
}

export function CategoryResultCard({ category }: CategoryResultCardProps) {
  // Sort candidates by rank (which should already be done by backend, but just to be safe)
  const sortedCandidates = [...category.candidates].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return b.vote_count - a.vote_count; // Secondary sort if ranks are equal somehow (though rank handles ties usually)
  });

  return (
    <div className="bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all">
      <div className="px-6 py-5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center relative overflow-hidden">
        {/* Subtle mesh background element for header */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {category.name}
          </h3>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center mt-1">
            <Users className="w-4 h-4 mr-1.5 opacity-70" />
            {category.total_votes.toLocaleString()} total valid votes
          </p>
        </div>
        <div className="relative z-10 p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>
      
      <div className="p-6 relative">
        {/* Subtle inner background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
        
        {sortedCandidates.length > 0 ? (
          <div className="space-y-1 relative z-10">
            {sortedCandidates.map((candidate) => (
              <CandidateResultRow 
                key={candidate.candidate_id} 
                candidate={candidate} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 relative z-10">
            No candidates found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
