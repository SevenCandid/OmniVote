import { useQuery } from '@tanstack/react-query';
import { electionApi, ElectionAnalyticsResponse } from '../api/electionApi';

export const useElectionAnalytics = (organizationId: string, electionId: string) => {
  return useQuery<ElectionAnalyticsResponse, Error>({
    queryKey: ['election-analytics', organizationId, electionId],
    queryFn: () =>
      electionApi.getAnalytics(organizationId, electionId),
    enabled: !!organizationId && !!electionId,
  });
};
