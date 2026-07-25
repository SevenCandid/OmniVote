import { z } from 'zod';
import { CandidateStatus } from '../types/candidate';

export const candidateBaseSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255, 'Full name is too long'),
  short_name: z.string().max(100, 'Short name is too long').optional().nullable(),
  photo: z.string().max(1000, 'Photo URL is too long').optional().nullable(),
  bio: z.string().optional().nullable(),
  manifesto: z.string().optional().nullable(),
});

export const candidateCreateSchema = candidateBaseSchema.extend({
  candidate_number: z.number().int().min(1, 'Candidate number must be at least 1').optional(),
});

export const candidateUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255, 'Full name is too long').optional(),
  short_name: z.string().max(100, 'Short name is too long').optional().nullable(),
  photo: z.string().max(1000, 'Photo URL is too long').optional().nullable(),
  bio: z.string().optional().nullable(),
  manifesto: z.string().optional().nullable(),
  status: z.nativeEnum(CandidateStatus).optional(),
});

export const candidateReorderSchema = z.object({
  new_candidate_number: z.number().int().min(1, 'Candidate number must be at least 1'),
});

export type CandidateCreateFormValues = z.infer<typeof candidateCreateSchema>;
export type CandidateUpdateFormValues = z.infer<typeof candidateUpdateSchema>;
export type CandidateReorderFormValues = z.infer<typeof candidateReorderSchema>;
