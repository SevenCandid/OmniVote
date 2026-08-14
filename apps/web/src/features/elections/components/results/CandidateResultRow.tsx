import { Trophy } from 'lucide-react';
import { CandidateResult } from '../../types';

interface CandidateResultRowProps {
  candidate: CandidateResult;
}

export function CandidateResultRow({ candidate }: CandidateResultRowProps) {
  const isWinner = candidate.is_winner;
  const isTied = candidate.is_tied;

  // Add subtle glow and animation classes if winner
  const containerClasses = isWinner 
    ? 'relative p-4 border border-indigo-500/30 dark:border-indigo-400/30 rounded-xl flex items-center justify-between mb-3 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-[0_0_15px_rgba(99,102,241,0.1)] dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-md overflow-hidden transition-all' 
    : 'relative p-4 border border-zinc-200 dark:border-zinc-800/60 rounded-xl flex items-center justify-between mb-3 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md transition-all hover:bg-white dark:hover:bg-zinc-900/60';

  return (
    <div className={containerClasses}>
      {/* Subtle winner gradient background */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent dark:from-indigo-400/5 pointer-events-none" />
      )}

      <div className="flex items-center space-x-4 relative z-10">
        <div className="flex-shrink-0 relative">
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className={`h-12 w-12 rounded-full object-cover border-2 ${isWinner ? 'border-indigo-400 dark:border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'border-zinc-200 dark:border-zinc-700'}`}
            />
          ) : (
            <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${isWinner ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] text-indigo-600 dark:text-indigo-300' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
              <span className="font-bold text-lg">
                {candidate.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isWinner && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-pulse-slow">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        
        <div>
          <h4 className={`text-base flex items-center gap-2 ${isWinner ? 'text-indigo-900 dark:text-indigo-100 font-bold tracking-tight' : 'text-zinc-900 dark:text-white font-semibold tracking-tight'}`}>
            {candidate.name}
            {isTied && isWinner && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30 tracking-wider">Tied Winner</span>}
            {isTied && !isWinner && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 tracking-wider">Tied (Rank {candidate.rank})</span>}
          </h4>
          <div className="flex items-center mt-0.5 space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{candidate.vote_count.toLocaleString()} votes</span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span>Rank: {candidate.rank}</span>
          </div>
        </div>
      </div>

      <div className="text-right min-w-[120px] relative z-10">
        <div className={`text-lg font-bold tracking-tight ${isWinner ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-white'}`}>
          {candidate.percentage.toFixed(1)}%
        </div>
        <div className="w-full h-2 bg-zinc-200/50 dark:bg-zinc-800/80 rounded-full mt-1.5 overflow-hidden backdrop-blur-sm border border-zinc-200/20 dark:border-zinc-700/30">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-zinc-400 dark:bg-zinc-500'}`}
            style={{ width: `${Math.min(100, candidate.percentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
