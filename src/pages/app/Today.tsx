import React, { useState } from 'react'
import { Link } from 'react-router'
import type { Snapshot } from '@/engine/types'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { Money } from '@/components/Money'
import { StatTile } from '@/components/StatTile'
import { Gauge } from '@/components/Gauge'
import { RiskBadge } from '@/components/RiskBadge'
import { RunwayChart } from '@/components/RunwayChart'
import { EmptyState } from '@/components/EmptyState'
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  PiggyBank,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TodayProps {
  snapshot?: Snapshot | null
}

export const Today: React.FC<TodayProps> = ({ snapshot = null }) => {
  useDocumentTitle('Today Cockpit')
  const [completedSteps] = useState<string[]>([])

  // If no cycle snapshot exists yet, render setup banner and onboarding checklist
  const hasCycle = snapshot !== null

  const checklistItems = [
    { id: 'cycle', label: 'Initialize 30-Day Cycle (₹10,000)', to: '/app/setup', done: hasCycle },
    { id: 'income', label: 'Log confirmed income streams', to: '/app/plan?tab=income', done: completedSteps.includes('income') },
    { id: 'commitments', label: 'Add fixed commitments & EMIs', to: '/app/plan?tab=commitments', done: completedSteps.includes('commitments') },
    { id: 'subscriptions', label: 'List recurring subscriptions', to: '/app/plan?tab=subscriptions', done: completedSteps.includes('subscriptions') },
    { id: 'goals', label: 'Define priority savings goals', to: '/app/plan?tab=goals', done: completedSteps.includes('goals') },
    { id: 'lab', label: 'Simulate your first decision in the Lab', to: '/app/lab', done: completedSteps.includes('lab') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Cockpit"
        subtitle={
          hasCycle
            ? `Day ${snapshot.dayNumber} of 30 · ${snapshot.daysLeft} days remaining in cycle`
            : 'Track your daily allowance, upcoming commitments, and 30-day runway trajectory.'
        }
        badge={
          hasCycle ? (
            <RiskBadge level={snapshot.risk.level} score={snapshot.risk.score} />
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6DFD2] text-[#5E5A52]">
              Cycle Not Started
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            {!hasCycle && (
              <Button asChild className="h-9 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg">
                <Link to="/app/setup">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-[#D4F23A]" />
                  <span>Start ₹10,000 Cycle</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="h-9 border-[#E6DFD2] text-xs font-semibold rounded-lg">
              <Link to="/app/lab">
                <span>Open Decision Lab</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* ALERT BANNER SLOT */}
      {!hasCycle && (
        <div
          className="rounded-[14px] bg-[#D4F23A]/15 border border-[#16140F]/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#16140F] text-[#D4F23A] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#16140F]">
                Welcome to RUNWAY! Initialize your ₹10,000 cycle
              </h2>
              <p className="text-xs text-[#5E5A52]">
                Configure your cycle start date and buffer cushion to calculate your exact daily allowance.
              </p>
            </div>
          </div>
          <Button asChild className="h-8 bg-[#16140F] text-[#FBF8F3] text-xs font-bold shrink-0">
            <Link to="/app/setup">Initialize Now</Link>
          </Button>
        </div>
      )}

      {/* ALLOWANCE HERO */}
      <div className="bg-white border border-[#E6DFD2] rounded-[18px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-1">
              Discretionary Pacing
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-4xl sm:text-5xl font-extrabold text-[#16140F] tabular-nums">
                {hasCycle ? <Money amount={snapshot.allowance.leftToday} size="3xl" /> : '₹—'}
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
              className="h-full bg-[#16140F] rounded-full transition-all duration-300"
              style={{
                width: hasCycle
                  ? `${Math.min(
                      (snapshot.allowance.spentToday / (snapshot.allowance.daily || 1)) * 100,
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

      {/* 30-DAY RUNWAY TRAJECTORY CHART */}
      <RunwayChart
        points={hasCycle ? snapshot.forecast.points : []}
        title="30-Day Runway Trajectory"
      />

      {/* TWO COLUMNS: COMING UP & GOALS PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coming Up List */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
                Coming Up
              </h3>
              <p className="text-xs text-[#5E5A52]">Upcoming obligations and scheduled incomes</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
              <Link to="/app/plan">Manage Plan</Link>
            </Button>
          </div>

          <EmptyState
            icon={<Clock className="w-5 h-5" />}
            title="No upcoming obligations"
            description="Add fixed bills, EMIs, or subscriptions in your Plan to see upcoming due dates."
            receiptBorder={false}
            action={
              <Button asChild size="sm" variant="outline" className="h-8 text-xs border-[#E6DFD2]">
                <Link to="/app/plan?tab=commitments">Add Commitment</Link>
              </Button>
            }
          />
        </div>

        {/* Savings Goals Mini-Progress */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
                Savings Goals
              </h3>
              <p className="text-xs text-[#5E5A52]">Ringfenced funds towards targets</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
              <Link to="/app/plan?tab=goals">View Goals</Link>
            </Button>
          </div>

          <EmptyState
            icon={<PiggyBank className="w-5 h-5" />}
            title="No savings goals created"
            description="Set a goal (e.g. emergency moat, certification) to reserve cycle contributions."
            receiptBorder={false}
            action={
              <Button asChild size="sm" variant="outline" className="h-8 text-xs border-[#E6DFD2]">
                <Link to="/app/plan?tab=goals">Create First Goal</Link>
              </Button>
            }
          />
        </div>
      </div>

      {/* SETUP ONBOARDING CHECKLIST */}
      <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-6">
        <div className="mb-4">
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-lg text-[#16140F]">
            Cycle Onboarding Checklist
          </h3>
          <p className="text-xs text-[#5E5A52]">
            Complete these steps to unlock high-fidelity forecasting and accurate risk analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="flex items-center justify-between p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] hover:border-[#16140F] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1D7A53] shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[#5E5A52] shrink-0" />
                )}
                <span className="text-xs font-semibold text-[#16140F] group-hover:underline">
                  {item.label}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#5E5A52] group-hover:text-[#16140F] shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Today
