import React from 'react';
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
  LifeBuoy
} from 'lucide-react';
import { useOrganization, useDeleteOrganization } from '../hooks/useOrganizations';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { BaseLoader } from '../../../components/ui/BaseLoader';

export const OrganizationLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: organization, isLoading } = useOrganization(id!);
  const { hasPermission, isLoading: isLoadingPermissions } = useMyPermissions(id);
  const deleteMutation = useDeleteOrganization();

  const navigation = [
    { name: 'Profile', to: `/dashboard/organizations/${id}`, icon: User, end: true },
    { name: 'Settings', to: `/dashboard/organizations/${id}/settings/general`, icon: Settings },
    { name: 'Branding', to: `/dashboard/organizations/${id}/settings/branding`, icon: Palette },
    { name: 'Security', to: `/dashboard/organizations/${id}/settings/security`, icon: ShieldAlert, disabled: true },
    { name: 'Members', to: `/dashboard/organizations/${id}/members`, icon: Users },
    { name: 'Roles & Permissions', to: `/dashboard/organizations/${id}/roles`, icon: Key },
    { name: 'Support', to: `/dashboard/organizations/${id}/support`, icon: LifeBuoy },
    { name: 'Notifications', to: `/dashboard/organizations/${id}/settings/notifications`, icon: Bell, disabled: true },
    { name: 'Integrations', to: `/dashboard/organizations/${id}/settings/integrations`, icon: Plug, disabled: true },
    { name: 'Audit Logs', to: `/dashboard/organizations/${id}/audit`, icon: Activity },
  ];

  if (isLoading || isLoadingPermissions) {
    return <BaseLoader />;
  }

  if (!organization) {
    return <div className="p-6">Organization not found.</div>;
  }

  const canDelete = hasPermission('organization.delete');

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col space-y-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/organizations')}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Organizations
        </button>
        
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {organization.name}
          </h1>
          <div className="flex space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize">
              {organization.status}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
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
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0 -mx-4 px-4 md:mx-0 md:px-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.disabled ? '#' : item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
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
                  <Icon size={18} />
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
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
