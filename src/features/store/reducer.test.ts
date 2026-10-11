import { describe, it, expect } from 'vitest'
import { financeReducer, initialFinanceState } from './reducer'
import type { FinanceState, Transaction, Commitment, Subscription, DecisionLogEntry } from '@/engine/types'

describe('financeReducer & State Persistence Tests', () => {
  const sampleState: FinanceState = {
    version: 1,
    cycle: {
      id: 'cycle_test',
      startDate: '2026-10-11',
      lengthDays: 30,
      startingBalance: 10000,
      bufferPercent: 10,
      status: 'active',
    },
    incomes: [],
    commitments: [],
    subscriptions: [
      {
        id: 'sub_1',
        name: 'Music Stream',
        amount: 199,
        freq: 'monthly',
        nextBillingDate: '2026-10-15',
        status: 'active',
      },
    ],
    goals: [
      {
        id: 'goal_1',
        name: 'Laptop Fund',
        targetAmount: 50000,
        startingSaved: 2000,
        cycleContribution: 1000,
        priority: 1,
        createdAt: '2026-10-11T00:00:00Z',
      },
    ],
    transactions: [
      {
        id: 'txn_1',
        date: '2026-10-11',
        amount: 250,
        kind: 'expense',
        category: 'food',
        note: 'Lunch with team',
        tag: 'need',
        unexpected: false,
      },
    ],
    decisions: [],
    cycleHistory: [],
  }

  it('undo mechanism: SET_STATE perfectly restores any prior state snapshot', () => {
    const prior = sampleState
    const mutated = financeReducer(prior, {
      type: 'ADD_TRANSACTION',
      payload: {
        id: 'txn_2',
        date: '2026-10-11',
        amount: 1000,
        kind: 'expense',
        category: 'shopping',
        note: 'Jacket',
        tag: 'want',
        unexpected: false,
      },
    })

    expect(mutated.transactions).toHaveLength(2)

    // Apply undo:
    const restored = financeReducer(mutated, {
      type: 'SET_STATE',
      payload: prior,
    })

    expect(restored).toEqual(prior)
    expect(restored.transactions).toHaveLength(1)
  })

  it('atomically commits a batch of decisions from Decision Lab', () => {
    const newTxn: Transaction = {
      id: 'txn_batch',
      date: '2026-10-11',
      amount: 400,
      kind: 'expense',
      category: 'entertainment',
      note: 'Movie tickets',
      tag: 'want',
      unexpected: false,
    }

    const newCom: Commitment = {
      id: 'com_batch',
      label: 'Internet bill',
      amount: 800,
      category: 'bills',
      recurrence: { freq: 'monthly', anchor: '2026-10-20' },
    }

    const newSub: Subscription = {
      id: 'sub_batch',
      name: 'Cloud Storage',
      amount: 150,
      freq: 'monthly',
      nextBillingDate: '2026-10-25',
      status: 'active',
    }

    const logEntry: DecisionLogEntry = {
      id: 'log_batch',
      timestamp: '2026-10-11T12:00:00Z',
      decision: {
        id: 'dec_1',
        type: 'purchase',
        label: 'Movie tickets',
        amount: 400,
        date: '2026-10-11',
        category: 'entertainment',
        tag: 'want',
      },
      impactSummary: {
        walletDelta: -400,
        allowanceDelta: -14,
        riskDelta: 0,
      },
    }

    const nextState = financeReducer(sampleState, {
      type: 'COMMIT_DECISIONS',
      payload: {
        transactions: [newTxn],
        commitments: [newCom],
        subscriptions: [newSub],
        toggledSubscriptionIds: ['sub_1'],
        decisions: [logEntry],
      },
    })

    expect(nextState.transactions).toHaveLength(2)
    expect(nextState.commitments).toHaveLength(1)
    expect(nextState.subscriptions).toHaveLength(2)
    // Toggled subscription should now be paused
    expect(nextState.subscriptions.find((s) => s.id === 'sub_1')?.status).toBe('paused')
    expect(nextState.decisions).toHaveLength(1)
  })

  it('completes and archives cycle, rolling over goal balances and recurring items', () => {
    // Add a goal deposit transaction
    const stateWithDeposit: FinanceState = {
      ...sampleState,
      transactions: [
        ...sampleState.transactions,
        {
          id: 'txn_dep',
          date: '2026-10-15',
          amount: 1500,
          kind: 'goal_deposit',
          category: 'savings',
          note: 'Deposit',
          tag: 'need',
          unexpected: false,
          goalId: 'goal_1',
        },
      ],
    }

    const completed = financeReducer(stateWithDeposit, {
      type: 'COMPLETE_CYCLE',
      payload: {
        summary: {
          cycleId: 'cycle_test',
          startDate: '2026-10-11',
          endDate: '2026-11-09',
          totalSpent: 250,
          totalSaved: 1500,
          finalStatus: 'surplus',
        },
        newStartDate: '2026-11-10',
      },
    })

    expect(completed.cycle).toBeNull()
    expect(completed.cycleHistory).toHaveLength(1)
    expect(completed.transactions).toHaveLength(0) // transactions reset
    // Goal starting saved should accumulate the 1500 deposit
    expect(completed.goals[0]?.startingSaved).toBe(2000 + 1500)
  })

  it('RESET_DATA resets cleanly to initialFinanceState', () => {
    const reset = financeReducer(sampleState, { type: 'RESET_DATA' })
    expect(reset).toEqual(initialFinanceState)
  })
})
