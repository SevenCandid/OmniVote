import React from 'react';
import { useOrganizations } from '../hooks/useOrganizations';
import { useNavigate } from 'react-router-dom';

export default function OrganizationListPage() {
  const { data: organizations, isLoading, error } = useOrganizations();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all tenant organizations across the platform.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/organizations/new')}
          className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          + New Organization
        </button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200">
          Failed to load organizations. Please try again.
        </div>
      )}

      {!isLoading && !error && organizations?.length === 0 && (
        <div className="text-center py-20 bg-gray-50 dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium">No organizations found</h3>
          <p className="text-gray-500 mt-2">Get started by creating a new organization.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations?.map((org) => (
          <div
            key={org.id}
            onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
            className="p-6 bg-white dark:bg-[#18181B] rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">{org.name}</h3>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                {org.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {org.description || 'No description provided.'}
            </p>
            <div className="text-xs text-gray-400">
              Slug: {org.slug}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
