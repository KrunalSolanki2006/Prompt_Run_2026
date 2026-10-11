import React from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'

export interface ChecklistItem {
  id: string
  label: string
  to: string
  done: boolean
}

interface CycleChecklistCardProps {
  items: ChecklistItem[]
}

export const CycleChecklistCard: React.FC<CycleChecklistCardProps> = ({ items }) => {
  return (
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
        {items.map((item) => (
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
  )
}
