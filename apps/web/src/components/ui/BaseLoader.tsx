import { Vote } from 'lucide-react';

export function BaseLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 select-none">
      <div className="relative flex items-center justify-center">
        {/* Progress Ring spinning */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* Core Shield Logo */}
        <div className="absolute w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <Vote size={16} />
        </div>
      </div>
      <p className="text-xs font-semibold text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] tracking-wider uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}
