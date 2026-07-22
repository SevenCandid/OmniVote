import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrgSupportRequests } from '../../support/api/supportApi';
import { useOrganization } from '../hooks/useOrganizations';
import { BaseButton } from '../../../components/ui/BaseButton';
import { CreateSupportRequestDialog } from '../../support/components/CreateSupportRequestDialog';

export default function OrganizationSupportPage() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: organization } = useOrganization(organizationId!);
  const {
    data: requests,
    isLoading,
    error,
  } = useOrgSupportRequests(organizationId!);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate(`/dashboard/organizations/${organizationId}`)
              }
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Org
            </button>
          </div>
          <h1 className="text-2xl font-bold mt-2">Support Center</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {organization
              ? `Manage support requests for ${organization.name}`
              : 'Manage support requests'}
          </p>
        </div>
        <div className="flex gap-3">
          <BaseButton onClick={() => setIsCreateOpen(true)}>
            + New Support Request
          </BaseButton>
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Loading requests...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Failed to load support requests.
          </div>
        ) : !requests || requests.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Support Requests
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You haven't submitted any support requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">
                      {req.request_type}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {req.description}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${
                            req.status === 'ACCEPTED' ||
                            req.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : req.status === 'REJECTED' ||
                                  req.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                      >
                        {req.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      {req.resolved_at
                        ? new Date(req.resolved_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {organizationId && (
        <CreateSupportRequestDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          organizationId={organizationId}
        />
      )}
    </div>
  );
}
