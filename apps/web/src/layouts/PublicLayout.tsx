import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Vote, Moon, Sun, Laptop, Menu, X } from 'lucide-react';
import { useTheme } from '../providers/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicLayout() {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
      {/* Floating Pill Header */}
      <div className="sticky top-4 z-50 w-full px-4 flex justify-center pointer-events-none transition-all duration-300">
        <header className="pointer-events-auto relative w-full max-w-6xl flex items-center justify-between h-16 px-4 sm:px-6 rounded-full border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#111111]/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 transition-transform group-hover:scale-105">
              <Vote size={18} />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight">
              Omni<span className="text-gray-500 dark:text-gray-400">Vote</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] absolute left-1/2 -translate-x-1/2">
            <Link to="/" className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
              Home
            </Link>
            <Link to="/about" className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
              About
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              Contact
            </Link>
            <Link to="/vote" className="px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
              Voter Portal
            </Link>
          </nav>

          {/* Actions & Theme Controls */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full p-1 bg-white/50 dark:bg-black/20">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-800 shadow-sm text-gray-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                aria-label="Light mode"
                title="Light Mode"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 shadow-sm text-gray-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                aria-label="Dark mode"
                title="Dark Mode"
              >
                <Moon size={14} />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-zinc-800 shadow-sm text-gray-900 dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                aria-label="System mode"
                title="System Mode"
              >
                <Laptop size={14} />
              </button>
            </div>

            <Link
              to="/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-6 py-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Toggle menu"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Mobile Menu Panel */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-20 left-0 right-0 md:hidden rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl p-4 shadow-2xl overflow-hidden origin-top"
              >
                <motion.nav 
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                    },
                    closed: {}
                  }}
                  className="flex flex-col gap-1 text-sm font-medium"
                >
                  {[
                    { name: 'Home', path: '/' },
                    { name: 'About', path: '/about' },
                    { name: 'Contact', path: '/contact' },
                    { name: 'Voter Portal', path: '/vote' }
                  ].map((item) => (
                    <motion.div
                      key={item.name}
                      variants={{
                        open: { opacity: 1, y: 0 },
                        closed: { opacity: 0, y: 10 }
                      }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                  className="flex flex-col gap-4 border-t border-gray-200 dark:border-white/10 mt-2 pt-4 px-4"
                >
                  {/* Theme Selector */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Theme</span>
                    <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full p-0.5 bg-gray-50 dark:bg-black/20">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                      >
                        <Sun size={14} />
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                      >
                        <Moon size={14} />
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-2 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-zinc-400'}`}
                      >
                        <Laptop size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold py-3 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

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
