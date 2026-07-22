import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../api/auditApi';

export const usePersonalAuditLogs = (
  skip: number = 0,
  limit: number = 50,
  eventType?: string
) => {
  return useQuery({
    queryKey: ['audit-logs', 'personal', skip, limit, eventType],
    queryFn: () => auditApi.getPersonalAuditLogs(skip, limit, eventType),
    keepPreviousData: true,
  });
};
