# RUNWAY — Product Specification & Technical Contract

> **Single Source of Truth** for RUNWAY (Prompt Run 2026, Stages 1, 2, and 3).

---

## 1. Product Summary

**RUNWAY**: *"Try the decision before it costs you."*  
A 30-day cash-flow cockpit designed for Gen Z to manage a limited ₹10,000 budget over 30 days and make informed, stress-tested financial decisions.

RUNWAY goes beyond passive expense tracking by establishing an interconnected financial ecosystem connecting income, liquid balance, commitments, savings goals, recurring subscriptions, surprise expenses, financial risk, and financial health. Users simulate financial decisions *before* committing them to observe real-time ripple effects across:
- Remaining liquid balance and daily allowance
- Savings goal feasibility and projected completion dates
- 30-day monthly cash flow forecast (expected vs. pessimistic)
- Comprehensive financial risk score (0–100) and drivers
- Explainable financial health score (0–100) and component grades

All computation is driven by **ONE pure engine function**:
```ts
computeSnapshot(state: FinanceState, asOf: ISODate): Snapshot
```
Every dashboard, chart, decision simulation impact panel, and user alert reads directly from this immutable snapshot.

---

## 2. Core Architectural Principles

1. **One Engine, One Snapshot**: No fragmented or duplicated money calculations in UI components. UI strictly consumes the snapshot output.
2. **Every Change Shows Its Ripple**: Every transaction, commitment, or simulated decision visibly impacts daily allowance, risk category, and 30-day trajectory with instant visual deltas and undo capabilities.
3. **Rule-Based & Explainable**: Risk and health scores are deterministic, transparent, and driven by heuristics codified in `engine/constants.ts`. They are never black-box scores and never framed as certified financial advice.
4. **Zero Fabricated Data**: No fake demo accounts, seeded transactions, or simulated histories. Empty states provide explicit, direct onboarding pathways to log real user parameters.
5. **Honest Local-First Privacy**: Data persists exclusively within user browser `localStorage`. No remote servers, no cloud telemetry, no simulated email verifications, and no mock credentials.
6. **Explicit Documented Heuristics**: All thresholds, buffer calculations, and grading limits live solely in `engine/constants.ts` and are rendered dynamically in educational views (such as the "How scores work" panel).

---

## 3. Application Routes

### Public Routes
- `/`: Marketing landing page (Product overview, interactive SVG consequence chain, transparent scoring explanation)
- `/sign-in`: Local browser authentication portal
- `/sign-up`: Account onboarding with real-time password strength evaluation

### Authenticated Cockpit Routes (`/app/*`)
- `/app/setup`: 30-day cycle initialization (₹10,000 challenge default, customizable start date, safety buffer percentage)
- `/app`: Today Dashboard (daily allowance hero, liquid wallet, 30-day runway chart, upcoming obligations, mini goals, recent logs)
- `/app/lab`: Decision Lab (8 decision & stress test types, interactive scenario basket, side-by-side before/after impact comparison)
- `/app/plan`: Financial commitments manager with tabbed views:
  - `?tab=income`: Income sources & predictability
  - `?tab=commitments`: Fixed obligations, EMIs, and bills
  - `?tab=subscriptions`: Recurring digital services & renewal dates
  - `?tab=goals`: Priority savings targets & cycle contributions
- `/app/activity`: Transaction ledger (filters for kind, category, need/want tag, unexpected flag, sorting, search, and CSV export)
- `/app/insights`: Analytical breakdown (30-day runway projection, risk driver waterfall, health score components, categorical distribution, allowance vs. actual spend)
- `/app/settings`: User profile, cycle adjustments, JSON backup export/import, data reset, account wipe

### Fallback
- `*`: Custom accessible 404 Not Found screen

---

## 4. Domain Model (`src/engine/types.ts`)

```ts
export type ISODate = string  // 'YYYY-MM-DD' calendar date in local time
export type Rupees = number   // Whole Indian Rupees (integer only)
export type Freq = 'once' | 'weekly' | 'monthly' | 'yearly'

export interface Recurrence {
  freq: Freq
  anchor: ISODate
  repeatCount?: number // Total planned occurrences (e.g., loan EMIs)
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
```

---

## 5. Snapshot Definition (`engine/types.ts`)

```ts
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface Driver {
  id: string
  label: string
  impact: number // Positive or negative risk contribution
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
    score: number // 0 (safest) to 100 (critical)
    level: RiskLevel
    drivers: Driver[]
  }
  health: {
    score: number | null // 0 to 100
    grade: 'strong' | 'steady' | 'shaky' | 'attention' | null
    components: HealthComponent[]
  }
}
```

