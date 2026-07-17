import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrganization, useCreateOrganization } from '../hooks/useOrganizations';
import { OrganizationForm } from '../components/OrganizationForm';
import { OrganizationCreateInput } from '../schemas/organizationSchema';

export default function OrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: organization, isLoading } = useOrganization(isNew ? '' : id!);
  const createMutation = useCreateOrganization();

  const handleSubmit = async (data: OrganizationCreateInput) => {
    if (isNew) {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/dashboard/organizations'),
      });
    } else {
      // Update logic would go here
    }
  };

  if (isLoading && !isNew) {
    return <div className="p-6">Loading organization details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'Create New Organization' : organization?.name}
        </h1>
      </div>

      {!isNew && (
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800 mb-6">
          <button className="pb-2 border-b-2 border-blue-600 font-medium text-blue-600">Profile</button>
          <button className="pb-2 font-medium text-gray-500 hover:text-gray-900">Settings</button>
          <button className="pb-2 font-medium text-gray-500 hover:text-gray-900">Branding</button>
        </div>
      )}

      <OrganizationForm
        initialData={organization}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
