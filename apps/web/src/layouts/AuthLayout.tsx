import { Outlet, Link } from 'react-router-dom';
import { Vote } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
      {/* Centered content block */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Vote size={20} />
          </div>
          <span className="font-sans font-bold text-2xl tracking-tight">
            Omni<span className="text-primary">Vote</span>
          </span>
        </Link>
        
        <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-2xl shadow-sm p-6 sm:p-8">
          <Outlet />
        </div>
      </div>
      
      {/* Powered by VeroSeven footer */}
      <footer className="w-full py-6 text-center border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
        <p className="text-[11px] text-[var(--color-neutral-muted-light)] uppercase tracking-[1.5px]">
          Powered by <span className="font-semibold text-primary">VeroSeven</span>
        </p>
      </footer>
    </div>
  );
}
