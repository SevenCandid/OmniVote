import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import VotingLayout from '../layouts/VotingLayout';
import ErrorLayout from '../layouts/ErrorLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import VotingPage from '../pages/VotingPage';
import OrganizationListPage from '../features/organizations/pages/OrganizationListPage';
import OrganizationDetailsPage from '../features/organizations/pages/OrganizationDetailsPage';
import {
  NotFoundPage,
  ForbiddenPage,
  ServerErrorPage,
  MaintenancePage,
} from '../pages/ErrorPages';

// Reusable Placeholder Page Component
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6 bg-white dark:bg-[#18181B] rounded-2xl border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
      This is a placeholder page for {title.toLowerCase()}. Business
      functionality will be introduced in future sprints.
    </p>
  </div>
);

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <PlaceholderPage title="About OmniVote" /> },
      { path: 'contact', element: <PlaceholderPage title="Contact Us" /> },
      { path: 'privacy', element: <PlaceholderPage title="Privacy Policy" /> },
      { path: 'terms', element: <PlaceholderPage title="Terms of Service" /> },
      {
        path: 'docs',
        element: <PlaceholderPage title="Documentation Portal" />,
      },
      {
        path: 'manifesto',
        element: <PlaceholderPage title="Our Platform Manifesto" />,
      },
    ],
  },
  // Auth Routes
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <PlaceholderPage title="Login Authentication" />,
      },
      {
        path: 'forgot-password',
        element: <PlaceholderPage title="Forgot Password Recovery" />,
      },
    ],
  },
  // Dashboard Admin Routes
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'organizations',
        children: [
          { index: true, element: <OrganizationListPage /> },
          { path: 'new', element: <OrganizationDetailsPage /> },
          { path: ':id', element: <OrganizationDetailsPage /> },
        ],
      },
      {
        path: 'elections',
        element: <PlaceholderPage title="Manage Elections" />,
      },
      {
        path: 'billing',
        element: <PlaceholderPage title="Billing Accounts" />,
      },
      { path: 'audit', element: <PlaceholderPage title="System Audit Logs" /> },
      {
        path: 'settings',
        element: <PlaceholderPage title="Administration Settings" />,
      },
    ],
  },
  // Distraction-free Voting Routes
  {
    path: '/vote',
    element: <VotingLayout />,
    children: [{ index: true, element: <VotingPage /> }],
  },
  // System Error Pages
  {
    path: '/',
    element: <ErrorLayout />,
    children: [
      { path: '403', element: <ForbiddenPage /> },
      { path: '500', element: <ServerErrorPage /> },
      { path: 'maintenance', element: <MaintenancePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
