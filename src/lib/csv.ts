/**
 * Escapes a cell value for safe CSV output, preventing CSV formula injection attacks
 * by prefixing risky leading characters (=, +, -, @, tab, newline) with a single quote.
 */
export function escapeCSVCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""'
  const str = String(value)
  
  // Neutralize formula injection characters
  const needsNeutralization = /^[=+\-@\t\r]/.test(str)
  const safeStr = needsNeutralization ? `'${str}` : str

  // Wrap in double quotes and escape internal quotes if special characters exist
  if (/[",\n\r]/.test(safeStr)) {
    return `"${safeStr.replace(/"/g, '""')}"`
  }
  return safeStr
}

/**
 * Generates an RFC-compliant CSV string from headers and rows with formula injection neutralization.
 */
export function generateCSV(headers: string[], rows: (string | number | boolean)[][]): string {
  const headerLine = headers.map(escapeCSVCell).join(',')
  const rowLines = rows.map((row) => row.map(escapeCSVCell).join(','))
  return [headerLine, ...rowLines].join('\r\n')
}
