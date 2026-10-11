import React from 'react'
import { Money } from '@/components/Money'
import { StatTile } from '@/components/StatTile'
import { Gauge } from '@/components/Gauge'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Wallet, TrendingUp } from 'lucide-react'
import type { Snapshot } from '@/engine/types'

interface CockpitStatsProps {
  hasCycle: boolean
  snapshot: Snapshot
}

export const CockpitStats: React.FC<CockpitStatsProps> = ({
  hasCycle,
  snapshot,
}) => {
  return (
    <div className="space-y-6">
      {/* ALLOWANCE HERO WITH ANIMATED NUMBER */}
      <div className="bg-white border border-[#E6DFD2] rounded-[18px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-1">
              Discretionary Pacing
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-4xl sm:text-5xl font-extrabold text-[#16140F] tabular-nums">
                {hasCycle ? (
                  <>
                    ₹<AnimatedNumber value={snapshot.allowance.leftToday} />
                  </>
                ) : (
                  '₹—'
                )}
              </h2>
              <span className="text-sm font-semibold text-[#5E5A52]">
                left to spend today
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0.5">
            <span className="text-xs text-[#5E5A52]">Daily Base Target:</span>
            <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] tabular-nums">
              {hasCycle ? <Money amount={snapshot.allowance.daily} /> : '₹— / day'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-[#FBF8F3] border border-[#E6DFD2] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                snapshot.allowance.status === 'overspent'
                  ? 'bg-[#B42318]'
                  : 'bg-[#16140F]'
              }`}
              style={{
                width: hasCycle
                  ? `${Math.min(
                      (snapshot.allowance.spentToday / Math.max(1, snapshot.allowance.daily)) * 100,
                      100
                    )}%`
                  : '0%',
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#5E5A52] font-medium">
            <span>
              Spent today: {hasCycle ? <Money amount={snapshot.allowance.spentToday} /> : '₹0'}
            </span>
            <span>
              {hasCycle ? `${snapshot.daysLeft} days remaining` : '30-day budget baseline'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 STAT TILES: WALLET, FORECAST, RISK, HEALTH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet */}
        <StatTile
          label="Liquid Wallet"
          value={hasCycle ? <Money amount={snapshot.wallet} size="2xl" /> : '₹10,000'}
          subtitle={
            hasCycle
              ? `₹${snapshot.savedInGoals.toLocaleString('en-IN')} locked in savings goals`
              : 'Initial challenge allocation'
          }
          icon={<Wallet className="w-4 h-4" />}
        />

        {/* Forecast End */}
        <StatTile
          label="Cycle End Forecast"
          value={hasCycle ? <Money amount={snapshot.forecast.endExpected} size="2xl" /> : '₹—'}
          subtitle={
            hasCycle
              ? `Pessimistic scenario: ₹${snapshot.forecast.endPessimistic.toLocaleString('en-IN')}`
              : 'Calculated once expenses and commitments are logged'
          }
          icon={<TrendingUp className="w-4 h-4" />}
        />

        {/* Risk Gauge */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-4 flex flex-col items-center justify-between">
          <Gauge
            value={hasCycle ? snapshot.risk.score : null}
            label="Risk Score"
            level={
              hasCycle
                ? snapshot.risk.level === 'low'
                  ? 'safe'
                  : snapshot.risk.level === 'moderate'
                  ? 'watch'
                  : snapshot.risk.level === 'high'
                  ? 'risk'
                  : 'critical'
                : 'neutral'
            }
            unit="/100"
          />
          <div className="text-center mt-2">
            <span className="text-[11px] text-[#5E5A52] block">
              {hasCycle ? snapshot.risk.drivers[0]?.label ?? 'No major risk factors' : 'Awaiting cycle setup'}
            </span>
          </div>
        </div>

        {/* Health Gauge */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-4 flex flex-col items-center justify-between">
          <Gauge
            value={hasCycle && snapshot.health.score !== null ? snapshot.health.score : null}
            label="Health Grade"
            level={
              hasCycle && snapshot.health.grade === 'strong'
                ? 'safe'
                : hasCycle && snapshot.health.grade === 'steady'
                ? 'watch'
                : 'neutral'
            }
            unit=" pts"
          />
          <div className="text-center mt-2">
            <span className="text-[11px] text-[#5E5A52] block">
              {hasCycle ? `Grade: ${snapshot.health.grade ?? 'Evaluating'}` : 'Requires active tracking'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
