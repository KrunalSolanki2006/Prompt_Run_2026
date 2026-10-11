import React, { useState, useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { useToday } from '@/hooks/useToday'
import {
  evaluateScenario,
  maxSafePurchaseToday,
  betterTimingHint,
} from '@/engine/engine'
import { PageHeader } from '@/components/PageHeader'
import { LabDecisionForm } from './lab/LabDecisionForm'
import { LabImpactSummary } from './lab/LabImpactSummary'
import { LabCommitDialog } from './lab/LabCommitDialog'
import { LabHistoryList } from './lab/LabHistoryList'
import type {
  Decision,
  DecisionLogEntry,
  Transaction,
  Commitment,
  Subscription,
} from '@/engine/types'

function makeLabId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
}

export const Lab: React.FC = () => {
  useDocumentTitle('Decision Lab')
  const {
    state,
    commitDecisionsBatch,
  } = useFinance()
  const today = useToday()

  const [basket, setBasket] = useState<Decision[]>([])
  const [commitDialogOpen, setCommitDialogOpen] = useState(false)

  // Simulation Evaluation
  const evaluation = useMemo(() => {
    return evaluateScenario(state, today, basket)
  }, [state, today, basket])

  // Safe Purchase Cap
  const safeLimitToday = useMemo(() => {
    return maxSafePurchaseToday(state, today)
  }, [state, today])

  // Smart Timing Hint
  const timingHint = useMemo(() => {
    const firstPurchase = basket.find((d) => d.type === 'purchase')
    if (firstPurchase && firstPurchase.type === 'purchase') {
      return betterTimingHint(state, today, firstPurchase)
    }
    return null
  }, [state, today, basket])

  const handleAddToBasket = (newDecision: Decision) => {
    if (basket.length >= 5) return
    setBasket((prev) => [...prev, newDecision])
  }

  const handleRemoveFromBasket = (id: string) => {
    setBasket((prev) => prev.filter((d) => d.id !== id))
  }

  const handleClearBasket = () => {
    setBasket([])
  }

  const hasDecisions = basket.length > 0
  const committableDecisions = useMemo(() => {
    return basket.filter(
      (d) => !['unexpected_expense', 'income_change', 'spending_change'].includes(d.type)
    )
  }, [basket])

  const stressTestDecisions = useMemo(() => {
    return basket.filter((d) =>
      ['unexpected_expense', 'income_change', 'spending_change'].includes(d.type)
    )
  }, [basket])

  const handleExecuteCommit = () => {
    if (committableDecisions.length === 0) return

    const newTxns: Transaction[] = []
    const newComs: Commitment[] = []
    const newSubs: Subscription[] = []
    const toggledSubIds: string[] = []
    const newDecisionLogs: DecisionLogEntry[] = []

    for (const d of committableDecisions) {
      if (d.type === 'purchase') {
        if (d.date <= today) {
          newTxns.push({
            id: makeLabId('txn'),
            date: d.date,
            amount: d.amount,
            kind: 'expense',
            category: d.category,
            note: d.label,
            tag: d.tag,
            unexpected: false,
          })
        } else {
          newComs.push({
            id: makeLabId('com'),
            label: d.label,
            amount: d.amount,
            category: d.category,
            recurrence: { freq: 'once', anchor: d.date },
          })
        }
      } else if (d.type === 'new_subscription') {
        newSubs.push({
          id: makeLabId('sub'),
          name: d.name,
          amount: d.amount,
          freq: d.freq,
          nextBillingDate: d.firstBillingDate,
          status: 'active',
        })
      } else if (d.type === 'cancel_subscription') {
        toggledSubIds.push(d.subscriptionId)
      } else if (d.type === 'new_commitment') {
        newComs.push({
          id: makeLabId('com'),
          label: d.label,
          amount: d.amount,
          category: d.category,
          recurrence: d.recurrence,
        })
      } else if (d.type === 'goal_deposit') {
        newTxns.push({
          id: makeLabId('txn'),
          date: today,
          amount: d.amount,
          kind: 'goal_deposit',
          category: 'savings',
          note: 'Goal deposit committed from Lab',
          tag: 'need',
          unexpected: false,
          goalId: d.goalId,
        })
      }

      newDecisionLogs.push({
        id: makeLabId('log'),
        timestamp: new Date().toISOString(),
        decision: d,
        impactSummary: {
          walletDelta: evaluation.deltas.walletDelta,
          allowanceDelta: evaluation.deltas.allowanceDelta,
          riskDelta: evaluation.deltas.riskDelta,
        },
      })
    }

    const label = `Committed ${committableDecisions.length} decision${committableDecisions.length > 1 ? 's' : ''} from Lab`
    commitDecisionsBatch(
      {
        transactions: newTxns,
        commitments: newComs,
        subscriptions: newSubs,
        toggledSubscriptionIds: toggledSubIds,
        decisions: newDecisionLogs,
      },
      label
    )

    setCommitDialogOpen(false)
    setBasket([])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Lab"
        subtitle="Simulate financial decisions and stress tests before spending a rupee. Watch live ripples across your 30-day runway."
        badge={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4F23A] text-[#16140F]">
            Sandbox Simulator
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: DECISION PICKER & DYNAMIC FORM */}
        <div className="lg:col-span-7 space-y-6">
          <LabDecisionForm
            state={state}
            today={today}
            basketCount={basket.length}
            onAddToBasket={handleAddToBasket}
          />
        </div>

        {/* RIGHT COLUMN: SCENARIO BASKET & IMPACT PANEL (Sticky) */}
        <div className="lg:col-span-5 sticky top-20 space-y-5">
          <LabImpactSummary
            basket={basket}
            hasDecisions={hasDecisions}
            evaluation={evaluation}
            safeLimitToday={safeLimitToday}
            timingHint={timingHint}
            committableDecisions={committableDecisions}
            onRemoveFromBasket={handleRemoveFromBasket}
            onClearBasket={handleClearBasket}
            onOpenCommitDialog={() => setCommitDialogOpen(true)}
          />
        </div>
      </div>

      {/* COMMIT CONFIRMATION MODAL */}
      <LabCommitDialog
        open={commitDialogOpen}
        onOpenChange={setCommitDialogOpen}
        committableDecisions={committableDecisions}
        stressTestDecisions={stressTestDecisions}
        onConfirm={handleExecuteCommit}
      />

      {/* DECISION HISTORY LOG */}
      <LabHistoryList decisions={state.decisions} />
    </div>
  )
}

export default Lab
