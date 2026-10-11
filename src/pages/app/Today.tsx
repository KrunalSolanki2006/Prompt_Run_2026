import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { useToday } from '@/hooks/useToday'
import { generateOccurrences } from '@/engine/occurrences'
import { addDays, isAfter } from '@/engine/dates'
import { PageHeader } from '@/components/PageHeader'
import { Money } from '@/components/Money'
import { RiskBadge } from '@/components/RiskBadge'
import { RunwayChart } from '@/components/RunwayChart'
import { CockpitStats } from './today/CockpitStats'
import { UpcomingBillsCard } from './today/UpcomingBillsCard'
import { SavingsGoalsMiniCard } from './today/SavingsGoalsMiniCard'
import { RecentActivityCard } from './today/RecentActivityCard'
import { CycleChecklistCard } from './today/CycleChecklistCard'
import { CycleCompletionModal } from './today/CycleCompletionModal'
import {
  ArrowRight,
  PiggyBank,
  Clock,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Trophy,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

    if (snapshot.forecast.cashOutDate) {
      return {
        type: 'critical' as const,
        icon: <AlertOctagon className="w-4 h-4 text-[#B42318]" />,
        title: `Projected Cash Deficit on ${snapshot.forecast.cashOutDate}`,
        description: 'Discretionary run rate and upcoming commitments will exhaust liquid funds before cycle end.',
        action: <Link to="/app/lab">Simulate Fixes in Lab</Link>,
      }
    }

    if (snapshot.upcoming.overdueCount > 0) {
      return {
        type: 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4 text-[#C2410C]" />,
        title: `${snapshot.upcoming.overdueCount} Overdue Commitment${snapshot.upcoming.overdueCount > 1 ? 's' : ''}`,
        description: 'Unpaid bills or commitments dated before today require immediate settlement.',
        action: <Link to="/app/plan?tab=commitments">Review Overdue</Link>,
      }
    }

    if (snapshot.upcoming.lateIncomeCount > 0) {
      return {
        type: 'warning' as const,
        icon: <Clock className="w-4 h-4 text-[#A15C07]" />,
        title: 'Scheduled Income Pending Verification',
        description: 'Expected income dated before today has not been marked received and is excluded from cash.',
        action: <Link to="/app/plan?tab=income">Verify Inflow</Link>,
      }
    }

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

    if (snapshot.allowance.status === 'overspent') {
      return {
        type: 'warning' as const,
        icon: <AlertTriangle className="w-4 h-4 text-[#A15C07]" />,
        title: 'Daily Allowance Exceeded for Today',
        description: `Overspent by ₹${Math.abs(snapshot.allowance.leftToday).toLocaleString('en-IN')}. Tomorrow's allowance will automatically re-calibrate.`,
        action: <Link to="/app/insights">View Pacing</Link>,
      }
    }

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

      {/* COCKPIT STATS: ALLOWANCE HERO + 4 TILES */}
      <CockpitStats hasCycle={hasCycle} snapshot={snapshot} />

      {/* 30-DAY RUNWAY TRAJECTORY CHART */}
      <RunwayChart
        points={hasCycle ? snapshot.forecast.points : []}
        title="30-Day Runway Trajectory"
      />

      {/* TWO COLUMNS: COMING UP & SAVINGS GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingBillsCard
          occurrences={upcomingOccurrences}
          onSettle={settleOccurrence}
        />
        <SavingsGoalsMiniCard
          goals={state.goals}
          goalProjections={snapshot.goals}
        />
      </div>

      {/* RECENT ACTIVITY (LAST 5 TRANSACTIONS) */}
      <RecentActivityCard transactions={recentTransactions} />

      {/* ONBOARDING CHECKLIST */}
      <CycleChecklistCard items={checklistItems} />

      {/* CYCLE COMPLETION MODAL */}
      <CycleCompletionModal
        open={completionModalOpen}
        onOpenChange={setCompletionModalOpen}
        state={state}
        snapshot={snapshot}
        finalSpent={finalSpent}
        finalSaved={finalSaved}
        finalStatus={finalStatus}
        onConfirm={handleStartNextCycle}
      />
    </div>
  )
}

export default Today
