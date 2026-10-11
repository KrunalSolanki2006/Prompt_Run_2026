import { z } from 'zod'
import { todayISO, diffDays } from '@/engine/dates'

export const cycleSetupSchema = z.object({
  startingBalance: z
    .number({ message: 'Budget must be a whole number' })
    .int('Whole rupees only')
    .min(1, 'Budget must be at least ₹1')
    .max(1000000, 'Budget cannot exceed ₹10,00,000'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date (YYYY-MM-DD)')
    .refine((date) => {
      const today = todayISO()
      const diff = diffDays(date, today)
      // Must be today or up to 29 days in the past
      return diff >= 0 && diff <= 29
    }, 'Start date must be today or within the past 29 days'),
  bufferPercent: z
    .number({ message: 'Buffer must be a percentage between 0 and 30' })
    .int('Must be an integer')
    .min(0, 'Buffer cannot be negative')
    .max(30, 'Buffer cannot exceed 30%'),
})

export type CycleSetupFormData = z.infer<typeof cycleSetupSchema>
