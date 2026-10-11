import React, { useState, useMemo } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/engine/constants'
import { formatRupees } from '@/lib/format'
import { generateCSV } from '@/lib/csv'
import {
  ReceiptText,
  Download,
  Search,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

export const Activity: React.FC = () => {
  useDocumentTitle('Activity Ledger')
  const { state, deleteTransaction } = useFinance()

  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [unexpectedOnly, setUnexpectedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('date-desc')

  // Filter & sort transactions
  const filteredTransactions = useMemo(() => {
    let list = [...state.transactions]

    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.note.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    // Kind filter
    if (kindFilter !== 'all') {
      list = list.filter((t) => t.kind === kindFilter)
    }

    // Category filter
    if (catFilter !== 'all') {
      list = list.filter((t) => t.category === catFilter)
    }

    // Tag filter
    if (tagFilter !== 'all') {
      list = list.filter((t) => t.tag === tagFilter)
    }

    // Unexpected filter
    if (unexpectedOnly) {
      list = list.filter((t) => t.unexpected)
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return b.date.localeCompare(a.date)
      } else if (sortBy === 'date-asc') {
        return a.date.localeCompare(b.date)
      } else if (sortBy === 'amount-desc') {
        return b.amount - a.amount
      } else if (sortBy === 'amount-asc') {
        return a.amount - b.amount
      }
      return 0
    })

    return list
  }, [
    state.transactions,
    search,
    kindFilter,
    catFilter,
    tagFilter,
    unexpectedOnly,
    sortBy,
  ])

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Kind',
      'Category',
      'Description',
      'Tag',
      'Unexpected',
      'Amount (Rupees)',
    ]

    const rows = filteredTransactions.map((t) => [
      t.date,
      t.kind,
      t.category,
      t.note,
      t.tag,
      t.unexpected ? 'Yes' : 'No',
      t.amount,
    ])

    const csvContent = generateCSV(headers, rows)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `runway-activity-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Ledger"
        subtitle="Complete log of expenses, income, and savings deposits across your 30-day runway."
        actions={
          <Button
            variant="outline"
            disabled={state.transactions.length === 0}
            onClick={handleExportCSV}
            className="h-9 border-[#E6DFD2] text-xs font-semibold rounded-lg flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#5E5A52] absolute left-3 top-3 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by note or description..."
              className="pl-9 h-10 bg-[#FBF8F3] border-[#E6DFD2] text-xs"
            />
          </div>

          {/* Kind Filter */}
          <div className="sm:col-span-2">
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-xs font-semibold text-[#16140F]"
              aria-label="Filter by transaction type"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="goal_deposit">Goal Deposit</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-xs font-semibold text-[#16140F]"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-xs font-semibold text-[#16140F]"
              aria-label="Sort order"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest ₹</option>
              <option value="amount-asc">Lowest ₹</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6DFD2]/60 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox
                id="filter-unexpected"
                checked={unexpectedOnly}
                onCheckedChange={(c) => setUnexpectedOnly(!!c)}
              />
              <Label htmlFor="filter-unexpected" className="text-xs text-[#5E5A52] cursor-pointer">
                Unexpected expenses only
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#5E5A52]">Tag:</span>
              <button
                type="button"
                onClick={() => setTagFilter(tagFilter === 'need' ? 'all' : 'need')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  tagFilter === 'need' ? 'bg-[#16140F] text-[#FBF8F3]' : 'bg-[#FBF8F3] text-[#5E5A52]'
                }`}
              >
                Needs
              </button>
              <button
                type="button"
                onClick={() => setTagFilter(tagFilter === 'want' ? 'all' : 'want')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  tagFilter === 'want' ? 'bg-[#16140F] text-[#FBF8F3]' : 'bg-[#FBF8F3] text-[#5E5A52]'
                }`}
              >
                Wants
              </button>
            </div>
          </div>

          <span className="text-[#5E5A52] text-[11px]">
            {filteredTransactions.length} of {state.transactions.length} items shown
          </span>
        </div>
      </div>

      {/* TRANSACTIONS LIST */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] overflow-hidden shadow-xs">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-xs text-left">
            <caption className="sr-only">Detailed activity ledger transactions</caption>
            <thead>
              <tr className="bg-[#FBF8F3] text-[#5E5A52] border-b border-[#E6DFD2]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center w-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD2]">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-[#FBF8F3]/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#5E5A52]">
                    {t.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#16140F]">
                    <div className="flex items-center gap-2">
                      <span>{t.note || t.category}</span>
                      {t.unexpected && (
                        <span className="text-[10px] font-bold text-[#A15C07] bg-[#A15C07]/10 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Emergency</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-[#5E5A52]">
                    <div className="flex items-center gap-1.5">
                      <CategoryIcon category={t.category} size="sm" />
                      <span>{t.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.tag === 'need'
                          ? 'bg-[#16140F]/10 text-[#16140F]'
                          : 'bg-[#5E5A52]/10 text-[#5E5A52]'
                      }`}
                    >
                      {t.tag.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-['Bricolage_Grotesque_Variable'] font-bold text-sm text-right tabular-nums">
                    <span
                      className={
                        t.kind === 'income'
                          ? 'text-[#1D7A53]'
                          : 'text-[#16140F]'
                      }
                    >
                      {t.kind === 'income' ? '+' : '-'}
                      {formatRupees(t.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete transaction "${t.note || t.category}"?`)) {
                          deleteTransaction(t.id)
                        }
                      }}
                      className="p-1 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#E6DFD2]">
            {filteredTransactions.map((t) => (
              <div key={t.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-[#16140F] block">
                      {t.note || t.category}
                    </span>
                    <span className="text-[11px] text-[#5E5A52]">
                      {t.date} · {t.category}
                    </span>
                  </div>
                  <span
                    className={`font-['Bricolage_Grotesque_Variable'] font-bold text-sm ${
                      t.kind === 'income' ? 'text-[#1D7A53]' : 'text-[#16140F]'
                    }`}
                  >
                    {t.kind === 'income' ? '+' : '-'}
                    {formatRupees(t.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <div className="flex gap-1.5">
                    <span className="font-bold bg-[#FBF8F3] px-1.5 py-0.5 rounded text-[10px]">
                      {t.tag.toUpperCase()}
                    </span>
                    {t.unexpected && (
                      <span className="font-bold text-[#A15C07] bg-[#A15C07]/10 px-1.5 py-0.5 rounded text-[10px]">
                        Emergency
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete transaction "${t.note || t.category}"?`)) {
                        deleteTransaction(t.id)
                      }
                    }}
                    className="text-[#B42318] text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<ReceiptText className="w-6 h-6 text-[#5E5A52]" />}
          title="No transactions match your filters"
          description={
            state.transactions.length === 0
              ? 'No transactions logged yet in this cycle. Use the "Add" button to log an expense or income.'
              : 'Try clearing your search term or filter criteria.'
          }
          receiptBorder={false}
        />
      )}
    </div>
  )
}
export default Activity
