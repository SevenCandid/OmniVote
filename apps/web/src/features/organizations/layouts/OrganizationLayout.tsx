import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Palette,
  ShieldAlert,
  Users,
  Key,
  Bell,
  Plug,
  Activity,
  ArrowLeft,
  LifeBuoy,
  CheckSquare,
} from 'lucide-react';
import {
  useOrganization,
} from '../hooks/useOrganizations';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export const OrganizationLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: organization, isLoading } = useOrganization(id!);
  const { isLoading: isLoadingPermissions } =
    useMyPermissions(id);

  const navigation = [
    {
      name: 'Profile',
      to: `/dashboard/organizations/${id}`,
      icon: User,
      end: true,
    },
    {
      name: 'Elections',
      to: `/dashboard/organizations/${id}/elections`,
      icon: CheckSquare,
    },
    {
      name: 'Settings',
      to: `/dashboard/organizations/${id}/settings/general`,
      icon: Settings,
    },
    {
      name: 'Branding',
      to: `/dashboard/organizations/${id}/settings/branding`,
      icon: Palette,
    },
    {
      name: 'Security',
      to: `/dashboard/organizations/${id}/settings/security`,
      icon: ShieldAlert,
      disabled: true,
    },
    {
      name: 'Members',
      to: `/dashboard/organizations/${id}/members`,
      icon: Users,
    },
    {
      name: 'Roles & Permissions',
      to: `/dashboard/organizations/${id}/roles`,
      icon: Key,
    },
    {
      name: 'Support',
      to: `/dashboard/organizations/${id}/support`,
      icon: LifeBuoy,
    },
    {
      name: 'Notifications',
      to: `/dashboard/organizations/${id}/settings/notifications`,
      icon: Bell,
      disabled: true,
    },
    {
      name: 'Integrations',
      to: `/dashboard/organizations/${id}/settings/integrations`,
      icon: Plug,
      disabled: true,
    },
    {
      name: 'Audit Logs',
      to: `/dashboard/organizations/${id}/audit`,
      icon: Activity,
    },
  ];

  if (isLoading || isLoadingPermissions) {
    return <BaseLoader />;
  }

  if (!organization) {
    return <div className="p-6">Organization not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-6 relative flex-1 min-h-0 flex flex-col px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex items-center space-x-3 mb-2 shrink-0 bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] py-1.5 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 z-10">
        <button
          onClick={() => navigate('/dashboard/organizations')}
          className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shrink-0"
          title="Back to Organizations"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {organization.name}
        </h1>
        <div className="flex space-x-1.5 sm:space-x-2 ml-2 shrink-0">
          <span className="px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize whitespace-nowrap">
            {organization.status}
          </span>
          <span
            className={`px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium capitalize whitespace-nowrap ${
              organization.verification_status === 'verified'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : organization.verification_status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {organization.verification_status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-full md:w-52 flex-shrink-0 -mx-4 px-4 md:mx-0 md:px-0 self-start overflow-y-auto no-scrollbar h-auto md:h-full pt-4">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.disabled ? '#' : item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      item.disabled
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : isActive
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                  onClick={(e) => {
                    if (item.disabled) e.preventDefault();
                  }}
                >
                  <Icon size={16} />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto inline-block px-2 py-0.5 text-[10px] uppercase font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">
                      Soon
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar pb-10 pt-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
