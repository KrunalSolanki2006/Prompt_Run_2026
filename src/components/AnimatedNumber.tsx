import React, { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { formatINR } from '@/lib/format'

interface AnimatedNumberProps {
  value: number
  formatAsRupees?: boolean
  className?: string
  duration?: number
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatAsRupees = false,
  className = '',
  duration = 0.4,
}) => {
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (shouldReduceMotion) return

    let animationFrameId: number
    const startValue = displayValue
    const endValue = value
    const startTime = performance.now()
    const durationMs = duration * 1000

    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      // Ease-out cubic curve
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (endValue - startValue) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(endValue)
      }
    }

    animationFrameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, shouldReduceMotion, duration])

  if (shouldReduceMotion) {
    return (
      <span className={`tabular-nums ${className}`}>
        {formatAsRupees ? formatINR(value) : value}
      </span>
    )
  }

  return (
    <span className={`tabular-nums ${className}`}>
      {formatAsRupees ? formatINR(displayValue) : displayValue}
    </span>
  )
}
