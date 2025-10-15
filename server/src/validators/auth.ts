import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(100).regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must include at least one letter and one number'),
  role: z.enum(['admin', 'finance_expert']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(100),
});
