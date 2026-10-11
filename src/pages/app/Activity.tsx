import React, { useState } from 'react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/engine/constants'
import { ReceiptText, Download, Search, Plus } from 'lucide-react'
import type { Transaction } from '@/engine/types'

export const Activity: React.FC = () => {
  useDocumentTitle('Activity Ledger')
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [unexpectedOnly, setUnexpectedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('date-desc')

  // STAGE-1: Static transaction list is empty. Real transactions load in Stage 2.
  const transactions: Transaction[] = []

  const handleExportCSV = () => {
    // STAGE-2: Generate and download real CSV ledger file
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Ledger"
        subtitle="Complete log of expenses, income, and savings deposits across your 30-day runway."
        actions={
          <Button
            variant="outline"
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
              className="pl-9 h-10 bg-[#FBF8F3] border-[#E6DFD2] text-sm"
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
        <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD2]/60 text-xs">
          <div className="flex items-center gap-4">
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
            {transactions.length} recorded items
          </span>
        </div>
      </div>

      {/* TABLE ON DESKTOP / CARDS ON MOBILE / EMPTY STATE */}
      {transactions.length > 0 ? (
        <div className="bg-white border border-[#E6DFD2] rounded-[14px] overflow-hidden shadow-xs">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-xs text-left">
            <caption className="sr-only">Detailed activity ledger transactions</caption>
            <thead>
              <tr className="bg-[#FBF8F3] text-[#5E5A52] border-b border-[#E6DFD2]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Tag</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Transactions mapped in Stage 2 */}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<ReceiptText className="w-6 h-6 text-[#5E5A52]" />}
          title="No transactions logged yet"
          description="Your activity ledger tracks real expenses and incoming money to compute your daily burn rate."
          action={
            <Button className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Log First Expense</span>
            </Button>
          }
        />
      )}
    </div>
  )
}
export default Activity
