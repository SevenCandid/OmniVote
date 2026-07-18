import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileFormData } from '../schemas/user';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { identityApi } from '../services/identityApi';
import { useSessionStore } from '../../../stores/sessionStore';

export function ProfilePage() {
  const { user, updateUser } = useSessionStore();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      setSuccess(false);
      setErrorMsg(null);
      const updatedUser = await identityApi.updateProfile(data);
      updateUser(updatedUser);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
          Update your personal information and avatar.
        </p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-xl p-6">
        {/* Avatar Section - Placeholder for now as backend doesn't support uploads yet */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-primary font-bold text-2xl flex items-center justify-center select-none border-2 border-white dark:border-zinc-800 shadow-sm">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">Profile Avatar</h3>
            <p className="text-xs text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mb-3">
              Avatar uploads will be available in a future update.
            </p>
            <BaseButton size="sm" variant="secondary" disabled>
              Upload New
            </BaseButton>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg">
              Profile updated successfully.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <BaseInput
              label="First Name"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <BaseInput
              label="Last Name"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <BaseInput
            label="Email Address"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed"
          />

          <div className="flex justify-end pt-4 border-t border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)]">
            <BaseButton type="submit" isLoading={isSubmitting} disabled={!isDirty}>
              Save Changes
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
}
