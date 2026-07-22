import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import VotingLayout from '../layouts/VotingLayout';
import ErrorLayout from '../layouts/ErrorLayout';
import PlatformLayout from '../layouts/PlatformLayout';

// Auth Pages
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PlatformRoute } from '../components/PlatformRoute';
import { PublicRoute } from '../components/PublicRoute';
import { LoginPage } from '../features/identity/pages/LoginPage';
import { RegisterPage } from '../features/identity/pages/RegisterPage';
import { ForgotPasswordPage } from '../features/identity/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/identity/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../features/identity/pages/VerifyEmailPage';
import { ProfilePage } from '../features/identity/pages/ProfilePage';
import { SecurityPage } from '../features/identity/pages/SecurityPage';
import { SessionsPage } from '../features/identity/pages/SessionsPage';
import { UserAuditPage } from '../features/identity/pages/UserAuditPage';

// Other Pages
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import OrganizationListPage from '../features/organizations/pages/OrganizationListPage';
import OrganizationDetailsPage from '../features/organizations/pages/OrganizationDetailsPage';
import { OrganizationLayout } from '../features/organizations/layouts/OrganizationLayout';
import { OrganizationSettingsGeneralPage } from '../features/organizations/pages/OrganizationSettingsGeneralPage';
import { OrganizationSettingsBrandingPage } from '../features/organizations/pages/OrganizationSettingsBrandingPage';
import OrganizationMembersPage from '../features/memberships/pages/OrganizationMembersPage';
import OrganizationInvitationsPage from '../features/memberships/pages/OrganizationInvitationsPage';
import UserInvitationsPage from '../features/memberships/pages/UserInvitationsPage';
import InvitationDetailsPage from '../features/memberships/pages/InvitationDetailsPage';
import OrganizationSettingsPage from '../features/memberships/pages/OrganizationSettingsPage';
import OrganizationRolesPage from '../features/rbac/pages/OrganizationRolesPage';
import RoleDetailsPage from '../features/rbac/pages/RoleDetailsPage';
import MembershipRolesPage from '../features/rbac/pages/MembershipRolesPage';
import SystemPermissionsPage from '../features/rbac/pages/SystemPermissionsPage';
import OrganizationSupportPage from '../features/organizations/pages/OrganizationSupportPage';
import { OrganizationAuditPage } from '../features/organizations/pages/OrganizationAuditPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

// Election Pages
import ElectionListPage from '../features/elections/pages/ElectionListPage';
import ElectionCreatePage from '../features/elections/pages/ElectionCreatePage';
import ElectionOverviewPage from '../features/elections/pages/ElectionOverviewPage';
import ElectionEditPage from '../features/elections/pages/ElectionEditPage';
import ElectionLayout from '../features/elections/layouts/ElectionLayout';

