import { describe, it, expect } from 'vitest'
import {
  todayISO,
  parseISO,
  formatISO,
  addDays,
  diffDays,
  isBefore,
  isAfter,
  addMonthsClamped,
  cycleEndDate,
} from './dates'

describe('dates utilities', () => {
  it('formats and parses ISO dates reliably', () => {
    const formatted = formatISO(2026, 4, 9)
    expect(formatted).toBe('2026-04-09')

    const parsed = parseISO('2026-10-15')
    expect(parsed).toEqual({ year: 2026, month: 10, day: 15 })
  })

  it('generates a valid todayISO string matching YYYY-MM-DD pattern', () => {
    const today = todayISO()
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('adds positive and negative days across month boundaries', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01')
  })

  it('correctly calculates difference in calendar days', () => {
    expect(diffDays('2026-01-01', '2026-01-31')).toBe(30)
    expect(diffDays('2026-01-31', '2026-01-01')).toBe(-30)
    expect(diffDays('2026-03-15', '2026-03-15')).toBe(0)
  })

  it('evaluates isBefore and isAfter accurately', () => {
    expect(isBefore('2026-01-01', '2026-01-02')).toBe(true)
    expect(isBefore('2026-05-10', '2026-04-10')).toBe(false)
    expect(isAfter('2026-05-10', '2026-04-10')).toBe(true)
    expect(isAfter('2026-01-01', '2026-01-01')).toBe(false)
  })

  it('clamps day 31 to month end when adding months', () => {
    // 2026 is not a leap year, Feb has 28 days
    expect(addMonthsClamped('2026-01-31', 1)).toBe('2026-02-28')
    // Leap year check: 2024 Feb had 29 days
    expect(addMonthsClamped('2024-01-31', 1)).toBe('2024-02-29')
    // 31st March + 1 month = 30th April
    expect(addMonthsClamped('2026-03-31', 1)).toBe('2026-04-30')
    // Normal month with 31 days keeps day
    expect(addMonthsClamped('2026-01-15', 2)).toBe('2026-03-15')
  })

  it('calculates 30-day cycle end date (start + 29 days)', () => {
    expect(cycleEndDate('2026-01-01')).toBe('2026-01-30')
    expect(diffDays('2026-01-01', cycleEndDate('2026-01-01'))).toBe(29)
  })
})
