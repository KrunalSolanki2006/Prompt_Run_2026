import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cycleSetupSchema, type CycleSetupFormData } from '@/features/setup/schemas'
import { useFinance } from '@/features/store/FinanceContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { todayISO, addDays } from '@/engine/dates'
import type { Cycle, IncomeSource, Commitment, Subscription, Goal } from '@/engine/types'
import { cleanText } from '@/lib/sanitize'
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ArrowDownLeft,
  Receipt,
  CreditCard,
  PiggyBank,
} from 'lucide-react'

export const Setup: React.FC = () => {
  useDocumentTitle('Cycle Setup')
  const navigate = useNavigate()
  const { initCycle, addIncome, addCommitment, addSubscription, addGoal } = useFinance()

  // Optional collapsible items state
  const [showOptionalIncome, setShowOptionalIncome] = useState(false)
  const [showOptionalCommitment, setShowOptionalCommitment] = useState(false)
  const [showOptionalSubscription, setShowOptionalSubscription] = useState(false)
  const [showOptionalGoal, setShowOptionalGoal] = useState(false)

  // Optional fields state
  const [optIncomeLabel, setOptIncomeLabel] = useState('')
  const [optIncomeAmount, setOptIncomeAmount] = useState('')

  const [optCommitmentLabel, setOptCommitmentLabel] = useState('')
  const [optCommitmentAmount, setOptCommitmentAmount] = useState('')

  const [optSubName, setOptSubName] = useState('')
  const [optSubAmount, setOptSubAmount] = useState('')

  const [optGoalName, setOptGoalName] = useState('')
  const [optGoalTarget, setOptGoalTarget] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CycleSetupFormData>({
    resolver: zodResolver(cycleSetupSchema),
    defaultValues: {
      startingBalance: 10000,
      startDate: todayISO(),
      bufferPercent: 10,
    },
    mode: 'onChange',
  })

  const currentBudget = watch('startingBalance') || 10000
  const currentBuffer = watch('bufferPercent') || 10
  const bufferAmount = Math.round((Number(currentBudget) * Number(currentBuffer)) / 100)

  const onSubmit = async (data: CycleSetupFormData) => {
    const newCycle: Cycle = {
      id: `cycle_${Date.now()}`,
      startDate: data.startDate,
      lengthDays: 30,
      startingBalance: data.startingBalance,
      bufferPercent: data.bufferPercent,
      status: 'active',
    }

    initCycle(newCycle)

    // Optionally add user's first income
    const incAmount = parseInt(optIncomeAmount, 10)
    if (optIncomeLabel.trim() && !isNaN(incAmount) && incAmount > 0) {
      const inc: IncomeSource = {
        id: `inc_${Date.now()}_setup`,
        label: cleanText(optIncomeLabel),
        amount: incAmount,
        recurrence: { freq: 'once', anchor: addDays(data.startDate, 5) },
        certainty: 'confirmed',
      }
      addIncome(inc)
    }

    // Optionally add user's first commitment
    const comAmount = parseInt(optCommitmentAmount, 10)
    if (optCommitmentLabel.trim() && !isNaN(comAmount) && comAmount > 0) {
      const com: Commitment = {
        id: `com_${Date.now()}_setup`,
        label: cleanText(optCommitmentLabel),
        amount: comAmount,
        category: 'bills',
        recurrence: { freq: 'once', anchor: addDays(data.startDate, 7) },
      }
      addCommitment(com)
    }

    // Optionally add user's first subscription
    const subAmount = parseInt(optSubAmount, 10)
    if (optSubName.trim() && !isNaN(subAmount) && subAmount > 0) {
      const sub: Subscription = {
        id: `sub_${Date.now()}_setup`,
        name: cleanText(optSubName),
        amount: subAmount,
        freq: 'monthly',
        nextBillingDate: addDays(data.startDate, 10),
        status: 'active',
      }
      addSubscription(sub)
    }

    // Optionally add user's first savings goal
    const goalTarget = parseInt(optGoalTarget, 10)
    if (optGoalName.trim() && !isNaN(goalTarget) && goalTarget > 0) {
      const goal: Goal = {
        id: `goal_${Date.now()}_setup`,
        name: cleanText(optGoalName),
        targetAmount: goalTarget,
        startingSaved: 0,
        cycleContribution: goalTarget,
        priority: 1,
        createdAt: new Date().toISOString(),
      }
      addGoal(goal)
    }

    navigate('/app', { replace: true })
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <PageHeader
        title="Initialize 30-Day Cycle"
        subtitle="Set up your starting parameters. Challenge baseline: ₹10,000 over 30 days."
        badge={
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4F23A] text-[#16140F]">
            Challenge Default: ₹10,000
          </span>
        }
      />

      <div className="bg-white border border-[#E6DFD2] rounded-[18px] p-6 sm:p-8 shadow-xs animate-pop-up">
        <div className="mb-6 pb-4 border-b border-[#E6DFD2]/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5E5A52] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#A15C07]" />
            <span>Cycle Contract</span>
          </div>
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F]">
            ₹10,000 Budget Parameters
          </h2>
          <p className="text-xs text-[#5E5A52] mt-1">
            Configure your cycle baseline. All optional sections can be skipped and configured later.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Starting Balance */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="setup-budget" className="text-sm font-semibold text-[#16140F]">
                Starting Cycle Balance (₹)
              </Label>
              {/* Preset Chips */}
              <div className="flex items-center gap-1.5">
                {[5000, 10000, 20000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setValue('startingBalance', preset, { shouldValidate: true })}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      currentBudget === preset
                        ? 'bg-[#16140F] text-[#FBF8F3]'
                        : 'bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52] hover:text-[#16140F]'
                    }`}
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-base font-bold text-[#5E5A52]">₹</span>
              <Input
                id="setup-budget"
                data-testid="setup-starting-balance"
                type="number"
                inputMode="numeric"
                min="1"
                max="1000000"
                step="1"
                placeholder="10000"
                className="pl-8 h-12 text-lg font-bold font-['Bricolage_Grotesque_Variable'] bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px] tabular-nums"
                aria-invalid={!!errors.startingBalance}
                aria-describedby={errors.startingBalance ? 'setup-budget-err' : 'setup-budget-hint'}
                {...register('startingBalance', { valueAsNumber: true })}
              />
            </div>
            <p id="setup-budget-hint" className="text-xs text-[#5E5A52]">
              Challenge default: ₹10,000 over 30 days (whole rupees).
            </p>
            {errors.startingBalance && (
              <p id="setup-budget-err" className="text-xs font-semibold text-[#B42318]">
                {errors.startingBalance.message}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="setup-date" className="text-sm font-semibold text-[#16140F]">
              Cycle Start Date
            </Label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#5E5A52] absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="setup-date"
                data-testid="setup-start-date"
                type="date"
                className="pl-10 h-12 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                aria-invalid={!!errors.startDate}
                aria-describedby={errors.startDate ? 'setup-date-err' : 'setup-date-hint'}
                {...register('startDate')}
              />
            </div>
            <p id="setup-date-hint" className="text-xs text-[#5E5A52]">
              Default is today. You may backdate up to 29 days if your cycle already started.
            </p>
            {errors.startDate && (
              <p id="setup-date-err" className="text-xs font-semibold text-[#B42318]">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* Safety Buffer Percentage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="setup-buffer" className="text-sm font-semibold text-[#16140F]">
                Safety Buffer Percentage
              </Label>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setValue('bufferPercent', pct, { shouldValidate: true })}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      currentBuffer === pct
                        ? 'bg-[#16140F] text-[#FBF8F3]'
                        : 'bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52] hover:text-[#16140F]'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Input
                id="setup-buffer"
                data-testid="setup-buffer-percent"
                type="number"
                inputMode="numeric"
                min="0"
                max="30"
                step="1"
                placeholder="10"
                className="h-12 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                aria-invalid={!!errors.bufferPercent}
                aria-describedby={errors.bufferPercent ? 'setup-buffer-err' : 'setup-buffer-hint'}
                {...register('bufferPercent', { valueAsNumber: true })}
              />
            </div>
            <p id="setup-buffer-hint" className="text-xs text-[#5E5A52] leading-relaxed">
              Ring-fences ₹{bufferAmount.toLocaleString('en-IN')} ({currentBuffer}%) for unexpected surprises before computing daily spend.
            </p>
            {errors.bufferPercent && (
              <p id="setup-buffer-err" className="text-xs font-semibold text-[#B42318]">
                {errors.bufferPercent.message}
              </p>
            )}
          </div>

          {/* Summary Box */}
          <div className="rounded-[12px] bg-[#FBF8F3] border border-[#E6DFD2] p-4 text-xs space-y-2 animate-slide-in-left">
            <div className="flex justify-between items-center text-[#5E5A52]">
              <span>Discretionary Pool Baseline:</span>
              <span className="font-semibold text-[#16140F] tabular-nums">
                ₹{(Number(currentBudget) - bufferAmount).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#5E5A52]">
              <span>Emergency Buffer Cushion:</span>
              <span className="font-semibold text-[#16140F] tabular-nums">
                ₹{bufferAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E6DFD2] flex justify-between items-center font-bold text-[#16140F]">
              <span>Total Starting Runway:</span>
              <span className="font-['Bricolage_Grotesque_Variable'] text-sm tabular-nums">
                ₹{Number(currentBudget).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* OPTIONAL COLLAPSIBLE SECTIONS (ALL SKIPPABLE) */}
          <div className="pt-2 border-t border-[#E6DFD2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider">
                Optional Quick Add (Skippable)
              </span>
              <span className="text-[11px] text-[#5E5A52]">All items can be added later in Plan</span>
            </div>

            {/* Collapsible 1: First Income */}
            <div className="border border-[#E6DFD2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowOptionalIncome(!showOptionalIncome)}
                className="w-full px-4 py-3 text-left text-xs font-semibold text-[#16140F] flex items-center justify-between bg-[#FBF8F3] hover:bg-[#F3EFE6] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-[#1D7A53]" />
                  <span>Add First Expected Income (Optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptionalIncome ? 'rotate-180' : ''}`} />
              </button>
              {showOptionalIncome && (
                <div className="p-4 space-y-3 bg-white border-t border-[#E6DFD2]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="opt-inc-label" className="text-xs font-semibold text-[#5E5A52]">Income Label</Label>
                      <Input
                        id="opt-inc-label"
                        placeholder="e.g. Freelance Stipend"
                        value={optIncomeLabel}
                        onChange={(e) => setOptIncomeLabel(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-inc-amt" className="text-xs font-semibold text-[#5E5A52]">Amount (₹)</Label>
                      <Input
                        id="opt-inc-amt"
                        type="number"
                        placeholder="e.g. 5000"
                        value={optIncomeAmount}
                        onChange={(e) => setOptIncomeAmount(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible 2: First Commitment */}
            <div className="border border-[#E6DFD2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowOptionalCommitment(!showOptionalCommitment)}
                className="w-full px-4 py-3 text-left text-xs font-semibold text-[#16140F] flex items-center justify-between bg-[#FBF8F3] hover:bg-[#F3EFE6] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#A15C07]" />
                  <span>Add First Fixed Commitment / Rent (Optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptionalCommitment ? 'rotate-180' : ''}`} />
              </button>
              {showOptionalCommitment && (
                <div className="p-4 space-y-3 bg-white border-t border-[#E6DFD2]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="opt-com-label" className="text-xs font-semibold text-[#5E5A52]">Obligation Title</Label>
                      <Input
                        id="opt-com-label"
                        placeholder="e.g. PG Rent / Wifi Bill"
                        value={optCommitmentLabel}
                        onChange={(e) => setOptCommitmentLabel(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-com-amt" className="text-xs font-semibold text-[#5E5A52]">Amount (₹)</Label>
                      <Input
                        id="opt-com-amt"
                        type="number"
                        placeholder="e.g. 2500"
                        value={optCommitmentAmount}
                        onChange={(e) => setOptCommitmentAmount(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible 3: First Subscription */}
            <div className="border border-[#E6DFD2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowOptionalSubscription(!showOptionalSubscription)}
                className="w-full px-4 py-3 text-left text-xs font-semibold text-[#16140F] flex items-center justify-between bg-[#FBF8F3] hover:bg-[#F3EFE6] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#5E5A52]" />
                  <span>Add First Subscription (Optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptionalSubscription ? 'rotate-180' : ''}`} />
              </button>
              {showOptionalSubscription && (
                <div className="p-4 space-y-3 bg-white border-t border-[#E6DFD2]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="opt-sub-name" className="text-xs font-semibold text-[#5E5A52]">Subscription Name</Label>
                      <Input
                        id="opt-sub-name"
                        placeholder="e.g. Spotify / OTT"
                        value={optSubName}
                        onChange={(e) => setOptSubName(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-sub-amt" className="text-xs font-semibold text-[#5E5A52]">Monthly Cost (₹)</Label>
                      <Input
                        id="opt-sub-amt"
                        type="number"
                        placeholder="e.g. 199"
                        value={optSubAmount}
                        onChange={(e) => setOptSubAmount(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible 4: First Savings Goal */}
            <div className="border border-[#E6DFD2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowOptionalGoal(!showOptionalGoal)}
                className="w-full px-4 py-3 text-left text-xs font-semibold text-[#16140F] flex items-center justify-between bg-[#FBF8F3] hover:bg-[#F3EFE6] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-[#1D7A53]" />
                  <span>Add First Savings Goal (Optional)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptionalGoal ? 'rotate-180' : ''}`} />
              </button>
              {showOptionalGoal && (
                <div className="p-4 space-y-3 bg-white border-t border-[#E6DFD2]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="opt-goal-name" className="text-xs font-semibold text-[#5E5A52]">Goal Target Name</Label>
                      <Input
                        id="opt-goal-name"
                        placeholder="e.g. Emergency Fund"
                        value={optGoalName}
                        onChange={(e) => setOptGoalName(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="opt-goal-target" className="text-xs font-semibold text-[#5E5A52]">Target Amount (₹)</Label>
                      <Input
                        id="opt-goal-target"
                        type="number"
                        placeholder="e.g. 2000"
                        value={optGoalTarget}
                        onChange={(e) => setOptGoalTarget(e.target.value)}
                        className="h-10 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              data-testid="setup-submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 rounded-[10px] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#D4F23A]" />
              <span>Start my 30 days</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default Setup
