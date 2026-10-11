import React from 'react'
import { DeltaChip } from '@/components/DeltaChip'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { formatRupees } from '@/lib/format'
import {
  Trash2,
  HelpCircle,
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import type { Decision } from '@/engine/types'
import type { ScenarioEvaluation } from '@/engine/engine'

interface LabImpactSummaryProps {
  basket: Decision[]
  hasDecisions: boolean
  evaluation: ScenarioEvaluation
  safeLimitToday: number
  timingHint: string | null
  committableDecisions: Decision[]
  onRemoveFromBasket: (id: string) => void
  onClearBasket: () => void
  onOpenCommitDialog: () => void
}

export const LabImpactSummary: React.FC<LabImpactSummaryProps> = ({
  basket,
  hasDecisions,
  evaluation,
  safeLimitToday,
  timingHint,
  committableDecisions,
  onRemoveFromBasket,
  onClearBasket,
  onOpenCommitDialog,
}) => {
  return (
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
            onClick={onClearBasket}
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
                onClick={() => onRemoveFromBasket(item.id)}
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
                onClick={onOpenCommitDialog}
                className="flex-1 h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg"
              >
                {committableDecisions.length === 0
                  ? 'Stress Tests Only'
                  : `Commit (${committableDecisions.length}) Decision${committableDecisions.length > 1 ? 's' : ''}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClearBasket}
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
  )
}
