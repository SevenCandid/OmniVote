import { useQuery } from '@tanstack/react-query';
import { organizationAuditApi } from '../api/organizationAuditApi';

export const useOrganizationAuditLogs = (
  organizationId: string,
  skip: number = 0,
  limit: number = 50,
  eventType?: string
) => {
  return useQuery({
    queryKey: [
      'audit-logs',
      'organization',
      organizationId,
      skip,
      limit,
      eventType,
    ],
    queryFn: () =>
      organizationAuditApi.getOrganizationAuditLogs(
        organizationId,
        skip,
        limit,
        eventType
      ),
    enabled: !!organizationId,
    keepPreviousData: true,
  });
};
