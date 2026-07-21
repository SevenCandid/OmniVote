import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordSchema, ResetPasswordFormData } from '../schemas/auth';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { identityApi } from '../services/identityApi';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setServerError('Invalid or missing password reset token.');
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    try {
      setServerError(null);
      await identityApi.resetPassword({
        token,
        new_password: data.new_password,
      });
      setSuccess(true);
    } catch (err: any) {
      setServerError(
        err.message || 'Failed to reset password. The token may be expired.'
      );
    }
  };

  if (success) {
    return (
      <div className="w-full text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Password Reset Successful</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          You can now log in with your new password.
        </p>
        <div className="pt-6">
          <BaseButton
            onClick={() => navigate('/auth/login')}
            className="w-full"
          >
            Go to Login
          </BaseButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Create New Password</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
            {serverError}
          </div>
        )}

        <BaseInput
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.new_password?.message}
          {...register('new_password')}
          disabled={!token}
        />

        <BaseInput
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
          disabled={!token}
        />

        <div className="pt-2">
          <BaseButton
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={!token}
          >
            Reset Password
          </BaseButton>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm font-semibold text-primary hover:text-indigo-700 transition-colors"
        >
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}
