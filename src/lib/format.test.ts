import { describe, it, expect } from 'vitest'
import { formatINR, formatDate, formatDateShort } from './format'

describe('format utilities', () => {
  it('formats whole Indian Rupees with comma grouping and symbol', () => {
    expect(formatINR(10000)).toMatch(/₹\s?10,000/)
    expect(formatINR(100000)).toMatch(/₹\s?1,00,000/)
    expect(formatINR(500)).toMatch(/₹\s?500/)
    expect(formatINR(0)).toMatch(/₹\s?0/)
  })

  it('formats dates consistently', () => {
    expect(formatDate('2026-10-11')).toBe('11 Oct 2026')
    expect(formatDateShort('2026-04-05')).toBe('5 Apr')
  })
})
