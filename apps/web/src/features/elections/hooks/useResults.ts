import { useQuery } from '@tanstack/react-query';
import { electionResultApi } from '../api/resultApi';
import { useElection } from './useElections';

export const resultKeys = {
  all: ['election-results'] as const,
  detail: (orgId: string, electionId: string) => [...resultKeys.all, orgId, electionId] as const,
};

export function useElectionResults(organizationId: string, electionId: string, live: boolean = false) {
  return useQuery({
    queryKey: resultKeys.detail(organizationId, electionId),
    queryFn: () => electionResultApi.getResults(organizationId, electionId),
    enabled: !!organizationId && !!electionId,
    refetchInterval: live ? 5000 : false, // Poll every 5s if live
  });
}
