import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react'
import { toast } from 'sonner'
import type {
  FinanceState,
  Snapshot,
  Cycle,
  IncomeSource,
  Commitment,
  Subscription,
  Goal,
  Transaction,
  DecisionLogEntry,
  CycleSummary,
} from '@/engine/types'
import { computeSnapshot } from '@/engine/engine'
import { useToday } from '@/hooks/useToday'
import { useAuth } from '@/features/auth/AuthContext'
import {
  financeReducer,
  initialFinanceState,
  FinanceAction,
} from './reducer'
import { FinanceStateSchema } from './schemas'
import { Occurrence } from '@/engine/occurrences'
import { formatRupees } from '@/lib/format'

export interface RippleLogEntry {
  id: string
  timestamp: string
  actionLabel: string
  allowanceBefore: number
  allowanceAfter: number
  forecastBefore: number
  forecastAfter: number
  riskLevelBefore: string
  riskLevelAfter: string
  riskScoreBefore: number
  riskScoreAfter: number
  healthBefore: number | null
  healthAfter: number | null
}

interface FinanceContextValue {
  state: FinanceState
  snapshot: Snapshot
  dispatch: React.Dispatch<FinanceAction>
  corruptBackupKey: string | null
  recentRipples: RippleLogEntry[]
  initCycle: (cycle: Cycle) => void
  updateCycle: (updates: Partial<Cycle>) => void
  completeCycle: (summary: CycleSummary, newStartDate: string) => void
  addTransaction: (txn: Transaction) => void
  updateTransaction: (txn: Transaction) => void
  deleteTransaction: (id: string) => void
  addIncome: (income: IncomeSource) => void
  updateIncome: (income: IncomeSource) => void
  deleteIncome: (id: string) => void
  addCommitment: (com: Commitment) => void
  updateCommitment: (com: Commitment) => void
  deleteCommitment: (id: string) => void
  addSubscription: (sub: Subscription) => void
  updateSubscription: (sub: Subscription) => void
  deleteSubscription: (id: string) => void
  toggleSubscription: (id: string) => void
  addGoal: (goal: Goal) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  logDecision: (entry: DecisionLogEntry) => void
  commitDecisionsBatch: (
    batch: {
      transactions: Transaction[]
      commitments: Commitment[]
      subscriptions: Subscription[]
      toggledSubscriptionIds: string[]
      decisions: DecisionLogEntry[]
    },
    label: string
  ) => void
  settleOccurrence: (occ: Occurrence, paidDate?: string) => void
  resetData: () => void
  exportJSON: () => string
  importJSON: (raw: string) => { success: boolean; error?: string }
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth()
  const today = useToday()
  const userId = user?.id

