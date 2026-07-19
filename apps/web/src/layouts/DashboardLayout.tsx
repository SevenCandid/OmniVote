import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Vote,
  Menu,
  X,
  Home,
  Building2,
  Calendar,
  CreditCard,
  Settings,
  FileText,
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Sun,
  Moon,
  Mail,
} from 'lucide-react';
import { useSidebarStore } from '../stores/sidebarStore';
import { useTheme } from '../providers/theme-provider';
import { useSessionStore } from '../stores/sessionStore';
import { identityApi } from '../features/identity/services/identityApi';

export default function DashboardLayout() {
  const { isOpen, toggle } = useSidebarStore();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useSessionStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await identityApi.logout();
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      logout();
    }
  };

  // Helper to detect active paths
  const isActive = (path: string) => location.pathname.startsWith(path) && (path !== '/dashboard' || location.pathname === '/dashboard');

  // Sidebar Menu Items
  const menuItems = [
    { title: 'Home', path: '/dashboard', icon: Home },
    { title: 'Organizations', path: '/dashboard/organizations', icon: Building2 },
    { title: 'Invitations', path: '/dashboard/invitations', icon: Mail },
    { title: 'Elections', path: '/dashboard/elections', icon: Calendar },
    { title: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    { title: 'Audit Logs', path: '/dashboard/audit', icon: FileText },
    { title: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] text-[var(--color-neutral-primary-light)] dark:text-[var(--color-neutral-primary-dark)]">
      {/* 1. Desktop Sidebar Container */}
      <aside
        className={`hidden lg:flex flex-col border-r border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white dark:bg-[#18181B] transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}
      >
        {/* Header Branding */}
        <div className="sticky top-0 z-10 bg-white/85 dark:bg-[#18181B]/85 backdrop-blur-md h-16 flex items-center justify-between px-4 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group overflow-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <Vote size={16} />
            </div>
            {isOpen && (
              <span className="font-sans font-bold tracking-tight text-base whitespace-nowrap">
                Omni<span className="text-primary">Vote</span>
              </span>
            )}
          </Link>
          <button
            onClick={toggle}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle sidebar"
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {isOpen && (
                  <span className="whitespace-nowrap">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Brand */}
        <div className="p-4 border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
          {isOpen ? (
            <p className="text-[9px] text-[var(--color-neutral-muted-light)] uppercase tracking-[1.5px]">
              Powered by{' '}
              <span className="font-semibold text-primary">VeroSeven</span>
            </p>
          ) : (
            <span className="text-[10px] text-primary font-bold text-center block">
              V7
            </span>
          )}
        </div>
      </aside>

      {/* 2. Mobile Sidebar Drawer */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Overlay */}
          <div
            onClick={() => setShowMobileSidebar(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          {/* Sidebar Panel */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-white dark:bg-[#18181B] border-r border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] h-full z-10 animate-slide-in">
            <div className="sticky top-0 z-10 bg-white/85 dark:bg-[#18181B]/85 backdrop-blur-md h-16 flex items-center justify-between px-4 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <Vote size={16} />
                </div>
                <span className="font-sans font-bold tracking-tight text-base">
                  Omni<span className="text-primary">Vote</span>
                </span>
              </Link>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileSidebar(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] text-center">
              <p className="text-[9px] text-[var(--color-neutral-muted-light)] uppercase tracking-[1px]">
                Powered by{' '}
                <span className="font-semibold text-primary">VeroSeven</span>
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 w-full h-16 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="lg:hidden p-2 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Tenant Org Selector Placeholder */}
            <div className="flex items-center gap-2 border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-full px-3 py-1 bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] text-xs font-semibold cursor-pointer select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>VeroSeven Ltd</span>
              <ChevronDown size={12} className="text-zinc-400" />
            </div>
          </div>

          {/* Search, Notifications & Profile actions */}
          <div className="flex items-center gap-4">
            {/* Search Placeholder */}
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 pl-9 pr-4 py-1.5 text-xs rounded-full border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button
              title="Notifications"
              aria-label="View notifications"
              className="relative p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

            {/* Theme Toggle inside Header */}
            <div className="flex items-center border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-full p-0.5 bg-[var(--color-surface-muted-light)] dark:bg-[var(--color-surface-muted-dark)] scale-90">
              <button
                onClick={() => setTheme('light')}
                title="Light Mode"
                aria-label="Switch to light mode"
                className={`p-1 rounded-full ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400'}`}
              >
                <Sun size={12} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                aria-label="Switch to dark mode"
                className={`p-1 rounded-full ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 text-primary shadow-sm' : 'text-zinc-400'}`}
              >
                <Moon size={12} />
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] transition-colors select-none"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-primary font-bold text-xs flex items-center justify-center uppercase">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">
                  {user?.first_name} {user?.last_name}
                </span>
                <ChevronDown size={12} className="text-zinc-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#18181B] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-xl shadow-lg p-2 z-20 animate-fade-in">
                    <div className="px-3 py-2 text-xs border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[var(--color-neutral-muted-light)] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/settings/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <Link
                      to="/dashboard/settings/organizations"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Building2 size={14} /> My Organizations
                    </Link>
                    <Link
                      to="/dashboard/invitations"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Mail size={14} /> My Invitations
                    </Link>
                    <Link
                      to="/dashboard/settings/security"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Settings size={14} /> Security
                    </Link>
                    <Link
                      to="/dashboard/settings/sessions"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <LogOut size={14} /> Sessions
                    </Link>
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Breadcrumb / PageHeader Placeholder */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-neutral-muted-light)] mb-4">
            <Link
              to="/dashboard"
              className="hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <span>/</span>
            <span className="capitalize">
              {location.pathname.split('/').pop() || 'Home'}
            </span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
