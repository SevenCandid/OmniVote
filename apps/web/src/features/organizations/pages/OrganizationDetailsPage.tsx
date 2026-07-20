import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrganization, useCreateOrganization, useDeleteOrganization, useUpdateOrganization } from '../hooks/useOrganizations';
import { OrganizationForm } from '../components/OrganizationForm';
import { OrganizationCreateInput } from '../schemas/organizationSchema';
import { useMyPermissions } from '../../rbac/hooks/useRbac';

export default function OrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // If id is undefined, we matched the 'new' route exactly. 
  // If id is 'new', we somehow matched the ':id' route with value 'new'.
  const isNew = id === undefined || id === 'new';

  const { data: organization, isLoading } = useOrganization(isNew ? '' : id!);
  const { hasPermission, isLoading: isLoadingPermissions } = useMyPermissions(isNew ? undefined : id);
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();

  const [isEditing, setIsEditing] = useState(isNew);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => navigate('/dashboard/organizations'),
    });
  };

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
      updateMutation.mutate({ id: id!, data: sanitizedData }, {
        onSuccess: () => {
          setIsEditing(false);
        }
      });
    }
  };

  if ((isLoading || isLoadingPermissions) && !isNew) {
    return <div className="p-6">Loading organization details...</div>;
  }

  const canEdit = isNew || hasPermission('organization.update');
  const canDelete = !isNew && hasPermission('organization.delete');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          &larr; Back
        </button>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">
            {isNew ? 'Create New Organization' : organization?.name}
          </h1>
          {!isNew && organization && (
            <div className="flex space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize">
                {organization.status}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                organization.verification_status === 'verified' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                organization.verification_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {organization.verification_status.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1"></div>
        {!isNew && (
          <div className="flex space-x-3">
            {!isEditing && canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium focus:outline-none"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {!isNew && (
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800 mb-6">
          <button className="pb-2 border-b-2 border-blue-600 font-medium text-blue-600">Profile</button>
          <button className="pb-2 font-medium text-gray-500 hover:text-gray-900">Settings</button>
          <button className="pb-2 font-medium text-gray-500 hover:text-gray-900">Branding</button>
          <button 
            className="pb-2 font-medium text-gray-500 hover:text-gray-900"
            onClick={() => navigate(`/dashboard/organizations/${id}/members`)}
          >
            Members
          </button>
          <button 
            className="pb-2 font-medium text-gray-500 hover:text-gray-900"
            onClick={() => navigate(`/dashboard/organizations/${id}/roles`)}
          >
            Roles & Permissions
          </button>
        </div>
      )}

      {createMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to create organization</p>
          <p>{createMutation.error instanceof Error ? createMutation.error.message : 'Unknown error occurred'}</p>
        </div>
      )}

      {updateMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to update organization</p>
          <p>{updateMutation.error instanceof Error ? updateMutation.error.message : 'Unknown error occurred'}</p>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to delete organization</p>
          <p>{deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Unknown error occurred'}</p>
        </div>
      )}

      <OrganizationForm
        initialData={organization}
        onSubmit={handleSubmit}
        isLoading={isNew ? createMutation.isPending : updateMutation.isPending}
        isReadOnly={!isEditing}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete Organization</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              This action cannot be undone. This will permanently delete the <strong>{organization?.name}</strong> organization and all of its data.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Please type <strong>{organization?.name}</strong> to confirm.
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== organization?.name || deleteMutation.isPending}
                className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
