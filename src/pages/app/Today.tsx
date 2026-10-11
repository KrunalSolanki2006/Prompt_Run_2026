import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { useToday } from '@/hooks/useToday'
import { generateOccurrences } from '@/engine/occurrences'
import { addDays, isAfter } from '@/engine/dates'
import { PageHeader } from '@/components/PageHeader'
import { Money } from '@/components/Money'
import { StatTile } from '@/components/StatTile'
import { Gauge } from '@/components/Gauge'
import { RiskBadge } from '@/components/RiskBadge'
import { RunwayChart } from '@/components/RunwayChart'
import { EmptyState } from '@/components/EmptyState'
import { CategoryIcon } from '@/components/CategoryIcon'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  Circle,
  ArrowRight,
  PiggyBank,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Check,
  Trophy,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatRupees } from '@/lib/format'
import type { CycleSummary } from '@/engine/types'

export const Today: React.FC = () => {
  useDocumentTitle('Today Cockpit')
  const navigate = useNavigate()
  const { state, snapshot, settleOccurrence, completeCycle } = useFinance()
  const today = useToday()
  const [completionModalOpen, setCompletionModalOpen] = useState(false)

  const hasCycle = state.cycle !== null
  const cycleEnd = snapshot.cycleEnd

  // Next 7 days occurrences plus overdue items
  const upcomingOccurrences = useMemo(() => {
    if (!state.cycle) return []
    const all = generateOccurrences(
      state.incomes,
      state.commitments,
      state.subscriptions,
      state.cycle.startDate,
      cycleEnd,
      today,
      state.transactions
    )

    const sevenDaysOut = addDays(today, 7)
    return all.filter((o) => {
      if (o.settled) return false
      // Include overdue items or items within the next 7 days
      return o.overdue || o.late || (!isAfter(o.date, sevenDaysOut) && !o.settled)
    })
  }, [state, cycleEnd, today])

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...state.transactions].slice(0, 5)
  }, [state.transactions])

  // Final metrics for cycle completion
  const finalSpent = useMemo(() => {
    return state.transactions
      .filter((t) => t.kind === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [state.transactions])
  const finalSaved = useMemo(() => {
    return state.transactions
      .filter((t) => t.kind === 'goal_deposit')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [state.transactions])

  const finalStatus: 'surplus' | 'balanced' | 'deficit' = useMemo(() => {
    if (snapshot.wallet > 0 && snapshot.buffer.remaining >= snapshot.buffer.target) {
      return 'surplus'
    }
    if (snapshot.wallet < 0 || snapshot.buffer.remaining < snapshot.buffer.target) {
      return 'deficit'
    }
    return 'balanced'
  }, [snapshot.wallet, snapshot.buffer])

  const handleStartNextCycle = () => {
    if (!state.cycle) return
    const summary: CycleSummary = {
      cycleId: state.cycle.id,
      startDate: state.cycle.startDate,
      endDate: snapshot.cycleEnd,
      totalSpent: finalSpent,
      totalSaved: finalSaved,
      finalStatus,
    }
    const nextStart = addDays(snapshot.cycleEnd, 1)
    completeCycle(summary, nextStart)
    setCompletionModalOpen(false)
    navigate('/app/setup')
  }

  // Priority-based Alert Banner
  const alertBanner = useMemo(() => {
    if (!hasCycle) {
      return {
        type: 'info' as const,
        icon: <Sparkles className="w-4 h-4 text-[#D4F23A]" />,
        title: 'Welcome to RUNWAY! Initialize your ₹10,000 cycle',
        description: 'Configure your cycle start date and buffer cushion to calculate your exact daily allowance.',
        action: <Link to="/app/setup">Initialize Now</Link>,
      }
    }

    // 0. Cycle completed
    if (snapshot.cyclePhase === 'completed') {
      return {
        type: 'info' as const,
        icon: <Trophy className="w-4 h-4 text-[#D4F23A]" />,
        title: '30-Day Cycle Completed!',
        description: `Your 30-day runway period is complete (${finalStatus} finish). Review your performance and archive to launch your next cycle.`,
        action: (
          <button
            type="button"
            onClick={() => setCompletionModalOpen(true)}
            className="text-xs font-bold text-[#16140F] hover:underline"
          >
            Review & Start Next
          </button>
        ),
      }
    }

    // 1. Cash-out threat
    if (snapshot.forecast.cashOutDate) {
      return {
        type: 'critical' as const,
        icon: <AlertOctagon className="w-4 h-4 text-[#B42318]" />,
        title: `Projected Cash Deficit on ${snapshot.forecast.cashOutDate}`,
        description: 'Discretionary run rate and upcoming commitments will exhaust liquid funds before cycle end.',
        action: <Link to="/app/lab">Simulate Fixes in Lab</Link>,
      }
    }

    // 2. Overdue obligations
    if (snapshot.upcoming.overdueCount > 0) {
      return {
        type: 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4 text-[#C2410C]" />,
        title: `${snapshot.upcoming.overdueCount} Overdue Commitment${snapshot.upcoming.overdueCount > 1 ? 's' : ''}`,
        description: 'Unpaid bills or commitments dated before today require immediate settlement.',
        action: <Link to="/app/plan?tab=commitments">Review Overdue</Link>,
      }
    }

    // 3. Late income
    if (snapshot.upcoming.lateIncomeCount > 0) {
      return {
        type: 'warning' as const,
        icon: <Clock className="w-4 h-4 text-[#A15C07]" />,
        title: 'Scheduled Income Pending Verification',
        description: 'Expected income dated before today has not been marked received and is excluded from cash.',
        action: <Link to="/app/plan?tab=income">Verify Inflow</Link>,
      }
    }

    // 4. Low buffer (<= 25%)
    if (
      snapshot.buffer.target > 0 &&
      snapshot.buffer.remaining <= snapshot.buffer.target * 0.25
    ) {
      return {
        type: 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4 text-[#A15C07]" />,
        title: 'Safety Cushion Critically Low',
        description: `Only ₹${snapshot.buffer.remaining.toLocaleString('en-IN')} remaining of ₹${snapshot.buffer.target.toLocaleString('en-IN')} emergency reserve.`,
        action: <Link to="/app/plan">Adjust Moat</Link>,
      }
    }

    // 5. Overspent today
    if (snapshot.allowance.status === 'overspent') {
      return {
        type: 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4 text-[#A15C07]" />,
        title: 'Daily Allowance Exceeded for Today',
        description: `Overspent by ₹${Math.abs(snapshot.allowance.leftToday).toLocaleString('en-IN')}. Tomorrow's allowance will automatically re-calibrate.`,
        action: <Link to="/app/insights">View Pacing</Link>,
      }
    }

    // 6. Goal unfunded
    if (snapshot.goals.some((g) => g.status === 'unfunded')) {
      return {
        type: 'info' as const,
        icon: <PiggyBank className="w-4 h-4 text-[#16140F]" />,
        title: 'Savings Goal Unfunded this Cycle',
        description: 'Liquid cash was fully absorbed by commitments and buffer before reaching lower-priority goals.',
        action: <Link to="/app/plan?tab=goals">Manage Goals</Link>,
      }
    }

    return null
  }, [hasCycle, snapshot, finalStatus])

  // Dynamic Onboarding Checklist
  const checklistItems = [
    { id: 'cycle', label: 'Initialize 30-Day Cycle (₹10,000)', to: '/app/setup', done: hasCycle },
    { id: 'income', label: 'Log confirmed income streams', to: '/app/plan?tab=income', done: state.incomes.length > 0 },
    { id: 'commitments', label: 'Add fixed commitments & EMIs', to: '/app/plan?tab=commitments', done: state.commitments.length > 0 },
    { id: 'subscriptions', label: 'List recurring subscriptions', to: '/app/plan?tab=subscriptions', done: state.subscriptions.length > 0 },
    { id: 'goals', label: 'Define priority savings goals', to: '/app/plan?tab=goals', done: state.goals.length > 0 },
    { id: 'lab', label: 'Simulate your first decision in the Lab', to: '/app/lab', done: state.decisions.length > 0 },
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

      {/* PRIORITY ALERT BANNER */}
      {alertBanner && (
        <div
          className={`rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
            alertBanner.type === 'critical'
              ? 'bg-[#B42318]/10 border-[#B42318]/30 text-[#B42318]'
              : alertBanner.type === 'warning'
              ? 'bg-[#A15C07]/10 border-[#A15C07]/30 text-[#A15C07]'
              : 'bg-[#D4F23A]/20 border-[#16140F]/15 text-[#16140F]'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#16140F] text-[#FBF8F3] flex items-center justify-center shrink-0">
              {alertBanner.icon}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#16140F]">
                {alertBanner.title}
              </h2>
              <p className="text-xs text-[#5E5A52]">
                {alertBanner.description}
              </p>
            </div>
          </div>
          <Button asChild className="h-8 bg-[#16140F] text-[#FBF8F3] text-xs font-bold shrink-0">
            {alertBanner.action}
          </Button>
        </div>
      )}

      {/* CYCLE COMPLETED CELEBRATORY CARD */}
      {hasCycle && snapshot.cyclePhase === 'completed' && (
        <div className="bg-white border-2 border-[#16140F] rounded-[18px] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6DFD2]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#16140F] text-[#D4F23A] flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F]">
                  30-Day Cycle Completed
                </h2>
                <p className="text-xs text-[#5E5A52]">
                  Period: {state.cycle?.startDate} to {snapshot.cycleEnd} (Day 30 of 30)
                </p>
              </div>
            </div>
            <div>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  finalStatus === 'surplus'
                    ? 'bg-[#1D7A53]/15 text-[#1D7A53]'
                    : finalStatus === 'balanced'
                    ? 'bg-[#D4F23A] text-[#16140F]'
                    : 'bg-[#B42318]/15 text-[#B42318]'
                }`}
              >
                {finalStatus === 'surplus'
                  ? 'Finished in Surplus'
                  : finalStatus === 'balanced'
                  ? 'Balanced Landing'
                  : 'Deficit Exhausted'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2]">
              <span className="text-[11px] font-semibold text-[#5E5A52] uppercase tracking-wider block">
                Final Liquid Wallet
              </span>
              <span className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] tabular-nums">
                <Money amount={snapshot.wallet} />
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2]">
              <span className="text-[11px] font-semibold text-[#5E5A52] uppercase tracking-wider block">
                Total Saved in Goals
              </span>
              <span className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#1D7A53] tabular-nums">
                <Money amount={finalSaved} />
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2]">
              <span className="text-[11px] font-semibold text-[#5E5A52] uppercase tracking-wider block">
                Total Cycle Outflow
              </span>
              <span className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] tabular-nums">
                <Money amount={finalSpent} />
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-[#5E5A52]">
              Archiving will save this cycle record to history, lock goal savings, advance recurring bills, and prepare your next 30-day runway.
            </p>
            <Button
              onClick={() => setCompletionModalOpen(true)}
              className="h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl px-5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#D4F23A]" />
              <span>Archive & Start Next Cycle</span>
            </Button>
          </div>
        </div>
      )}

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

      {/* 30-DAY RUNWAY TRAJECTORY CHART */}
      <RunwayChart
        points={hasCycle ? snapshot.forecast.points : []}
        title="30-Day Runway Trajectory"
      />

      {/* TWO COLUMNS: COMING UP & SAVINGS GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coming Up List with Direct Settlement Buttons */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
                Coming Up
              </h3>
              <p className="text-xs text-[#5E5A52]">Next 7 days & overdue obligations</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
              <Link to="/app/plan">Manage Plan</Link>
            </Button>
          </div>

          {upcomingOccurrences.length === 0 ? (
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
          ) : (
            <div className="space-y-2.5">
              {upcomingOccurrences.map((occ) => (
                <div
                  key={occ.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    occ.overdue || occ.late
                      ? 'bg-[#B42318]/5 border-[#B42318]/30'
                      : 'bg-[#FBF8F3] border-[#E6DFD2]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={occ.category ?? 'bills'} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#16140F] truncate">
                          {occ.label}
                        </span>
                        {occ.overdue && (
                          <span className="text-[10px] font-bold text-[#B42318] bg-[#B42318]/10 px-1.5 py-0.2 rounded">
                            Overdue
                          </span>
                        )}
                        {occ.late && (
                          <span className="text-[10px] font-bold text-[#A15C07] bg-[#A15C07]/10 px-1.5 py-0.2 rounded">
                            Late
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#5E5A52] block">
                        Due: {occ.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-['Bricolage_Grotesque_Variable'] font-bold text-xs tabular-nums text-[#16140F]">
                      <Money amount={occ.amount} />
                    </span>
                    <Button
                      size="sm"
                      onClick={() => settleOccurrence(occ)}
                      className="h-7 px-2.5 text-[11px] font-semibold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/85 rounded-lg"
                    >
                      <Check className="w-3 h-3 mr-1 text-[#D4F23A]" />
                      <span>{occ.type === 'income' ? 'Mark Received' : 'Mark Paid'}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

          {snapshot.goals.length === 0 ? (
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
          ) : (
            <div className="space-y-3">
              {snapshot.goals.map((gProj) => {
                const goalDef = state.goals.find((g) => g.id === gProj.goalId)
                const pct = Math.min(
                  100,
                  Math.round((gProj.saved / Math.max(1, gProj.target)) * 100)
                )

                return (
                  <div
                    key={gProj.goalId}
                    className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-2"
                  >
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-bold text-[#16140F] block">
                          {goalDef?.name ?? 'Goal'}
                        </span>
                        <span className="text-[11px] text-[#5E5A52]">
                          Saved ₹{gProj.saved.toLocaleString('en-IN')} of ₹{gProj.target.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#16140F] tabular-nums">
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 w-full bg-white border border-[#E6DFD2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#16140F] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-[#5E5A52]">
                      <span>Cycle plan: ₹{goalDef?.cycleContribution.toLocaleString('en-IN') ?? 0}</span>
                      <span className="font-semibold text-[#16140F]">
                        Status: {gProj.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY (LAST 5 TRANSACTIONS) */}
      <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
              Recent Activity
            </h3>
            <p className="text-xs text-[#5E5A52]">Latest transactions logged in this cycle</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
            <Link to="/app/activity">View All Activity</Link>
          </Button>
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyState
            title="No activity recorded yet"
            description="Use 'Add Transaction' to log expenses, income, or savings deposits."
            receiptBorder={false}
          />
        ) : (
          <div className="divide-y divide-[#E6DFD2]">
            {recentTransactions.map((t) => (
              <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={t.category} size="sm" />
                  <div>
                    <span className="text-xs font-bold text-[#16140F] block">
                      {t.note || t.category}
                    </span>
                    <span className="text-[11px] text-[#5E5A52]">
                      {t.date} · {t.tag.toUpperCase()}
                      {t.unexpected ? ' · Unexpected' : ''}
                    </span>
                  </div>
                </div>

                <div className="font-['Bricolage_Grotesque_Variable'] font-bold text-sm tabular-nums">
                  <span
                    className={
                      t.kind === 'income'
                        ? 'text-[#1D7A53]'
                        : t.kind === 'goal_deposit'
                        ? 'text-[#16140F]'
                        : 'text-[#16140F]'
                    }
                  >
                    {t.kind === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ONBOARDING CHECKLIST */}
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

      {/* CYCLE COMPLETION MODAL */}
      <Dialog open={completionModalOpen} onOpenChange={setCompletionModalOpen}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[18px] p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-[#A15C07]" />
              <DialogTitle className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F]">
                Archive 30-Day Cycle
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Verify your final metrics before closing this cycle and starting your next 30-day runway.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5E5A52]">Cycle Duration:</span>
                <span className="font-semibold text-[#16140F]">
                  {state.cycle?.startDate} → {snapshot.cycleEnd} (30 days)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5A52]">Starting Budget:</span>
                <span className="font-semibold text-[#16140F]">
                  {formatRupees(state.cycle?.startingBalance ?? 10000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5A52]">Total Spent:</span>
                <span className="font-semibold text-[#16140F]">
                  {formatRupees(finalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5E5A52]">Saved in Goals:</span>
                <span className="font-bold text-[#1D7A53]">
                  {formatRupees(finalSaved)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E6DFD2] pt-2">
                <span className="font-semibold text-[#16140F]">Final Status:</span>
                <span className="font-bold uppercase tracking-wider text-xs">
                  {finalStatus}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#5E5A52] space-y-1">
              <p className="font-semibold text-[#16140F]">What happens when you roll over?</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Cycle summary is archived permanently to your cycle history.</li>
                <li>Goal deposits are locked into each goal's starting principal.</li>
                <li>Recurring subscriptions & commitments advance into the next cycle.</li>
                <li>Discretionary transaction log resets for fresh daily allowance pacing.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setCompletionModalOpen(false)}
              className="h-9 border-[#E6DFD2] text-xs font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartNextCycle}
              className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
            >
              Start Next Cycle
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#D4F23A]" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default Today
