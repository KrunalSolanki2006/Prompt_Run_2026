import React from 'react'

interface GaugeProps {
  value: number | null
  max?: number
  label: string
  level?: 'safe' | 'watch' | 'risk' | 'critical' | 'neutral'
  size?: number
  unit?: string
  textAlternative?: string
  className?: string
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  max = 100,
  label,
  level = 'neutral',
  size = 130,
  unit = '',
  textAlternative,
  className = '',
}) => {
  const percentage = value !== null ? Math.min(Math.max(value / max, 0), 1) : 0
  const radius = 42
  const cx = 50
  const cy = 48
  const strokeWidth = 8
  const arcLength = Math.PI * radius // ~131.95
  const strokeDashoffset = arcLength * (1 - percentage)

  const levelColors: Record<string, string> = {
    safe: '#1D7A53',
    watch: '#A15C07',
    risk: '#C2410C',
    critical: '#B42318',
    neutral: '#16140F',
  }

  const strokeColor = levelColors[level] ?? '#16140F'
  const altText =
    textAlternative ||
    (value !== null ? `${label}: ${Math.round(value)}${unit} (${level})` : `${label}: No data yet`)

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="img"
      aria-label={altText}
    >
      <div style={{ width: size, height: size * 0.65 }} className="relative">
        <svg
          viewBox="0 0 100 60"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Background track arc */}
          <path
            d="M 8 48 A 42 42 0 0 1 92 48"
            fill="none"
            stroke="#E6DFD2"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active value arc */}
          {value !== null && (
            <path
              d="M 8 48 A 42 42 0 0 1 92 48"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
          )}

          {/* Center text */}
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            className="font-['Bricolage_Grotesque_Variable'] font-bold text-[19px] fill-[#16140F] tabular-nums"
          >
            {value !== null ? `${Math.round(value)}${unit}` : '—'}
          </text>
        </svg>
      </div>

      <span className="text-xs font-semibold text-[#5E5A52] uppercase tracking-wider text-center mt-1">
        {label}
      </span>
    </div>
  )
}
