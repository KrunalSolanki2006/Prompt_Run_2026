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
import { DeltaChip } from '@/components/DeltaChip'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { CATEGORIES } from '@/engine/constants'
import type {
  Decision,
  DecisionLogEntry,
  CategoryId,
  Transaction,
  Commitment,
  Subscription,
} from '@/engine/types'
import { cleanText } from '@/lib/sanitize'
import { formatRupees } from '@/lib/format'
import {
  ShoppingBag,
  CreditCard,
  Ban,
  Layers,
  PiggyBank,
  AlertTriangle,
  Clock,
  TrendingDown,
  Sparkles,
  Trash2,
  CheckCircle,
  AlertOctagon,
  HelpCircle,
  Calendar,
  ShieldCheck,
} from 'lucide-react'

type DecisionTypeKey =
  | 'purchase'
  | 'new_subscription'
  | 'cancel_subscription'
  | 'new_commitment'
  | 'goal_deposit'
  | 'unexpected_expense'
  | 'income_change'
  | 'spending_change'

interface DecisionTypeMeta {
  key: DecisionTypeKey
  label: string
  desc: string
  isStressTest: boolean
  icon: React.ReactNode
}

const DECISION_TYPES: DecisionTypeMeta[] = [
  {
    key: 'purchase',
    label: 'Buy Something',
    desc: 'Discretionary purchase today or on a planned date',
    isStressTest: false,
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    key: 'new_subscription',
    label: 'Add Subscription',
    desc: 'Recurring digital service or membership renewal',
    isStressTest: false,
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    key: 'cancel_subscription',
    label: 'Cancel Subscription',
    desc: 'Drop an existing recurring cost to free daily burn',
    isStressTest: false,
    icon: <Ban className="w-4 h-4" />,
  },
  {
    key: 'new_commitment',
    label: 'Take on EMI / Bill',
    desc: 'Fixed obligation or recurring monthly payment',
    isStressTest: false,
    icon: <Layers className="w-4 h-4" />,
  },
  {
    key: 'goal_deposit',
    label: 'Put Money in Goal',
    desc: 'Transfer liquid cash into a protected savings target',
    isStressTest: false,
    icon: <PiggyBank className="w-4 h-4" />,
  },
  {
    key: 'unexpected_expense',
    label: 'Surprise Expense',
    desc: 'Emergency repair, medical fee, or urgent surprise',
    isStressTest: true,
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  {
    key: 'income_change',
    label: 'Income Late / Missing',
    desc: 'Simulate what happens if freelance payment is delayed',
    isStressTest: true,
    icon: <Clock className="w-4 h-4" />,
  },
  {
    key: 'spending_change',
    label: 'Adjust Daily Burn',
    desc: 'Stress test spending 10%–50% more or less per day',
    isStressTest: true,
    icon: <TrendingDown className="w-4 h-4" />,
  },
]

function makeLabId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
}

