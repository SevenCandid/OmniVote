import { z } from 'zod';

export const OrganizationStatusSchema = z.enum([
  'active',
  'suspended',
  'archived',
]);

export const OrganizationVerificationStatusSchema = z.enum([
  'unverified',
  'pending_verification',
  'verified',
  'rejected',
]);

export const SubscriptionStatusSchema = z.enum([
  'active',
  'canceled',
  'trialing',
  'past_due',
  'unpaid',
]);

// Creation Schema
export const OrganizationCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  legal_name: z.string().max(255).optional().nullable(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),
  description: z.string().optional().nullable(),
  website: z
    .union([z.string().url('Must be a valid URL'), z.literal('')])
    .optional()
    .nullable(),
  contact_email: z
    .union([z.string().email('Must be a valid email'), z.literal('')])
    .optional()
    .nullable(),
  contact_phone: z.string().max(50).optional().nullable(),
  country: z
    .union([
      z.string().length(2, 'Must be a 2-letter country code'),
      z.literal(''),
    ])
    .optional()
    .nullable(),
  timezone: z.string().max(100).default('UTC'),
  preferred_language: z.string().max(10).default('en'),
  currency: z.string().length(3).default('USD'),
});

export type OrganizationCreateInput = z.infer<typeof OrganizationCreateSchema>;

// Update Schema
export const OrganizationUpdateSchema =
  OrganizationCreateSchema.partial().extend({
    status: OrganizationStatusSchema.optional(),
    verification_status: OrganizationVerificationStatusSchema.optional(),
  });

export type OrganizationUpdateInput = z.infer<typeof OrganizationUpdateSchema>;

export const OrganizationSettingsUpdateSchema = z.object({
  default_timezone: z.string().optional(),
  date_format: z.string().optional(),
  time_format: z.string().optional(),
  default_event_visibility: z.string().optional(),
  default_result_visibility: z.string().optional(),
});

export type OrganizationSettingsUpdateInput = z.infer<typeof OrganizationSettingsUpdateSchema>;

export const OrganizationBrandingUpdateSchema = z.object({
  logo_url: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional().nullable(),
  banner_url: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional().nullable(),
  favicon_url: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional().nullable(),
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  accent_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional().nullable(),
  theme_preference: z.string().optional(),
});

export type OrganizationBrandingUpdateInput = z.infer<typeof OrganizationBrandingUpdateSchema>;

// Response Schemas
export const OrganizationSettingsSchema = z.object({
  id: z.string().uuid(),
  default_timezone: z.string(),
  date_format: z.string(),
  time_format: z.string(),
  default_event_visibility: z.string(),
  default_result_visibility: z.string(),
});

export const OrganizationBrandingSchema = z.object({
  id: z.string().uuid(),
  logo_url: z.string().nullable(),
  banner_url: z.string().nullable(),
  favicon_url: z.string().nullable(),
  primary_color: z.string().nullable(),
  secondary_color: z.string().nullable(),
  accent_color: z.string().nullable(),
  theme_preference: z.string(),
});

export const OrganizationSubscriptionSchema = z.object({
  id: z.string().uuid(),
  current_plan: z.string(),
  status: SubscriptionStatusSchema,
  is_trial: z.boolean(),
  trial_expires_at: z.string().nullable(),
});

export const OrganizationResponseSchema = OrganizationCreateSchema.extend({
  id: z.string().uuid(),
  status: OrganizationStatusSchema,
  verification_status: OrganizationVerificationStatusSchema,
  is_deleted: z.boolean(),
  settings: OrganizationSettingsSchema.optional(),
  branding: OrganizationBrandingSchema.optional(),
  subscription: OrganizationSubscriptionSchema.optional(),
});

export type Organization = z.infer<typeof OrganizationResponseSchema>;
