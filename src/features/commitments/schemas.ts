import { z } from 'zod'
import { cleanText, parseRupees } from '@/lib/sanitize'

export const commitmentSchema = z.object({
  label: z
    .string()
    .transform(cleanText(60))
    .refine((val) => val.length >= 2, 'Label must be at least 2 characters'),
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => parseRupees(val)),
  category: z.enum([
    'food',
    'transport',
    'shopping',
    'entertainment',
    'bills',
    'education',
    'health',
    'social',
    'subscriptions',
    'savings',
    'other',
  ]),
  freq: z.enum(['once', 'weekly', 'monthly', 'yearly']),
  anchor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  repeatCount: z
    .union([z.number(), z.string(), z.undefined()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
})

export type CommitmentFormData = z.infer<typeof commitmentSchema>
