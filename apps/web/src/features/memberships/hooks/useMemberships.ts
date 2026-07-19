import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipApi } from '../services/membershipApi';
import { InviteMemberInput } from '../schemas/invitationSchema';

export const membershipKeys = {
  all: ['memberships'] as const,
  orgMembers: (orgId: string) => [...membershipKeys.all, 'org', orgId, 'members'] as const,
  orgPending: (orgId: string) => [...membershipKeys.all, 'org', orgId, 'pending'] as const,
  userOrganizations: () => [...membershipKeys.all, 'user', 'organizations'] as const,
  userInvitations: () => [...membershipKeys.all, 'user', 'invitations'] as const,
};

export const useOrganizationMembers = (organizationId: string) => {
  return useQuery({
    queryKey: membershipKeys.orgMembers(organizationId),
    queryFn: () => membershipApi.getOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });
};

export const usePendingInvitations = (organizationId: string) => {
  return useQuery({
    queryKey: membershipKeys.orgPending(organizationId),
    queryFn: () => membershipApi.getPendingInvitations(organizationId),
    enabled: !!organizationId,
  });
};

export const useUserOrganizations = () => {
  return useQuery({
    queryKey: membershipKeys.userOrganizations(),
    queryFn: () => membershipApi.getUserOrganizations(),
  });
};

export const useUserInvitations = () => {
  return useQuery({
    queryKey: membershipKeys.userInvitations(),
    queryFn: () => membershipApi.getUserInvitations(),
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, data }: { organizationId: string; data: InviteMemberInput }) =>
      membershipApi.inviteMember(organizationId, data),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.orgMembers(organizationId) });
      queryClient.invalidateQueries({ queryKey: membershipKeys.orgPending(organizationId) });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => membershipApi.acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => membershipApi.declineInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
};

export const useRemoveMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, membershipId }: { organizationId: string; membershipId: string }) =>
      membershipApi.removeMembership(organizationId, membershipId),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: membershipKeys.orgMembers(organizationId) });
    },
  });
};
