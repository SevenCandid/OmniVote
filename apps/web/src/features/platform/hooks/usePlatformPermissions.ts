import { useState, useEffect } from 'react';
import {
  platformApi,
  PlatformPermissionsResponse,
} from '../services/platformApi';

export function usePlatformPermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await platformApi.getMyPlatformPermissions();

        if (mounted) {
          setPermissions(res.data?.permissions || []);
          setRoles(res.data?.roles || []);
          // Any successful response with data indicates they have platform access
          setIsPlatformAdmin(true);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Failed to fetch platform permissions:', err);
          setError(err);
          setIsPlatformAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    permissions,
    roles,
    isLoading,
    error,
    isPlatformAdmin,
  };
}
