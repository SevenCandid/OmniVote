import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voterApi } from '../api/voterApi';
import { EligibleVoterCreate, PaginatedVoterResponse } from '../types/voter';

export const useVoters = (organizationId: string, electionId: string, skip = 0, limit = 50) => {
  return useQuery<PaginatedVoterResponse>({
    queryKey: ['elections', electionId, 'voters', skip, limit],
    queryFn: () => voterApi.list(organizationId, electionId, skip, limit),
  });
};

export const useAddVoter = (organizationId: string, electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EligibleVoterCreate) => voterApi.create(organizationId, electionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections', electionId, 'voters'] });
    },
  });
};

export const useBulkAddVoters = (organizationId: string, electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EligibleVoterCreate[]) => voterApi.bulkCreate(organizationId, electionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections', electionId, 'voters'] });
    },
  });
};

export const useDeleteVoter = (organizationId: string, electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voterId: string) => voterApi.delete(organizationId, electionId, voterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections', electionId, 'voters'] });
    },
  });
};
