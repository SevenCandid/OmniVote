import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    // If they are already authenticated, redirect them to the dashboard
    // Or whatever page they were originally trying to access before being sent to login
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
