import React from 'react'
import { EmptyState } from '@/components/EmptyState'
import type { DecisionLogEntry } from '@/engine/types'

interface LabHistoryListProps {
  decisions: DecisionLogEntry[]
}

export const LabHistoryList: React.FC<LabHistoryListProps> = ({ decisions }) => {
  return (
    <div className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs">
      <h3 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F] mb-1">
        Decision History Log
      </h3>
      <p className="text-xs text-[#5E5A52] mb-4">
        Record of decisions committed from the Decision Lab during this cycle.
      </p>

      {decisions.length === 0 ? (
        <EmptyState
          title="No decisions committed yet"
          description="When you stage and commit decisions from the Decision Lab, they appear here with audited delta impacts."
          receiptBorder={false}
        />
      ) : (
        <div className="divide-y divide-[#E6DFD2]">
          {decisions.map((entry) => (
            <div
              key={entry.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-bold text-[#16140F] block">
                  {'label' in entry.decision
                    ? entry.decision.label
                    : 'name' in entry.decision
                    ? entry.decision.name
                    : entry.decision.type}
                </span>
                <span className="text-[11px] text-[#5E5A52]">
                  {new Date(entry.timestamp).toLocaleDateString()} · Type: {entry.decision.type}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#5E5A52]">
                  Allowance: {entry.impactSummary.allowanceDelta >= 0 ? '+' : ''}
                  ₹{entry.impactSummary.allowanceDelta}/d
                </span>
                <span className="text-[11px] text-[#5E5A52]">
                  Risk: {entry.impactSummary.riskDelta >= 0 ? '+' : ''}
                  {entry.impactSummary.riskDelta} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
