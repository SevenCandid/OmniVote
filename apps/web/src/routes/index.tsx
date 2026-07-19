import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import VotingLayout from '../layouts/VotingLayout';
import ErrorLayout from '../layouts/ErrorLayout';

// Auth Pages
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { LoginPage } from '../features/identity/pages/LoginPage';
import { RegisterPage } from '../features/identity/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/identity/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/identity/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../features/identity/pages/VerifyEmailPage';
import { ProfilePage } from '../features/identity/pages/ProfilePage';
import { SecurityPage } from '../features/identity/pages/SecurityPage';
import { SessionsPage } from '../features/identity/pages/SessionsPage';

// Other Pages
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import OrganizationListPage from '../features/organizations/pages/OrganizationListPage';
import OrganizationDetailsPage from '../features/organizations/pages/OrganizationDetailsPage';
import OrganizationMembersPage from '../features/memberships/pages/OrganizationMembersPage';
import PendingInvitationsPage from '../features/memberships/pages/PendingInvitationsPage';
import UserInvitationsPage from '../features/memberships/pages/UserInvitationsPage';
import InvitationDetailsPage from '../features/memberships/pages/InvitationDetailsPage';
import OrganizationSettingsPage from '../features/memberships/pages/OrganizationSettingsPage';
import OrganizationRolesPage from '../features/rbac/pages/OrganizationRolesPage';
import RoleDetailsPage from '../features/rbac/pages/RoleDetailsPage';
import MembershipRolesPage from '../features/rbac/pages/MembershipRolesPage';
import SystemPermissionsPage from '../features/rbac/pages/SystemPermissionsPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

export const router = createBrowserRouter([
  // Public Marketing Routes
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'about', element: <PlaceholderPage title="About OmniVote" /> },
      { path: 'pricing', element: <PlaceholderPage title="Pricing Plans" /> },
      { path: 'features', element: <PlaceholderPage title="Features Overview" /> },
      { path: 'security', element: <PlaceholderPage title="Security Architecture" /> },
      { path: 'contact', element: <PlaceholderPage title="Contact Us" /> },
      { path: 'terms', element: <PlaceholderPage title="Terms of Service" /> },
      { path: 'privacy', element: <PlaceholderPage title="Privacy Policy" /> },
    ],
  },
  // Public Invitation Link (Doesn't force auth until user decides to accept)
  {
    path: '/invite/:token',
    element: <InvitationDetailsPage />,
  },
  // Auth Routes
  {
    path: '/auth',
    element: <PublicRoute><AuthLayout /></PublicRoute>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
    ],
  },
  // Dashboard Admin Routes
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'organizations',
        children: [
          { index: true, element: <OrganizationListPage /> },
          { path: 'new', element: <OrganizationDetailsPage /> },
          { path: ':id', element: <OrganizationDetailsPage /> },
          { path: ':id/members', element: <OrganizationMembersPage /> },
          { path: ':id/members/invitations', element: <PendingInvitationsPage /> },
          { path: ':id/members/:membershipId/roles', element: <MembershipRolesPage /> },
          { path: ':id/roles', element: <OrganizationRolesPage /> },
          { path: ':id/roles/:roleId', element: <RoleDetailsPage /> },
        ],
      },
      { path: 'invitations', element: <UserInvitationsPage /> },
      { path: 'elections', element: <PlaceholderPage title="Manage Elections" /> },
      { path: 'billing', element: <PlaceholderPage title="Billing Accounts" /> },
      { path: 'audit', element: <PlaceholderPage title="System Audit Logs" /> },
      {
        path: 'settings',
        children: [
          { index: true, element: <ProfilePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'security', element: <SecurityPage /> },
          { path: 'sessions', element: <SessionsPage /> },
          { path: 'organizations', element: <OrganizationSettingsPage /> },
          { path: 'system/permissions', element: <SystemPermissionsPage /> },
        ]
      },
    ],
  },
  // Public Voting UI
  {
    path: '/vote',
    element: <VotingLayout />,
    children: [
      {
        path: ':electionId',
        element: <PlaceholderPage title="Voter Ballot" />,
      },
      {
        path: ':electionId/receipt',
        element: <PlaceholderPage title="Vote Receipt" />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
