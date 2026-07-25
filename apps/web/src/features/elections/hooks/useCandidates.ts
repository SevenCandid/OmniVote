import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '../api/candidateApi';
import { CandidateCreate, CandidateUpdate, CandidateReorderRequest } from '../types/candidate';

export const candidateKeys = {
  all: ['candidates'] as const,
  lists: (orgId: string, electionId: string, categoryId: string) => [...candidateKeys.all, orgId, electionId, categoryId] as const,
  detail: (orgId: string, electionId: string, categoryId: string, candidateId: string) => [...candidateKeys.lists(orgId, electionId, categoryId), candidateId] as const,
};

export const useCandidates = (orgId: string, electionId: string, categoryId: string) => {
  return useQuery({
    queryKey: candidateKeys.lists(orgId, electionId, categoryId),
    queryFn: () => candidateApi.getCandidates(orgId, electionId, categoryId),
    enabled: !!orgId && !!electionId && !!categoryId,
  });
};

export const useCreateCandidate = (orgId: string, electionId: string, categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CandidateCreate) => candidateApi.createCandidate(orgId, electionId, categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists(orgId, electionId, categoryId) });
    },
  });
};

export const useUpdateCandidate = (orgId: string, electionId: string, categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, data }: { candidateId: string; data: CandidateUpdate }) =>
      candidateApi.updateCandidate(orgId, electionId, categoryId, candidateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists(orgId, electionId, categoryId) });
      queryClient.invalidateQueries({ queryKey: candidateKeys.detail(orgId, electionId, categoryId, variables.candidateId) });
    },
  });
};

export const useReorderCandidate = (orgId: string, electionId: string, categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, data }: { candidateId: string; data: CandidateReorderRequest }) =>
      candidateApi.reorderCandidate(orgId, electionId, categoryId, candidateId, data),
    onSuccess: () => {
      // Reordering affects the whole list
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists(orgId, electionId, categoryId) });
    },
  });
};

export const useDeleteCandidate = (orgId: string, electionId: string, categoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) => candidateApi.deleteCandidate(orgId, electionId, categoryId, candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.lists(orgId, electionId, categoryId) });
    },
  });
};
