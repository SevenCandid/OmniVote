import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import {
  SupportRequestCreate,
  SupportRequestCreateSchema,
} from '../schemas/supportSchema';
import { useCreateSupportRequest } from '../api/supportApi';

interface CreateSupportRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function CreateSupportRequestDialog({
  isOpen,
  onClose,
  organizationId,
}: CreateSupportRequestDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportRequestCreate>({
    resolver: zodResolver(SupportRequestCreateSchema),
    defaultValues: {
      request_type: 'GENERAL',
      description: '',
    },
  });

  const { mutateAsync: createRequest, isPending } =
    useCreateSupportRequest(organizationId);

  if (!isOpen) return null;

  const onSubmit = async (data: SupportRequestCreate) => {
    try {
      await createRequest(data);
      toast.success('Support request submitted successfully');
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit support request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            New Support Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Request Type
            </label>
            <select
              {...register('request_type')}
              className={`w-full px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.request_type
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500'
              }`}
            >
              <option value="GENERAL">General Inquiry</option>
              <option value="TECHNICAL">Technical Issue</option>
              <option value="BILLING">Billing Support</option>
              <option value="ELECTION">Election Management</option>
              <option value="SECURITY">Security / Access</option>
            </select>
            {errors.request_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.request_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.description
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500'
              }`}
              placeholder="Describe your issue or request in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <BaseButton variant="secondary" onClick={onClose} type="button">
              Cancel
            </BaseButton>
            <BaseButton type="submit" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Request'}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
}
