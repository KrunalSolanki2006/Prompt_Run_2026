import React, { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { useToday } from '@/hooks/useToday'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/engine/constants'
import { cleanText } from '@/lib/sanitize'
import { formatRupees } from '@/lib/format'
import type {
  IncomeSource,
  Commitment,
  Subscription,
  Goal,
  CategoryId,
} from '@/engine/types'
import {
  ArrowDownLeft,
  Receipt,
  CreditCard,
  PiggyBank,
  Plus,
  Trash2,
  Pause,
  Play,
} from 'lucide-react'

export const Plan: React.FC = () => {
  useDocumentTitle('Financial Plan')
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'commitments'

  const {
    state,
    snapshot,
    addIncome,
    deleteIncome,
    addCommitment,
    deleteCommitment,
    addSubscription,
    deleteSubscription,
    toggleSubscription,
    addGoal,
    deleteGoal,
    addTransaction,
  } = useFinance()
  const today = useToday()

  const [dialogOpen, setDialogOpen] = useState<string | null>(null)
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null)
  const [depositAmountStr, setDepositAmountStr] = useState('')

  // Form states for Income
  const [incLabel, setIncLabel] = useState('')
  const [incAmount, setIncAmount] = useState('3000')
  const [incFreq, setIncFreq] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [incAnchor, setIncAnchor] = useState(today)
  const [incCertainty, setIncCertainty] = useState<'confirmed' | 'likely'>('confirmed')

  // Form states for Commitment
  const [comLabel, setComLabel] = useState('')
  const [comAmount, setComAmount] = useState('1500')
  const [comCategory, setComCategory] = useState<CategoryId>('bills')
  const [comFreq, setComFreq] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [comAnchor, setComAnchor] = useState(today)

  // Form states for Subscription
  const [subName, setSubName] = useState('')
  const [subAmount, setSubAmount] = useState('299')
  const [subFreq, setSubFreq] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [subNextDate, setSubNextDate] = useState(today)

  // Form states for Goal
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('5000')
  const [goalStarting, setGoalStarting] = useState('0')
  const [goalContribution, setGoalContribution] = useState('1000')
  const [goalPriority, setGoalPriority] = useState<1 | 2 | 3>(1)
  const [goalDeadline, setGoalDeadline] = useState('')

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  // Handlers
  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(incAmount, 10)
    if (!amount || amount <= 0) return

    const newInc: IncomeSource = {
      id: `inc_${Date.now()}`,
      label: cleanText(incLabel || 'Income Source'),
      amount,
      recurrence: { freq: incFreq, anchor: incAnchor },
      certainty: incCertainty,
    }
    addIncome(newInc)
    setIncLabel('')
    setDialogOpen(null)
  }

  const handleSaveCommitment = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(comAmount, 10)
    if (!amount || amount <= 0) return

    const newCom: Commitment = {
      id: `com_${Date.now()}`,
      label: cleanText(comLabel || 'Fixed Bill'),
      amount,
      category: comCategory,
      recurrence: { freq: comFreq, anchor: comAnchor },
    }
    addCommitment(newCom)
    setComLabel('')
    setDialogOpen(null)
  }

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(subAmount, 10)
    if (!amount || amount <= 0) return

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      name: cleanText(subName || 'Digital Subscription'),
      amount,
      freq: subFreq,
      nextBillingDate: subNextDate,
      status: 'active',
    }
    addSubscription(newSub)
    setSubName('')
    setDialogOpen(null)
  }

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(goalTarget, 10)
    if (!target || target <= 0) return

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      name: cleanText(goalName || 'Savings Goal'),
      targetAmount: target,
      startingSaved: parseInt(goalStarting, 10) || 0,
      cycleContribution: parseInt(goalContribution, 10) || 0,
      priority: goalPriority,
      deadline: goalDeadline || undefined,
      createdAt: new Date().toISOString(),
    }
    addGoal(newGoal)
    setGoalName('')
    setDialogOpen(null)
  }

  const handleExecuteGoalDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositGoal) return
    const amount = parseInt(depositAmountStr, 10)
    if (!amount || amount <= 0 || amount > snapshot.wallet) return

    addTransaction({
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: today,
      amount,
      kind: 'goal_deposit',
      category: 'savings',
      note: `Deposit to ${depositGoal.name}`,
      tag: 'need',
      unexpected: false,
      goalId: depositGoal.id,
    })

    setDepositGoal(null)
    setDepositAmountStr('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commitments & Financial Plan"
        subtitle="Organize recurring income, fixed obligations, digital subscriptions, and savings goals."
        actions={
          <Button
            onClick={() => setDialogOpen(currentTab)}
            className="h-9 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4F23A]" />
            <span>
              {currentTab === 'income'
                ? 'Add Income'
                : currentTab === 'commitments'
                ? 'Add Commitment'
                : currentTab === 'subscriptions'
                ? 'Add Subscription'
                : 'Create Goal'}
            </span>
          </Button>
        }
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border border-[#E6DFD2] rounded-xl p-1 grid grid-cols-2 sm:grid-cols-4 h-auto shadow-xs">
          <TabsTrigger
            value="income"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Income ({state.incomes.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="commitments"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            <span>Commitments ({state.commitments.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            <span>Subscriptions ({state.subscriptions.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <PiggyBank className="w-3.5 h-3.5 mr-1.5" />
            <span>Goals ({state.goals.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INCOME */}
        <TabsContent value="income">
          {state.incomes.length === 0 ? (
            <EmptyState
              icon={<ArrowDownLeft className="w-6 h-6 text-[#1D7A53]" />}
              title="No income sources configured"
              description="Add your salary, freelance gigs, or allowances to incorporate predictable cash inflows."
              action={
                <Button
                  onClick={() => setDialogOpen('income')}
                  className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
                >
                  Add First Income Source
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-white border border-[#E6DFD2] rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#16140F]">{inc.label}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          inc.certainty === 'confirmed'
                            ? 'bg-[#1D7A53]/10 text-[#1D7A53]'
                            : 'bg-[#A15C07]/10 text-[#A15C07]'
                        }`}
                      >
                        {inc.certainty}
                      </span>
                    </div>
                    <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] block">
                      +{formatRupees(inc.amount)}
                    </span>
                    <span className="text-xs text-[#5E5A52]">
                      Recurrence: {inc.recurrence.freq} · Anchor: {inc.recurrence.anchor}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove income "${inc.label}"?`)) {
                        deleteIncome(inc.id)
                      }
                    }}
                    className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                    aria-label={`Delete ${inc.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: COMMITMENTS */}
        <TabsContent value="commitments">
          {state.commitments.length === 0 ? (
            <EmptyState
              icon={<Receipt className="w-6 h-6 text-[#5E5A52]" />}
              title="No fixed commitments logged"
              description="Add fixed commitments like rent, loan EMIs, or utility bills so they are ring-fenced from daily allowance."
              action={
                <Button
                  onClick={() => setDialogOpen('commitments')}
                  className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
                >
                  Add First Commitment
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.commitments.map((com) => (
                <div
                  key={com.id}
                  className="bg-white border border-[#E6DFD2] rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <span className="font-bold text-sm text-[#16140F] block mb-1">
                      {com.label}
                    </span>
                    <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] block">
                      {formatRupees(com.amount)}
                    </span>
                    <span className="text-xs text-[#5E5A52]">
                      {com.category.toUpperCase()} · {com.recurrence.freq} · Due: {com.recurrence.anchor}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove commitment "${com.label}"?`)) {
                        deleteCommitment(com.id)
                      }
                    }}
                    className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                    aria-label={`Delete ${com.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: SUBSCRIPTIONS */}
        <TabsContent value="subscriptions">
          {state.subscriptions.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="w-6 h-6 text-[#A15C07]" />}
              title="No active subscriptions tracked"
              description="Log your streaming services, cloud storage, and gym memberships to track upcoming billing cycles."
              action={
                <Button
                  onClick={() => setDialogOpen('subscriptions')}
                  className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
                >
                  Track a Subscription
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-white border rounded-xl p-4 flex justify-between items-start ${
                    sub.status === 'paused'
                      ? 'border-[#E6DFD2]/60 opacity-60'
                      : 'border-[#E6DFD2]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#16140F]">{sub.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          sub.status === 'active'
                            ? 'bg-[#1D7A53]/10 text-[#1D7A53]'
                            : 'bg-[#5E5A52]/10 text-[#5E5A52]'
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] block">
                      {formatRupees(sub.amount)}
                      <span className="text-xs font-normal text-[#5E5A52]">/{sub.freq}</span>
                    </span>
                    <span className="text-xs text-[#5E5A52]">
                      Next Billing: {sub.nextBillingDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSubscription(sub.id)}
                      className="h-8 px-2 text-xs"
                      title={sub.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
                    >
                      {sub.status === 'active' ? (
                        <Pause className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <Play className="w-3.5 h-3.5 mr-1" />
                      )}
                      <span>{sub.status === 'active' ? 'Pause' : 'Resume'}</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove subscription "${sub.name}"?`)) {
                          deleteSubscription(sub.id)
                        }
                      }}
                      className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                      aria-label={`Delete ${sub.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: GOALS */}
        <TabsContent value="goals">
          {state.goals.length === 0 ? (
            <EmptyState
              icon={<PiggyBank className="w-6 h-6 text-[#1D7A53]" />}
              title="No savings goals established"
              description="Create milestone targets (emergency fund, travel, courses) to reserve savings during your 30-day cycle."
              action={
                <Button
                  onClick={() => setDialogOpen('goals')}
                  className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
                >
                  Create First Goal
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.goals.map((g) => {
                const proj = snapshot.goals.find((p) => p.goalId === g.id)
                const currentSaved = proj?.saved ?? g.startingSaved
                const pct = Math.min(100, Math.round((currentSaved / g.targetAmount) * 100))

                return (
                  <div
                    key={g.id}
                    className="bg-white border border-[#E6DFD2] rounded-xl p-5 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-[#16140F]">{g.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#16140F] text-[#FBF8F3]">
                            P{g.priority}
                          </span>
                        </div>
                        <span className="text-xs text-[#5E5A52]">
                          Target: {formatRupees(g.targetAmount)} · Cycle Plan: {formatRupees(g.cycleContribution)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove goal "${g.name}"? Past deposits will remain in history.`)) {
                            deleteGoal(g.id)
                          }
                        }}
                        className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                        aria-label={`Delete ${g.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Saved: {formatRupees(currentSaved)}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#FBF8F3] border border-[#E6DFD2] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#16140F] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E6DFD2] flex justify-between items-center text-xs">
                      <span className="text-[#5E5A52]">
                        Status: <strong className="text-[#16140F] capitalize">{proj?.status.replace('_', ' ') ?? 'Active'}</strong>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDepositGoal(g)
                          setDepositAmountStr('500')
                        }}
                        className="h-7 px-2.5 text-xs border-[#E6DFD2]"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        <span>Add Money</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 1. INCOME DIALOG */}
      <Dialog open={dialogOpen === 'income'} onOpenChange={(o) => !o && setDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Add Income Stream
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Record anticipated or confirmed income to incorporate into your cash flow.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveIncome} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Label / Employer</Label>
              <Input
                value={incLabel}
                onChange={(e) => setIncLabel(e.target.value)}
                placeholder="e.g. Freelance Stipend"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Certainty</Label>
                <select
                  value={incCertainty}
                  onChange={(e) => setIncCertainty(e.target.value as 'confirmed' | 'likely')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="likely">Likely</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recurrence</Label>
                <select
                  value={incFreq}
                  onChange={(e) => setIncFreq(e.target.value as 'once' | 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="once">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Date Expected</Label>
                <Input
                  type="date"
                  value={incAnchor}
                  onChange={(e) => setIncAnchor(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Save Income
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. COMMITMENT DIALOG */}
      <Dialog open={dialogOpen === 'commitments'} onOpenChange={(o) => !o && setDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Add Fixed Commitment or EMI
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Ringfence non-negotiable fixed expenses from your daily discretionary spend.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCommitment} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Obligation Label</Label>
              <Input
                value={comLabel}
                onChange={(e) => setComLabel(e.target.value)}
                placeholder="e.g. WiFi Bill or Rent"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={comAmount}
                  onChange={(e) => setComAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Category</Label>
                <select
                  value={comCategory}
                  onChange={(e) => setComCategory(e.target.value as CategoryId)}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
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
                <Label className="text-xs font-semibold">Recurrence</Label>
                <select
                  value={comFreq}
                  onChange={(e) => setComFreq(e.target.value as 'once' | 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="once">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Due Date</Label>
                <Input
                  type="date"
                  value={comAnchor}
                  onChange={(e) => setComAnchor(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Save Commitment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. SUBSCRIPTION DIALOG */}
      <Dialog open={dialogOpen === 'subscriptions'} onOpenChange={(o) => !o && setDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Track Digital Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Keep tabs on recurring entertainment, cloud, or fitness subscriptions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSubscription} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Service Name</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Music Stream"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recurring Fee (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Billing Frequency</Label>
                <select
                  value={subFreq}
                  onChange={(e) => setSubFreq(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Next Billing Date</Label>
              <Input
                type="date"
                value={subNextDate}
                onChange={(e) => setSubNextDate(e.target.value)}
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Track Subscription
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. GOAL DIALOG */}
      <Dialog open={dialogOpen === 'goals'} onOpenChange={(o) => !o && setDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Create Savings Goal
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Ringfence contributions towards milestone savings targets.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Goal Name</Label>
              <Input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Emergency Moat / Certification"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Target Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cycle Plan (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={goalContribution}
                  onChange={(e) => setGoalContribution(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Priority (1 = Highest)</Label>
                <select
                  value={goalPriority}
                  onChange={(e) => setGoalPriority(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value={1}>Priority 1 (Crucial)</option>
                  <option value={2}>Priority 2 (Important)</option>
                  <option value={3}>Priority 3 (Discretionary)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Starting Saved (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={goalStarting}
                  onChange={(e) => setGoalStarting(e.target.value)}
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Deadline (Optional)</Label>
              <Input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Save Goal
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. GOAL DEPOSIT MODAL */}
      <Dialog open={depositGoal !== null} onOpenChange={(o) => !o && setDepositGoal(null)}>
        <DialogContent className="max-w-sm bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-lg">
              Deposit to {depositGoal?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Transfer funds from liquid wallet (₹{snapshot.wallet.toLocaleString('en-IN')}) to this goal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExecuteGoalDeposit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Deposit Amount (₹)</Label>
              <Input
                type="number"
                min="1"
                max={snapshot.wallet}
                value={depositAmountStr}
                onChange={(e) => setDepositAmountStr(e.target.value)}
                required
                className="bg-[#FBF8F3] border-[#E6DFD2] font-bold text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={parseInt(depositAmountStr, 10) > snapshot.wallet}
              className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl"
            >
              Deposit Funds
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default Plan
