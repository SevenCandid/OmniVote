import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CandidateUpdateFormValues, candidateUpdateSchema } from '../../schemas/candidateSchema';
import { BaseDialog } from '@/components/ui/BaseDialog';
import { BaseButton } from '@/components/ui/BaseButton';
import { Candidate } from '../../types/candidate';

interface CandidateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateId: string, data: CandidateUpdateFormValues) => Promise<void>;
  isLoading: boolean;
  candidate: Candidate | null;
  termSingular: string;
}

export function CandidateEditModal({ isOpen, onClose, onSubmit, isLoading, candidate, termSingular }: CandidateEditModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CandidateUpdateFormValues>({
    resolver: zodResolver(candidateUpdateSchema),
    defaultValues: {
      full_name: '',
      short_name: '',
      photo: '',
      bio: '',
      manifesto: '',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (candidate) {
      reset({
        full_name: candidate.full_name,
        short_name: candidate.short_name || '',
        photo: candidate.photo || '',
        bio: candidate.bio || '',
        manifesto: candidate.manifesto || '',
      });
    }
  }, [candidate, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setValue('photo', event.target.result as string, { shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data: CandidateUpdateFormValues) => {
    if (!candidate) return;
    
    // Drop base64 before sending to backend (matches existing platform architecture)
    const sanitizedData = { ...data };
    if (sanitizedData.photo?.startsWith('data:')) {
      sanitizedData.photo = null; 
    }
    await onSubmit(candidate.id, sanitizedData);
  };

  const photo = watch('photo');

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title={`Edit ${termSingular}`} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input
            {...register('full_name')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Short Name</label>
          <input
            {...register('short_name')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="J. Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photo</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100 border flex items-center justify-center">
              {photo ? (
                <img src={photo} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No img</span>
              )}
            </div>
            <BaseButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </BaseButton>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief biography..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Manifesto / Platform</label>
          <textarea
            {...register('manifesto')}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Key policies and promises..."
          />
        </div>

        <div className="pt-4 flex justify-end space-x-3 border-t">
          <BaseButton type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </BaseButton>
          <BaseButton type="submit" isLoading={isLoading}>
            Save Changes
          </BaseButton>
        </div>
      </form>
    </BaseDialog>
  );
}
