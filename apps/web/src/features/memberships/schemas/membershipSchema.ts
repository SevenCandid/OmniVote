import { z } from 'zod';

export enum MembershipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  SUSPENDED = 'suspended',
  REMOVED = 'removed',
}

export const MembershipSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  status: z.nativeEnum(MembershipStatus),
  invited_by: z.string().uuid().nullable().optional(),
  invited_at: z.string().nullable().optional(),
  accepted_at: z.string().nullable().optional(),
  suspended_at: z.string().nullable().optional(),
  removed_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).nullable().optional(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
  }).nullable().optional(),
});

export type Membership = z.infer<typeof MembershipSchema>;

