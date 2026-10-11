import React, { useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { PageHeader } from '@/components/PageHeader'
import { RunwayChart } from '@/components/RunwayChart'
import { DailySpendChart, type DailySpendPoint } from '@/components/DailySpendChart'
import { EmptyState } from '@/components/EmptyState'
import { CategoryIcon } from '@/components/CategoryIcon'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { RISK_THRESHOLDS, HEALTH_WEIGHTS } from '@/engine/constants'
import { formatRupees } from '@/lib/format'
import { addDays, isBefore } from '@/engine/dates'
import { computeSnapshot } from '@/engine/engine'
import type { CategoryId } from '@/engine/types'
import {
  TrendingUp,
  ShieldAlert,
  HeartPulse,
  PieChart,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react'

export const Insights: React.FC = () => {
  useDocumentTitle('Financial Insights')
  const { state, snapshot } = useFinance()

  const hasCycle = state.cycle !== null

  // Category spending aggregation & Need vs Want
  const { categorySpend, needTotal, wantTotal, totalExpense } = useMemo(() => {
    const map = new Map<string, number>()
    let need = 0
    let want = 0
    let total = 0

    for (const t of state.transactions) {
      if (t.kind === 'expense') {
        total += t.amount
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
        if (t.tag === 'need') {
          need += t.amount
        } else {
          want += t.amount
        }
      }
    }

    const sorted = Array.from(map.entries())
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        percent: total > 0 ? Math.round((amt / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    return {
      categorySpend: sorted,
      needTotal: need,
      wantTotal: want,
      totalExpense: total,
    }
  }, [state.transactions])

  // Daily spend vs allowance data for completed days
  const dailySpendData = useMemo(() => {
    if (!state.cycle || snapshot.dayNumber <= 1) return []

    const points: DailySpendPoint[] = []
    const completedDays = snapshot.dayNumber - 1

    for (let i = 0; i < completedDays; i++) {
      const d = addDays(state.cycle.startDate, i)
      let daySpend = 0
      for (const t of state.transactions) {
        if (t.date === d && t.kind === 'expense' && !t.unexpected && !t.link) {
          daySpend += t.amount
        }
      }

      // Compute allowed for that day by simulating state prior to d
      const subState = {
        ...state,
        transactions: state.transactions.filter((t) => isBefore(t.date, d)),
      }
      const daySnap = computeSnapshot(subState, d)

      points.push({
        date: d,
        spent: daySpend,
        allowance: daySnap.allowance.daily,
      })
    }

    return points
  }, [state, snapshot.dayNumber])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cockpit Analytics & Risk Breakdown"
        subtitle="Transparent diagnostic overview of your 30-day runway, risk vulnerabilities, and health component drivers."
      />

      {/* DISCLAIMER CALLOUT */}
      <div
        className="rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] p-3.5 flex items-start gap-3 text-xs text-[#5E5A52]"
        role="note"
      >
        <Info className="w-4 h-4 text-[#16140F] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#16140F]">Educational Heuristics:</strong> RUNWAY risk and health scores are rule-based mathematical calculations designed to inform personal cash-flow pacing. They do not constitute certified financial advice.
        </p>
      </div>

      {/* SECTION 1: RUNWAY FORECAST */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F]">
            30-Day Cash Trajectory & Cash-Out Forecast
          </h2>
        </div>
        <RunwayChart
          points={hasCycle ? snapshot.forecast.points : []}
          title="Expected vs. Pessimistic Runway Trajectory"
        />
      </section>

      {/* SECTION 2 & 3: RISK DRIVERS & HEALTH BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Drivers */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#C2410C]" />
              <h3 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
                Active Risk Drivers
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52]">
              Score: {snapshot.risk.score}/100 ({snapshot.risk.level})
            </span>
          </div>

          {snapshot.risk.drivers.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="w-5 h-5 text-[#5E5A52]" />}
              title="No risk drivers detected"
              description="As transactions and obligations are logged, drivers appear here with explainable causes and action recommendations."
              receiptBorder={false}
            />
          ) : (
            <div className="space-y-3">
              {snapshot.risk.drivers.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#16140F]">{d.label}</span>
                    <span className="font-semibold text-[#C2410C]">
                      +{d.impact} pts risk
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5E5A52] leading-relaxed">
                    {d.detail}
                  </p>
                  {d.action && (
                    <div className="pt-1 border-t border-[#E6DFD2] flex items-center gap-1.5 text-[11px] font-semibold text-[#16140F]">
                      <ArrowRight className="w-3 h-3 text-[#D4F23A] bg-[#16140F] rounded-full p-0.5" />
                      <span>Action: {d.action}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Breakdown */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#1D7A53]" />
              <h3 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
                Health Score Components
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FBF8F3] border border-[#E6DFD2] text-[#5E5A52]">
              {snapshot.health.score !== null
                ? `${snapshot.health.score} pts (${snapshot.health.grade})`
                : 'Evaluating'}
            </span>
          </div>

          <div className="space-y-2.5">
            {snapshot.health.components.map((comp) => (
              <div
                key={comp.id}
                className="p-2.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] flex flex-col justify-between text-xs"
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-[#16140F]">{comp.label}</span>
                  <span className="font-semibold text-[#5E5A52]">
                    {comp.weight}% Weight
                  </span>
                </div>
                <p className="text-[11px] text-[#5E5A52]">{comp.detail}</p>
                <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-[#16140F]">
                  <span>Status:</span>
                  <span className="tabular-nums">
                    {comp.score !== null ? `${comp.score} / 100` : '— (Pending)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4 & 5: SPENDING BY CATEGORY & DAILY SPEND CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending By Category & Needs vs Wants */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#16140F]" />
              <h3 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
                Spending Breakdown
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#5E5A52]">
              Total: {formatRupees(totalExpense)}
            </span>
          </div>

          {totalExpense === 0 ? (
            <EmptyState
              icon={<PieChart className="w-5 h-5 text-[#5E5A52]" />}
              title="No spending to categorize"
              description="Breakdown appears once discretionary expenses or fixed commitments are recorded."
              receiptBorder={false}
            />
          ) : (
            <div className="space-y-4">
              {/* Needs vs Wants ratio bar */}
              <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#16140F]">
                    Needs: {formatRupees(needTotal)} (
                    {Math.round((needTotal / totalExpense) * 100)}%)
                  </span>
                  <span className="text-[#5E5A52]">
                    Wants: {formatRupees(wantTotal)} (
                    {Math.round((wantTotal / totalExpense) * 100)}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-[#E6DFD2] rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#16140F]"
                    style={{ width: `${(needTotal / totalExpense) * 100}%` }}
                  />
                  <div
                    className="h-full bg-[#D4F23A]"
                    style={{ width: `${(wantTotal / totalExpense) * 100}%` }}
                  />
                </div>
              </div>

              {/* Categorical list */}
              <div className="space-y-2">
                {categorySpend.map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#FBF8F3] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={c.category as CategoryId} size="sm" />
                      <span className="font-semibold capitalize text-[#16140F]">
                        {c.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5E5A52] text-[11px]">{c.percent}%</span>
                      <span className="font-bold text-[#16140F] tabular-nums">
                        {formatRupees(c.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Spend vs Allowance */}
        <DailySpendChart
          data={dailySpendData}
          title="Daily Spend vs Daily Allowance"
        />
      </div>

      {/* SECTION 6: HOW SCORES WORK (ACCORDION CODIFIED FROM CONSTANTS) */}
      <section className="bg-white border border-[#E6DFD2] rounded-[18px] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F]">
            How Scores & Calculations Work
          </h2>
        </div>
        <p className="text-xs text-[#5E5A52] mb-6">
          RUNWAY uses zero black-box AI models for financial metrics. All evaluations are deterministic, explainable, and codified directly from <code className="font-mono text-[#16140F]">engine/constants.ts</code>.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {/* Risk Model */}
          <AccordionItem value="risk-model" className="border-[#E6DFD2]">
            <AccordionTrigger className="text-sm font-bold text-[#16140F] hover:no-underline">
              Risk Score Thresholds & Level Classification
            </AccordionTrigger>
            <AccordionContent className="text-xs text-[#5E5A52] space-y-3 pt-2">
              <p>Risk is evaluated on a 0 (safest) to 100 (critical) scale categorized into 4 tiers:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.entries(RISK_THRESHOLDS) as Array<[string, (typeof RISK_THRESHOLDS)['low']]>).map(
                  ([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#16140F] uppercase">{val.label}</span>
                        <span className="font-semibold text-xs text-[#5E5A52]">Score ≤ {val.maxScore}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{val.description}</p>
                    </div>
                  )
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Daily Allowance Equation */}
          <AccordionItem value="allowance-math" className="border-[#E6DFD2]">
            <AccordionTrigger className="text-sm font-bold text-[#16140F] hover:no-underline">
              Priority Waterfall & Daily Allowance Equation
            </AccordionTrigger>
            <AccordionContent className="text-xs text-[#5E5A52] space-y-3 pt-2 leading-relaxed">
              <p>
                RUNWAY evaluates available funds through a strict priority waterfall:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Obligations First:</strong> Upcoming fixed commitments and subscriptions are funded before any discretionary spending.</li>
                <li><strong>Emergency Cushion:</strong> Safety buffer percentage is ringfenced against surprise outlays.</li>
                <li><strong>Priority Goals:</strong> Target contributions to savings goals are reserved in order of priority (P1 first).</li>
                <li><strong>Discretionary Pool:</strong> The remaining funds are divided across remaining cycle days.</li>
              </ol>
              <div className="p-3 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] font-mono text-xs text-[#16140F]">
                Start of Day Allowance = ⌊ (Discretionary Pool + Spend Today) ÷ Days Left ⌋
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Health Score Weights */}
          <AccordionItem value="health-weights" className="border-[#E6DFD2]">
            <AccordionTrigger className="text-sm font-bold text-[#16140F] hover:no-underline">
              Financial Health Multi-Factor Grading
            </AccordionTrigger>
            <AccordionContent className="text-xs text-[#5E5A52] space-y-2 pt-2 leading-relaxed">
              <p>Health score is a composite index computed from 6 weighted pillars:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Budget Adherence ({HEALTH_WEIGHTS.budgetAdherence}%):</strong> Consistency staying within daily discretionary allowance.</li>
                <li><strong>Trajectory Outlook ({HEALTH_WEIGHTS.outlook}%):</strong> Inverse of financial risk based on cash runway forecast.</li>
                <li><strong>Buffer Protection ({HEALTH_WEIGHTS.bufferProtection}%):</strong> Evaluates whether your reserve cushion is intact or depleted.</li>
                <li><strong>Savings Goal Pacing ({HEALTH_WEIGHTS.goalProgress}%):</strong> Measures whether planned cycle contributions to goals remain feasible.</li>
                <li><strong>Bills Paid on Time ({HEALTH_WEIGHTS.billsOnTime}%):</strong> Verifies that scheduled fixed commitments are settled promptly.</li>
                <li><strong>Subscription Load ({HEALTH_WEIGHTS.subscriptionLoad}%):</strong> Proportion of initial budget consumed by recurring digital services.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
export default Insights
