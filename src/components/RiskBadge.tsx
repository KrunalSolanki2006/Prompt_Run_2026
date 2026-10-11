import React from 'react'
import { CircleCheck, CircleAlert, TriangleAlert, OctagonAlert } from 'lucide-react'
import type { RiskLevel } from '@/engine/types'

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  className?: string
  size?: 'sm' | 'base' | 'lg'
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  className = '',
  size = 'base',
}) => {
  const configs: Record<
    RiskLevel,
    {
      label: string
      bgClass: string
      textClass: string
      borderClass: string
      icon: React.ReactNode
    }
  > = {
    low: {
      label: 'Low Risk',
      bgClass: 'bg-[#1D7A53]/10',
      textClass: 'text-[#1D7A53]',
      borderClass: 'border-[#1D7A53]/30',
      icon: <CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    moderate: {
      label: 'Moderate Risk',
      bgClass: 'bg-[#A15C07]/10',
      textClass: 'text-[#A15C07]',
      borderClass: 'border-[#A15C07]/30',
      icon: <CircleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    high: {
      label: 'High Risk',
      bgClass: 'bg-[#C2410C]/10',
      textClass: 'text-[#C2410C]',
      borderClass: 'border-[#C2410C]/30',
      icon: <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    critical: {
      label: 'Critical Risk',
      bgClass: 'bg-[#B42318]/10',
      textClass: 'text-[#B42318]',
      borderClass: 'border-[#B42318]/30',
      icon: <OctagonAlert className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
  }

  const config = configs[level]

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    base: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bgClass} ${config.textClass} ${config.borderClass} ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={`Risk assessment: ${config.label}${score !== undefined ? ` (score ${score}/100)` : ''}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="tabular-nums opacity-85 text-[0.85em]">
          ({score})
        </span>
      )}
    </span>
  )
}
