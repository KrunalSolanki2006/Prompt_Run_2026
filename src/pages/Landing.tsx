import React from 'react'
import { Link } from 'react-router'
import { Logo } from '@/components/Logo'
import { ConsequenceChain } from '@/components/ConsequenceChain'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  Calendar,
  Layers,
  FlaskConical,
  Activity,
  ArrowRight,
  ShieldCheck,
  Database,
  Info,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react'

export const Landing: React.FC = () => {
  useDocumentTitle('Make ₹10,000 Last 30 Days')

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#16140F] flex flex-col selection:bg-[#D4F23A] selection:text-[#16140F]">
      {/* Skip to Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#16140F] text-[#FBF8F3] px-4 py-2 rounded-md font-semibold text-sm outline-none ring-2 ring-[#D4F23A]"
      >
        Skip to main content
      </a>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FBF8F3]/90 backdrop-blur-md border-b border-[#E6DFD2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo showTagline />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5E5A52]" aria-label="Main menu">
            <a href="#how-it-works" className="hover:text-[#16140F] transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-[#16140F] transition-colors">
              Connected features
            </a>
            <a href="#transparency" className="hover:text-[#16140F] transition-colors">
              Transparency
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/sign-in"
              className="text-sm font-semibold text-[#16140F] hover:text-[#5E5A52] px-3 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="text-sm font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/85 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Get started</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white border border-[#E6DFD2] rounded-full px-3 py-1 text-xs font-semibold text-[#16140F] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#1D7A53] animate-pulse" />
                <span>Prompt Run 2026 Challenge Cockpit</span>
              </div>

              {/* H1 rendered immediately without opacity 0 to protect LCP */}
              <h1 className="font-['Bricolage_Grotesque_Variable'] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#16140F] leading-[1.08] mb-6">
                Make <span className="bg-[#D4F23A] px-2 py-0.5 rounded-md">₹10,000</span> last 30 days.
              </h1>

              <p className="text-lg sm:text-xl text-[#5E5A52] font-normal leading-relaxed mb-8 max-w-xl">
                Test every money move before you make it, and see how it ripples through your balance, goals, risk, and financial health.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
                <Link
                  to="/sign-up"
                  className="bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 text-base font-bold px-6 py-3.5 rounded-xl shadow-xs transition-colors text-center inline-flex items-center justify-center gap-2"
                >
                  <span>Start your 30 days</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/sign-in"
                  className="bg-white border border-[#E6DFD2] hover:border-[#16140F] text-[#16140F] text-base font-semibold px-6 py-3.5 rounded-xl transition-colors text-center"
                >
                  Sign in to existing cycle
                </Link>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#5E5A52] font-medium pt-2">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1D7A53]" /> 100% Local in browser
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1D7A53]" /> Deterministic rules
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A15C07]" /> Zero fake demo data
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <ConsequenceChain />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-[#E6DFD2]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-2">
                The 4-Step Cycle
              </span>
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-3xl sm:text-4xl font-extrabold text-[#16140F]">
                How RUNWAY steers your cash flow
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Set your 30 days',
                  desc: 'Initialize the ₹10,000 challenge budget, define your cycle start date, and lock an emergency buffer percentage.',
                  icon: <Calendar className="w-5 h-5" />,
                },
                {
                  step: '02',
                  title: 'Plan what’s coming',
                  desc: 'Add confirmed income and map fixed commitments: rent, subscriptions, mobile recharges, and savings goals.',
                  icon: <Layers className="w-5 h-5" />,
                },
                {
                  step: '03',
                  title: 'Try decisions in the Lab',
                  desc: 'Simulate taking an auto ride, splitting a dinner, or adding a streaming subscription before spending a single rupee.',
                  icon: <FlaskConical className="w-5 h-5" />,
                },
                {
                  step: '04',
                  title: 'Watch the ripple',
                  desc: 'Instantly view before/after changes to your daily allowance, savings deadlines, risk meters, and 30-day forecast.',
                  icon: <Activity className="w-5 h-5" />,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-[#FBF8F3] border border-[#E6DFD2] rounded-[14px] p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-extrabold font-['Bricolage_Grotesque_Variable'] text-[#16140F] bg-[#D4F23A] px-2 py-0.5 rounded">
                        {item.step}
                      </span>
                      <div className="text-[#5E5A52] p-1.5 rounded-md bg-white border border-[#E6DFD2]">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-lg text-[#16140F] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5E5A52] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONNECTED FEATURES */}
        <section id="features" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-2">
              Interconnected System
            </span>
            <h2 className="font-['Bricolage_Grotesque_Variable'] text-3xl sm:text-4xl font-extrabold text-[#16140F]">
              Everything connects. Nothing exists in isolation.
            </h2>
            <p className="text-base text-[#5E5A52] mt-3">
              One pure engine computes a unified snapshot. When one number shifts, the entire cockpit responds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Daily Allowance (Prominent span) */}
            <div className="md:col-span-2 bg-white border border-[#E6DFD2] rounded-[14px] p-6.5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1D7A53] uppercase tracking-wider block mb-1">
                  Pacing Engine
                </span>
                <h3 className="font-['Bricolage_Grotesque_Variable'] text-2xl font-bold text-[#16140F] mb-2">
                  Daily Allowance with Real-Time Discipline
                </h3>
                <p className="text-sm text-[#5E5A52] leading-relaxed mb-6">
                  Unlike traditional monthly budgets that fail on day 10, RUNWAY calculates what you can spend today after locking obligations, upcoming bills, and goal contributions. Overspending today recalculates tomorrow’s allowance immediately.
                </p>
              </div>
              <div className="bg-[#FBF8F3] border border-[#E6DFD2] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#5E5A52] block">Current Formula</span>
                  <span className="font-mono text-xs font-semibold text-[#16140F]">
                    (Liquid Balance - Remaining Commitments - Buffer) ÷ Days Left
                  </span>
                </div>
                <span className="bg-[#D4F23A] text-[#16140F] text-xs font-bold px-2.5 py-1 rounded-md">
                  Dynamic
                </span>
              </div>
            </div>

            {/* Feature 2: Surprise Buffer */}
            <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#A15C07] uppercase tracking-wider block mb-1">
                  Contingency Guard
                </span>
                <h3 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] mb-2">
                  Surprise-Expense Buffer
                </h3>
                <p className="text-sm text-[#5E5A52] leading-relaxed">
                  Reserve a dedicated 5%–20% safety moat for unpredicted medicine, vehicle repairs, or forgotten fees before calculating your discretionary daily spend.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E6DFD2] text-xs font-semibold text-[#16140F] flex items-center justify-between">
                <span>Default Challenge Buffer</span>
                <span className="bg-[#16140F] text-[#FBF8F3] px-2 py-0.5 rounded">10% (₹1,000)</span>
              </div>
            </div>

            {/* Feature 3: Commitments & Subscriptions */}
            <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#5E5A52] uppercase tracking-wider block mb-1">
                  Obligations
                </span>
                <h3 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] mb-2">
                  Commitments & Subscriptions
                </h3>
                <p className="text-sm text-[#5E5A52] leading-relaxed">
                  Keep recurring EMIs, utility bills, and active subscriptions separated from discretionary money so you never accidentally spend rent money on a night out.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E6DFD2] text-xs text-[#5E5A52]">
                Auto-ringfences cash until marked paid.
              </div>
            </div>

            {/* Feature 4: Savings Goals */}
            <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1D7A53] uppercase tracking-wider block mb-1">
                  Wealth Building
                </span>
                <h3 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] mb-2">
                  Savings Goals & Feasibility
                </h3>
                <p className="text-sm text-[#5E5A52] leading-relaxed">
                  Assign priority to your goals. The cockpit tells you upfront whether your cycle contribution is on track, behind, or unfunded by your current burn rate.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E6DFD2] text-xs text-[#5E5A52]">
                Simulates completion dates dynamically.
              </div>
            </div>

            {/* Feature 5: Risk Meter & Health Score */}
            <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-[#C2410C] uppercase tracking-wider block mb-1">
                  Diagnostic Cockpit
                </span>
                <h3 className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold text-[#16140F] mb-2">
                  Risk Meter & Health Score
                </h3>
                <p className="text-sm text-[#5E5A52] leading-relaxed">
                  A transparent 0–100 risk assessment with actionable drivers, paired with a multi-factor health grade evaluating runway buffer, discipline, and coverage.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E6DFD2] text-xs text-[#5E5A52]">
                100% explainable heuristic math.
              </div>
            </div>
          </div>
        </section>

        {/* TRANSPARENCY & INTEGRITY */}
        <section id="transparency" className="py-16 bg-[#F3EFE6] border-t border-[#E6DFD2]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#5E5A52] uppercase tracking-wider block mb-2">
                Ethical Design
              </span>
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-2xl sm:text-3xl font-extrabold text-[#16140F]">
                Our Product & Data Contract
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#E6DFD2] rounded-xl p-5 flex items-start gap-4">
                <Database className="w-5 h-5 text-[#16140F] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#16140F]">100% Local-First Storage</h3>
                  <p className="text-xs text-[#5E5A52] mt-1 leading-relaxed">
                    Your financial records, accounts, and simulations live strictly in your browser’s localStorage. No remote servers, cloud databases, or trackers ever touch your financial parameters.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E6DFD2] rounded-xl p-5 flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-[#16140F] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#16140F]">Explainable, Rule-Based Scoring</h3>
                  <p className="text-xs text-[#5E5A52] mt-1 leading-relaxed">
                    Risk and health ratings are computed with deterministic rules defined directly in source code (<code className="font-mono text-[#16140F]">engine/constants.ts</code>). Every score shows its specific mathematical drivers and actions.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E6DFD2] rounded-xl p-5 flex items-start gap-4">
                <Info className="w-5 h-5 text-[#16140F] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-[#16140F]">Not Certified Financial Advice</h3>
                  <p className="text-xs text-[#5E5A52] mt-1 leading-relaxed">
                    RUNWAY is an interactive educational decision simulator designed to build cash flow awareness for Gen Z budget constraints. It is not an accredited financial advisory service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="bg-[#16140F] text-[#FBF8F3] rounded-[18px] p-8 sm:p-14 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-3xl sm:text-4xl font-extrabold mb-4">
                Ready to conquer your ₹10,000 cycle?
              </h2>
              <p className="text-[#FBF8F3]/80 text-base max-w-lg mx-auto mb-8">
                Initialize your 30-day runway now. No fake sign-up forms, no credit cards, and no cloud accounts required.
              </p>
              <Link
                to="/sign-up"
                className="bg-[#D4F23A] text-[#16140F] hover:bg-[#D4F23A]/90 font-bold text-base px-7 py-3.5 rounded-xl inline-flex items-center gap-2 transition-colors"
              >
                <span>Start your 30 days</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#E6DFD2] py-8 bg-[#FBF8F3] text-xs text-[#5E5A52]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo showTagline={false} />
            <span className="text-[#E6DFD2]">|</span>
            <span>Prompt Run 2026 Individual Hackathon</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-[#16140F]">How it works</a>
            <a href="#features" className="hover:text-[#16140F]">Features</a>
            <a href="#transparency" className="hover:text-[#16140F]">Transparency</a>
            <Link to="/sign-in" className="hover:text-[#16140F]">Sign in</Link>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#5E5A52]" />
            <span>30-Day Pure Cash Flow Engine</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
