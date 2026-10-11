import React from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { RunwayChart } from '@/components/RunwayChart'
import { DailySpendChart } from '@/components/DailySpendChart'
import { EmptyState } from '@/components/EmptyState'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { RISK_THRESHOLDS, HEALTH_WEIGHTS } from '@/engine/constants'
import {
  TrendingUp,
  ShieldAlert,
  HeartPulse,
  PieChart,
  HelpCircle,
  AlertCircle,
} from 'lucide-react'

export const Insights: React.FC = () => {
  useDocumentTitle('Financial Insights')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cockpit Analytics & Risk Breakdown"
        subtitle="Transparent diagnostic overview of your 30-day runway, risk vulnerabilities, and health component drivers."
      />

      {/* SECTION 1: RUNWAY FORECAST */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F]">
            30-Day Cash Trajectory & Cash-Out Forecast
          </h2>
        </div>
        <RunwayChart points={[]} title="Expected vs. Stress Test Cash Flow" />
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
              4-Tier Heuristic
            </span>
          </div>

          <EmptyState
            icon={<AlertCircle className="w-5 h-5 text-[#5E5A52]" />}
            title="No risk drivers detected"
            description="As transactions and obligations are logged, drivers (e.g. high burn rate, obligation burden, depleted buffer) appear here with suggested actions."
            receiptBorder={false}
          />
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
              Weighted 0–100
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                label: 'Runway Buffer Security',
                weight: HEALTH_WEIGHTS.runwayBuffer * 100,
                desc: 'Coverage of safety moat against surprise outlays',
              },
              {
                label: 'Obligation Coverage',
                weight: HEALTH_WEIGHTS.obligationCoverage * 100,
                desc: 'Cash set aside for fixed bills and scheduled EMIs',
              },
              {
                label: 'Savings Goal Progress',
                weight: HEALTH_WEIGHTS.savingsProgress * 100,
                desc: 'Feasibility of funding cycle contributions',
              },
              {
                label: 'Spending Discipline',
                weight: HEALTH_WEIGHTS.spendDiscipline * 100,
                desc: 'Adherence to the daily allowance threshold',
              },
            ].map((comp) => (
              <div
                key={comp.label}
                className="p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] flex flex-col justify-between text-xs"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[#16140F]">{comp.label}</span>
                  <span className="font-semibold text-[#5E5A52]">{comp.weight}% Weight</span>
                </div>
                <p className="text-[11px] text-[#5E5A52]">{comp.desc}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#16140F]">
                  <span>Status: Awaiting cycle baseline</span>
                  <span>— / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4 & 5: SPENDING BY CATEGORY & DAILY SPEND CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending By Category */}
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-[#16140F]" />
            <h3 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
              Spending by Category
            </h3>
          </div>
          <EmptyState
            icon={<PieChart className="w-5 h-5 text-[#5E5A52]" />}
            title="No spending to categorize"
            description="Breakdown appears once discretionary expenses or fixed commitments are recorded."
            receiptBorder={false}
          />
        </div>

        {/* Daily Spend vs Allowance */}
        <DailySpendChart data={[]} title="Daily Spend vs Daily Allowance" />
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

          {/* Daily Allowance Math */}
          <AccordionItem value="allowance-math" className="border-[#E6DFD2]">
            <AccordionTrigger className="text-sm font-bold text-[#16140F] hover:no-underline">
              Daily Allowance Formulation
            </AccordionTrigger>
            <AccordionContent className="text-xs text-[#5E5A52] space-y-2 pt-2 leading-relaxed">
              <p>
                Unlike basic monthly budgeting where budget is divided equally by 30 days regardless of obligations, RUNWAY isolates cash:
              </p>
              <div className="p-3 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] font-mono text-xs text-[#16140F]">
                Daily Allowance = (Liquid Wallet - Unpaid Commitments - Emergency Buffer) ÷ Days Remaining
              </div>
              <p>
                When you overspend on Day 5, your allowance for Day 6 automatically adjusts downwards. If you underspend, the surplus naturally rolls forward or funds your savings targets.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Health Score Weights */}
          <AccordionItem value="health-weights" className="border-[#E6DFD2]">
            <AccordionTrigger className="text-sm font-bold text-[#16140F] hover:no-underline">
              Financial Health Multi-Factor Grading
            </AccordionTrigger>
            <AccordionContent className="text-xs text-[#5E5A52] space-y-2 pt-2 leading-relaxed">
              <p>Health score is a composite index computed from 4 weighted pillars:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Runway Buffer Moat ({HEALTH_WEIGHTS.runwayBuffer * 100}%):</strong> Evaluates whether your reserve cushion is intact or depleted by emergencies.</li>
                <li><strong>Obligation Coverage ({HEALTH_WEIGHTS.obligationCoverage * 100}%):</strong> Verifies that current liquid cash fully covers upcoming fixed commitments.</li>
                <li><strong>Savings Progress ({HEALTH_WEIGHTS.savingsProgress * 100}%):</strong> Measures whether planned cycle contributions to goals remain feasible.</li>
                <li><strong>Spend Discipline ({HEALTH_WEIGHTS.spendDiscipline * 100}%):</strong> Analyzes variance between daily allowance and actual discretionary spend.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
export default Insights
