import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../../identity/schemas/auth';
import { BaseInput } from '../../../components/ui/BaseInput';
import { BaseButton } from '../../../components/ui/BaseButton';
import { identityApi } from '../../identity/services/identityApi';
import { useSessionStore } from '../../../stores/sessionStore';

export function PlatformLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useSessionStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/platform';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      const response = await identityApi.login(data);
      login(response.user, response.access_token, response.refresh_token);

      const inviteReturnTo = localStorage.getItem('inviteReturnTo');
      if (inviteReturnTo) {
        localStorage.removeItem('inviteReturnTo');
        navigate(inviteReturnTo, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Platform Administration</h1>
        <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
          Sign in to access the platform dashboard
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
          placeholder="admin@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <BaseInput
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs font-semibold text-primary hover:text-indigo-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <BaseButton type="submit" className="w-full" isLoading={isSubmitting}>
          Sign In as Administrator
        </BaseButton>
      </form>
    </div>
  );
}
