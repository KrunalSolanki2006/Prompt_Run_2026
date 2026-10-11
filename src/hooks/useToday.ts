import { useState, useEffect } from 'react'
import { todayISO } from '@/engine/dates'
import type { ISODate } from '@/engine/types'

/**
 * Hook providing today's local ISO date (YYYY-MM-DD).
 * Rolls over automatically at local midnight and on tab visibility change.
 */
export function useToday(): ISODate {
  const [today, setToday] = useState<ISODate>(todayISO)

  useEffect(() => {
    // 1. Visibility change listener (user returns to tab next day)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const current = todayISO()
        setToday((prev: ISODate) => (prev !== current ? current : prev))
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 2. Schedule midnight rollover timer
    let timerId: ReturnType<typeof setTimeout> | undefined

    const scheduleMidnightRollover = () => {
      const now = new Date()
      // Calculate milliseconds until tomorrow 00:00:00.100
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        100
      )
      const msUntilMidnight = tomorrow.getTime() - now.getTime()

      timerId = setTimeout(() => {
        setToday(todayISO())
        scheduleMidnightRollover()
      }, msUntilMidnight)
    }

    scheduleMidnightRollover()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timerId) clearTimeout(timerId)
    }
  }, [])

  return today
}
