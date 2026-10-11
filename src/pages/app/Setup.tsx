import React from 'react'
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
import { todayISO } from '@/engine/dates'
import type { Cycle } from '@/engine/types'
import { Sparkles, Calendar, ShieldCheck, ArrowRight } from 'lucide-react'

export const Setup: React.FC = () => {
  useDocumentTitle('Cycle Setup')
  const navigate = useNavigate()
  const { initCycle } = useFinance()

  const {
    register,
    handleSubmit,
    watch,
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
    navigate('/app', { replace: true })
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <PageHeader
        title="Initialize 30-Day Cycle"
        subtitle="Set up your starting parameters. The challenge baseline is ₹10,000 over 30 days."
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
            Configure your cycle. You can adjust the starting budget or backdate the start date by up to 29 days if your cycle already started.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Starting Balance */}
          <div className="space-y-1.5">
            <Label htmlFor="setup-budget" className="text-sm font-semibold text-[#16140F]">
              Starting Cycle Balance (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-base font-bold text-[#5E5A52]">₹</span>
              <Input
                id="setup-budget"
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
              Challenge default: ₹10,000 over 30 days (whole rupees, integer only).
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
                type="date"
                className="pl-10 h-12 text-base bg-[#FBF8F3] border-[#E6DFD2] rounded-[10px]"
                aria-invalid={!!errors.startDate}
                aria-describedby={errors.startDate ? 'setup-date-err' : 'setup-date-hint'}
                {...register('startDate')}
              />
            </div>
            <p id="setup-date-hint" className="text-xs text-[#5E5A52]">
              Default is today. You may backdate up to 29 days if you started earlier.
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
              <span className="text-xs font-bold font-['Bricolage_Grotesque_Variable'] text-[#16140F] bg-[#D4F23A] px-2 py-0.5 rounded">
                {currentBuffer}% (~₹{bufferAmount.toLocaleString('en-IN')})
              </span>
            </div>
            <Input
              id="setup-buffer"
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
            <p id="setup-buffer-hint" className="text-xs text-[#5E5A52] leading-relaxed">
              Ring-fences a portion of your funds for unexpected surprises before calculating your discretionary daily spend.
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

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 rounded-[10px] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-[#D4F23A]" />
              <span>Start 30-Day Runway</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default Setup
