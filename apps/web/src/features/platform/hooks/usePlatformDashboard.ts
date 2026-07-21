import { useQuery } from '@tanstack/react-query';
import { platformDashboardApi } from '../api/platformDashboardApi';
import { usePlatformPermissions } from './usePlatformPermissions';

export const PLATFORM_DASHBOARD_KEYS = {
  all: ['platformDashboard'] as const,
  statistics: () => [...PLATFORM_DASHBOARD_KEYS.all, 'statistics'] as const,
  activity: (limit: number) =>
    [...PLATFORM_DASHBOARD_KEYS.all, 'activity', limit] as const,
};

export function usePlatformStatistics() {
  const { isPlatformAdmin } = usePlatformPermissions();

  return useQuery({
    queryKey: PLATFORM_DASHBOARD_KEYS.statistics(),
    queryFn: platformDashboardApi.getStatistics,
    enabled: isPlatformAdmin,
  });
}

export function usePlatformActivity(limit: number = 5) {
  const { isPlatformAdmin } = usePlatformPermissions();

  return useQuery({
    queryKey: PLATFORM_DASHBOARD_KEYS.activity(limit),
    queryFn: () => platformDashboardApi.getActivity(limit),
    enabled: isPlatformAdmin,
  });
}
