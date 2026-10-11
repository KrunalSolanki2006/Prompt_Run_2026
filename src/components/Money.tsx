import React from 'react'
import type { Rupees } from '@/engine/types'
import { formatINR } from '@/lib/format'

interface MoneyProps {
  amount: Rupees
  showSign?: boolean
  className?: string
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  color?: 'default' | 'safe' | 'watch' | 'risk' | 'critical' | 'muted' | 'volt-bg'
  as?: 'span' | 'div' | 'p'
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  showSign = false,
  className = '',
  size = 'base',
  color = 'default',
  as: Component = 'span',
}) => {
  const isPositive = amount > 0
  const isNegative = amount < 0
  const absFormatted = formatINR(Math.abs(amount))
  
  let prefix = ''
  if (showSign) {
    if (isPositive) prefix = '+'
    else if (isNegative) prefix = '-'
  } else if (isNegative) {
    prefix = '-'
  }

  const sizeClasses: Record<string, string> = {
    sm: 'text-sm font-medium',
    base: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-xl font-bold font-["Bricolage_Grotesque_Variable"]',
    '2xl': 'text-2xl font-bold font-["Bricolage_Grotesque_Variable"]',
    '3xl': 'text-3xl font-extrabold font-["Bricolage_Grotesque_Variable"] tracking-tight',
  }

  const colorClasses: Record<string, string> = {
    default: 'text-[#16140F]',
    safe: 'text-[#1D7A53]',
    watch: 'text-[#A15C07]',
    risk: 'text-[#C2410C]',
    critical: 'text-[#B42318]',
    muted: 'text-[#5E5A52]',
    'volt-bg': 'bg-[#D4F23A] text-[#16140F] px-1.5 py-0.5 rounded-sm',
  }

  return (
    <Component
      className={`tabular-nums ${sizeClasses[size] ?? ''} ${colorClasses[color] ?? ''} ${className}`}
    >
      {prefix}
      {absFormatted}
    </Component>
  )
}
