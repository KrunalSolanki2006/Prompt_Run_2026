import React from 'react'
import { ArrowRight } from 'lucide-react'

interface DeltaChipProps {
  before: React.ReactNode
  after: React.ReactNode
  deltaText?: string
  trend?: 'positive' | 'negative' | 'neutral'
  label?: string
  className?: string
}

export const DeltaChip: React.FC<DeltaChipProps> = ({
  before,
  after,
  deltaText,
  trend = 'neutral',
  label,
  className = '',
}) => {
  const trendClasses = {
    positive: 'bg-[#1D7A53]/10 text-[#1D7A53] border-[#1D7A53]/30',
    negative: 'bg-[#C2410C]/10 text-[#C2410C] border-[#C2410C]/30',
    neutral: 'bg-[#16140F]/5 text-[#16140F] border-[#E6DFD2]',
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border ${trendClasses[trend]} ${className}`}
      role="group"
      aria-label={label ? `${label}: ${before} changed to ${after}` : `Changed from ${before} to ${after}`}
    >
      {label && <span className="text-[#5E5A52] font-normal">{label}:</span>}
      <span className="tabular-nums font-semibold opacity-75">{before}</span>
      <ArrowRight className="w-3 h-3 text-[#5E5A52] shrink-0" aria-hidden="true" />
      <span className="tabular-nums font-bold">{after}</span>
      {deltaText && (
        <span className="tabular-nums text-[0.85em] font-medium ml-0.5">
          ({deltaText})
        </span>
      )}
    </div>
  )
}
