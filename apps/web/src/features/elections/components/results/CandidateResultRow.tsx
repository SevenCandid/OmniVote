import { Trophy } from 'lucide-react';
import { CandidateResult } from '../../types';

interface CandidateResultRowProps {
  candidate: CandidateResult;
  totalVotes: number;
}

export function CandidateResultRow({ candidate }: CandidateResultRowProps) {
  const isWinner = candidate.is_winner;
  const isTied = candidate.is_tied;

  return (
    <div className={`p-4 border rounded-lg flex items-center justify-between mb-3 ${isWinner ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white border-gray-200 dark:bg-[#18181B] dark:border-gray-800'}`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 relative">
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center border border-gray-300 dark:border-gray-700">
              <span className="text-gray-500 font-medium text-lg dark:text-gray-400">
                {candidate.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isWinner && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        
        <div>
          <h4 className={`text-base font-medium ${isWinner ? 'text-indigo-900 dark:text-indigo-100 font-semibold' : 'text-gray-900 dark:text-white'}`}>
            {candidate.name}
            {isTied && isWinner && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Tied Winner</span>}
            {isTied && !isWinner && <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Tied for Rank {candidate.rank}</span>}
          </h4>
          <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Rank: {candidate.rank}</span>
            <span>&bull;</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{candidate.vote_count} votes</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {candidate.percentage.toFixed(1)}%
        </div>
        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full ${isWinner ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-500'}`}
            style={{ width: `${Math.min(100, candidate.percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
