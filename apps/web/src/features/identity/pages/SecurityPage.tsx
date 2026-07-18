import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '../schemas/user';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { identityApi } from '../services/identityApi';

export function SecurityPage() {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setSuccess(false);
      setErrorMsg(null);
      await identityApi.updatePassword(data);
      setSuccess(true);
      reset();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)] mt-1">
          Manage your password and security preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-[#18181B] border border-[var(--color-border-default-light)] dark:border-[var(--color-border-default-dark)] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg">
              Password updated successfully.
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <BaseInput
              label="Current Password"
              type="password"
              error={errors.current_password?.message}
              {...register('current_password')}
            />
            
            <div className="pt-2">
              <BaseInput
                label="New Password"
                type="password"
                error={errors.new_password?.message}
                {...register('new_password')}
              />
            </div>
            
            <BaseInput
              label="Confirm New Password"
              type="password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <div className="flex pt-4">
            <BaseButton type="submit" isLoading={isSubmitting}>
              Update Password
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
}
