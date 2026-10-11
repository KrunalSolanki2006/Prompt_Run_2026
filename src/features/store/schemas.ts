import { z } from 'zod'

const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const RupeesSchema = z.number().int()

const RecurrenceSchema = z.object({
  freq: z.enum(['once', 'weekly', 'monthly', 'yearly']),
  anchor: ISODateSchema,
  repeatCount: z.number().int().positive().optional(),
})

const CategoryIdSchema = z.enum([
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
])

export const CycleSchema = z.object({
  id: z.string(),
  startDate: ISODateSchema,
  lengthDays: z.literal(30),
  startingBalance: RupeesSchema,
  bufferPercent: z.number().min(0).max(30),
  status: z.enum(['active', 'completed']),
})

export const IncomeSourceSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(100),
  amount: RupeesSchema.positive(),
  recurrence: RecurrenceSchema,
  certainty: z.enum(['confirmed', 'likely']),
})

export const CommitmentSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(100),
  amount: RupeesSchema.positive(),
  category: CategoryIdSchema,
  recurrence: RecurrenceSchema,
})

export const SubscriptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  amount: RupeesSchema.positive(),
  freq: z.enum(['weekly', 'monthly', 'yearly']),
  nextBillingDate: ISODateSchema,
  status: z.enum(['active', 'paused']),
})

export const GoalSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  targetAmount: RupeesSchema.positive(),
  startingSaved: RupeesSchema.min(0),
  cycleContribution: RupeesSchema.min(0),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  deadline: ISODateSchema.optional(),
  createdAt: z.string(),
})

export const TransactionSchema = z.object({
  id: z.string(),
  date: ISODateSchema,
  amount: RupeesSchema.positive(),
  kind: z.enum(['expense', 'income', 'goal_deposit']),
  category: CategoryIdSchema,
  note: z.string(),
  tag: z.enum(['need', 'want']),
  unexpected: z.boolean(),
  goalId: z.string().optional(),
  link: z
    .object({
      type: z.enum(['income', 'commitment', 'subscription']),
      id: z.string(),
      occurrence: ISODateSchema,
    })
    .optional(),
})

export const DecisionSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('purchase'),
    label: z.string(),
    amount: RupeesSchema,
    date: ISODateSchema,
    category: CategoryIdSchema,
    tag: z.enum(['need', 'want']),
  }),
  z.object({
    id: z.string(),
    type: z.literal('new_subscription'),
    name: z.string(),
    amount: RupeesSchema,
    freq: z.enum(['weekly', 'monthly', 'yearly']),
    firstBillingDate: ISODateSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal('cancel_subscription'),
    subscriptionId: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('new_commitment'),
    label: z.string(),
    amount: RupeesSchema,
    recurrence: RecurrenceSchema,
    category: CategoryIdSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal('goal_deposit'),
    goalId: z.string(),
    amount: RupeesSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal('unexpected_expense'),
    label: z.string(),
    amount: RupeesSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal('income_change'),
    incomeId: z.string(),
    change: z.enum(['delay', 'missing']),
    days: z.number().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('spending_change'),
    percent: z.number(),
  }),
])

export const DecisionLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  decision: DecisionSchema,
  impactSummary: z.object({
    walletDelta: z.number(),
    allowanceDelta: z.number(),
    riskDelta: z.number(),
  }),
})

export const CycleSummarySchema = z.object({
  cycleId: z.string(),
  startDate: ISODateSchema,
  endDate: ISODateSchema,
  totalSpent: RupeesSchema,
  totalSaved: RupeesSchema,
  finalStatus: z.enum(['surplus', 'balanced', 'deficit']),
})

export const FinanceStateSchema = z.object({
  version: z.literal(1),
  cycle: CycleSchema.nullable(),
  incomes: z.array(IncomeSourceSchema),
  commitments: z.array(CommitmentSchema),
  subscriptions: z.array(SubscriptionSchema),
  goals: z.array(GoalSchema),
  transactions: z.array(TransactionSchema),
  decisions: z.array(DecisionLogEntrySchema),
  cycleHistory: z.array(CycleSummarySchema),
})

export type FinanceStateValidated = z.infer<typeof FinanceStateSchema>
