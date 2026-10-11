import { z } from 'zod'
import { cleanText, parseRupees } from '@/lib/sanitize'

export const incomeSchema = z.object({
  label: z
    .string()
    .transform(cleanText(60))
    .refine((val) => val.length >= 2, 'Label must be at least 2 characters'),
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => parseRupees(val)),
  freq: z.enum(['once', 'weekly', 'monthly']),
  anchor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  certainty: z.enum(['confirmed', 'likely']),
})

export type IncomeFormData = z.infer<typeof incomeSchema>
