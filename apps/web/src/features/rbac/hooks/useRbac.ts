import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacApi } from '../services/rbacApi';
import {
  RoleCreateInput,
  RoleUpdateInput,
  RolePermissionAssign,
  MembershipRoleAssign,
} from '../schemas/rbacSchema';
import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const rbacKeys = {
  all: ['rbac'] as const,
  roles: (orgId: string) => [...rbacKeys.all, orgId, 'roles'] as const,
  roleDetails: (orgId: string, roleId: string) =>
    [...rbacKeys.all, orgId, 'roles', roleId] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
  rolePermissions: (orgId: string, roleId: string) =>
    [...rbacKeys.all, orgId, 'roles', roleId, 'permissions'] as const,
  membershipRoles: (orgId: string, membershipId: string) =>
    [...rbacKeys.all, orgId, 'memberships', membershipId, 'roles'] as const,
  myMemberships: () => [...rbacKeys.all, 'myMemberships'] as const,
};

// Roles
export const useRoles = (organizationId: string) => {
  return useQuery({
    queryKey: rbacKeys.roles(organizationId),
    queryFn: () => rbacApi.listRoles(organizationId),
    enabled: !!organizationId,
  });
};

export const useRole = (organizationId: string, roleId: string) => {
  return useQuery({
    queryKey: rbacKeys.roleDetails(organizationId, roleId),
    queryFn: () => rbacApi.getRole(organizationId, roleId),
    enabled: !!organizationId && !!roleId,
  });
};

export const useCreateRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoleCreateInput) =>
      rbacApi.createRole(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.roles(organizationId),
      });
    },
  });
};

export const useUpdateRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: RoleUpdateInput }) =>
      rbacApi.updateRole(organizationId, roleId, data),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.roles(organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: rbacKeys.roleDetails(organizationId, roleId),
      });
    },
  });
};

export const useDeleteRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rbacApi.deleteRole(organizationId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.roles(organizationId),
      });
    },
  });
};

// Permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: () => rbacApi.listPermissions(),
  });
};

export const useRolePermissions = (organizationId: string, roleId: string) => {
  return useQuery({
    queryKey: rbacKeys.rolePermissions(organizationId, roleId),
    queryFn: () => rbacApi.listRolePermissions(organizationId, roleId),
    enabled: !!organizationId && !!roleId,
  });
};

export const useAssignRolePermission = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string;
      data: RolePermissionAssign;
    }) => rbacApi.assignRolePermission(organizationId, roleId, data),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.rolePermissions(organizationId, roleId),
      });
    },
  });
};

export const useRemoveRolePermission = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => rbacApi.removeRolePermission(organizationId, roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.rolePermissions(organizationId, roleId),
      });
    },
  });
};

export const useReplaceRolePermissions = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => rbacApi.replaceRolePermissions(organizationId, roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.rolePermissions(organizationId, roleId),
      });
    },
  });
};

// Membership Roles
export const useMembershipRoles = (
  organizationId: string,
  membershipId: string
) => {
  return useQuery({
    queryKey: rbacKeys.membershipRoles(organizationId, membershipId),
    queryFn: () => rbacApi.listMembershipRoles(organizationId, membershipId),
    enabled: !!organizationId && !!membershipId,
  });
};

export const useAssignMembershipRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      data,
    }: {
      membershipId: string;
      data: MembershipRoleAssign;
    }) => rbacApi.assignMembershipRole(organizationId, membershipId, data),
    onSuccess: (_, { membershipId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.membershipRoles(organizationId, membershipId),
      });
    },
  });
};

export const useRemoveMembershipRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      roleId,
    }: {
      membershipId: string;
      roleId: string;
    }) => rbacApi.removeMembershipRole(organizationId, membershipId, roleId),
    onSuccess: (_, { membershipId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.membershipRoles(organizationId, membershipId),
      });
    },
  });
};

export const useReplaceMembershipRoles = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      roleIds,
    }: {
      membershipId: string;
      roleIds: string[];
    }) => rbacApi.replaceMembershipRoles(organizationId, membershipId, roleIds),
    onSuccess: (_, { membershipId }) => {
      queryClient.invalidateQueries({
        queryKey: rbacKeys.membershipRoles(organizationId, membershipId),
      });
    },
  });
};

// My Permissions (Effective Permissions Logic)
// My Permissions (Effective Permissions Logic)
export const useMyPermissions = (organizationId: string | undefined) => {
  const { accessToken } = useSessionStore();

  const { data: effectiveData, isLoading } = useQuery({
    queryKey: ['my-effective-permissions', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const res = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/my-permissions`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (res.status === 401) {
        useSessionStore.getState().logout();
        throw new Error('Unauthorized');
      }
      if (!res.ok) {
        if (res.status === 403) return null; // Not a member or restricted
        throw new Error('Failed to fetch permissions');
      }
      // The endpoint returns a plain list of strings representing the permissions
      return res.json() as Promise<string[]>;
    },
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache permissions for 5 mins
  });

  const hasPermission = (permissionKey: string) => {
    if (!effectiveData || !Array.isArray(effectiveData)) return false;
    return effectiveData.includes(permissionKey);
  };

  return {
    permissions: Array.isArray(effectiveData) ? effectiveData : [],
    roles: [],
    membershipId: undefined,
    hasPermission,
    isLoading,
  };
};