  const [state, dispatchRaw] = useReducer(financeReducer, initialFinanceState)
  const [corruptBackupKey, setCorruptBackupKey] = useState<string | null>(null)
  const [recentRipples, setRecentRipples] = useState<RippleLogEntry[]>([])
  const previousStateRef = useRef<FinanceState>(state)
  const isLoadedRef = useRef(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const storageKey = userId ? `runway:v1:data:${userId}` : null

  // 1. Load user state on user change
  useEffect(() => {
    if (!storageKey) {
      dispatchRaw({ type: 'SET_STATE', payload: initialFinanceState })
      isLoadedRef.current = false
      return
    }

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        const validated = FinanceStateSchema.safeParse(parsed)
        if (validated.success) {
          dispatchRaw({ type: 'SET_STATE', payload: validated.data })
        } else {
          // Schema parse error - backup corrupt data
          const backupKey = `runway:v1:corrupt:${Date.now()}`
          localStorage.setItem(backupKey, raw)
          queueMicrotask(() => setCorruptBackupKey(backupKey))
          console.error(
            'Corrupt user data detected. Backed up to:',
            backupKey,
            validated.error
          )
          dispatchRaw({ type: 'SET_STATE', payload: initialFinanceState })
        }
      } else {
        dispatchRaw({ type: 'SET_STATE', payload: initialFinanceState })
      }
    } catch (err) {
      console.error('Error loading finance state:', err)
      dispatchRaw({ type: 'SET_STATE', payload: initialFinanceState })
    }

    isLoadedRef.current = true
  }, [storageKey])

  // 2. Debounced persistence to localStorage on state change
  useEffect(() => {
    if (!isLoadedRef.current || !storageKey) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state))
      } catch (err) {
        console.error('Failed to persist finance state to localStorage:', err)
      }
    }, 250)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state, storageKey])

  // 3. Compute immutable snapshot via engine
  const snapshot = useMemo(() => {
    return computeSnapshot(state, today)
  }, [state, today])

  // 4. Wrapped Dispatch with Consequence Toast and Undo capability
  const dispatchWithConsequence = useCallback(
    (action: FinanceAction, actionLabel?: string) => {
      const preState = state
      const preSnapshot = computeSnapshot(preState, today)

      const nextState = financeReducer(preState, action)
      const postSnapshot = computeSnapshot(nextState, today)

      dispatchRaw(action)
      previousStateRef.current = preState

      // Don't show toast for raw SET_STATE or if no cycle is configured
      if (action.type === 'SET_STATE' || !nextState.cycle) {
        return
      }

      // Compute changed metrics
      const changes: string[] = []

      // Allowance change
      const allowanceDiff = postSnapshot.allowance.daily - preSnapshot.allowance.daily
      if (allowanceDiff !== 0) {
        const sign = allowanceDiff > 0 ? '+' : ''
        changes.push(`Daily allowance: ${sign}${formatRupees(allowanceDiff)}/day`)
      }

      // Forecast End change
      const forecastDiff =
        postSnapshot.forecast.endExpected - preSnapshot.forecast.endExpected
      if (forecastDiff !== 0) {
        const sign = forecastDiff > 0 ? '+' : ''
        changes.push(`Month-end forecast: ${sign}${formatRupees(forecastDiff)}`)
      }

      // Risk score / tier change
      if (postSnapshot.risk.level !== preSnapshot.risk.level) {
        changes.push(
          `Risk shifted: ${preSnapshot.risk.level.toUpperCase()} → ${postSnapshot.risk.level.toUpperCase()}`
        )
      } else if (postSnapshot.risk.score !== preSnapshot.risk.score) {
        const rDiff = postSnapshot.risk.score - preSnapshot.risk.score
        const sign = rDiff > 0 ? '+' : ''
        changes.push(`Risk score: ${sign}${rDiff} pts`)
      }

      // Health score change
      if (
        postSnapshot.health.score !== null &&
        preSnapshot.health.score !== null &&
        postSnapshot.health.score !== preSnapshot.health.score
      ) {
        const hDiff = postSnapshot.health.score - preSnapshot.health.score
        const sign = hDiff > 0 ? '+' : ''
        changes.push(`Health score: ${sign}${hDiff} pts`)
      }

      // Record persistent ripple entry
      const newRipple: RippleLogEntry = {
        id: `rip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actionLabel: actionLabel ?? 'Updated finances',
        allowanceBefore: preSnapshot.allowance.daily,
        allowanceAfter: postSnapshot.allowance.daily,
        forecastBefore: preSnapshot.forecast.endExpected,
        forecastAfter: postSnapshot.forecast.endExpected,
        riskLevelBefore: preSnapshot.risk.level,
        riskLevelAfter: postSnapshot.risk.level,
        riskScoreBefore: preSnapshot.risk.score,
        riskScoreAfter: postSnapshot.risk.score,
        healthBefore: preSnapshot.health.score,
        healthAfter: postSnapshot.health.score,
      }
      setRecentRipples((prev) => [newRipple, ...prev].slice(0, 5))

      // Show consequence toast with deltas and undo
      const title = actionLabel ?? 'Updated finances'
      const metricsSummary =
        changes.length > 0
          ? changes.slice(0, 3).join(' · ')
          : 'Trajectory and commitments updated in sync.'

      toast(title, {
        description: metricsSummary,
        action: {
          label: 'Undo',
          onClick: () => {
            dispatchRaw({ type: 'SET_STATE', payload: preState })
            toast.info('Action undone', { description: 'Restored previous state.' })
          },
        },
        duration: 5000,
      })
    },
    [state, today]
  )

  // Context methods
  const initCycle = useCallback(
    (cycle: Cycle) => {
      dispatchWithConsequence({ type: 'INIT_CYCLE', payload: cycle }, 'Cycle initialized')
    },
    [dispatchWithConsequence]
  )

  const updateCycle = useCallback(
    (updates: Partial<Cycle>) => {
      dispatchWithConsequence(
        { type: 'UPDATE_CYCLE', payload: updates },
        'Cycle settings updated'
      )
    },
    [dispatchWithConsequence]
  )

  const completeCycle = useCallback(
    (summary: CycleSummary, newStartDate: string) => {
      dispatchWithConsequence(
        { type: 'COMPLETE_CYCLE', payload: { summary, newStartDate } },
        'Cycle archived & completed'
      )
    },
    [dispatchWithConsequence]
  )

  const addTransaction = useCallback(
    (txn: Transaction) => {
      const label = txn.link
        ? txn.note
        : txn.kind === 'income'
        ? `Logged income: ${formatRupees(txn.amount)}`
        : txn.kind === 'goal_deposit'
        ? `Goal deposit: ${formatRupees(txn.amount)}`
        : txn.unexpected
        ? `Unexpected spend: ${formatRupees(txn.amount)}`
        : `Logged spend: ${formatRupees(txn.amount)}`
      dispatchWithConsequence({ type: 'ADD_TRANSACTION', payload: txn }, label)
    },
    [dispatchWithConsequence]
  )

  const updateTransaction = useCallback(
    (txn: Transaction) => {
      dispatchWithConsequence(
        { type: 'UPDATE_TRANSACTION', payload: txn },
        'Transaction updated'
      )
    },
    [dispatchWithConsequence]
  )

  const deleteTransaction = useCallback(
    (id: string) => {
      dispatchWithConsequence(
        { type: 'DELETE_TRANSACTION', payload: { id } },
        'Transaction removed'
      )
    },
    [dispatchWithConsequence]
  )

  const addIncome = useCallback(
    (income: IncomeSource) => {
      dispatchWithConsequence(
        { type: 'ADD_INCOME', payload: income },
        `Added income: ${income.label}`
      )
    },
    [dispatchWithConsequence]
  )

  const updateIncome = useCallback(
    (income: IncomeSource) => {
      dispatchWithConsequence(
        { type: 'UPDATE_INCOME', payload: income },
        'Income source updated'
      )
    },
    [dispatchWithConsequence]
  )

  const deleteIncome = useCallback(
    (id: string) => {
      dispatchWithConsequence(
        { type: 'DELETE_INCOME', payload: { id } },
        'Income source deleted'
      )
    },
    [dispatchWithConsequence]
  )

  const addCommitment = useCallback(
    (com: Commitment) => {
      dispatchWithConsequence(
        { type: 'ADD_COMMITMENT', payload: com },
        `Added commitment: ${com.label}`
      )
    },
    [dispatchWithConsequence]
  )

  const updateCommitment = useCallback(
    (com: Commitment) => {
      dispatchWithConsequence(
        { type: 'UPDATE_COMMITMENT', payload: com },
        'Commitment updated'
      )
    },
    [dispatchWithConsequence]
  )

  const deleteCommitment = useCallback(
    (id: string) => {
      dispatchWithConsequence(
        { type: 'DELETE_COMMITMENT', payload: { id } },
        'Commitment deleted'
      )
    },
    [dispatchWithConsequence]
  )

  const addSubscription = useCallback(
    (sub: Subscription) => {
      dispatchWithConsequence(
        { type: 'ADD_SUBSCRIPTION', payload: sub },
        `Added subscription: ${sub.name}`
      )
    },
    [dispatchWithConsequence]
  )

  const updateSubscription = useCallback(
    (sub: Subscription) => {
      dispatchWithConsequence(
        { type: 'UPDATE_SUBSCRIPTION', payload: sub },
        'Subscription updated'
      )
    },
    [dispatchWithConsequence]
  )

  const deleteSubscription = useCallback(
    (id: string) => {
      dispatchWithConsequence(
        { type: 'DELETE_SUBSCRIPTION', payload: { id } },
        'Subscription deleted'
      )
    },
    [dispatchWithConsequence]
  )

  const toggleSubscription = useCallback(
    (id: string) => {
      dispatchWithConsequence(
        { type: 'TOGGLE_SUBSCRIPTION', payload: { id } },
        'Subscription status toggled'
      )
    },
    [dispatchWithConsequence]
  )

  const addGoal = useCallback(
    (goal: Goal) => {
      dispatchWithConsequence(
        { type: 'ADD_GOAL', payload: goal },
        `Added goal: ${goal.name}`
      )
    },
    [dispatchWithConsequence]
  )

  const updateGoal = useCallback(
    (goal: Goal) => {
      dispatchWithConsequence(
        { type: 'UPDATE_GOAL', payload: goal },
        'Goal updated'
      )
    },
    [dispatchWithConsequence]
  )

  const deleteGoal = useCallback(
    (id: string) => {
      dispatchWithConsequence(
        { type: 'DELETE_GOAL', payload: { id } },
        'Goal deleted'
      )
    },
    [dispatchWithConsequence]
  )

  const logDecision = useCallback(
    (entry: DecisionLogEntry) => {
      dispatchWithConsequence(
        { type: 'LOG_DECISION', payload: entry },
        'Committed decision from Decision Lab'
      )
    },
    [dispatchWithConsequence]
  )

  const commitDecisionsBatch = useCallback(
    (
      batch: {
        transactions: Transaction[]
        commitments: Commitment[]
        subscriptions: Subscription[]
        toggledSubscriptionIds: string[]
        decisions: DecisionLogEntry[]
      },
      label: string
    ) => {
      dispatchWithConsequence(
        { type: 'COMMIT_DECISIONS', payload: batch },
        label
      )
    },
    [dispatchWithConsequence]
  )

  const settleOccurrence = useCallback(
    (occ: Occurrence, paidDate?: string) => {
      const txnDate = paidDate ?? today
      const isIncome = occ.type === 'income'

      const txn: Transaction = {
        id: `txn_settle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: txnDate,
        amount: occ.amount,
        kind: isIncome ? 'income' : 'expense',
        category: occ.category ?? (isIncome ? 'other' : 'bills'),
        note: isIncome ? `Received: ${occ.label}` : `Paid: ${occ.label}`,
        tag: 'need',
        unexpected: false,
        link: {
          type: occ.type,
          id: occ.sourceId,
          occurrence: occ.date,
        },
      }

      addTransaction(txn)
    },
    [today, addTransaction]
  )

  const resetData = useCallback(() => {
    dispatchWithConsequence({ type: 'RESET_DATA' }, 'Data reset')
  }, [dispatchWithConsequence])

  const exportJSON = useCallback(() => {
    return JSON.stringify(state, null, 2)
  }, [state])

  const importJSON = useCallback(
    (raw: string): { success: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(raw)
        const validated = FinanceStateSchema.safeParse(parsed)
        if (!validated.success) {
          return {
            success: false,
            error: 'Invalid file format: JSON does not match RUNWAY state schema.',
          }
        }
        dispatchWithConsequence(
          { type: 'SET_STATE', payload: validated.data },
          'Imported data backup'
        )
        return { success: true }
      } catch {
        return { success: false, error: 'Malformed JSON file.' }
      }
    },
    [dispatchWithConsequence]
  )

  return (
    <FinanceContext.Provider
      value={{
        state,
        snapshot,
        dispatch: dispatchWithConsequence,
        corruptBackupKey,
        recentRipples,
        initCycle,
        updateCycle,
        completeCycle,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addIncome,
        updateIncome,
        deleteIncome,
        addCommitment,
        updateCommitment,
        deleteCommitment,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleSubscription,
        addGoal,
        updateGoal,
        deleteGoal,
        logDecision,
        commitDecisionsBatch,
        settleOccurrence,
        resetData,
        exportJSON,
        importJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext)
  if (!ctx) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return ctx
}
