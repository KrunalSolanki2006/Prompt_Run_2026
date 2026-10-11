import React from 'react'

export const ConsequenceChain: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full rounded-[14px] bg-white border border-[#E6DFD2] p-6 shadow-xs overflow-hidden ${className}`}
      role="img"
      aria-label="Consequence chain diagram: Income flows into Balance, constrained by Commitments to calculate Daily Allowance, where Decisions simulate ripples on Risk and Health scores."
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#E6DFD2]/60 mb-5">
        <span className="text-xs font-semibold text-[#5E5A52] uppercase tracking-wider">
          Simulated Financial Flow
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#16140F] bg-[#D4F23A] px-2 py-0.5 rounded-full">
          Live Ripple
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 540 280"
          className="w-full h-auto"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#16140F" />
            </marker>
          </defs>

          {/* Node 1: Income */}
          <g transform="translate(15, 30)">
            <rect width="130" height="60" rx="10" fill="#FBF8F3" stroke="#E6DFD2" strokeWidth="1.5" />
            <text x="65" y="28" textAnchor="middle" className="text-[12px] font-bold fill-[#16140F]">Income Stream</text>
            <text x="65" y="46" textAnchor="middle" className="text-[10px] fill-[#5E5A52]">Predicted & Cash</text>
          </g>

          {/* Flow 1 -> 2 */}
          <path
            d="M 145 60 L 195 60"
            stroke="#16140F"
            strokeWidth="2"
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
          />

          {/* Node 2: Balance */}
          <g transform="translate(205, 30)">
            <rect width="130" height="60" rx="10" fill="#16140F" />
            <text x="65" y="28" textAnchor="middle" className="text-[12px] font-bold fill-[#FBF8F3]">Liquid Balance</text>
            <text x="65" y="46" textAnchor="middle" className="text-[10px] fill-[#D4F23A]">Available Pool</text>
          </g>

          {/* Flow 2 -> 3 (down to Commitments) */}
          <path
            d="M 270 90 L 270 120"
            stroke="#16140F"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />

          {/* Node 3: Commitments & Subscriptions */}
          <g transform="translate(180, 125)">
            <rect width="180" height="55" rx="10" fill="#FBF8F3" stroke="#E6DFD2" strokeWidth="1.5" />
            <text x="90" y="25" textAnchor="middle" className="text-[11px] font-bold fill-[#16140F]">Fixed Commitments & Bills</text>
            <text x="90" y="42" textAnchor="middle" className="text-[10px] fill-[#5E5A52]">Reserved Obligations</text>
          </g>

          {/* Flow 3 -> 4 */}
          <path
            d="M 270 180 L 270 205"
            stroke="#16140F"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />

          {/* Node 4: Daily Allowance */}
          <g transform="translate(195, 210)">
            <rect width="150" height="60" rx="10" fill="#D4F23A" stroke="#16140F" strokeWidth="1.5" />
            <text x="75" y="27" textAnchor="middle" className="text-[12px] font-extrabold fill-[#16140F]">Daily Allowance</text>
            <text x="75" y="46" textAnchor="middle" className="text-[10px] font-semibold fill-[#16140F]">Safe Spend Today</text>
          </g>

          {/* Flow from Allowance to Decision */}
          <path
            d="M 345 240 L 395 240"
            stroke="#16140F"
            strokeWidth="2"
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
          />

          {/* Node 5: Simulated Decision */}
          <g transform="translate(400, 210)">
            <rect width="125" height="60" rx="10" fill="#FBF8F3" stroke="#16140F" strokeWidth="2" strokeDasharray="3 3" />
            <text x="62" y="27" textAnchor="middle" className="text-[12px] font-bold fill-[#16140F]">Decision Lab</text>
            <text x="62" y="46" textAnchor="middle" className="text-[10px] fill-[#C2410C] font-semibold">Test Before Spend</text>
          </g>

          {/* Upward feedback from Decision to Risk & Health */}
          <path
            d="M 462 210 L 462 95"
            stroke="#16140F"
            strokeWidth="2"
            strokeDasharray="4 3"
            markerEnd="url(#arrow)"
          />

          {/* Node 6: Risk & Health Output */}
          <g transform="translate(390, 30)">
            <rect width="140" height="60" rx="10" fill="#FBF8F3" stroke="#1D7A53" strokeWidth="1.5" />
            <text x="70" y="26" textAnchor="middle" className="text-[11px] font-bold fill-[#16140F]">Risk & Health Meter</text>
            <text x="70" y="45" textAnchor="middle" className="text-[10px] fill-[#1D7A53] font-semibold">Explainable 0–100</text>
          </g>
        </svg>
      </div>

      <div className="mt-4 pt-3 border-t border-[#E6DFD2] text-[11px] text-[#5E5A52] flex items-center justify-between">
        <span>Deterministic pure calculation</span>
        <span className="font-semibold text-[#16140F]">computeSnapshot(state, asOf)</span>
      </div>
    </div>
  )
}
