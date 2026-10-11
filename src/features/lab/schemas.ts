import { z } from 'zod'
import { cleanText, parseRupees } from '@/lib/sanitize'

export const purchaseDecisionSchema = z.object({
  label: z.string().transform(cleanText(60)).refine((v) => v.length >= 2, 'Description required'),
  amount: z.union([z.number(), z.string()]).transform(parseRupees),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
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
  tag: z.enum(['need', 'want']),
})

export const newSubscriptionDecisionSchema = z.object({
  name: z.string().transform(cleanText(60)).refine((v) => v.length >= 2, 'Service name required'),
  amount: z.union([z.number(), z.string()]).transform(parseRupees),
  freq: z.enum(['weekly', 'monthly', 'yearly']),
  firstBillingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
})

export const cancelSubscriptionDecisionSchema = z.object({
  subscriptionId: z.string().min(1, 'Select a subscription to cancel'),
})

export const newCommitmentDecisionSchema = z.object({
  label: z.string().transform(cleanText(60)).refine((v) => v.length >= 2, 'Label required'),
  amount: z.union([z.number(), z.string()]).transform(parseRupees),
  freq: z.enum(['once', 'weekly', 'monthly', 'yearly']),
  anchor: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
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
})

export const goalDepositDecisionSchema = z.object({
  goalId: z.string().min(1, 'Select a target goal'),
  amount: z.union([z.number(), z.string()]).transform(parseRupees),
})

export const unexpectedExpenseDecisionSchema = z.object({
  label: z.string().transform(cleanText(60)).refine((v) => v.length >= 2, 'Emergency reason required'),
  amount: z.union([z.number(), z.string()]).transform(parseRupees),
})

export const incomeChangeDecisionSchema = z.object({
  incomeId: z.string().min(1, 'Select an income stream'),
  change: z.enum(['delay', 'missing']),
  days: z.union([z.number(), z.string(), z.undefined()]).optional().transform((v) => (v ? Number(v) : 7)),
})

export const spendingChangeDecisionSchema = z.object({
  percent: z
    .union([z.number(), z.string()])
    .transform((v) => Number(v))
    .refine((v) => v >= -50 && v <= 50, 'Adjustment must be between -50% and +50%'),
})
