import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import {
  EmergencySessionCreate,
  EmergencySessionCreateSchema,
} from '../schemas/supportSchema';
import { useStartEmergencySession } from '../api/supportApi';
import { useQuery } from '@tanstack/react-query';
import { platformOrganizationsApi } from '../../platform/services/platformOrganizationsApi';

interface EmergencySessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencySessionDialog({
  isOpen,
  onClose,
}: EmergencySessionDialogProps) {
  const { data: orgsResponse } = useQuery({
    queryKey: ['platform', 'organizations'],
    queryFn: () => platformOrganizationsApi.list(0, 100),
    enabled: isOpen,
  });
  const orgs = orgsResponse?.items || [];
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmergencySessionCreate>({
    resolver: zodResolver(EmergencySessionCreateSchema),
    defaultValues: {
      reason: '',
      duration_minutes: 60,
    },
  });

  const { mutateAsync: startSession, isPending } = useStartEmergencySession();

  if (!isOpen) return null;

  const onSubmit = async (data: EmergencySessionCreate) => {
    try {
      await startSession(data);
      toast.success('Emergency support session started');
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to start emergency session');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="text-red-500 mr-2">⚠️</span> Start Emergency
            Session
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
              Target Organization
            </label>
            <select
              {...register('organization_id')}
              className={`w-full px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.organization_id
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500'
              }`}
            >
              <option value="">Select an organization...</option>
              {orgs?.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organization_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organization_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for Access
            </label>
            <textarea
              {...register('reason')}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.reason
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:border-blue-500'
              }`}
              placeholder="Why is emergency access required?"
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reason.message}
              </p>
            )}
          </div>

          <BaseInput
            label="Duration (minutes)"
            type="number"
            {...register('duration_minutes', { valueAsNumber: true })}
            error={errors.duration_minutes?.message}
          />

          <div className="flex justify-end space-x-3 mt-6">
            <BaseButton variant="secondary" onClick={onClose} type="button">
              Cancel
            </BaseButton>
            <BaseButton type="submit" variant="danger" disabled={isPending}>
              {isPending ? 'Starting...' : 'Start Session'}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
}
