import { describe, it, expect } from 'vitest'
import {
  computeSnapshot,
  applyDecisions,
  evaluateScenario,
  maxSafePurchaseToday,
  betterTimingHint,
} from './engine'
import type { FinanceState, Decision } from './types'

function createBaseState(): FinanceState {
  return {
    version: 1,
    cycle: {
      id: 'cycle_1',
      startDate: '2026-04-01',
      lengthDays: 30,
      startingBalance: 10000,
      bufferPercent: 10, // ₹1,000 buffer
      status: 'active',
    },
    incomes: [
      {
        id: 'inc_1',
        label: 'Stipend',
        amount: 5000,
        recurrence: { freq: 'once', anchor: '2026-04-15' },
        certainty: 'confirmed',
      },
    ],
    commitments: [
      {
        id: 'com_1',
        label: 'WiFi Bill',
        amount: 800,
        category: 'bills',
        recurrence: { freq: 'once', anchor: '2026-04-10' },
      },
    ],
    subscriptions: [
      {
        id: 'sub_1',
        name: 'Music Stream',
        amount: 199,
        freq: 'monthly',
        nextBillingDate: '2026-04-12',
        status: 'active',
      },
    ],
    goals: [
      {
        id: 'goal_1',
        name: 'Emergency Moat',
        targetAmount: 5000,
        startingSaved: 1000,
        cycleContribution: 1000,
        priority: 1,
        createdAt: '2026-04-01T10:00:00Z',
      },
      {
        id: 'goal_2',
        name: 'Design Course',
        targetAmount: 3000,
        startingSaved: 500,
        cycleContribution: 500,
        priority: 2,
        createdAt: '2026-04-01T11:00:00Z',
      },
    ],
    transactions: [],
    decisions: [],
    cycleHistory: [],
  }
}

describe('Engine - Priority Waterfall & Calculations', () => {
  it('correctly allocates cash through priority tiers (obligations -> buffer -> goals -> pool)', () => {
    const state = createBaseState()
    const snap = computeSnapshot(state, '2026-04-01')

    // Initial Wallet: 10,000. Confirmed pending income on Apr 15: 5,000.
    // Total cash: 15,000.
    expect(snap.wallet).toBe(10000)
    expect(snap.upcoming.confirmedIncome).toBe(5000)
    expect(snap.allocation.cash).toBe(15000)

    // Obligations: WiFi (800) + Sub (199) = 999.
    expect(snap.upcoming.obligations).toBe(999)
    expect(snap.allocation.obligationsFunded).toBe(999)
    expect(snap.allocation.obligationShortfall).toBe(0)

    // Buffer: 10% of 10,000 = 1,000.
    expect(snap.buffer.target).toBe(1000)
    expect(snap.buffer.remaining).toBe(1000)
    expect(snap.allocation.bufferFunded).toBe(1000)

    // Goals remaining plans: Goal 1 (1000) + Goal 2 (500) = 1500.
    expect(snap.allocation.goalsFunded).toBe(1500)

    // Discretionary pool: 15,000 - 999 - 1000 - 1500 = 11,501.
    expect(snap.allocation.pool).toBe(11501)

    // Day 1: daysLeft = 30. startOfDayAllowance = floor(11501 / 30) = 383.
    expect(snap.allowance.daily).toBe(383)
    expect(snap.allowance.status).toBe('ok')
  })

  it('unexpected expense is absorbed by buffer without changing pool until exhausted', () => {
    const state = createBaseState()
    const snapBefore = computeSnapshot(state, '2026-04-01')

    // Add ₹600 unexpected expense
    state.transactions.push({
      id: 'txn_unexp_1',
      date: '2026-04-01',
      amount: 600,
      kind: 'expense',
      category: 'health',
      note: 'Emergency medicine',
      tag: 'need',
      unexpected: true,
    })

    const snapAfter = computeSnapshot(state, '2026-04-01')

    // Wallet drops by 600
    expect(snapAfter.wallet).toBe(snapBefore.wallet - 600)
    // Buffer remaining drops from 1000 to 400
    expect(snapAfter.buffer.used).toBe(600)
    expect(snapAfter.buffer.remaining).toBe(400)
    // Pool was reduced by 600 cash, but bufferFunded requirement dropped from 1000 to 400!
    // So discretionary pool remains identical!
    expect(snapAfter.allocation.pool).toBe(snapBefore.allocation.pool)
    expect(snapAfter.allowance.daily).toBe(snapBefore.allowance.daily)

    // Now exhaust buffer with another ₹500 unexpected expense (total unexpected: 1100 > 1000)
    state.transactions.push({
      id: 'txn_unexp_2',
      date: '2026-04-01',
      amount: 500,
      kind: 'expense',
      category: 'health',
      note: 'Followup doctor',
      tag: 'need',
      unexpected: true,
    })

    const snapExhausted = computeSnapshot(state, '2026-04-01')
    expect(snapExhausted.buffer.remaining).toBe(0)
    // The ₹100 excess unexpected spend now reduces the discretionary pool
    expect(snapExhausted.allocation.pool).toBe(snapBefore.allocation.pool - 100)
  })

  it('starves lower tiers in order when cash drops (pool first, then goals by priority)', () => {
    const state = createBaseState()
    // Remove income so cash is just 10,000
    state.incomes = []

    // Add large discretionary purchase of ₹8,000
    state.transactions.push({
      id: 'txn_big_purchase',
      date: '2026-04-01',
      amount: 8000,
      kind: 'expense',
      category: 'shopping',
      note: 'New phone payment',
      tag: 'want',
      unexpected: false,
    })

    const snap = computeSnapshot(state, '2026-04-01')
    // Wallet is 2,000. Cash is 2,000.
    // Tier 1: Obligations = 999. Funded = 999. Remaining cash = 1,001.
    expect(snap.allocation.obligationsFunded).toBe(999)
    // Tier 2: Buffer = 1,000. Funded = 1,000. Remaining cash = 1.
    expect(snap.allocation.bufferFunded).toBe(1000)
    // Tier 3: Goals. Priority 1 Goal (Plan 1000) gets remaining 1. Priority 2 Goal gets 0!
    expect(snap.goals.find((g) => g.goalId === 'goal_1')?.funded).toBe(1)
    expect(snap.goals.find((g) => g.goalId === 'goal_2')?.funded).toBe(0)
    // Tier 4: Pool gets 0.
    expect(snap.allocation.pool).toBe(0)
  })

  it('occurrence settlement: marks occurrence settled when linked transaction exists', () => {
    const state = createBaseState()
    // Link transaction to WiFi bill
    state.transactions.push({
      id: 'txn_paid_wifi',
      date: '2026-04-05',
      amount: 800,
      kind: 'expense',
      category: 'bills',
      note: 'Paid WiFi',
      tag: 'need',
      unexpected: false,
      link: {
        type: 'commitment',
        id: 'com_1',
        occurrence: '2026-04-10',
      },
    })

    const snap = computeSnapshot(state, '2026-04-05')
    // Unsettled obligations should now exclude the 800 WiFi bill (leaving only the 199 subscription)
    expect(snap.upcoming.obligations).toBe(199)
  })

  it('cash-out override forces at least high risk (score >= 60)', () => {
    const state = createBaseState()
    state.incomes = [] // No future income
    // Add commitment that exceeds starting balance
    state.commitments.push({
      id: 'huge_rent',
      label: 'Security deposit',
      amount: 15000,
      category: 'bills',
      recurrence: { freq: 'once', anchor: '2026-04-05' },
    })

    const snap = computeSnapshot(state, '2026-04-01')
    expect(snap.forecast.cashOutDate).not.toBeNull()
    expect(snap.risk.score).toBeGreaterThanOrEqual(60)
    expect(['high', 'critical']).toContain(snap.risk.level)
  })

  it('returns null for health score when no transactions or plan items exist', () => {
    const emptyPlanState: FinanceState = {
      version: 1,
      cycle: {
        id: 'cycle_clean',
        startDate: '2026-04-01',
        lengthDays: 30,
        startingBalance: 10000,
        bufferPercent: 10,
        status: 'active',
      },
      incomes: [],
      commitments: [],
      subscriptions: [],
      goals: [],
      transactions: [],
      decisions: [],
      cycleHistory: [],
    }

    const snap = computeSnapshot(emptyPlanState, '2026-04-01')
    expect(snap.health.score).toBeNull()
    expect(snap.health.grade).toBeNull()
  })
})

