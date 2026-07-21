import { z } from 'zod';

export const platformStatisticsSchema = z.object({
  total_organizations: z.number(),
  verified_organizations: z.number(),
  pending_verification: z.number(),
  platform_users: z.number(),
  standard_users: z.number(),
  active_support_sessions: z.number(),
  open_support_requests: z.number(),
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