---

## 6. Decision Lab Specification

### Decision Types & Classification

```ts
export type Decision =
  // Committable Decisions
  | { id: string; type: 'purchase'; label: string; amount: Rupees; date: ISODate; category: CategoryId; tag: 'need' | 'want' }
  | { id: string; type: 'new_subscription'; name: string; amount: Rupees; freq: 'weekly' | 'monthly' | 'yearly'; firstBillingDate: ISODate }
  | { id: string; type: 'cancel_subscription'; subscriptionId: string }
  | { id: string; type: 'new_commitment'; label: string; amount: Rupees; recurrence: Recurrence; category: CategoryId }
  | { id: string; type: 'goal_deposit'; goalId: string; amount: Rupees }

  // Non-Committable Stress Tests
  | { id: string; type: 'unexpected_expense'; label: string; amount: Rupees }
  | { id: string; type: 'income_change'; incomeId: string; change: 'delay' | 'missing'; days?: number }
  | { id: string; type: 'spending_change'; percent: number } // -50% to +50% variation
```

- **Committable Operations**: Converting a simulated plan into permanent cycle records (e.g., executing a purchase logs an actual transaction, creating an EMI binds a commitment).
- **Stress Testing Operations**: Simulated scenarios (unexpected vehicle repair, delayed freelance payout, daily burn inflation) never persist into permanent records. They calculate immediate risk impact to inform contingency reserves.

---

## 7. Storage & Persistence (`localStorage`)

- `runway:v1:accounts`: Registered user records (salt, salted password hash, name, created date).
- `runway:v1:session`: Currently active user session (`userId`, session timestamp).
- `runway:v1:data:<userId>`: Complete user `FinanceState` validated via Zod on parse.
- **Resilience**: If schema validation fails on load, corrupt data is backed up under `runway:v1:corrupt:<timestamp>` and an inline recovery reset dialog is triggered.

---

## 8. Category & Icon Mapping

| Category | Label | Lucide Icon |
|---|---|---|
| `food` | Food & Dining | `Utensils` |
| `transport` | Transport & Commute | `Car` |
| `shopping` | Shopping & Goods | `ShoppingBag` |
| `entertainment` | Entertainment & Leisure | `Film` |
| `bills` | Utilities & Bills | `Receipt` |
| `education` | Learning & Books | `GraduationCap` |
| `health` | Health & Wellness | `HeartPulse` |
| `social` | Social & Outings | `Users` |
| `subscriptions` | Subscriptions | `CreditCard` |
| `savings` | Savings & Investments | `PiggyBank` |
| `other` | Miscellaneous | `Ellipsis` |

---

## 9. Design System: "Paper & Volt"

- **Theme Palette**:
  - Warm Paper: `#FBF8F3` (Background)
  - Surface: `#FFFFFF` (Cards, Panels)
  - Deep Ink: `#16140F` (Headings, Body Copy)
  - Muted Ink: `#5E5A52` (Labels, Secondary Text)
  - Structure Line: `#E6DFD2` (Borders, Dividers)
  - Electric Volt: `#D4F23A` (Accents, highlights, badges — paired strictly with Deep Ink text)
  - Semantic Status:
    - Safe: `#1D7A53`
    - Watch: `#A15C07`
    - Risk: `#C2410C`
    - Critical: `#B42318`
- **Visual Rhythm**:
  - Card Border Radius: `14px`
  - Input Border Radius: `10px`
  - Signature Detail: Clean dashed lines mimicking paper receipts
  - Contrast minimums: 4.5:1 text-to-background across all semantic pairs.
- **Typography**:
  - Display Font: Bricolage Grotesque (headings, big numerals)
  - Body Font: Inter (UI controls, labels, narrative text)
  - Tabular numerals (`font-variant-numeric: tabular-nums`) applied to all currency and metric displays.

---

## 10. Development Conventions & Quality Standards

- **Strict Typing**: TypeScript `strict: true`, `noUncheckedIndexedAccess: true`. Zero `any`, zero `@ts-ignore`.
- **Zero ESLint Warnings**: ESLint with flat config enforcing react hooks, react refresh, and `jsx-a11y`.
- **Modularity**: Files strictly kept under ~300 lines of code. Named exports standard (default exports restricted to lazy page boundaries).
- **Sanitization**: All user inputs undergo normalization via `cleanText()` (trim, whitespace normalization, bidi control character removal).
- **Date Handling**: Exclusively local ISO strings (`YYYY-MM-DD`). No unsafe `new Date("YYYY-MM-DD")` parsing.
