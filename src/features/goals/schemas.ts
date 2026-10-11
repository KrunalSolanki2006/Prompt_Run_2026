import { z } from 'zod'
import { cleanText, parseRupees } from '@/lib/sanitize'

export const goalSchema = z.object({
  name: z
    .string()
    .transform(cleanText(60))
    .refine((val) => val.length >= 2, 'Goal name must be at least 2 characters'),
  targetAmount: z
    .union([z.number(), z.string()])
    .transform((val) => parseRupees(val)),
  startingSaved: z
    .union([z.number(), z.string(), z.undefined()])
    .optional()
    .transform((val) => (val !== undefined && val !== '' ? parseRupees(val) : 0)),
  cycleContribution: z
    .union([z.number(), z.string()])
    .transform((val) => parseRupees(val)),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  deadline: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Deadline must be a valid date (YYYY-MM-DD)',
    }),
})

export type GoalFormData = z.infer<typeof goalSchema>

export const goalDepositSchema = z.object({
  goalId: z.string().min(1, 'Select a savings goal'),
  amount: z
    .union([z.number(), z.string()])
    .transform((val) => parseRupees(val)),
})

export type GoalDepositFormData = z.infer<typeof goalDepositSchema>
