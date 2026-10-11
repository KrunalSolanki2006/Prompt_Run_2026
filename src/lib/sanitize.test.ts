import { describe, it, expect } from 'vitest'
import { cleanText, parseRupees } from './sanitize'

describe('sanitize utilities', () => {
  describe('cleanText', () => {
    it('trims and collapses repeated whitespace', () => {
      const cleaner = cleanText(50)
      expect(cleaner('   hello    world   ')).toBe('hello world')
      expect(cleaner('line\n\nbreak\ttab')).toBe('line break tab')
    })

    it('strips control characters and bidi overrides', () => {
      const cleaner = cleanText(100)
      const evil = 'Clean\u0000Text\u202EReversed\u202C'
      expect(cleaner(evil)).toBe('CleanTextReversed')
    })

    it('enforces maximum character limits cleanly', () => {
      const cleaner = cleanText(10)
      expect(cleaner('123456789012345')).toBe('1234567890')
    })

    it('gracefully handles non-string inputs', () => {
      const cleaner = cleanText(20)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(cleaner(null as any)).toBe('')
    })
  })

  describe('parseRupees', () => {
    it('accepts valid integer numbers and numeric strings', () => {
      expect(parseRupees(500)).toBe(500)
      expect(parseRupees('10,000')).toBe(10000)
      expect(parseRupees(' 2500 ')).toBe(2500)
    })

    it('rejects floats / fractional paise', () => {
      expect(() => parseRupees(50.5)).toThrow('whole number')
      expect(() => parseRupees('199.99')).toThrow('whole number')
    })

    it('rejects numbers outside the 1 to 1,000,000 range', () => {
      expect(() => parseRupees(0)).toThrow('between ₹1 and ₹10,00,000')
      expect(() => parseRupees(-100)).toThrow('between ₹1 and ₹10,00,000')
      expect(() => parseRupees(1000001)).toThrow('between ₹1 and ₹10,00,000')
    })

    it('rejects invalid non-numeric inputs', () => {
      expect(() => parseRupees('abc')).toThrow('valid number')
      expect(() => parseRupees(NaN)).toThrow('valid number')
    })
  })
})
