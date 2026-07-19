import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserOrganizations } from '../hooks/useMemberships';
import { MembershipStatus } from '../schemas/membershipSchema';
import { BaseCard } from '../../../components/ui/BaseCard';
import { BaseButton } from '../../../components/ui/BaseButton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Building2 } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const navigate = useNavigate();
  const { data: memberships, isLoading, error } = useUserOrganizations();

  const activeMemberships = memberships?.filter(
    m => m.status === MembershipStatus.ACCEPTED || m.status === MembershipStatus.SUSPENDED
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">My Organizations</h1>
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-zinc-200 dark:bg-zinc-800 h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
          Failed to load organizations.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Organizations</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Organizations you are currently a member of.
        </p>
      </div>

      {!activeMemberships || activeMemberships.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations"
          description="You are not a member of any organizations yet."
        />
      ) : (
        <div className="space-y-4">
          {activeMemberships.map((membership) => (
            <BaseCard key={membership.id} className="p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{membership.organization?.name || 'Unknown Organization'}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${membership.status === MembershipStatus.ACCEPTED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {membership.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Joined: {membership.accepted_at ? new Date(membership.accepted_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BaseButton
                    variant="outline"
                    onClick={() => navigate(`/dashboard/organizations/${membership.organization_id}`)}
                  >
                    View Organization
                  </BaseButton>
                </div>
              </div>
            </BaseCard>
          ))}
        </div>
      )}
    </div>
  );
}
