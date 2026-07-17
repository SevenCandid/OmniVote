import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrganizationCreateSchema, OrganizationCreateInput } from '../schemas/organizationSchema';

interface Props {
  initialData?: Partial<OrganizationCreateInput>;
  onSubmit: (data: OrganizationCreateInput) => void;
  isLoading?: boolean;
}

export function OrganizationForm({ initialData, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationCreateInput>({
    resolver: zodResolver(OrganizationCreateSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      contact_email: initialData?.contact_email || '',
      contact_phone: initialData?.contact_phone || '',
      country: initialData?.country || '',
      timezone: initialData?.timezone || 'UTC',
      preferred_language: initialData?.preferred_language || 'en',
      currency: initialData?.currency || 'USD',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-[#18181B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Core Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Organization Name *</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="e.g. Acme Corp"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unique Slug *</label>
            <input
              {...register('slug')}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="e.g. acme-corp"
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="Brief description of the organization"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#18181B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input
              {...register('contact_email')}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="admin@acme.com"
            />
            {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              {...register('website')}
              className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent"
              placeholder="https://acme.com"
            />
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Organization'}
        </button>
      </div>
    </form>
  );
}
