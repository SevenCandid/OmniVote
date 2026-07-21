import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

interface PublicRouteProps {
  children: React.ReactNode;
  defaultRedirect?: string;
}

export function PublicRoute({
  children,
  defaultRedirect = '/dashboard',
}: PublicRouteProps) {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    // If they are already authenticated, redirect them to the defaultRedirect
    // Or whatever page they were originally trying to access before being sent to login
    const from = (location.state as any)?.from?.pathname || defaultRedirect;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
