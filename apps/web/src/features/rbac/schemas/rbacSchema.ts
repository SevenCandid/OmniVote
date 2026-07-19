import { z } from 'zod';

export const PermissionSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  display_name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  is_system: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Permission = z.infer<typeof PermissionSchema>;

export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Role name is required').max(255),
  description: z.string().nullable(),
  organization_id: z.string().uuid().nullable(),
  is_system: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;

export const RoleCreateInputSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(255),
  description: z.string().nullable().optional(),
});

export type RoleCreateInput = z.infer<typeof RoleCreateInputSchema>;

export const RoleUpdateInputSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
});

export type RoleUpdateInput = z.infer<typeof RoleUpdateInputSchema>;

export const RolePermissionAssignSchema = z.object({
  permission_id: z.string().uuid(),
});

export type RolePermissionAssign = z.infer<typeof RolePermissionAssignSchema>;

export const MembershipRoleAssignSchema = z.object({
  role_id: z.string().uuid(),
});

export type MembershipRoleAssign = z.infer<typeof MembershipRoleAssignSchema>;
