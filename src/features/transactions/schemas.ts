import { z } from 'zod'
import { cleanText, parseRupees } from '@/lib/sanitize'

export const transactionSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => parseRupees(val)),
  kind: z.enum(['expense', 'income', 'goal_deposit']),
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
  note: z.string().transform(cleanText(120)),
  tag: z.enum(['need', 'want']),
  unexpected: z.boolean().default(false),
  goalId: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