// Platform Pages
import PlatformDashboardPage from '../features/platform/pages/PlatformDashboardPage';
import { PlatformOrganizationsPage } from '../features/platform/pages/PlatformOrganizationsPage';
import { PlatformOrganizationDetailsPage } from '../features/platform/pages/PlatformOrganizationDetailsPage';
import { PlatformUsersPage } from '../features/platform/pages/PlatformUsersPage';
import { PlatformUserDetailsPage } from '../features/platform/pages/PlatformUserDetailsPage';
import { PlatformRolesPage } from '../features/platform/pages/PlatformRolesPage';
import { PlatformInvitationsPage } from '../features/platform/pages/PlatformInvitationsPage';
import { PlatformVerificationPage } from '../features/platform/pages/PlatformVerificationPage';
import { PlatformLoginPage } from '../features/platform/pages/PlatformLoginPage';
import PlatformSupportPage from '../features/platform/pages/PlatformSupportPage';
import { PlatformAnalyticsPage } from '../features/platform/pages/PlatformAnalyticsPage';
import { PlatformAuditPage } from '../features/platform/pages/PlatformAuditPage';
import { PlatformNotificationsPage } from '../features/platform/pages/PlatformNotificationsPage';
import { PlatformSettingsPage } from '../features/platform/pages/PlatformSettingsPage';

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
      {
        path: 'features',
        element: <PlaceholderPage title="Features Overview" />,
      },
      {
        path: 'security',
        element: <PlaceholderPage title="Security Architecture" />,
      },
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
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
    ],
  },
  // Platform Auth Routes
  {
    path: '/platform/login',
    element: (
      <PublicRoute defaultRedirect="/platform">
        <AuthLayout />
      </PublicRoute>
    ),
    children: [{ index: true, element: <PlatformLoginPage /> }],
  },
  // Dashboard Admin Routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'organizations',
        children: [
          { index: true, element: <OrganizationListPage /> },
          { path: 'new', element: <OrganizationDetailsPage /> },
          {
            path: ':id',
            element: <OrganizationLayout />,
            children: [
              { index: true, element: <OrganizationDetailsPage /> },
              { path: 'members', element: <OrganizationMembersPage /> },
              {
                path: 'members/invitations',
                element: <OrganizationInvitationsPage />,
              },
              {
                path: 'members/:membershipId/roles',
                element: <MembershipRolesPage />,
              },
              {
                path: 'settings/general',
                element: <OrganizationSettingsGeneralPage />,
              },
              {
                path: 'settings/branding',
                element: <OrganizationSettingsBrandingPage />,
              },
              { path: 'roles', element: <OrganizationRolesPage /> },
              { path: 'roles/:roleId', element: <RoleDetailsPage /> },
              { path: 'support', element: <OrganizationSupportPage /> },
              { path: 'audit', element: <OrganizationAuditPage /> },
              {
                path: 'elections',
                children: [
                  { index: true, element: <ElectionListPage /> },
                  { path: 'new', element: <ElectionCreatePage /> },
                  {
                    path: ':electionId',
                    element: <ElectionLayout />,
                    children: [
                      { index: true, element: <ElectionOverviewPage /> },
                      { path: 'edit', element: <ElectionEditPage /> },
                      {
                        path: 'positions',
                        element: (
                          <PlaceholderPage title="Positions - Coming Soon" />
                        ),
                      },
                      {
                        path: 'candidates',
                        element: (
                          <PlaceholderPage title="Candidates - Coming Soon" />
                        ),
                      },
                      {
                        path: 'voters',
                        element: (
                          <PlaceholderPage title="Voters - Coming Soon" />
                        ),
                      },
                      {
                        path: 'ballot',
                        element: (
                          <PlaceholderPage title="Ballot - Coming Soon" />
                        ),
                      },
                      {
                        path: 'voting',
                        element: (
                          <PlaceholderPage title="Voting - Coming Soon" />
                        ),
                      },
                      {
                        path: 'results',
                        element: (
                          <PlaceholderPage title="Results - Coming Soon" />
                        ),
                      },
                      {
                        path: 'analytics',
                        element: (
                          <PlaceholderPage title="Analytics - Coming Soon" />
                        ),
                      },
                      {
                        path: 'audit',
                        element: (
                          <PlaceholderPage title="Election Audit - Coming Soon" />
                        ),
                      },
                      {
                        path: 'settings',
                        element: (
                          <PlaceholderPage title="Election Settings - Coming Soon" />
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: 'invitations', element: <UserInvitationsPage /> },
      {
        path: 'elections',
        element: <PlaceholderPage title="Manage Elections" />,
      },
      {
        path: 'billing',
        element: <PlaceholderPage title="Billing Accounts" />,
      },
      { path: 'audit', element: <UserAuditPage /> },
      {
        path: 'settings',
        children: [
          { index: true, element: <ProfilePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'security', element: <SecurityPage /> },
          { path: 'sessions', element: <SessionsPage /> },
          { path: 'organizations', element: <OrganizationSettingsPage /> },
          { path: 'system/permissions', element: <SystemPermissionsPage /> },
        ],
      },
    ],
  },
  // Platform Admin Routes
  {
    path: '/platform',
    element: (
      <PlatformRoute>
        <PlatformLayout />
      </PlatformRoute>
    ),
    children: [
      { index: true, element: <PlatformDashboardPage /> },
      { path: 'organizations', element: <PlatformOrganizationsPage /> },
      {
        path: 'organizations/:id',
        element: <PlatformOrganizationDetailsPage />,
      },
      { path: 'support', element: <PlatformSupportPage /> },
      {
        path: 'verification',
        element: <PlatformVerificationPage />,
      },
      { path: 'users', element: <PlatformUsersPage /> },
      { path: 'users/:id', element: <PlatformUserDetailsPage /> },
      { path: 'roles', element: <PlatformRolesPage /> },
      { path: 'invitations', element: <PlatformInvitationsPage /> },
      {
        path: 'analytics',
        element: <PlatformAnalyticsPage />,
      },
      {
        path: 'audit',
        element: <PlatformAuditPage />,
      },
      {
        path: 'notifications',
        element: <PlatformNotificationsPage />,
      },
      {
        path: 'settings',
        element: <PlatformSettingsPage />,
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
