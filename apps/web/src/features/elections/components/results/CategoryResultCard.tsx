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
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#18181B]/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Users className="w-4 h-4 mr-1.5" />
            {category.total_votes.toLocaleString()} total valid votes
          </p>
        </div>
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>
      
      <div className="p-6">
        {sortedCandidates.length > 0 ? (
          <div className="space-y-1">
            {sortedCandidates.map((candidate) => (
              <CandidateResultRow 
                key={candidate.candidate_id} 
                candidate={candidate} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No candidates found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
