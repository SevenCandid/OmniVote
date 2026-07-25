import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votingApi } from '../api/votingApi';
import { StartSessionRequest, DraftSelectionUpdate } from '../types/voting';

const QUERY_KEYS = {
  session: (electionId: string, sessionId: string) => ['voting', electionId, sessionId],
};

export function useStartSession(organizationId: string, electionId: string) {
  return useMutation({
    mutationFn: (data: StartSessionRequest) => votingApi.startSession(organizationId, electionId, data),
  });
}

export function useVotingSession(organizationId: string, electionId: string, sessionId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.session(electionId, sessionId!),
    queryFn: () => votingApi.getSession(organizationId, electionId, sessionId!),
    enabled: !!sessionId,
    staleTime: 0, // We want the latest session state (especially expiration)
  });
}

export function useSaveDraft(organizationId: string, electionId: string, sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DraftSelectionUpdate) => votingApi.saveDraft(organizationId, electionId, sessionId, data),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(QUERY_KEYS.session(electionId, sessionId), updatedSession);
    },
  });
}

export function useSubmitBallot(organizationId: string, electionId: string, sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => votingApi.submitBallot(organizationId, electionId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(electionId, sessionId) });
    },
  });
}
