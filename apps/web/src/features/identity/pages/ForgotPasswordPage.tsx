import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas/auth';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { identityApi } from '../services/identityApi';

export function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setServerError(null);
      await identityApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'An error occurred. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="w-full text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          We've sent password reset instructions to your email address.
        </p>
        <div className="pt-6">
          <Link to="/auth/login" className="text-sm font-semibold text-primary hover:text-indigo-700 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
            {serverError}
          </div>
        )}

        <BaseInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <BaseButton type="submit" className="w-full" isLoading={isSubmitting}>
          Send Reset Link
        </BaseButton>
      </form>

      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-sm font-semibold text-primary hover:text-indigo-700 transition-colors">
          &larr; Back to Login
        </Link>
      </div>
    </div>
  );
}
