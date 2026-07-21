import { z } from 'zod';

export const platformStatisticsSchema = z.object({
  total_organizations: z.number(),
  verified_organizations: z.number(),
  pending_verification: z.number(),
  platform_users: z.number(),
  standard_users: z.number(),
  active_support_sessions: z.number(),
  open_support_requests: z.number(),
  org_growth_percentage: z.number().optional(),
  user_growth_percentage: z.number().optional(),
  total_elections: z.number().optional(),
  active_elections: z.number().optional(),
  system_health: z.record(z.any()).optional(),
});

export const platformActivityLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  event_type: z.string(),
  user_id: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export type PlatformStatistics = z.infer<typeof platformStatisticsSchema>;
export type PlatformActivityLog = z.infer<typeof platformActivityLogSchema>;

export const platformAuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  event_type: z.string(),
  user_id: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const paginatedAuditSchema = z.object({
  items: z.array(platformAuditLogSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type PlatformAuditLog = z.infer<typeof platformAuditLogSchema>;
export type PaginatedAuditResponse = z.infer<typeof paginatedAuditSchema>;
