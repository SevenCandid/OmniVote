import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrganization, useCreateOrganization } from '../hooks/useOrganizations';
import { OrganizationForm } from '../components/OrganizationForm';
import { OrganizationCreateInput } from '../schemas/organizationSchema';

export default function OrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // If id is undefined, we matched the 'new' route exactly. 
  // If id is 'new', we somehow matched the ':id' route with value 'new'.
  const isNew = id === undefined || id === 'new';

  const { data: organization, isLoading } = useOrganization(isNew ? '' : id!);
  const createMutation = useCreateOrganization();

  const handleSubmit = async (data: OrganizationCreateInput) => {
    // Sanitize empty strings to null or undefined since the backend requires strict types
    // (e.g. EmailStr fails on "", HttpUrl fails on "")
    const sanitizedData: any = { ...data };
    const optionalFields = ['legal_name', 'description', 'website', 'contact_email', 'contact_phone', 'country'];
    optionalFields.forEach(field => {
      if (sanitizedData[field] === '') {
        sanitizedData[field] = null;
      }
    });

    if (isNew) {
      createMutation.mutate(sanitizedData, {
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

      {createMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to save organization</p>
          <p>{createMutation.error instanceof Error ? createMutation.error.message : 'Unknown error occurred'}</p>
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
