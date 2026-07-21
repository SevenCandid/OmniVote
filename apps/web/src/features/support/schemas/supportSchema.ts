import { z } from 'zod';

export const SupportRequestStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
]);

export type SupportRequestStatus = z.infer<typeof SupportRequestStatusSchema>;

export const SessionStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'TERMINATED']);

export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SupportRequestSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  requested_by: z.string().uuid(),
  request_type: z.string(),
  description: z.string(),
  status: SupportRequestStatusSchema,
  created_at: z.string(),
  resolved_at: z.string().nullable().optional(),
});

export type SupportRequest = z.infer<typeof SupportRequestSchema>;

export const SupportSessionSchema = z.object({
  id: z.string().uuid(),
  platform_user_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  support_request_id: z.string().uuid().nullable().optional(),
  access_level: z.string(),
  reason: z.string(),
  expires_at: z.string(),
  status: SessionStatusSchema,
  created_at: z.string(),
  ended_at: z.string().nullable().optional(),
});

export type SupportSession = z.infer<typeof SupportSessionSchema>;

export const SupportRequestCreateSchema = z.object({
  request_type: z.string().min(1, 'Type is required').max(50),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
});

export type SupportRequestCreate = z.infer<typeof SupportRequestCreateSchema>;

export const EmergencySessionCreateSchema = z.object({
  organization_id: z.string().uuid('Please select a valid organization'),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
  duration_minutes: z
    .number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(1440, 'Duration cannot exceed 24 hours (1440 mins)'),
});

export type EmergencySessionCreate = z.infer<
  typeof EmergencySessionCreateSchema
>;
