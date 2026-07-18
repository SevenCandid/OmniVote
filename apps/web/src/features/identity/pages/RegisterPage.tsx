import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../schemas/auth';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { identityApi } from '../services/identityApi';

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  
  // Basic password strength logic
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      await identityApi.register({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during registration');
    }
  };

  if (success) {
    return (
      <div className="w-full text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          We've sent a verification link to your email address. Please click the link to activate your account.
        </p>
        <div className="pt-6">
          <BaseButton onClick={() => navigate('/auth/login')} variant="outline" className="w-full">
            Return to Login
          </BaseButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          Join OmniVote and start managing elections
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <BaseInput
            label="First Name"
            placeholder="Jane"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <BaseInput
            label="Last Name"
            placeholder="Doe"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <BaseInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1.5">
          <BaseInput
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          {password.length > 0 && (
            <div className="flex items-center gap-1 mt-1 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className={`h-full ${strength >= 1 ? 'bg-red-500' : ''} flex-1`} />
              <div className={`h-full ${strength >= 2 ? 'bg-orange-500' : ''} flex-1`} />
              <div className={`h-full ${strength >= 3 ? 'bg-emerald-500' : ''} flex-1`} />
              <div className={`h-full ${strength >= 4 ? 'bg-emerald-600' : ''} flex-1`} />
            </div>
          )}
        </div>

        <BaseInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="pt-2">
          <BaseButton type="submit" className="w-full" isLoading={isSubmitting}>
            Create Account
          </BaseButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="font-semibold text-primary hover:text-indigo-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
