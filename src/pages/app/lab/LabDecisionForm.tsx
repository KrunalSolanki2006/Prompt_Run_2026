import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/engine/constants'
import { cleanText } from '@/lib/sanitize'
import type {
  Decision,
  CategoryId,
  FinanceState,
} from '@/engine/types'
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
} from 'lucide-react'

export type DecisionTypeKey =
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

export const DECISION_TYPES: DecisionTypeMeta[] = [
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

interface LabDecisionFormProps {
  state: FinanceState
  today: string
  basketCount: number
  onAddToBasket: (decision: Decision) => void
}

export const LabDecisionForm: React.FC<LabDecisionFormProps> = ({
  state,
  today,
  basketCount,
  onAddToBasket,
}) => {
  const [selectedType, setSelectedType] = useState<DecisionTypeKey>('purchase')

  // Form states
  const [purchaseLabel, setPurchaseLabel] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('350')
  const [purchaseCategory, setPurchaseCategory] = useState<CategoryId>('shopping')
  const [purchaseTag, setPurchaseTag] = useState<'need' | 'want'>('want')
  const [purchaseDate, setPurchaseDate] = useState(today)

  const [subName, setSubName] = useState('')
  const [subAmount, setSubAmount] = useState('499')
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

  const [targetGoalId, setTargetGoalId] = useState<string>(
    state.goals[0]?.id ?? ''
  )
  const [goalAmount, setGoalAmount] = useState('500')

  const [surpriseLabel, setSurpriseLabel] = useState('')
  const [surpriseAmount, setSurpriseAmount] = useState('1500')

  const [incomeChangeId, setIncomeChangeId] = useState<string>(
    state.incomes[0]?.id ?? ''
  )
  const [incomeChangeType, setIncomeChangeType] = useState<'delay' | 'missing'>('delay')
  const [incomeDelayDays, setIncomeDelayDays] = useState('7')

  const [spendPercent, setSpendPercent] = useState('20')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (basketCount >= 5) return

    const id = `dec_${Date.now()}`
    let newDecision: Decision | null = null

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
      onAddToBasket(newDecision)
    }
  }

  const activeMeta = DECISION_TYPES.find((d) => d.key === selectedType)

  return (
    <div className="space-y-6">
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
              Configure {activeMeta?.label}
            </h3>
            <p className="text-xs text-[#5E5A52]">
              {activeMeta?.desc}
            </p>
          </div>
          {activeMeta?.isStressTest && (
            <Badge variant="outline" className="border-[#C2410C] text-[#C2410C] text-[10px]">
              Non-committable Stress Test
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    inputMode="numeric"
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
                    inputMode="numeric"
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
                  <Label htmlFor="dec-sub-first" className="text-xs font-semibold text-[#16140F]">
                    First Bill
                  </Label>
                  <Input
                    id="dec-sub-first"
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
                Select Active Subscription to Cancel:
              </Label>
              {state.subscriptions.filter((s) => s.status === 'active').length === 0 ? (
                <p className="text-xs text-[#5E5A52] italic p-3 bg-[#FBF8F3] rounded-lg">
                  No active subscriptions found to cancel.
                </p>
              ) : (
                <select
                  id="dec-cancel-sub"
                  value={cancelSubId}
                  onChange={(e) => setCancelSubId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                >
                  {state.subscriptions
                    .filter((s) => s.status === 'active')
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} (₹{sub.amount}/{sub.freq})
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
                <Label htmlFor="dec-com-label" className="text-xs font-semibold text-[#16140F]">
                  Obligation / EMI Name
                </Label>
                <Input
                  id="dec-com-label"
                  value={commitLabel}
                  onChange={(e) => setCommitLabel(e.target.value)}
                  placeholder="e.g. Gym Membership EMI"
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dec-com-amount" className="text-xs font-semibold text-[#16140F]">
                    Amount (₹)
                  </Label>
                  <Input
                    id="dec-com-amount"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={commitAmount}
                    onChange={(e) => setCommitAmount(e.target.value)}
                    required
                    className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dec-com-category" className="text-xs font-semibold text-[#16140F]">
                    Category
                  </Label>
                  <select
                    id="dec-com-category"
                    value={commitCategory}
                    onChange={(e) => setCommitCategory(e.target.value as CategoryId)}
                    className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md text-[#16140F]"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'savings').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dec-com-freq" className="text-xs font-semibold text-[#16140F]">
                    Frequency
                  </Label>
                  <select
                    id="dec-com-freq"
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
                  <Label htmlFor="dec-com-anchor" className="text-xs font-semibold text-[#16140F]">
                    First Due Date
                  </Label>
                  <Input
                    id="dec-com-anchor"
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
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="dec-goal-id" className="text-xs font-semibold text-[#16140F]">
                  Select Savings Goal:
                </Label>
                {state.goals.length === 0 ? (
                  <p className="text-xs text-[#5E5A52] italic p-3 bg-[#FBF8F3] rounded-lg">
                    No savings goals created yet.
                  </p>
                ) : (
                  <select
                    id="dec-goal-id"
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
                  inputMode="numeric"
                  min="1"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                  required
                />
              </div>
            </div>
          )}

          {/* Type 6: Unexpected Expense (Stress Test) */}
          {selectedType === 'unexpected_expense' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="dec-surprise-label" className="text-xs font-semibold text-[#16140F]">
                  Emergency Reason
                </Label>
                <Input
                  id="dec-surprise-label"
                  value={surpriseLabel}
                  onChange={(e) => setSurpriseLabel(e.target.value)}
                  placeholder="e.g. Phone Screen Repair"
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
                  inputMode="numeric"
                  min="1"
                  value={surpriseAmount}
                  onChange={(e) => setSurpriseAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
            </>
          )}

          {/* Type 7: Income Change (Stress Test) */}
          {selectedType === 'income_change' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="dec-income-id" className="text-xs font-semibold text-[#16140F]">
                  Target Income Source:
                </Label>
                {state.incomes.length === 0 ? (
                  <p className="text-xs text-[#5E5A52] italic p-3 bg-[#FBF8F3] rounded-lg">
                    No income sources logged.
                  </p>
                ) : (
                  <select
                    id="dec-income-id"
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
                    Simulation Type
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
                      inputMode="numeric"
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
            disabled={basketCount >= 5}
            className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg mt-2 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4F23A]" />
            <span>
              {basketCount >= 5 ? 'Basket Full (Max 5)' : 'Add to Simulation Basket'}
            </span>
          </Button>
        </form>
      </div>
    </div>
  )
}
