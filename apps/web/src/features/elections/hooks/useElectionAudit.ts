import { useQuery } from '@tanstack/react-query';
import { electionApi } from '../api/electionApi';

export function useElectionAudit(organizationId: string, electionId: string) {
  return useQuery({
    queryKey: ['election-audit', organizationId, electionId],
    queryFn: () => electionApi.getAuditLogs(organizationId, electionId),
    enabled: !!organizationId && !!electionId,
  });
}
