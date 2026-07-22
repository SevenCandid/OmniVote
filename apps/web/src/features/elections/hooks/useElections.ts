import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { electionApi } from '../api/electionApi';
import { ElectionCreate, ElectionUpdate } from '../types';

export const electionKeys = {
  all: ['elections'] as const,
  lists: () => [...electionKeys.all, 'list'] as const,
  list: (orgId: string, filters: string) =>
    [...electionKeys.lists(), orgId, { filters }] as const,
  details: () => [...electionKeys.all, 'detail'] as const,
  detail: (orgId: string, id: string) =>
    [...electionKeys.details(), orgId, id] as const,
};

export function useElections(organizationId: string, skip = 0, limit = 50) {
  return useQuery({
    queryKey: electionKeys.list(organizationId, `skip=${skip}&limit=${limit}`),
    queryFn: () => electionApi.list(organizationId, skip, limit),
    enabled: !!organizationId,
  });
}

export function useElection(organizationId: string, electionId: string) {
  return useQuery({
    queryKey: electionKeys.detail(organizationId, electionId),
    queryFn: () => electionApi.get(organizationId, electionId),
    enabled: !!organizationId && !!electionId,
  });
}

export function useCreateElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: ElectionCreate;
    }) => electionApi.create(organizationId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.setQueryData(
        electionKeys.detail(variables.organizationId, data.id),
        data
      );
    },
  });
}

export function useUpdateElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      electionId,
      data,
    }: {
      organizationId: string;
      electionId: string;
      data: ElectionUpdate;
    }) => electionApi.update({ organizationId, electionId, data }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.setQueryData(
        electionKeys.detail(variables.organizationId, variables.electionId),
        data
      );
    },
  });
}

export function useDeleteElection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      electionId,
    }: {
      organizationId: string;
      electionId: string;
    }) => electionApi.delete(organizationId, electionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
      queryClient.removeQueries({
        queryKey: electionKeys.detail(
          variables.organizationId,
          variables.electionId
        ),
      });
    },
  });
}

export function useElectionLifecycle() {
  const queryClient = useQueryClient();

  const handleSuccess = (data: any, variables: any) => {
    queryClient.invalidateQueries({ queryKey: electionKeys.lists() });
    queryClient.setQueryData(
      electionKeys.detail(variables.organizationId, variables.electionId),
      data
    );
  };

  const publish = useMutation({
    mutationFn: ({
      organizationId,
      electionId,
    }: {
      organizationId: string;
      electionId: string;
    }) => electionApi.publish(organizationId, electionId),
    onSuccess: handleSuccess,
  });

  const openVoting = useMutation({
    mutationFn: ({
      organizationId,
      electionId,
    }: {
      organizationId: string;
      electionId: string;
    }) => electionApi.openVoting(organizationId, electionId),
    onSuccess: handleSuccess,
  });

  const closeVoting = useMutation({
    mutationFn: ({
      organizationId,
      electionId,
    }: {
      organizationId: string;
      electionId: string;
    }) => electionApi.closeVoting(organizationId, electionId),
    onSuccess: handleSuccess,
  });

  const archive = useMutation({
    mutationFn: ({
      organizationId,
      electionId,
    }: {
      organizationId: string;
      electionId: string;
    }) => electionApi.archive(organizationId, electionId),
    onSuccess: handleSuccess,
  });

  const cancel = useMutation({
    mutationFn: ({
      organizationId,
      electionId,
    }: {
      organizationId: string;
      electionId: string;
    }) => electionApi.cancel(organizationId, electionId),
    onSuccess: handleSuccess,
  });

  return {
    publish,
    openVoting,
    closeVoting,
    archive,
    cancel,
  };
}
