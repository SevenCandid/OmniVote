import { Outlet } from 'react-router-dom';
import { Vote } from 'lucide-react';

export default function VotingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
      {/* Distraction-free top bar */}
      <header className="sticky top-0 z-50 w-full h-16 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
            <Vote size={16} />
          </div>
          <span className="font-sans font-bold tracking-tight text-base">
            Omni<span className="text-primary">Vote</span>
          </span>
          <span className="text-xs border-l border-zinc-300 dark:border-zinc-700 pl-2 ml-1 text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            Voter Portal
          </span>
        </div>
        
        {/* Secure connection badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Secure Session</span>
        </div>
      </header>

      {/* Main Ballot Container */}
      <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Powered by VeroSeven footer */}
      <footer className="w-full py-6 text-center border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white dark:bg-[#18181B]">
        <p className="text-[11px] text-[var(--color-neutral-muted-light)] uppercase tracking-[1.5px]">
          Powered by <span className="font-semibold text-primary">VeroSeven</span>
        </p>
      </footer>
    </div>
  );
}
