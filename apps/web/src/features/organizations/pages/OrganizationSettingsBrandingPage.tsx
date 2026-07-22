import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  useOrganization,
  useUpdateOrganization,
  useUpdateOrganizationBranding,
} from '../hooks/useOrganizations';
import { useMyPermissions } from '../../rbac/hooks/useRbac';
import { BaseLoader } from '../../../components/ui/BaseLoader';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';

export const OrganizationSettingsBrandingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: org, isLoading } = useOrganization(id!);
  const { hasPermission, isLoading: isLoadingPermissions } =
    useMyPermissions(id);

  const updateOrgMutation = useUpdateOrganization();
  const updateBrandingMutation = useUpdateOrganizationBranding();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    contact_email: '',
    primary_color: '#2563eb',
    secondary_color: '#475569',
    accent_color: '#f59e0b',
    logo_url: '',
    banner_url: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        slug: org.slug || '',
        description: org.description || '',
        website: org.website || '',
        contact_email: org.contact_email || '',
        primary_color: org.branding?.primary_color || '#2563eb',
        secondary_color: org.branding?.secondary_color || '#475569',
        accent_color: org.branding?.accent_color || '#f59e0b',
        logo_url: org.branding?.logo_url || '',
        banner_url: org.branding?.banner_url || '',
      });
    }
  }, [org]);

  if (isLoading || isLoadingPermissions) {
    return <BaseLoader />;
  }

  const canEdit = hasPermission('organization.update');

  if (!canEdit) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
        You do not have permission to view or edit organization branding.
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo_url' | 'banner_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate file upload with FileReader (base64)
    // Architecture Note: Replace with actual presigned S3/GCS URL upload logic in the future
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          [field]: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Clean up empty strings to avoid validation errors
    const sanitizedOrgData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description === '' ? null : formData.description,
      website: formData.website === '' ? null : formData.website,
      contact_email:
        formData.contact_email === '' ? null : formData.contact_email,
    };

    // Core fields
    updateOrgMutation.mutate({
      id,
      data: sanitizedOrgData,
    });

    // Branding fields
    updateBrandingMutation.mutate(
      {
        id,
        data: {
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color,
          accent_color: formData.accent_color,
          // Don't send base64 to backend, it breaks HttpUrl and DB limits
          logo_url: formData.logo_url?.startsWith('data:')
            ? null
            : formData.logo_url || null,
          banner_url: formData.banner_url?.startsWith('data:')
            ? null
            : formData.banner_url || null,
        },
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 3000);
        },
      }
    );
  };

  const isPending =
    updateOrgMutation.isPending || updateBrandingMutation.isPending;

  return (
    <div className="flex flex-col 2xl:flex-row gap-8">
      {/* Settings Form */}
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Branding & Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Customize how your organization appears to users and members.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {updateOrgMutation.isError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
              <p className="font-semibold">
                Failed to update organization profile
              </p>
              <p>
                {updateOrgMutation.error instanceof Error
                  ? updateOrgMutation.error.message
                  : 'Unknown error occurred'}
              </p>
            </div>
          )}

          {updateBrandingMutation.isError && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
              <p className="font-semibold">
                Failed to update organization branding
              </p>
              <p>
                {updateBrandingMutation.error instanceof Error
                  ? updateBrandingMutation.error.message
                  : 'Unknown error occurred'}
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-[#18181B] shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 space-y-8">
              {/* Organization Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                  Organization Profile
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Short Name (Slug)
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                  Assets
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.logo_url ? (
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={formData.logo_url}
                            alt="Logo"
                            className="object-cover h-full w-full"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({ ...p, logo_url: '' }))
                            }
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Upload Logo
                      </button>
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={(e) => handleFileUpload(e, 'logo_url')}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Banner (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.banner_url ? (
                        <div className="relative h-16 w-32 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={formData.banner_url}
                            alt="Banner"
                            className="object-cover h-full w-full"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({ ...p, banner_url: '' }))
                            }
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X size={16} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-32 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Upload Banner
                      </button>
                      <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={(e) => handleFileUpload(e, 'banner_url')}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                  Brand Colors
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary Color
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        name="primary_color"
                        value={formData.primary_color}
                        onChange={handleChange}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        name="primary_color"
                        value={formData.primary_color}
                        onChange={handleChange}
                        className="block w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800 uppercase font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Secondary Color
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        name="secondary_color"
                        value={formData.secondary_color}
                        onChange={handleChange}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        name="secondary_color"
                        value={formData.secondary_color}
                        onChange={handleChange}
                        className="block w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800 uppercase font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Accent Color
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        name="accent_color"
                        value={formData.accent_color}
                        onChange={handleChange}
                        className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        name="accent_color"
                        value={formData.accent_color}
                        onChange={handleChange}
                        className="block w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm bg-white dark:bg-gray-800 uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1f1f23] px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
              <div className="text-sm">
                {isSuccess ? (
                  <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                    <Check size={16} /> Branding saved successfully!
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    Changes apply immediately to your organization.
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isPending}
                style={{ backgroundColor: formData.primary_color }}
                className="px-4 py-2 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live Preview Panel */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
        <div className="sticky top-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Live Preview
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              See how your colors affect the UI components.
            </p>
          </div>

          <div className="bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            {/* Banner Preview */}
            <div
              className="h-24 w-full bg-gray-200 dark:bg-gray-800 bg-cover bg-center"
              style={
                formData.banner_url
                  ? { backgroundImage: `url(${formData.banner_url})` }
                  : { backgroundColor: formData.secondary_color }
              }
            />

            <div className="p-5">
              <div className="flex items-center gap-3 mb-4 -mt-10">
                <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-900 border-4 border-white dark:border-[#18181B] flex items-center justify-center overflow-hidden">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      {formData.name
                        ? formData.name.charAt(0).toUpperCase()
                        : 'O'}
                    </div>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-gray-900 dark:text-white truncate">
                {formData.name || 'Organization Name'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4 line-clamp-2">
                {formData.description ||
                  'Your organization description will appear here...'}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">
                    Buttons
                  </label>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-1.5 px-3 rounded text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      Primary Action
                    </button>
                    <button
                      className="flex-1 py-1.5 px-3 rounded text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: formData.secondary_color }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">
                    Badges & Highlights
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: formData.accent_color }}
                    >
                      New
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${formData.primary_color}20`, // 20% opacity approx
                        color: formData.primary_color,
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">
                    Interactive State
                  </label>
                  <div
                    className="p-3 rounded-md border flex items-center justify-between"
                    style={{
                      borderColor: formData.primary_color,
                      backgroundColor: `${formData.primary_color}0a`,
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: formData.primary_color }}
                    >
                      Selected Option
                    </span>
                    <Check
                      size={16}
                      style={{ color: formData.primary_color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
