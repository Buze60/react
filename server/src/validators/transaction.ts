import { z } from 'zod';

export const transactionCreateSchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date')).transform((s) => new Date(s)),
  category: z.string().trim().min(1).max(64),
  description: z.string().trim().max(500).optional(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();
