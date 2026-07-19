import { z } from 'zod';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

export const InvitationSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  invited_by: z.string().uuid(),
  recipient_email: z.string().email(),
  recipient_user_id: z.string().uuid().nullable().optional(),
  status: z.nativeEnum(InvitationStatus),
  initial_roles: z.array(z.string()),
  expires_at: z.string(),
  accepted_at: z.string().nullable().optional(),
  declined_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).nullable().optional(),
});

export type Invitation = z.infer<typeof InvitationSchema>;

export const InvitationDetailsSchema = z.object({
  id: z.string().uuid(),
  organization_name: z.string(),
  invited_by_name: z.string().nullable().optional(),
  recipient_email: z.string().email(),
  status: z.nativeEnum(InvitationStatus),
  expires_at: z.string(),
});

export type InvitationDetails = z.infer<typeof InvitationDetailsSchema>;

export const InviteMemberSchema = z.object({
  recipient_email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  initial_roles: z.array(z.string()).optional(),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
