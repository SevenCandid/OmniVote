import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacApi } from '../services/rbacApi';
import { RoleCreateInput, RoleUpdateInput, RolePermissionAssign, MembershipRoleAssign } from '../schemas/rbacSchema';
import { useSessionStore } from '../../../stores/sessionStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const rbacKeys = {
  all: ['rbac'] as const,
  roles: (orgId: string) => [...rbacKeys.all, orgId, 'roles'] as const,
  roleDetails: (orgId: string, roleId: string) => [...rbacKeys.all, orgId, 'roles', roleId] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
  rolePermissions: (orgId: string, roleId: string) => [...rbacKeys.all, orgId, 'roles', roleId, 'permissions'] as const,
  membershipRoles: (orgId: string, membershipId: string) => [...rbacKeys.all, orgId, 'memberships', membershipId, 'roles'] as const,
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
    mutationFn: (data: RoleCreateInput) => rbacApi.createRole(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles(organizationId) });
    },
  });
};

export const useUpdateRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: RoleUpdateInput }) =>
      rbacApi.updateRole(organizationId, roleId, data),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles(organizationId) });
      queryClient.invalidateQueries({ queryKey: rbacKeys.roleDetails(organizationId, roleId) });
    },
  });
};

export const useDeleteRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rbacApi.deleteRole(organizationId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles(organizationId) });
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
    mutationFn: ({ roleId, data }: { roleId: string; data: RolePermissionAssign }) =>
      rbacApi.assignRolePermission(organizationId, roleId, data),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.rolePermissions(organizationId, roleId) });
    },
  });
};

export const useRemoveRolePermission = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      rbacApi.removeRolePermission(organizationId, roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.rolePermissions(organizationId, roleId) });
    },
  });
};

// Membership Roles
export const useMembershipRoles = (organizationId: string, membershipId: string) => {
  return useQuery({
    queryKey: rbacKeys.membershipRoles(organizationId, membershipId),
    queryFn: () => rbacApi.listMembershipRoles(organizationId, membershipId),
    enabled: !!organizationId && !!membershipId,
  });
};

export const useAssignMembershipRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, data }: { membershipId: string; data: MembershipRoleAssign }) =>
      rbacApi.assignMembershipRole(organizationId, membershipId, data),
    onSuccess: (_, { membershipId }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.membershipRoles(organizationId, membershipId) });
    },
  });
};

export const useRemoveMembershipRole = (organizationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ membershipId, roleId }: { membershipId: string; roleId: string }) =>
      rbacApi.removeMembershipRole(organizationId, membershipId, roleId),
    onSuccess: (_, { membershipId }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.membershipRoles(organizationId, membershipId) });
    },
  });
};

// My Permissions (Effective Permissions Logic)
export const useMyPermissions = (organizationId: string | undefined) => {
  const { accessToken } = useSessionStore();

  // 1. Fetch user's memberships to find their membership ID in this org
  const { data: myMemberships } = useQuery({
    queryKey: rbacKeys.myMemberships(),
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/users/me/organizations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401) {
        useSessionStore.getState().logout();
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Failed to fetch memberships');
      return res.json() as Promise<{ id: string; organization_id: string }[]>;
    },
    enabled: !!accessToken,
  });

  const membershipId = myMemberships?.find((m) => m.organization_id === organizationId)?.id;

  // 2. Fetch roles for that membership
  const { data: roles } = useQuery({
    queryKey: rbacKeys.membershipRoles(organizationId!, membershipId!),
    queryFn: () => rbacApi.listMembershipRoles(organizationId!, membershipId!),
    enabled: !!organizationId && !!membershipId,
    retry: false, // Don't retry if 403
  });

  // 3. We cannot easily map over an unknown number of queries to fetch permissions inside a single hook.
  // We'll fetch ALL permissions (if they have access) and filter locally, OR fetch permissions per role if needed.
  // Actually, since this is for frontend hiding only, we'll fetch ALL permissions of those roles.
  // Since we can't do useQuery in a loop dynamically easily without useQueries, we'll write a custom query function.

  const { data: effectivePermissions, isLoading } = useQuery({
    queryKey: ['my-effective-permissions', organizationId, membershipId, roles?.map(r => r.id).join(',')],
    queryFn: async () => {
      if (!roles || roles.length === 0) return [];
      const permKeys = new Set<string>();
      for (const role of roles) {
        try {
          const perms = await rbacApi.listRolePermissions(organizationId!, role.id);
          perms.forEach(p => permKeys.add(p.key));
        } catch (e) {
          // ignore 403s for specific role permissions fetching
        }
      }
      return Array.from(permKeys);
    },
    enabled: !!organizationId && !!membershipId && !!roles && roles.length > 0,
  });

  const hasPermission = (permissionKey: string) => {
    if (!effectivePermissions) return false; // Default to hiding until loaded
    return effectivePermissions.includes(permissionKey);
  };

  return {
    permissions: effectivePermissions || [],
    hasPermission,
    isLoading: !effectivePermissions && isLoading,
  };
};
