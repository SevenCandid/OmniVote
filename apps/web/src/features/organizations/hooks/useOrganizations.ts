import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../services/organizationApi';
import {
  OrganizationCreateInput,
  OrganizationUpdateInput,
  OrganizationSettingsUpdateInput,
  OrganizationBrandingUpdateInput,
} from '../schemas/organizationSchema';

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: string) =>
    [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

export const useOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: () => organizationApi.list(),
  });
};

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => organizationApi.get(id),
    enabled: !!id,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrganizationCreateInput) => organizationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdateInput }) =>
      organizationApi.update({ id, data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
};

export const useUpdateOrganizationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: OrganizationSettingsUpdateInput;
    }) => organizationApi.updateSettings({ id, data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(id),
      });
    },
  });
};

export const useUpdateOrganizationBranding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: OrganizationBrandingUpdateInput;
    }) => organizationApi.updateBranding({ id, data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(id),
      });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
};
