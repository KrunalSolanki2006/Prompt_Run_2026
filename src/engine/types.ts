export type ISODate = string // 'YYYY-MM-DD' calendar date in local time
export type Rupees = number // Whole Indian Rupees (integer only)
export type Freq = 'once' | 'weekly' | 'monthly' | 'yearly'

export interface Recurrence {
  freq: Freq
  anchor: ISODate
  repeatCount?: number // Total planned occurrences (e.g. loan EMIs)
}

export type CategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'education'
  | 'health'
  | 'social'
  | 'subscriptions'
  | 'savings'
  | 'other'

export interface Cycle {
  id: string
  startDate: ISODate
  lengthDays: 30
  startingBalance: Rupees
  bufferPercent: number
  status: 'active' | 'completed'
}

export interface IncomeSource {
  id: string
  label: string
  amount: Rupees
  recurrence: Recurrence
  certainty: 'confirmed' | 'likely'
}

export interface Commitment {
  id: string
  label: string
  amount: Rupees
  category: CategoryId
  recurrence: Recurrence
}

export interface Subscription {
  id: string
  name: string
  amount: Rupees
  freq: 'weekly' | 'monthly' | 'yearly'
  nextBillingDate: ISODate
  status: 'active' | 'paused'
}

export interface Goal {
  id: string
  name: string
  targetAmount: Rupees
  startingSaved: Rupees
  cycleContribution: Rupees
  priority: 1 | 2 | 3
  deadline?: ISODate
  createdAt: string
}

export interface Transaction {
  id: string
  date: ISODate
  amount: Rupees
  kind: 'expense' | 'income' | 'goal_deposit'
  category: CategoryId
  note: string
  tag: 'need' | 'want'
  unexpected: boolean
  goalId?: string
  link?: {
    type: 'income' | 'commitment' | 'subscription'
    id: string
    occurrence: ISODate
  }
}

export type Decision =
  | { id: string; type: 'purchase'; label: string; amount: Rupees; date: ISODate; category: CategoryId; tag: 'need' | 'want' }
  | { id: string; type: 'new_subscription'; name: string; amount: Rupees; freq: 'weekly' | 'monthly' | 'yearly'; firstBillingDate: ISODate }
  | { id: string; type: 'cancel_subscription'; subscriptionId: string }
  | { id: string; type: 'new_commitment'; label: string; amount: Rupees; recurrence: Recurrence; category: CategoryId }
  | { id: string; type: 'goal_deposit'; goalId: string; amount: Rupees }
  | { id: string; type: 'unexpected_expense'; label: string; amount: Rupees } // stress test, happens today
  | { id: string; type: 'income_change'; incomeId: string; change: 'delay' | 'missing'; days?: number } // stress test
  | { id: string; type: 'spending_change'; percent: number } // stress test, -50..+50 vs current pace

export interface DecisionLogEntry {
  id: string
  timestamp: string
  decision: Decision
  impactSummary: {
    walletDelta: number
    allowanceDelta: number
    riskDelta: number
  }
}

export interface CycleSummary {
  cycleId: string
  startDate: ISODate
  endDate: ISODate
  totalSpent: Rupees
  totalSaved: Rupees
  finalStatus: 'surplus' | 'balanced' | 'deficit'
}

export interface FinanceState {
  version: 1
  cycle: Cycle | null
  incomes: IncomeSource[]
  commitments: Commitment[]
  subscriptions: Subscription[]
  goals: Goal[]
  transactions: Transaction[]
  decisions: DecisionLogEntry[]
  cycleHistory: CycleSummary[]
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface Driver {
  id: string
  label: string
  impact: number
  detail: string
  action?: string
}

export interface HealthComponent {
  id: string
  label: string
  weight: number
  score: number | null
  detail: string
}

export interface GoalProjection {
  goalId: string
  saved: Rupees
  target: Rupees
  remainingPlan: Rupees
  funded: Rupees
  fundedPercent: number
  projectedSavedAtCycleEnd: Rupees
  estimatedCompletion: ISODate | null
  status: 'complete' | 'on_track' | 'behind' | 'unfunded'
}

export interface ForecastPoint {
  date: ISODate
  expected: number
  pessimistic: number
}

export interface Snapshot {
  asOf: ISODate
  dayNumber: number
  daysLeft: number
  cycleEnd: ISODate
  cyclePhase: 'active' | 'completed'
  wallet: number
  savedInGoals: number
  upcoming: {
    obligations: number
    confirmedIncome: number
    likelyIncome: number
    overdueCount: number
    lateIncomeCount: number
  }
  allocation: {
    cash: number
    obligationsFunded: number
    obligationShortfall: number
    bufferFunded: number
    goalsFunded: number
    pool: number
  }
  buffer: {
    target: number
    used: number
    remaining: number
  }
  allowance: {
    daily: number
    spentToday: number
    leftToday: number
    status: 'ok' | 'overspent' | 'overcommitted'
  }
  forecast: {
    runRate: number
    points: ForecastPoint[]
    endExpected: number
    endPessimistic: number
    cashOutDate: ISODate | null
    pessimisticCashOutDate: ISODate | null
    minExpected: number
  }
  goals: GoalProjection[]
  risk: {
    score: number
    level: RiskLevel
    drivers: Driver[]
  }
  health: {
    score: number | null
    grade: 'strong' | 'steady' | 'shaky' | 'attention' | null
    components: HealthComponent[]
  }
}
