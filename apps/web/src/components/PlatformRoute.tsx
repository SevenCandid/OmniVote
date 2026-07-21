import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { usePlatformPermissions } from '../features/platform/hooks/usePlatformPermissions';
import { BaseLoader } from './ui/BaseLoader';
import { EmptyState } from './ui/EmptyState';
import { ShieldAlert } from 'lucide-react';

interface PlatformRouteProps {
  children: React.ReactNode;
}

export function PlatformRoute({ children }: PlatformRouteProps) {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const location = useLocation();
  const { isLoading, error, isPlatformAdmin } = usePlatformPermissions();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)]">
        <BaseLoader />
      </div>
    );
  }

  // If there's an error (e.g. 403 Forbidden or 404 Not Found due to endpoint not existing yet)
  // or if the user is explicitly not a platform admin, show an unauthorized state.
  if (error || !isPlatformAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--color-canvas-light)] dark:bg-[var(--color-canvas-dark)] p-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={ShieldAlert}
            title="Platform Access Denied"
            description="You do not have the required administrative privileges to access the VeroSeven Platform Administration Portal."
            actionText="Return to Dashboard"
            onAction={() => (window.location.href = '/dashboard')}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
