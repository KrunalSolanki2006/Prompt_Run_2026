import React, { useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { DeltaChip } from '@/components/DeltaChip'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/engine/constants'
import { todayISO } from '@/engine/dates'
import type { Decision } from '@/engine/types'
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
  HelpCircle,
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

export const Lab: React.FC = () => {
  useDocumentTitle('Decision Lab')
  const [selectedType, setSelectedType] = useState<DecisionTypeKey>('purchase')
  const [basket, setBasket] = useState<Decision[]>([])

  // Form states for active decision
  const [purchaseLabel, setPurchaseLabel] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('350')
  const [purchaseCategory, setPurchaseCategory] = useState('food')
  const [purchaseTag, setPurchaseTag] = useState<'need' | 'want'>('want')

  const [subName, setSubName] = useState('')
  const [subAmount, setSubAmount] = useState('299')
  const [subFreq, setSubFreq] = useState<'monthly' | 'yearly'>('monthly')

  const [commitLabel, setCommitLabel] = useState('')
  const [commitAmount, setCommitAmount] = useState('1200')

  const [goalAmount, setGoalAmount] = useState('500')

  const [surpriseLabel, setSurpriseLabel] = useState('')
  const [surpriseAmount, setSurpriseAmount] = useState('800')

  const [spendPercent, setSpendPercent] = useState('20')

  const handleAddToBasket = (e: React.FormEvent) => {
    e.preventDefault()

    let newDecision: Decision | null = null
    const id = `dec_${Date.now()}`

    switch (selectedType) {
      case 'purchase':
        newDecision = {
          id,
          type: 'purchase',
          label: purchaseLabel || 'Discretionary Purchase',
          amount: Number(purchaseAmount) || 0,
          date: todayISO(),
          category: purchaseCategory as (typeof CATEGORIES)[number]['id'],
          tag: purchaseTag,
        }
        break
      case 'new_subscription':
        newDecision = {
          id,
          type: 'new_subscription',
          name: subName || 'New Subscription',
          amount: Number(subAmount) || 0,
          freq: subFreq,
          firstBillingDate: todayISO(),
        }
        break
      case 'cancel_subscription':
        newDecision = {
          id,
          type: 'cancel_subscription',
          subscriptionId: 'sub_sample',
        }
        break
      case 'new_commitment':
        newDecision = {
          id,
          type: 'new_commitment',
          label: commitLabel || 'New Obligation',
          amount: Number(commitAmount) || 0,
          recurrence: { freq: 'monthly', anchor: todayISO() },
          category: 'bills',
        }
        break
      case 'goal_deposit':
        newDecision = {
          id,
          type: 'goal_deposit',
          goalId: 'goal_sample',
          amount: Number(goalAmount) || 0,
        }
        break
      case 'unexpected_expense':
        newDecision = {
          id,
          type: 'unexpected_expense',
          label: surpriseLabel || 'Surprise Outlay',
          amount: Number(surpriseAmount) || 0,
        }
        break
      case 'income_change':
        newDecision = {
          id,
          type: 'income_change',
          incomeId: 'inc_sample',
          change: 'delay',
          days: 7,
        }
        break
      case 'spending_change':
        newDecision = {
          id,
          type: 'spending_change',
          percent: Number(spendPercent) || 0,
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
  const hasStressTest = basket.some((d) =>
    ['unexpected_expense', 'income_change', 'spending_change'].includes(d.type)
  )

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
              {/* Type 1: Buy Something */}
              {selectedType === 'purchase' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-purchase-label" className="text-xs font-semibold text-[#16140F]">
                      Item or Experience
                    </Label>
                    <Input
                      id="dec-purchase-label"
                      value={purchaseLabel}
                      onChange={(e) => setPurchaseLabel(e.target.value)}
                      placeholder="e.g. Weekend dinner with friends"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-purchase-amount" className="text-xs font-semibold text-[#16140F]">
                        Amount (₹)
                      </Label>
                      <Input
                        id="dec-purchase-amount"
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        min="1"
                        required
                        className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="dec-purchase-cat" className="text-xs font-semibold text-[#16140F]">
                        Category
                      </Label>
                      <select
                        id="dec-purchase-cat"
                        value={purchaseCategory}
                        onChange={(e) => setPurchaseCategory(e.target.value)}
                        className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-[#16140F] block">Priority Classification</Label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="purchase-tag"
                          checked={purchaseTag === 'need'}
                          onChange={() => setPurchaseTag('need')}
                        />
                        <span>Essential Need</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="purchase-tag"
                          checked={purchaseTag === 'want'}
                          onChange={() => setPurchaseTag('want')}
                        />
                        <span>Discretionary Want</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Type 2: Add Subscription */}
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
                      placeholder="e.g. Spotify Premium"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dec-sub-amount" className="text-xs font-semibold text-[#16140F]">
                        Recurring Amount (₹)
                      </Label>
                      <Input
                        id="dec-sub-amount"
                        type="number"
                        value={subAmount}
                        onChange={(e) => setSubAmount(e.target.value)}
                        min="1"
                        required
                        className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dec-sub-freq" className="text-xs font-semibold text-[#16140F]">
                        Billing Frequency
                      </Label>
                      <select
                        id="dec-sub-freq"
                        value={subFreq}
                        onChange={(e) => setSubFreq(e.target.value as typeof subFreq)}
                        className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Type 3: Cancel Subscription */}
              {selectedType === 'cancel_subscription' && (
                <div className="p-4 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs text-[#5E5A52]">
                  Simulates removing an active subscription from your ongoing cycle commitments.
                  Select a subscription from your Plan to calculate how much daily allowance it recovers.
                </div>
              )}

              {/* Type 4: Take on Commitment */}
              {selectedType === 'new_commitment' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-commit-label" className="text-xs font-semibold text-[#16140F]">
                      Commitment Description
                    </Label>
                    <Input
                      id="dec-commit-label"
                      value={commitLabel}
                      onChange={(e) => setCommitLabel(e.target.value)}
                      placeholder="e.g. Laptop EMI or Room Deposit"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dec-commit-amount" className="text-xs font-semibold text-[#16140F]">
                      Amount (₹)
                    </Label>
                    <Input
                      id="dec-commit-amount"
                      type="number"
                      value={commitAmount}
                      onChange={(e) => setCommitAmount(e.target.value)}
                      min="1"
                      required
                      className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                    />
                  </div>
                </>
              )}

              {/* Type 5: Goal Deposit */}
              {selectedType === 'goal_deposit' && (
                <div className="space-y-1">
                  <Label htmlFor="dec-goal-amount" className="text-xs font-semibold text-[#16140F]">
                    Deposit Amount to Ringfence (₹)
                  </Label>
                  <Input
                    id="dec-goal-amount"
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    min="1"
                    required
                    className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                  />
                </div>
              )}

              {/* Type 6: Surprise Expense (Stress Test) */}
              {selectedType === 'unexpected_expense' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="dec-surprise-label" className="text-xs font-semibold text-[#16140F]">
                      Emergency Outlay Description
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

              {/* Type 7: Income Late (Stress Test) */}
              {selectedType === 'income_change' && (
                <div className="p-4 rounded-xl bg-[#C2410C]/10 border border-[#C2410C]/30 text-xs text-[#C2410C]">
                  Simulates a 7-day delay or missing freelance invoice. Tests whether your safety buffer absorbs the shortfall or if your allowance turns negative.
                </div>
              )}

              {/* Type 8: Spending Pace Change (Stress Test) */}
              {selectedType === 'spending_change' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="dec-spend-pace" className="text-xs font-semibold text-[#16140F]">
                      Daily Spending Pace Variation (%):
                    </Label>
                    <span className="font-bold text-xs text-[#16140F] bg-[#D4F23A] px-2 py-0.5 rounded">
                      +{spendPercent}%
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
                className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg mt-2 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4F23A]" />
                <span>Add to Simulation Basket</span>
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
                  {basket.length} {basket.length === 1 ? 'decision' : 'decisions'} in simulation
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
                        {'label' in item ? item.label : 'name' in item ? item.name : item.type}
                      </span>
                      <span className="text-[10px] text-[#5E5A52]">
                        {'amount' in item ? `₹${item.amount.toLocaleString('en-IN')}` : item.type}
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
                  description="Add a decision to see its impact."
                  receiptBorder={false}
                />
              </div>
            )}

            {/* IMPACT PANEL: BEFORE TO AFTER ROWS */}
            <div className="space-y-3 pt-3 border-t border-[#E6DFD2]">
              <span className="text-xs font-bold text-[#16140F] uppercase tracking-wider block">
                Simulated Impact Ripples
              </span>

              {hasDecisions ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5E5A52]">Wallet Now:</span>
                    <DeltaChip before="₹10,000" after="₹9,650" deltaText="-₹350" trend="negative" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5E5A52]">Daily Allowance:</span>
                    <DeltaChip before="₹300/d" after="₹288/d" deltaText="-₹12/d" trend="negative" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5E5A52]">Goal Feasibility:</span>
                    <DeltaChip before="On Track" after="On Track" trend="neutral" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5E5A52]">Forecast End:</span>
                    <DeltaChip before="₹1,200" after="₹850" deltaText="-₹350" trend="negative" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#5E5A52]">Risk Assessment:</span>
                    <DeltaChip before="Low (18)" after="Low (22)" trend="neutral" />
                  </div>

                  {/* Verdict Banner Slot */}
                  <div className="p-3 rounded-xl bg-[#1D7A53]/10 border border-[#1D7A53]/30 text-xs text-[#1D7A53] mt-3">
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verdict: Safe Move</span>
                    </div>
                    <span>
                      Daily allowance absorbs this outlay without breaching your 10% emergency buffer.
                    </span>
                  </div>

                  {/* Safe Limit Slot */}
                  <div className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] text-[11px] text-[#5E5A52] flex justify-between">
                    <span>Safe discretionary spend cap today:</span>
                    <span className="font-bold text-[#16140F]">₹600</span>
                  </div>

                  {/* Commit Actions */}
                  <div className="pt-2 flex gap-2">
                    <Button
                      type="button"
                      disabled={hasStressTest}
                      className="flex-1 h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg"
                      title={hasStressTest ? 'Stress tests cannot be committed permanently' : undefined}
                    >
                      {hasStressTest ? 'Stress Tests Active' : 'Commit Decision'}
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
                  {hasStressTest && (
                    <p className="text-[10px] text-[#5E5A52] text-center">
                      Stress test scenarios cannot be committed to permanent records.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#5E5A52] italic">
                  Select a move on the left to inspect before/after allowance deltas.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Lab
