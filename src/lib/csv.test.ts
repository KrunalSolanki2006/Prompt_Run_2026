import { describe, it, expect } from 'vitest'
import { escapeCSVCell, generateCSV } from './csv'

describe('CSV Security and Export Utilities', () => {
  describe('escapeCSVCell', () => {
    it('neutralizes spreadsheet formula injection characters (=, +, -, @, \\t, \\r)', () => {
      expect(escapeCSVCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)")
      expect(escapeCSVCell('+12345')).toBe("'+12345")
      expect(escapeCSVCell('-cmd|/C')).toBe("'-cmd|/C")
      expect(escapeCSVCell('@IMPORTXML(...)')).toBe("'@IMPORTXML(...)")
      expect(escapeCSVCell('\tTABBED')).toBe("'\tTABBED")
    })

    it('escapes embedded quotes and wraps in double quotes when needed', () => {
      expect(escapeCSVCell('hello "world"')).toBe('"hello ""world"""')
      expect(escapeCSVCell('line,with,comma')).toBe('"line,with,comma"')
      expect(escapeCSVCell('multi\nline')).toBe('"multi\nline"')
    })

    it('handles null, undefined, numbers and booleans safely', () => {
      expect(escapeCSVCell(null)).toBe('""')
      expect(escapeCSVCell(undefined)).toBe('""')
      expect(escapeCSVCell(1000)).toBe('1000')
      expect(escapeCSVCell(true)).toBe('true')
    })
  })

  describe('generateCSV', () => {
    it('generates CRLF-separated RFC compliant CSV table with header', () => {
      const headers = ['Date', 'Amount', 'Note']
      const rows = [
        ['2026-10-11', 500, '=HYPERLINK("http://evil.com")'],
        ['2026-10-12', 1200, 'Grocery, Fruits & Veggies'],
      ]

      const csv = generateCSV(headers, rows)
      const lines = csv.split('\r\n')
      expect(lines).toHaveLength(3)
      expect(lines[0]).toBe('Date,Amount,Note')
      expect(lines[1]).toBe('2026-10-11,500,"\'=HYPERLINK(""http://evil.com"")"')
      expect(lines[2]).toBe('2026-10-12,1200,"Grocery, Fruits & Veggies"')
    })
  })
})
