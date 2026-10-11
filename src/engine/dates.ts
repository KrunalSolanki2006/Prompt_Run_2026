import type { ISODate } from './types'

export interface ParsedDate {
  year: number
  month: number
  day: number
}

/**
 * Returns today's calendar date as local YYYY-MM-DD.
 * Does NOT invoke UTC-based new Date("YYYY-MM-DD").
 */
export function todayISO(): ISODate {
  const d = new Date()
  return formatISO(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

/**
 * Safely parses a YYYY-MM-DD string into integer components.
 */
export function parseISO(iso: ISODate): ParsedDate {
  const parts = iso.split('-')
  const year = parseInt(parts[0] ?? '1970', 10)
  const month = parseInt(parts[1] ?? '1', 10)
  const day = parseInt(parts[2] ?? '1', 10)
  return { year, month, day }
}

/**
 * Formats numeric year, month (1-12), and day (1-31) into padded YYYY-MM-DD.
 */
export function formatISO(year: number, month: number, day: number): ISODate {
  const y = String(year).padStart(4, '0')
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Adds an integer number of days to a local ISO date.
 */
export function addDays(iso: ISODate, days: number): ISODate {
  const { year, month, day } = parseISO(iso)
  const d = new Date(year, month - 1, day + days)
  return formatISO(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

/**
 * Computes calendar days between two dates: (b - a).
 * If b is 1 day after a, returns +1.
 */
export function diffDays(a: ISODate, b: ISODate): number {
  const pA = parseISO(a)
  const pB = parseISO(b)
  const utcA = Date.UTC(pA.year, pA.month - 1, pA.day)
  const utcB = Date.UTC(pB.year, pB.month - 1, pB.day)
  return Math.round((utcB - utcA) / 86400000)
}

/**
 * Returns true if ISO date a is strictly before b.
 */
export function isBefore(a: ISODate, b: ISODate): boolean {
  return a < b
}

/**
 * Returns true if ISO date a is strictly after b.
 */
export function isAfter(a: ISODate, b: ISODate): boolean {
  return a > b
}

/**
 * Adds months to a date, clamping days exceeding the target month's maximum length
 * (e.g., 2026-01-31 + 1 month = 2026-02-28).
 */
export function addMonthsClamped(iso: ISODate, months: number): ISODate {
  const { year, month, day } = parseISO(iso)
  const totalMonths = (year * 12 + (month - 1)) + months
  const targetYear = Math.floor(totalMonths / 12)
  const targetMonth = (totalMonths % 12) + 1
  // Calculate max days in target month by passing day 0 of next month
  const maxDays = new Date(targetYear, targetMonth, 0).getDate()
  const targetDay = Math.min(day, maxDays)
  return formatISO(targetYear, targetMonth, targetDay)
}

/**
 * Computes the 30th day for a 30-day cycle starting on startDate.
 * Day 1 is startDate; cycle ends after 30 days total (startDate + 29 days).
 */
export function cycleEndDate(startDate: ISODate): ISODate {
  return addDays(startDate, 29)
}