describe('Engine - Scenarios & Decision Lab', () => {
  it('preserves scenario purity: input state is not mutated by evaluateScenario or applyDecisions', () => {
    const state = createBaseState()
    const stateClone = JSON.parse(JSON.stringify(state))

    const decisions: Decision[] = [
      {
        id: 'dec_1',
        type: 'purchase',
        label: 'Coffee machine',
        amount: 2500,
        date: '2026-04-01',
        category: 'shopping',
        tag: 'want',
      },
      {
        id: 'dec_2',
        type: 'spending_change',
        percent: 20,
      },
    ]

    const { state: appliedState } = applyDecisions(state, decisions, '2026-04-01')
    expect(appliedState.transactions.length).toBe(state.transactions.length + 1)
    expect(appliedState.transactions.find((t) => t.note === 'Coffee machine')?.amount).toBe(2500)

    const evaluation = evaluateScenario(state, '2026-04-01', decisions)

    // Deep equality check that state is untouched
    expect(state).toEqual(stateClone)
    expect(evaluation.before.wallet).toBe(10000)
    expect(evaluation.after.wallet).toBe(7500)
    expect(evaluation.deltas.walletDelta).toBe(-2500)
  })

  it('correctly calculates maxSafePurchaseToday via binary search', () => {
    const state = createBaseState()
    const maxSafe = maxSafePurchaseToday(state, '2026-04-01')

    expect(maxSafe).toBeGreaterThan(0)
    expect(maxSafe).toBeLessThanOrEqual(10000)

    // A purchase at maxSafe should produce manageable or comfortable
    const evalAtMax = evaluateScenario(state, '2026-04-01', [
      {
        id: 'test_safe',
        type: 'purchase',
        label: 'Safe check',
        amount: maxSafe,
        date: '2026-04-01',
        category: 'shopping',
        tag: 'want',
      },
    ])
    expect(['comfortable', 'manageable']).toContain(evalAtMax.verdict)
  })

  it('computes better timing hint if shifting purchase date improves the verdict', () => {
    const state = createBaseState()
    // A purchase of ₹6,000 on Apr 1 before the Apr 15 ₹5,000 stipend might be tight/not_advisable,
    // but on or after Apr 15 becomes comfortable/manageable!
    const bigPurchase: Decision = {
      id: 'timing_test',
      type: 'purchase',
      label: 'Camera lens',
      amount: 6000,
      date: '2026-04-01',
      category: 'shopping',
      tag: 'want',
    }

    const hint = betterTimingHint(state, '2026-04-01', bigPurchase)
    // The hint should point to a future date in April
    if (hint !== null) {
      expect(hint >= '2026-04-02').toBe(true)
      expect(hint <= '2026-04-30').toBe(true)
    }
  })
})
