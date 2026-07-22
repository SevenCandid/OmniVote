import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useOrganization,
  useCreateOrganization,
  useDeleteOrganization,
  useUpdateOrganization,
} from '../hooks/useOrganizations';
import { OrganizationForm } from '../components/OrganizationForm';
import { OrganizationCreateInput } from '../schemas/organizationSchema';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { useOrgSupportSessions } from '../../support/api/supportApi';

export default function OrganizationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // If id is undefined, we matched the 'new' route exactly.
  // If id is 'new', we somehow matched the ':id' route with value 'new'.
  const isNew = id === undefined || id === 'new';

  const { data: organization, isLoading } = useOrganization(isNew ? '' : id!);
  const { hasPermission, isLoading: isLoadingPermissions } = useMyPermissions(
    isNew ? undefined : id
  );
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();

  const { data: supportSessions } = useOrgSupportSessions(isNew ? '' : id!);
  const activeSession = supportSessions?.find((s) => s.status === 'ACTIVE');

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
    const optionalFields = [
      'legal_name',
      'description',
      'website',
      'contact_email',
      'contact_phone',
      'country',
    ];
    optionalFields.forEach((field) => {
      if (sanitizedData[field] === '') {
        sanitizedData[field] = null;
      }
    });

    if (isNew) {
      createMutation.mutate(sanitizedData, {
        onSuccess: () => navigate('/dashboard/organizations'),
      });
    } else {
      updateMutation.mutate(
        { id: id!, data: sanitizedData },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    }
  };

  if ((isLoading || isLoadingPermissions) && !isNew) {
    return <div className="p-6">Loading organization details...</div>;
  }

    const canEdit = isNew || hasPermission('organization.update');
    const canDelete = !isNew && hasPermission('organization.delete');

    return (
      <div className={isNew ? "max-w-4xl mx-auto p-6 space-y-6" : "space-y-6 max-w-4xl"}>
        {isNew ? (
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              &larr; Back
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">Create New Organization</h1>
            </div>
            <div className="flex-1"></div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organization Profile</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View and manage your organization's core details.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing && canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium focus:outline-none"
                >
                  Edit Profile
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-medium focus:outline-none"
                >
                  Delete Organization
                </button>
              )}
            </div>
          </div>
        )}

        {activeSession && (
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 p-4 rounded-xl text-sm border border-blue-200 dark:border-blue-800/50 flex justify-between items-center">
            <div>
              <p className="font-semibold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Active Support Session
              </p>
              <p className="mt-1">
                A platform admin is currently assisting this organization. Reason: {activeSession.reason}
              </p>
            </div>
          </div>
        )}



      {createMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to create organization</p>
          <p>
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Unknown error occurred'}
          </p>
        </div>
      )}

      {updateMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to update organization</p>
          <p>
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Unknown error occurred'}
          </p>
        </div>
      )}

      {deleteMutation.isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          <p className="font-semibold">Failed to delete organization</p>
          <p>
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : 'Unknown error occurred'}
          </p>
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
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Delete Organization
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              This action cannot be undone. This will permanently delete the{' '}
              <strong>{organization?.name}</strong> organization and all of its
              data.
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
                disabled={
                  deleteConfirmText !== organization?.name ||
                  deleteMutation.isPending
                }
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
