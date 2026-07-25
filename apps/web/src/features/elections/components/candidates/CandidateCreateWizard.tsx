import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CandidateCreateFormValues, candidateCreateSchema } from '../../schemas/candidateSchema';
import { BaseDialog } from '@/components/ui/BaseDialog';
import { BaseButton } from '@/components/ui/BaseButton';

interface CandidateCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CandidateCreateFormValues) => Promise<void>;
  isLoading: boolean;
  termSingular: string;
}

export function CandidateCreateWizard({ isOpen, onClose, onSubmit, isLoading, termSingular }: CandidateCreateWizardProps) {
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<CandidateCreateFormValues>({
    resolver: zodResolver(candidateCreateSchema),
    defaultValues: {
      full_name: '',
      short_name: '',
      photo: '',
      bio: '',
      manifesto: '',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        // Set form value for photo to base64 preview
        setValue('photo', event.target.result as string, { shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const formData = watch();

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['full_name', 'short_name', 'photo']);
    } else if (step === 2) {
      isValid = await trigger(['bio', 'manifesto']);
    }
    
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFormSubmit = async (data: CandidateCreateFormValues) => {
    // Drop base64 before sending to backend (matches existing platform architecture)
    const sanitizedData = { ...data };
    if (sanitizedData.photo?.startsWith('data:')) {
      sanitizedData.photo = null; 
    }
    await onSubmit(sanitizedData);
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title={`Add New ${termSingular}`} size="lg">
      <div className="mb-6 flex justify-between items-center text-sm font-medium text-gray-500">
        <span className={step >= 1 ? 'text-blue-600' : ''}>1. Basic Info</span>
        <span>→</span>
        <span className={step >= 2 ? 'text-blue-600' : ''}>2. Content</span>
        <span>→</span>
        <span className={step >= 3 ? 'text-blue-600' : ''}>3. Review</span>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                {...register('full_name')}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                placeholder="e.g. John Doe"
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Short Name (Optional)</label>
              <input
                {...register('short_name')}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                placeholder="e.g. JD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
              <div className="flex items-center gap-4">
                {formData.photo ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border">
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 border border-dashed flex items-center justify-center text-gray-400 text-xs text-center">
                    No image
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <BaseButton 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.photo ? 'Change Photo' : 'Upload Photo'}
                  </BaseButton>
                  {formData.photo && (
                    <button 
                      type="button"
                      onClick={() => setValue('photo', '', { shouldValidate: true })}
                      className="text-xs text-red-500 text-left hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
              <p className="text-xs text-gray-500 mt-2">
                Max size: 5MB. Formats: JPG, PNG, WEBP.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Biography (Optional)</label>
              <textarea
                {...register('bio')}
                className="mt-1 w-full px-3 py-2 border rounded-md h-24"
                placeholder="Brief background..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manifesto (Optional)</label>
              <textarea
                {...register('manifesto')}
                className="mt-1 w-full px-3 py-2 border rounded-md h-32"
                placeholder="Promises and platform..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Review Details</h3>
            <p className="text-sm"><strong>Name:</strong> {formData.full_name}</p>
            {formData.short_name && <p className="text-sm"><strong>Short Name:</strong> {formData.short_name}</p>}
            {formData.photo && <p className="text-sm"><strong>Photo:</strong> [Image provided]</p>}
            <p className="text-sm mt-2 font-medium">Bio:</p>
            <p className="text-sm text-gray-600 line-clamp-2">{formData.bio || 'None provided'}</p>
            <p className="text-sm mt-2 font-medium">Manifesto:</p>
            <p className="text-sm text-gray-600 line-clamp-2">{formData.manifesto || 'None provided'}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <BaseButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </BaseButton>
          
          {step > 1 && (
            <BaseButton variant="secondary" onClick={handleBack} disabled={isLoading}>
              Back
            </BaseButton>
          )}
          
          {step < 3 ? (
            <BaseButton type="button" onClick={handleNext}>
              Next
            </BaseButton>
          ) : (
            <BaseButton type="submit" disabled={isLoading} isLoading={isLoading}>
              Create {termSingular}
            </BaseButton>
          )}
        </div>
      </form>
    </BaseDialog>
  );
}
