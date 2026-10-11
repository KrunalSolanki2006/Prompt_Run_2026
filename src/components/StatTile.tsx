import React from 'react'

interface StatTileProps {
  label: string
  value: React.ReactNode
  subtitle?: string
  delta?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  className?: string
  footer?: React.ReactNode
  dataTestId?: string
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subtitle,
  delta,
  icon,
  badge,
  className = '',
  footer,
  dataTestId,
}) => {
  return (
    <div
      data-testid={dataTestId}
      className={`bg-white border border-[#E6DFD2] rounded-[14px] p-4.5 flex flex-col justify-between transition-colors hover:border-[#16140F]/30 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-[#5E5A52] uppercase tracking-wider">
            {label}
          </span>
          <div className="flex items-center gap-1.5">
            {badge}
            {icon && (
              <div className="text-[#5E5A52] p-1 rounded-md bg-[#FBF8F3] border border-[#E6DFD2]">
                {icon}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap">
          <div className="text-2xl font-bold font-['Bricolage_Grotesque_Variable'] text-[#16140F] tabular-nums tracking-tight">
            {value}
          </div>
          {delta && <div>{delta}</div>}
        </div>

        {subtitle && (
          <p className="text-xs text-[#5E5A52] mt-1 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {footer && (
        <div className="mt-3 pt-3 border-t border-[#E6DFD2]/60 text-xs text-[#5E5A52]">
          {footer}
        </div>
      )}
    </div>
  )
}
