/* eslint-disable no-control-regex */
import type { Rupees } from '@/engine/types'

/**
 * Normalizes user text:
 * 1. Strips ASCII control characters (0x00-0x1F, 0x7F-0x9F)
 * 2. Strips Unicode bidirectional override characters (U+202A..U+202E, U+2066..U+2069)
 * 3. Collapses consecutive whitespaces into a single space
 * 4. Trims leading and trailing whitespace
 * 5. Truncates length to `max` characters
 */
export function cleanText(max: number = 200): (input: string) => string {
  return (input: string): string => {
    if (typeof input !== 'string') return ''
    
    // Convert tabs, newlines, and carriage returns to space first
    const spaced = input.replace(/[\t\r\n]+/g, ' ')
    
    // Remove remaining control characters and bidi overrides
    const stripped = spaced
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
    
    // Collapse whitespace and trim
    const normalized = stripped.replace(/\s+/g, ' ').trim()
    
    return normalized.slice(0, max)
  }
}

/**
 * Validates and converts an input into an integer Rupee amount (1 to 1,000,000).
 * Rejects fractional amounts, non-integers, negative numbers, or numbers outside range.
 */
export function parseRupees(input: unknown): Rupees {
  let val: number
  if (typeof input === 'number') {
    val = input
  } else if (typeof input === 'string') {
    const cleaned = input.replace(/,/g, '').trim()
    val = Number(cleaned)
  } else {
    throw new Error('Invalid rupee value type')
  }

  if (isNaN(val) || !isFinite(val)) {
    throw new Error('Rupee amount must be a valid number')
  }

  if (!Number.isInteger(val)) {
    throw new Error('Rupee amount must be a whole number (no paise)')
  }

  if (val < 1 || val > 1_000_000) {
    throw new Error('Rupee amount must be between ₹1 and ₹10,00,000')
  }

  return val
}
