import { Candidate } from '../../types/candidate';
import { BaseButton } from '@/components/ui/BaseButton';
import { User, CheckCircle2 } from 'lucide-react';

interface CandidateVotingCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onToggleSelection: () => void;
  onViewProfile: (candidate: Candidate) => void;
}

export const CandidateVotingCard = ({
  candidate,
  isSelected,
  onToggleSelection,
  onViewProfile
}: CandidateVotingCardProps) => {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border-2 transition-all duration-200
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
        }
      `}
    >
      {/* Top right checkmark */}
      {isSelected && (
        <div className="absolute top-4 right-4 text-primary animate-scale-in">
          <CheckCircle2 size={24} className="fill-primary text-white" />
        </div>
      )}

      <div className="p-5" onClick={onToggleSelection}>
        <div className="flex gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            {candidate.photo ? (
              <img 
                src={candidate.photo} 
                alt={candidate.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-zinc-400" />
            )}
          </div>
          
          <div className="flex-1 flex flex-col justify-center cursor-pointer">
            <div className="text-xs font-semibold text-[var(--color-neutral-muted-light)] uppercase tracking-wider mb-1">
              Candidate #{candidate.candidate_number}
            </div>
            <h3 className="text-lg sm:text-xl font-bold leading-tight mb-1">{candidate.full_name}</h3>
            {candidate.short_name && (
              <p className="text-sm text-[var(--color-neutral-secondary-light)]">{candidate.short_name}</p>
            )}
          </div>
        </div>

        {candidate.bio && (
          <p className="mt-4 text-sm text-[var(--color-neutral-secondary-light)] line-clamp-2">
            {candidate.bio}
          </p>
        )}
      </div>

      <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(candidate);
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          View Full Profile
        </button>
        
        <BaseButton 
          variant={isSelected ? "primary" : "secondary"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection();
          }}
          className="px-6 rounded-full"
        >
          {isSelected ? 'Selected' : 'Select'}
        </BaseButton>
      </div>
    </div>
  );
};