export const Lab: React.FC = () => {
  useDocumentTitle('Decision Lab')
  const {
    state,
    snapshot,
    commitDecisionsBatch,
  } = useFinance()
  const today = useToday()

  const [selectedType, setSelectedType] = useState<DecisionTypeKey>('purchase')
  const [basket, setBasket] = useState<Decision[]>([])
  const [commitDialogOpen, setCommitDialogOpen] = useState(false)

  // Form states for active decision
  const [purchaseLabel, setPurchaseLabel] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('350')
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [purchaseCategory, setPurchaseCategory] = useState<CategoryId>('food')
  const [purchaseTag, setPurchaseTag] = useState<'need' | 'want'>('want')

  const [subName, setSubName] = useState('')
  const [subAmount, setSubAmount] = useState('299')
  const [subFreq, setSubFreq] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [subFirstBillingDate, setSubFirstBillingDate] = useState(today)

  const [cancelSubId, setCancelSubId] = useState<string>(
    state.subscriptions[0]?.id ?? ''
  )

  const [commitLabel, setCommitLabel] = useState('')
  const [commitAmount, setCommitAmount] = useState('1200')
  const [commitCategory, setCommitCategory] = useState<CategoryId>('bills')
  const [commitFreq, setCommitFreq] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [commitAnchor, setCommitAnchor] = useState(today)

  const [goalAmount, setGoalAmount] = useState('500')
  const [targetGoalId, setTargetGoalId] = useState<string>(
    state.goals[0]?.id ?? ''
  )

  const [surpriseLabel, setSurpriseLabel] = useState('')
  const [surpriseAmount, setSurpriseAmount] = useState('800')

  const [incomeChangeId, setIncomeChangeId] = useState<string>(
    state.incomes[0]?.id ?? ''
  )
  const [incomeChangeType, setIncomeChangeType] = useState<'delay' | 'missing'>('delay')
  const [incomeDelayDays, setIncomeDelayDays] = useState('7')

  const [spendPercent, setSpendPercent] = useState('20')

  // Live Scenario Evaluation via Pure Engine
  const evaluation = useMemo(() => {
    return evaluateScenario(state, today, basket)
  }, [state, today, basket])

  // Safe Purchase Limit Binary Search
  const safeLimitToday = useMemo(() => {
    return maxSafePurchaseToday(state, today)
  }, [state, today])

  // Better Timing Hint for first purchase in basket
  const timingHint = useMemo(() => {
    const firstPurchase = basket.find((d) => d.type === 'purchase')
    if (firstPurchase) {
      return betterTimingHint(state, today, firstPurchase)
    }
    return null
  }, [state, today, basket])

  const handleAddToBasket = (e: React.FormEvent) => {
    e.preventDefault()

    if (basket.length >= 5) {
      return
    }

    let newDecision: Decision | null = null
    const id = `dec_${Date.now()}`

    switch (selectedType) {
      case 'purchase':
        newDecision = {
          id,
          type: 'purchase',
          label: cleanText(purchaseLabel || 'Discretionary Purchase'),
          amount: Math.max(1, parseInt(purchaseAmount, 10) || 1),
          date: purchaseDate,
          category: purchaseCategory,
          tag: purchaseTag,
        }
        break
      case 'new_subscription':
        newDecision = {
          id,
          type: 'new_subscription',
          name: cleanText(subName || 'New Subscription'),
          amount: Math.max(1, parseInt(subAmount, 10) || 1),
          freq: subFreq,
          firstBillingDate: subFirstBillingDate,
        }
        break
      case 'cancel_subscription':
        if (!cancelSubId) return
        newDecision = {
          id,
          type: 'cancel_subscription',
          subscriptionId: cancelSubId,
        }
        break
      case 'new_commitment':
        newDecision = {
          id,
          type: 'new_commitment',
          label: cleanText(commitLabel || 'New Obligation'),
          amount: Math.max(1, parseInt(commitAmount, 10) || 1),
          recurrence: { freq: commitFreq, anchor: commitAnchor },
          category: commitCategory,
        }
        break
      case 'goal_deposit':
        if (!targetGoalId) return
        newDecision = {
          id,
          type: 'goal_deposit',
          goalId: targetGoalId,
          amount: Math.max(1, parseInt(goalAmount, 10) || 1),
        }
        break
      case 'unexpected_expense':
        newDecision = {
          id,
          type: 'unexpected_expense',
          label: cleanText(surpriseLabel || 'Surprise Outlay'),
          amount: Math.max(1, parseInt(surpriseAmount, 10) || 1),
        }
        break
      case 'income_change':
        if (!incomeChangeId) return
        newDecision = {
          id,
          type: 'income_change',
          incomeId: incomeChangeId,
          change: incomeChangeType,
          days: incomeChangeType === 'delay' ? parseInt(incomeDelayDays, 10) || 7 : undefined,
        }
        break
      case 'spending_change':
        newDecision = {
          id,
          type: 'spending_change',
          percent: parseInt(spendPercent, 10) || 0,
        }
        break
    }

    if (newDecision) {
      setBasket([...basket, newDecision])
    }
  }

  const handleRemoveFromBasket = (id: string) => {
    setBasket(basket.filter((d) => d.id !== id))
  }

  const handleClearBasket = () => {
    setBasket([])
  }

  const hasDecisions = basket.length > 0
  const committableDecisions = basket.filter(
    (d) => !['unexpected_expense', 'income_change', 'spending_change'].includes(d.type)
  )
  const stressTestDecisions = basket.filter((d) =>
    ['unexpected_expense', 'income_change', 'spending_change'].includes(d.type)
  )

  const handleExecuteCommit = (_e?: React.MouseEvent) => {
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
          {/* Decision Type Grid */}
          <div className="bg-white border border-[#E6DFD2] rounded-[16px] p-5 shadow-xs">
            <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-3">
              1. Choose Decision or Stress Test
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DECISION_TYPES.map((type) => {
                const isSelected = selectedType === type.key
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setSelectedType(type.key)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#16140F] text-[#FBF8F3] border-[#16140F] shadow-xs'
                        : 'bg-[#FBF8F3] hover:bg-[#E6DFD2]/50 text-[#16140F] border-[#E6DFD2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={isSelected ? 'text-[#D4F23A]' : 'text-[#5E5A52]'}>
                        {type.icon}
                      </div>
                      {type.isStressTest && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-[#C2410C] text-white'
                              : 'bg-[#C2410C]/15 text-[#C2410C]'
                          }`}
                        >
                          Stress
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight block">
                      {type.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Form Card */}
          <div className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E6DFD2]">
              <div>
                <h3 className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F]">
                  Configure {DECISION_TYPES.find((d) => d.key === selectedType)?.label}
                </h3>
                <p className="text-xs text-[#5E5A52]">
                  {DECISION_TYPES.find((d) => d.key === selectedType)?.desc}
                </p>
              </div>
              {DECISION_TYPES.find((d) => d.key === selectedType)?.isStressTest && (
                <Badge variant="outline" className="border-[#C2410C] text-[#C2410C] text-[10px]">
                  Non-committable Stress Test
                </Badge>
              )}
            </div>

            <form onSubmit={handleAddToBasket} className="space-y-4">
              {/* Type 1: Purchase */}
              {selectedType === 'purchase' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-purchase-label" className="text-xs font-semibold text-[#16140F]">
                      Item or Experience Name
                    </Label>
                    <Input
                      id="dec-purchase-label"
                      value={purchaseLabel}
                      onChange={(e) => setPurchaseLabel(e.target.value)}
                      placeholder="e.g. Mechanical Keyboard"
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-purchase-amount" className="text-xs font-semibold text-[#16140F]">
                        Price (₹)
                      </Label>
                      <Input
                        id="dec-purchase-amount"
                        type="number"
                        min="1"
                        max="1000000"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-purchase-date" className="text-xs font-semibold text-[#16140F]">
                        Purchase Date
                      </Label>
                      <Input
                        id="dec-purchase-date"
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="bg-[#FBF8F3] border-[#E6DFD2]"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-purchase-category" className="text-xs font-semibold text-[#16140F]">
                        Category
                      </Label>
                      <select
                        id="dec-purchase-category"
                        value={purchaseCategory}
                        onChange={(e) => setPurchaseCategory(e.target.value as CategoryId)}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        {CATEGORIES.filter((c) => c.id !== 'savings').map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-[#16140F]">Classification</Label>
                      <div className="flex gap-1 h-10 items-center">
                        <button
                          type="button"
                          onClick={() => setPurchaseTag('need')}
                          className={`flex-1 h-9 rounded-md text-xs font-semibold transition-colors ${
                            purchaseTag === 'need'
                              ? 'bg-[#16140F] text-[#FBF8F3]'
                              : 'bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52]'
                          }`}
                        >
                          Need
                        </button>
                        <button
                          type="button"
                          onClick={() => setPurchaseTag('want')}
                          className={`flex-1 h-9 rounded-md text-xs font-semibold transition-colors ${
                            purchaseTag === 'want'
                              ? 'bg-[#16140F] text-[#FBF8F3]'
                              : 'bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52]'
                          }`}
                        >
                          Want
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Type 2: New Subscription */}
              {selectedType === 'new_subscription' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-sub-name" className="text-xs font-semibold text-[#16140F]">
                      Subscription Name
                    </Label>
                    <Input
                      id="dec-sub-name"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder="e.g. Cloud Storage Plus"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-sub-amount" className="text-xs font-semibold text-[#16140F]">
                        Fee (₹)
                      </Label>
                      <Input
                        id="dec-sub-amount"
                        type="number"
                        min="1"
                        value={subAmount}
                        onChange={(e) => setSubAmount(e.target.value)}
                        required
                        className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-sub-freq" className="text-xs font-semibold text-[#16140F]">
                        Frequency
                      </Label>
                      <select
                        id="dec-sub-freq"
                        value={subFreq}
                        onChange={(e) => setSubFreq(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-sub-date" className="text-xs font-semibold text-[#16140F]">
                        First Billing
                      </Label>
                      <Input
                        id="dec-sub-date"
                        type="date"
                        value={subFirstBillingDate}
                        onChange={(e) => setSubFirstBillingDate(e.target.value)}
                        className="bg-[#FBF8F3] border-[#E6DFD2]"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Type 3: Cancel Subscription */}
              {selectedType === 'cancel_subscription' && (
                <div className="space-y-2">
                  <Label htmlFor="dec-cancel-sub" className="text-xs font-semibold text-[#16140F]">
                    Select Subscription to Pause / Cancel
                  </Label>
                  {state.subscriptions.length === 0 ? (
                    <p className="text-xs text-[#5E5A52]">No active subscriptions found.</p>
                  ) : (
                    <select
                      id="dec-cancel-sub"
                      value={cancelSubId}
                      onChange={(e) => setCancelSubId(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                    >
                      {state.subscriptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (₹{s.amount.toLocaleString('en-IN')}/{s.freq})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Type 4: New Commitment */}
              {selectedType === 'new_commitment' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-commit-label" className="text-xs font-semibold text-[#16140F]">
                      Obligation Label
                    </Label>
                    <Input
                      id="dec-commit-label"
                      value={commitLabel}
                      onChange={(e) => setCommitLabel(e.target.value)}
                      placeholder="e.g. WiFi Bill or Appliance EMI"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-commit-amount" className="text-xs font-semibold text-[#16140F]">
                        Amount (₹)
                      </Label>
                      <Input
                        id="dec-commit-amount"
                        type="number"
                        min="1"
                        value={commitAmount}
                        onChange={(e) => setCommitAmount(e.target.value)}
                        required
                        className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-commit-cat" className="text-xs font-semibold text-[#16140F]">
                        Category
                      </Label>
                      <select
                        id="dec-commit-cat"
                        value={commitCategory}
                        onChange={(e) => setCommitCategory(e.target.value as CategoryId)}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-commit-freq" className="text-xs font-semibold text-[#16140F]">
                        Recurrence
                      </Label>
                      <select
                        id="dec-commit-freq"
                        value={commitFreq}
                        onChange={(e) => setCommitFreq(e.target.value as 'once' | 'weekly' | 'monthly' | 'yearly')}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        <option value="once">One-time</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-commit-anchor" className="text-xs font-semibold text-[#16140F]">
                        Due Date
                      </Label>
                      <Input
                        id="dec-commit-anchor"
                        type="date"
                        value={commitAnchor}
                        onChange={(e) => setCommitAnchor(e.target.value)}
                        className="bg-[#FBF8F3] border-[#E6DFD2]"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Type 5: Goal Deposit */}
              {selectedType === 'goal_deposit' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-goal-select" className="text-xs font-semibold text-[#16140F]">
                      Target Savings Goal
                    </Label>
                    {state.goals.length === 0 ? (
                      <p className="text-xs text-[#B42318]">No active savings goals found.</p>
                    ) : (
                      <select
                        id="dec-goal-select"
                        value={targetGoalId}
                        onChange={(e) => setTargetGoalId(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        {state.goals.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} (Target: ₹{g.targetAmount.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dec-goal-amount" className="text-xs font-semibold text-[#16140F]">
                      Deposit Amount (₹)
                    </Label>
                    <Input
                      id="dec-goal-amount"
                      type="number"
                      min="1"
                      max={snapshot.wallet}
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                    />
                  </div>
                </>
              )}

              {/* Type 6: Surprise Expense (Stress Test) */}
              {selectedType === 'unexpected_expense' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-surprise-label" className="text-xs font-semibold text-[#16140F]">
                      Emergency Scenario Label
                    </Label>
                    <Input
                      id="dec-surprise-label"
                      value={surpriseLabel}
                      onChange={(e) => setSurpriseLabel(e.target.value)}
                      placeholder="e.g. Dental visit or bike puncture"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dec-surprise-amount" className="text-xs font-semibold text-[#16140F]">
                      Emergency Amount (₹)
                    </Label>
                    <Input
                      id="dec-surprise-amount"
                      type="number"
                      value={surpriseAmount}
                      onChange={(e) => setSurpriseAmount(e.target.value)}
                      min="1"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2] font-bold text-[#C2410C]"
                    />
                  </div>
                </>
              )}

              {/* Type 7: Income Change (Stress Test) */}
              {selectedType === 'income_change' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="dec-income-select" className="text-xs font-semibold text-[#16140F]">
                      Select Income Stream to Stress Test
                    </Label>
                    {state.incomes.length === 0 ? (
                      <p className="text-xs text-[#5E5A52]">No scheduled income streams found.</p>
                    ) : (
                      <select
                        id="dec-income-select"
                        value={incomeChangeId}
                        onChange={(e) => setIncomeChangeId(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        {state.incomes.map((inc) => (
                          <option key={inc.id} value={inc.id}>
                            {inc.label} (₹{inc.amount.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-income-type" className="text-xs font-semibold text-[#16140F]">
                        Scenario Type
                      </Label>
                      <select
                        id="dec-income-type"
                        value={incomeChangeType}
                        onChange={(e) => setIncomeChangeType(e.target.value as 'delay' | 'missing')}
                        className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                      >
                        <option value="delay">Delayed payout</option>
                        <option value="missing">Completely missing</option>
                      </select>
                    </div>
                    {incomeChangeType === 'delay' && (
                      <div className="space-y-1">
                        <Label htmlFor="dec-income-days" className="text-xs font-semibold text-[#16140F]">
                          Delay Days
                        </Label>
                        <Input
                          id="dec-income-days"
                          type="number"
                          min="1"
                          max="29"
                          value={incomeDelayDays}
                          onChange={(e) => setIncomeDelayDays(e.target.value)}
                          className="bg-[#FBF8F3] border-[#E6DFD2]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Type 8: Spending Change (Stress Test) */}
              {selectedType === 'spending_change' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="dec-spend-pace" className="text-xs font-semibold text-[#16140F]">
                      Daily Spending Pace Variation (%):
                    </Label>
                    <span className="font-bold text-xs text-[#16140F] bg-[#D4F23A] px-2 py-0.5 rounded">
                      {spendPercent}%
                    </span>
                  </div>
                  <Input
                    id="dec-spend-pace"
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={spendPercent}
                    onChange={(e) => setSpendPercent(e.target.value)}
                    className="h-8"
                  />
                  <div className="flex justify-between text-[10px] text-[#5E5A52]">
                    <span>-50% (Extreme Frugality)</span>
                    <span>+50% (High Discretionary Burn)</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={basket.length >= 5}
                className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg mt-2 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4F23A]" />
                <span>
                  {basket.length >= 5 ? 'Basket Full (Max 5)' : 'Add to Simulation Basket'}
                </span>
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: SCENARIO BASKET & IMPACT PANEL (Sticky) */}
        <div className="lg:col-span-5 sticky top-20 space-y-5">
          <div className="bg-white border border-[#E6DFD2] rounded-[18px] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD2] mb-4">
              <div>
                <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block">
                  Scenario Basket
                </span>
                <span className="text-xs text-[#5E5A52]">
                  {basket.length} of 5 decisions staged
                </span>
              </div>
              {hasDecisions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearBasket}
                  className="h-7 text-xs text-[#B42318] hover:text-[#B42318] hover:bg-[#B42318]/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>Clear All</span>
                </Button>
              )}
            </div>

            {/* Basket Items List */}
            {hasDecisions ? (
              <div className="space-y-2 mb-6">
                {basket.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#16140F] block">
                        {'label' in item
                          ? item.label
                          : 'name' in item
                          ? item.name
                          : item.type === 'spending_change'
                          ? `Daily Pace ${item.percent}%`
                          : item.type === 'cancel_subscription'
                          ? 'Cancel Subscription'
                          : 'Income Change'}
                      </span>
                      <span className="text-[10px] text-[#5E5A52]">
                        {'amount' in item
                          ? `₹${item.amount.toLocaleString('en-IN')}`
                          : item.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromBasket(item.id)}
                      className="text-[#5E5A52] hover:text-[#B42318] p-1"
                      aria-label="Remove simulated decision"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 mb-6">
                <EmptyState
                  icon={<HelpCircle className="w-5 h-5" />}
                  title="No decisions staged"
                  description="Choose an action or stress test on the left to simulate live ripples."
                  receiptBorder={false}
                />
              </div>
            )}

            {/* IMPACT PANEL: BEFORE TO AFTER ROWS ACROSS ALL 6 REQUIRED OUTPUTS */}
            <div className="space-y-3 pt-3 border-t border-[#E6DFD2]">
              <span className="text-xs font-bold text-[#16140F] uppercase tracking-wider block">
                Live Ripple Impacts (6 Outputs)
              </span>

              {hasDecisions ? (
                <div className="space-y-3">
                  {/* Output 1: Liquid Wallet */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E5A52]">1. Liquid Wallet:</span>
                    <DeltaChip
                      before={formatRupees(evaluation.before.wallet)}
                      after={formatRupees(evaluation.after.wallet)}
                      deltaText={`${evaluation.deltas.walletDelta >= 0 ? '+' : ''}${formatRupees(evaluation.deltas.walletDelta)}`}
                      trend={
                        evaluation.deltas.walletDelta > 0
                          ? 'positive'
                          : evaluation.deltas.walletDelta < 0
                          ? 'negative'
                          : 'neutral'
                      }
                    />
                  </div>

                  {/* Output 2: Daily Allowance */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E5A52]">2. Daily Allowance:</span>
                    <DeltaChip
                      before={`${formatRupees(evaluation.before.allowance.daily)}/d`}
                      after={`${formatRupees(evaluation.after.allowance.daily)}/d`}
                      deltaText={`${evaluation.deltas.allowanceDelta >= 0 ? '+' : ''}${formatRupees(evaluation.deltas.allowanceDelta)}/d`}
                      trend={
                        evaluation.deltas.allowanceDelta > 0
                          ? 'positive'
                          : evaluation.deltas.allowanceDelta < 0
                          ? 'negative'
                          : 'neutral'
                      }
                    />
                  </div>

                  {/* Output 3: Savings Goals Feasibility & Progress */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E5A52]">3. Goals Funding:</span>
                    <DeltaChip
                      before={
                        evaluation.before.goals.length > 0
                          ? `${evaluation.before.goals[0]?.fundedPercent ?? 0}% funded`
                          : 'No goals'
                      }
                      after={
                        evaluation.after.goals.length > 0
                          ? `${evaluation.after.goals[0]?.fundedPercent ?? 0}% funded`
                          : 'No goals'
                      }
                      trend="neutral"
                    />
                  </div>

                  {/* Output 4: 30-Day Forecast & Cash-Out Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E5A52]">4. 30-Day Forecast:</span>
                    <DeltaChip
                      before={formatRupees(evaluation.before.forecast.endExpected)}
                      after={formatRupees(evaluation.after.forecast.endExpected)}
                      deltaText={`${evaluation.deltas.endExpectedDelta >= 0 ? '+' : ''}${formatRupees(evaluation.deltas.endExpectedDelta)}`}
                      trend={
                        evaluation.deltas.endExpectedDelta >= 0
                          ? 'positive'
                          : 'negative'
                      }
                    />
                  </div>
                  {evaluation.after.forecast.cashOutDate && (
                    <div className="p-2 rounded-lg bg-[#B42318]/10 text-[#B42318] text-[11px] font-semibold flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Deficit projected on {evaluation.after.forecast.cashOutDate}</span>
                    </div>
                  )}

                  {/* Output 5: Risk Score & Level */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E5A52]">5. Risk Assessment:</span>
                    <DeltaChip
                      before={`${evaluation.before.risk.score}/100 (${evaluation.before.risk.level})`}
                      after={`${evaluation.after.risk.score}/100 (${evaluation.after.risk.level})`}
                      deltaText={`${evaluation.deltas.riskDelta >= 0 ? '+' : ''}${evaluation.deltas.riskDelta} pts`}
                      trend={
                        evaluation.deltas.riskDelta > 0
                          ? 'negative'
                          : evaluation.deltas.riskDelta < 0
                          ? 'positive'
                          : 'neutral'
                      }
                    />
                  </div>

                  {/* Output 6: Health Score & Grade */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#5E5A52]">6. Health Score:</span>
                    <DeltaChip
                      before={
                        evaluation.before.health.score !== null
                          ? `${evaluation.before.health.score} pts (${evaluation.before.health.grade})`
                          : 'Evaluating'
                      }
                      after={
                        evaluation.after.health.score !== null
                          ? `${evaluation.after.health.score} pts (${evaluation.after.health.grade})`
                          : 'Evaluating'
                      }
                      trend={
                        evaluation.deltas.healthDelta > 0
                          ? 'positive'
                          : evaluation.deltas.healthDelta < 0
                          ? 'negative'
                          : 'neutral'
                      }
                    />
                  </div>

                  {/* Verdict Banner with 2-4 Plain Language Reasons */}
                  <div
                    aria-live="polite"
                    className={`p-3.5 rounded-xl border text-xs mt-3 ${
                      evaluation.verdict === 'comfortable'
                        ? 'bg-[#1D7A53]/10 border-[#1D7A53]/30 text-[#1D7A53]'
                        : evaluation.verdict === 'manageable'
                        ? 'bg-[#16140F]/5 border-[#16140F]/20 text-[#16140F]'
                        : evaluation.verdict === 'tight'
                        ? 'bg-[#A15C07]/10 border-[#A15C07]/30 text-[#A15C07]'
                        : 'bg-[#B42318]/10 border-[#B42318]/30 text-[#B42318]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1.5">
                      {evaluation.verdict === 'comfortable' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : evaluation.verdict === 'not_advisable' ? (
                        <AlertOctagon className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span className="capitalize">
                        Verdict: {evaluation.verdict.replace('_', ' ')}
                      </span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] leading-relaxed">
                      {evaluation.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Safe Limit Today */}
                  <div className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] text-[11px] text-[#5E5A52] flex justify-between items-center">
                    <span>Safe discretionary spend cap today:</span>
                    <span className="font-bold text-[#16140F] tabular-nums">
                      {formatRupees(safeLimitToday)}
                    </span>
                  </div>

                  {/* Better Timing Hint */}
                  {timingHint && (
                    <div className="p-2.5 rounded-lg bg-[#D4F23A]/20 border border-[#16140F]/15 text-[11px] text-[#16140F] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#16140F] shrink-0" />
                      <span>
                        <strong>Better timing hint:</strong> Waiting until{' '}
                        <strong>{timingHint}</strong> upgrades verdict safety.
                      </span>
                    </div>
                  )}

                  {/* Commit Action Buttons */}
                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      disabled={committableDecisions.length === 0}
                      onClick={() => setCommitDialogOpen(true)}
                      className="flex-1 h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg"
                    >
                      {committableDecisions.length === 0
                        ? 'Stress Tests Only'
                        : `Commit (${committableDecisions.length}) Decision${committableDecisions.length > 1 ? 's' : ''}`}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearBasket}
                      className="h-10 text-xs border-[#E6DFD2]"
                    >
                      Clear
                    </Button>
                  </div>
                  {committableDecisions.length === 0 && (
                    <p className="text-[10px] text-[#5E5A52] text-center">
                      Stress test scenarios cannot be committed to permanent records.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#5E5A52] italic">
                  Select an action or scenario on the left to inspect before/after allowance deltas.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMMIT CONFIRMATION MODAL */}
      <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <DialogContent className="max-w-md bg-white border border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1D7A53]" />
              <span>Commit Simulated Decisions</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              The following committable items will be permanently written to your cycle record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div>
              <span className="text-xs font-bold text-[#16140F] block mb-2">
                Committable Actions:
              </span>
              <div className="space-y-2">
                {committableDecisions.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-[#16140F] block">
                        {'label' in d ? d.label : 'name' in d ? d.name : d.type}
                      </span>
                      <span className="text-[11px] text-[#5E5A52]">Type: {d.type}</span>
                    </div>
                    <span className="font-bold text-[#16140F]">
                      {'amount' in d ? `₹${d.amount.toLocaleString('en-IN')}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {stressTestDecisions.length > 0 && (
              <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs space-y-1">
                <span className="font-bold text-[#A15C07] block">
                  Excluded Stress Tests ({stressTestDecisions.length}):
                </span>
                <p className="text-[11px] text-[#5E5A52]">
                  Stress test scenarios (surprise outlays, late income, pace shifts) are informational sandbox simulations and are NOT committed to permanent state.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommitDialogOpen(false)}
              className="text-xs border-[#E6DFD2]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecuteCommit}
              className="text-xs font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 px-4"
            >
              Confirm & Commit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DECISION HISTORY LOG */}
      <div className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs">
        <h3 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F] mb-1">
          Decision History Log
        </h3>
        <p className="text-xs text-[#5E5A52] mb-4">
          Record of decisions committed from the Decision Lab during this cycle.
        </p>

        {state.decisions.length === 0 ? (
          <EmptyState
            title="No decisions committed yet"
            description="When you stage and commit decisions from the Decision Lab, they appear here with audited delta impacts."
            receiptBorder={false}
          />
        ) : (
          <div className="divide-y divide-[#E6DFD2]">
            {state.decisions.map((entry) => (
              <div
                key={entry.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-[#16140F] block">
                    {'label' in entry.decision
                      ? entry.decision.label
                      : 'name' in entry.decision
                      ? entry.decision.name
                      : entry.decision.type}
                  </span>
                  <span className="text-[11px] text-[#5E5A52]">
                    {new Date(entry.timestamp).toLocaleDateString()} · Type: {entry.decision.type}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#5E5A52]">
                    Allowance: {entry.impactSummary.allowanceDelta >= 0 ? '+' : ''}
                    ₹{entry.impactSummary.allowanceDelta}/d
                  </span>
                  <span className="text-[11px] text-[#5E5A52]">
                    Risk: {entry.impactSummary.riskDelta >= 0 ? '+' : ''}
                    {entry.impactSummary.riskDelta} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default Lab
