import type { ISODate, Rupees } from '@/engine/types'
import { parseISO } from '@/engine/dates'

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

/**
 * Formats a whole rupee integer into Indian numbering format (e.g., ₹10,000).
 */
export function formatINR(amount: Rupees): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0'
  return inrFormatter.format(Math.round(amount))
}

export const formatRupees = formatINR


const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Formats an ISODate (YYYY-MM-DD) into readable representation (e.g., "11 Oct 2026").
 */
export function formatDate(iso: ISODate): string {
  const { year, month, day } = parseISO(iso)
  const monthName = MONTH_NAMES[month - 1] ?? 'Jan'
  return `${day} ${monthName} ${year}`
}

/**
 * Formats an ISODate into short representation (e.g., "11 Oct").
 */
export function formatDateShort(iso: ISODate): string {
  const { month, day } = parseISO(iso)
  const monthName = MONTH_NAMES[month - 1] ?? 'Jan'
  return `${day} ${monthName}`
}
