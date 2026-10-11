import type { CategoryId, RiskLevel } from './types'

export const CYCLE_LENGTH_DAYS = 30
export const DEFAULT_BUDGET = 10000
export const DEFAULT_BUFFER_PERCENT = 10

export const RISK_THRESHOLDS: Record<RiskLevel, { maxScore: number; label: string; description: string }> = {
  low: {
    maxScore: 25,
    label: 'Low Risk',
    description: 'Cash flow is well within safety thresholds. Daily allowance covers projected needs.',
  },
  moderate: {
    maxScore: 50,
    label: 'Moderate Risk',
    description: 'Cash cushion is tightening. Discretionary spending should be tracked cautiously.',
  },
  high: {
    maxScore: 75,
    label: 'High Risk',
    description: 'Upcoming obligations consume most remaining funds. High vulnerability to surprise expenses.',
  },
  critical: {
    maxScore: 100,
    label: 'Critical Risk',
    description: 'Projected cash deficit or depleted allowance. Immediate adjustment required.',
  },
}

export const CATEGORIES: Array<{
  id: CategoryId
  label: string
  description: string
}> = [
  { id: 'food', label: 'Food & Dining', description: 'Groceries, eating out, snacks, beverages' },
  { id: 'transport', label: 'Transport', description: 'Metro, autos, cab rides, fuel' },
  { id: 'shopping', label: 'Shopping', description: 'Clothing, personal items, essentials' },
  { id: 'entertainment', label: 'Entertainment', description: 'Movies, gaming, recreational outings' },
  { id: 'bills', label: 'Bills & Utilities', description: 'Electricity, phone recharges, WiFi' },
  { id: 'education', label: 'Education', description: 'Courses, stationery, books' },
  { id: 'health', label: 'Health & Wellness', description: 'Medicines, consultations, fitness' },
  { id: 'social', label: 'Social & Gatherings', description: 'Gifts, treating friends, celebrations' },
  { id: 'subscriptions', label: 'Subscriptions', description: 'Streaming, cloud storage, memberships' },
  { id: 'savings', label: 'Savings & Goals', description: 'Target deposits, emergency funds' },
  { id: 'other', label: 'Other', description: 'Miscellaneous uncategorized expenses' },
]

export const HEALTH_WEIGHTS = {
  runwayBuffer: 0.35,
  obligationCoverage: 0.25,
  savingsProgress: 0.20,
  spendDiscipline: 0.20,
} as const
