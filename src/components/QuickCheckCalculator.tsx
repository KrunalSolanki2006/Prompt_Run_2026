import React, { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { evaluateScenario } from '@/engine/engine'
import { todayISO } from '@/engine/dates'
import { formatRupees } from '@/lib/format'
import { DeltaChip } from './DeltaChip'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
} from 'lucide-react'
import type { FinanceState, Decision } from '@/engine/types'

export const QuickCheckCalculator: React.FC = () => {
  const [budgetStr, setBudgetStr] = useState('10000')
  const [amountStr, setAmountStr] = useState('500')

  const budget = Math.max(1, parseInt(budgetStr, 10) || 10000)
  const purchaseAmount = Math.max(1, parseInt(amountStr, 10) || 500)
  const today = useMemo(() => todayISO(), [])

  // Evaluate using the pure engine
  const evaluation = useMemo(() => {
    const baseState: FinanceState = {
      version: 1,
      cycle: {
        id: 'quick_check_cycle',
        startDate: today,
        lengthDays: 30,
        startingBalance: budget,
        bufferPercent: 10,
        status: 'active',
      },
      transactions: [],
      incomes: [],
      commitments: [],
      subscriptions: [],
      goals: [],
      decisions: [],
      cycleHistory: [],
    }

    const testDecision: Decision = {
      id: 'quick_check_purchase',
      type: 'purchase',
      label: 'Planned expense',
      amount: purchaseAmount,
      date: today,
      category: 'shopping',
      tag: 'want',
    }

    return evaluateScenario(baseState, today, [testDecision])
  }, [budget, purchaseAmount, today])

  return (
    <div
      data-testid="landing-quick-check"
      className="bg-white border-2 border-[#16140F] rounded-[18px] p-6 sm:p-8 shadow-sm space-y-6 animate-pop-up"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6DFD2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16140F] text-[#D4F23A] flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F]">
              Quick Estimate · Instant Ripple Test
            </h3>
            <p className="text-xs text-[#5E5A52]">
              Live engine math on your inputs. No account needed.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#D4F23A] text-[#16140F]">
            Quick estimate, nothing is saved
          </span>
        </div>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Cycle Budget */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="qc-budget" className="text-xs font-semibold text-[#16140F]">
              30-Day Budget (₹)
            </Label>
            <div className="flex items-center gap-1">
              {[5000, 10000, 20000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBudgetStr(String(preset))}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                    budget === preset
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
            <span className="absolute left-3 top-2.5 font-bold text-[#5E5A52] text-sm">₹</span>
            <Input
              id="qc-budget"
              data-testid="quick-check-budget"
              type="number"
              inputMode="numeric"
              min="1"
              max="1000000"
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value)}
              className="pl-7 h-11 text-base font-bold bg-[#FBF8F3] border-[#E6DFD2] rounded-xl tabular-nums"
            />
          </div>
        </div>

        {/* Purchase Amount */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="qc-amount" className="text-xs font-semibold text-[#16140F]">
              Test Purchase Amount (₹)
            </Label>
            <div className="flex items-center gap-1">
              {[200, 500, 1000, 2500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountStr(String(preset))}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                    purchaseAmount === preset
                      ? 'bg-[#16140F] text-[#FBF8F3]'
                      : 'bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52] hover:text-[#16140F]'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 font-bold text-[#5E5A52] text-sm">₹</span>
            <Input
              id="qc-amount"
              data-testid="quick-check-amount"
              type="number"
              inputMode="numeric"
              min="1"
              max="1000000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="pl-7 h-11 text-base font-bold bg-[#FBF8F3] border-[#E6DFD2] rounded-xl tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Ripple Results Grid */}
      <div className="p-4 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-3">
        <span className="text-xs font-bold text-[#16140F] uppercase tracking-wider block">
          Deterministic 30-Day Ripple Outputs
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Daily Allowance */}
          <div className="bg-white p-3 rounded-lg border border-[#E6DFD2] flex flex-col justify-between">
            <span className="text-[#5E5A52] text-[11px] block mb-1">Daily Spend Allowance</span>
            <DeltaChip
              before={`${formatRupees(evaluation.before.allowance.daily)}/d`}
              after={`${formatRupees(evaluation.after.allowance.daily)}/d`}
              deltaText={`${evaluation.deltas.allowanceDelta >= 0 ? '+' : ''}${formatRupees(evaluation.deltas.allowanceDelta)}/d`}
              trend={evaluation.deltas.allowanceDelta > 0 ? 'positive' : evaluation.deltas.allowanceDelta < 0 ? 'negative' : 'neutral'}
            />
          </div>

          {/* Month End Forecast */}
          <div className="bg-white p-3 rounded-lg border border-[#E6DFD2] flex flex-col justify-between">
            <span className="text-[#5E5A52] text-[11px] block mb-1">Month-End Balance</span>
            <DeltaChip
              before={formatRupees(evaluation.before.forecast.endExpected)}
              after={formatRupees(evaluation.after.forecast.endExpected)}
              deltaText={`${evaluation.deltas.endExpectedDelta >= 0 ? '+' : ''}${formatRupees(evaluation.deltas.endExpectedDelta)}`}
              trend={evaluation.deltas.endExpectedDelta >= 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Risk Level */}
          <div className="bg-white p-3 rounded-lg border border-[#E6DFD2] flex flex-col justify-between">
            <span className="text-[#5E5A52] text-[11px] block mb-1">Financial Risk</span>
            <div className="flex items-baseline gap-1.5 font-bold uppercase tracking-wider text-xs">
              <span className="text-[#5E5A52]">{evaluation.before.risk.level}</span>
              <span>→</span>
              <span className={evaluation.after.risk.level === 'critical' || evaluation.after.risk.level === 'high' ? 'text-[#B42318]' : 'text-[#16140F]'}>
                {evaluation.after.risk.level} ({evaluation.after.risk.score} pts)
              </span>
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-white p-3 rounded-lg border border-[#E6DFD2] flex flex-col justify-between">
            <span className="text-[#5E5A52] text-[11px] block mb-1">Financial Health</span>
            <div className="flex items-baseline gap-1.5 font-bold text-xs">
              <span className="text-[#5E5A52]">{evaluation.before.health.score ?? 80}</span>
              <span>→</span>
              <span className="text-[#1D7A53]">
                {evaluation.after.health.score ?? 75} pts ({evaluation.after.health.grade})
              </span>
            </div>
          </div>
        </div>

        {/* Live Polite Verdict Banner */}
        <div
          aria-live="polite"
          className={`p-3.5 rounded-xl border text-xs mt-2 ${
            evaluation.verdict === 'comfortable'
              ? 'bg-[#1D7A53]/10 border-[#1D7A53]/30 text-[#1D7A53]'
              : evaluation.verdict === 'manageable'
              ? 'bg-[#16140F]/5 border-[#16140F]/20 text-[#16140F]'
              : evaluation.verdict === 'tight'
              ? 'bg-[#A15C07]/10 border-[#A15C07]/30 text-[#A15C07]'
              : 'bg-[#B42318]/10 border-[#B42318]/30 text-[#B42318]'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
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
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            {evaluation.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-[#5E5A52]">
          <ShieldCheck className="w-4 h-4 text-[#1D7A53]" />
          <span>Pure deterministic math. No cloud tracking, runs directly in your browser.</span>
        </div>
        <Button asChild className="h-11 bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 font-bold text-xs rounded-xl px-5 shrink-0">
          <Link to="/sign-up">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#D4F23A]" />
            <span>Start your ₹10,000 cycle</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
export default QuickCheckCalculator
