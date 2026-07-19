import React from 'react';
import { useMyPermissions } from '../hooks/useRbac';

interface RequirePermissionProps {
  permissionKey: string;
  organizationId: string | undefined;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({
  permissionKey,
  organizationId,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = useMyPermissions(organizationId);

  if (isLoading) {
    // Optionally return null or a generic skeleton while checking permissions
    return null;
  }

  if (!hasPermission(permissionKey)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
