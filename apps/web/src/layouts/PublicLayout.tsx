import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Vote, Moon, Sun, Laptop, Menu, X } from 'lucide-react';
import { useTheme } from '../providers/theme-provider';

export default function PublicLayout() {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Vote size={18} />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight">
              Omni<span className="text-primary">Vote</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link
              to="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <Link to="/vote" className="hover:text-primary transition-colors">
              Voter Portal
            </Link>
          </nav>

          {/* Actions & Theme Controls */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-full p-1 bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)]">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                aria-label="Light mode"
                title="Light Mode"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                aria-label="Dark mode"
                title="Dark Mode"
              >
                <Moon size={14} />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-400 hover:text-zinc-600'}`}
                aria-label="System mode"
                title="System Mode"
              >
                <Laptop size={14} />
              </button>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary text-white text-sm font-semibold px-5 py-2 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-label="Toggle menu"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white dark:bg-[#18181B] px-4 pt-2 pb-6 space-y-4 animate-fade-in">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/vote"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Voter Portal
              </Link>
            </nav>

            <div className="flex flex-col gap-4 border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] pt-4 px-3">
              {/* Theme Selector */}
              <div className="flex items-center justify-between text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
                <span>Interface Theme</span>
                <div className="flex items-center border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-full p-0.5 bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)]">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400'}`}
                    title="Light Mode"
                    aria-label="Light Mode"
                  >
                    <Sun size={12} />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400'}`}
                    title="Dark Mode"
                    aria-label="Dark Mode"
                  >
                    <Moon size={12} />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400'}`}
                    title="System Mode"
                    aria-label="System Mode"
                  >
                    <Laptop size={12} />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-full bg-primary text-white text-sm font-semibold py-2.5 hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white dark:bg-[#18181B] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[var(--color-neutral-muted-light)] uppercase tracking-[1.5px]">
            Powered by{' '}
            <span className="font-semibold text-primary">VeroSeven</span>
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/docs" className="hover:text-primary transition-colors">
              Documentation
            </Link>
            <Link
              to="/manifesto"
              className="hover:text-primary transition-colors"
            >
              Manifesto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
