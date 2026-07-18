import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { identityApi } from '../services/identityApi';
import { BaseButton } from '../../../components/ui/BaseButton';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided.');
      return;
    }

    identityApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message || 'Verification failed. The link may be expired.');
      });
  }, [token]);

  return (
    <div className="w-full text-center space-y-4">
      {status === 'loading' && (
        <>
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="animate-spin w-full h-full text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Verifying your email...</h1>
          <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            Please wait while we verify your account.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-fade-in">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email Verified!</h1>
          <p className="text-sm text-[var(--color-neutral-secondary-light)] dark:text-[var(--color-neutral-secondary-dark)]">
            Your account is now active.
          </p>
          <div className="pt-6">
            <BaseButton onClick={() => navigate('/auth/login')} className="w-full">
              Continue to Login
            </BaseButton>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Verification Failed</h1>
          <p className="text-sm text-danger mt-2">{errorMsg}</p>
          <div className="pt-6">
            <BaseButton onClick={() => navigate('/auth/login')} variant="outline" className="w-full">
              Return to Login
            </BaseButton>
          </div>
        </>
      )}
    </div>
  );
}
