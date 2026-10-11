import React from 'react'
import { Link } from 'react-router'
import { formatRupees } from '@/lib/format'
import { DeltaChip } from '@/components/DeltaChip'
import { Activity, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RippleLogEntry } from '@/features/store/FinanceContext'

interface WhatChangedCardProps {
  ripples: RippleLogEntry[]
}

export const WhatChangedCard: React.FC<WhatChangedCardProps> = ({ ripples }) => {
  return (
    <div
      data-testid="what-changed-panel"
      className="bg-white border border-[#E6DFD2] rounded-[18px] p-5 sm:p-6 shadow-xs space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6DFD2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#16140F] text-[#D4F23A] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
              What Changed · Before → After Ripple Log
            </h3>
            <p className="text-xs text-[#5E5A52]">
              Persistent ripple trail: see how your actions shift allowance, forecast, risk, and health
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs border-[#E6DFD2]">
          <Link to="/app/activity">View All Activity</Link>
        </Button>
      </div>

      {ripples.length === 0 ? (
        <div className="p-4 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs text-[#5E5A52] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-[#16140F] block">No state ripples recorded yet this session</span>
            <span>Add an expense, settle a bill, or commit a simulated decision to view its live ripple deltas here.</span>
          </div>
          <Button asChild size="sm" className="bg-[#16140F] text-[#FBF8F3] text-xs font-bold shrink-0">
            <Link to="/app/lab">
              <FlaskConical className="w-3.5 h-3.5 mr-1.5 text-[#D4F23A]" />
              <span>Simulate in Lab</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {ripples.map((rip) => {
            const allowanceDelta = rip.allowanceAfter - rip.allowanceBefore
            const forecastDelta = rip.forecastAfter - rip.forecastBefore

            return (
              <div
                key={rip.id}
                className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs space-y-2 hover:border-[#16140F]/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#16140F]">{rip.actionLabel}</span>
                  <span className="text-[10px] text-[#5E5A52] font-mono">{rip.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-[#E6DFD2]/60">
                  {/* Allowance */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-[#5E5A52]">Allowance:</span>
                    <DeltaChip
                      before={`${formatRupees(rip.allowanceBefore)}/d`}
                      after={`${formatRupees(rip.allowanceAfter)}/d`}
                      deltaText={`${allowanceDelta >= 0 ? '+' : ''}${formatRupees(allowanceDelta)}/d`}
                      trend={allowanceDelta > 0 ? 'positive' : allowanceDelta < 0 ? 'negative' : 'neutral'}
                    />
                  </div>

                  {/* Forecast End */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-[#5E5A52]">Month-End:</span>
                    <DeltaChip
                      before={formatRupees(rip.forecastBefore)}
                      after={formatRupees(rip.forecastAfter)}
                      deltaText={`${forecastDelta >= 0 ? '+' : ''}${formatRupees(forecastDelta)}`}
                      trend={forecastDelta >= 0 ? 'positive' : 'negative'}
                    />
                  </div>

                  {/* Risk Tier */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-[#5E5A52]">Risk:</span>
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      {rip.riskLevelBefore} → <span className="font-bold text-[#16140F]">{rip.riskLevelAfter}</span>
                    </span>
                  </div>

                  {/* Health */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-start text-[11px]">
                    <span className="text-[#5E5A52]">Health:</span>
                    <span className="font-semibold text-[10px]">
                      {rip.healthBefore !== null ? `${rip.healthBefore} pts` : '—'} →{' '}
                      <span className="font-bold text-[#16140F]">
                        {rip.healthAfter !== null ? `${rip.healthAfter} pts` : '—'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default WhatChangedCard
