import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinance } from '@/features/store/FinanceContext'
import { useToday } from '@/hooks/useToday'
import { CATEGORIES } from '@/engine/constants'
import type { CategoryId, Transaction } from '@/engine/types'
import { cleanText } from '@/lib/sanitize'
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  ShieldAlert,
} from 'lucide-react'

interface QuickAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TabKind = 'expense' | 'income' | 'goal_deposit'

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { state, snapshot, addTransaction } = useFinance()
  const today = useToday()

  const [activeTab, setActiveTab] = useState<TabKind>('expense')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<CategoryId>('food')
  const [note, setNote] = useState('')
  const [tag, setTag] = useState<'need' | 'want'>('need')
  const [unexpected, setUnexpected] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    state.goals[0]?.id ?? ''
  )
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const amount = parseInt(amountStr, 10)
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid amount in whole Rupees.')
      return
    }

    if (amount > 1000000) {
      setFormError('Amount exceeds maximum limit of ₹10,00,000.')
      return
    }

    if (activeTab === 'goal_deposit') {
      if (!selectedGoalId) {
        setFormError('Please select a target savings goal.')
        return
      }
      if (amount > snapshot.wallet) {
        setFormError(
          `Deposit exceeds available wallet balance (₹${snapshot.wallet.toLocaleString('en-IN')}).`
        )
        return
      }
    }

    const txnId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const txn: Transaction = {
      id: txnId,
      date: today,
      amount,
      kind: activeTab,
      category: activeTab === 'goal_deposit' ? 'savings' : category,
      note: cleanText(note || (activeTab === 'goal_deposit' ? 'Savings deposit' : activeTab === 'income' ? 'Income' : 'Expense')),
      tag,
      unexpected: activeTab === 'expense' ? unexpected : false,
      goalId: activeTab === 'goal_deposit' ? selectedGoalId : undefined,
    }

    addTransaction(txn)
    setAmountStr('')
    setNote('')
    setUnexpected(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
        <DialogHeader className="mb-2">
          <DialogTitle className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold">
            Log Transaction
          </DialogTitle>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-[#FBF8F3] border border-[#E6DFD2] p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('expense')
              setFormError(null)
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'expense'
                ? 'bg-[#16140F] text-[#FBF8F3] shadow-xs'
                : 'text-[#5E5A52] hover:text-[#16140F]'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#B42318]" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('income')
              setFormError(null)
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'income'
                ? 'bg-[#16140F] text-[#FBF8F3] shadow-xs'
                : 'text-[#5E5A52] hover:text-[#16140F]'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#1D7A53]" />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('goal_deposit')
              setFormError(null)
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'goal_deposit'
                ? 'bg-[#16140F] text-[#FBF8F3] shadow-xs'
                : 'text-[#5E5A52] hover:text-[#16140F]'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5 text-[#D4F23A]" />
            <span>Deposit</span>
          </button>
        </div>

        {formError && (
          <div
            className="p-3 mb-3 rounded-lg bg-[#B42318]/10 border border-[#B42318]/30 text-xs text-[#B42318] flex items-center gap-2"
            role="alert"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1">
            <Label htmlFor="qa-amount" className="text-xs font-semibold">
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-bold text-[#5E5A52]">
                ₹
              </span>
              <Input
                id="qa-amount"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                max="1000000"
                placeholder="e.g. 250"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="pl-8 h-11 text-base font-bold bg-[#FBF8F3] border-[#E6DFD2] rounded-xl tabular-nums"
                required
              />
            </div>
          </div>

          {/* Goal Selector for Deposit */}
          {activeTab === 'goal_deposit' && (
            <div className="space-y-1">
              <Label htmlFor="qa-goal" className="text-xs font-semibold">
                Target Savings Goal
              </Label>
              {state.goals.length === 0 ? (
                <p className="text-xs text-[#B42318]">
                  No active goals created. Add a goal in your Plan first.
                </p>
              ) : (
                <select
                  id="qa-goal"
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-xl text-[#16140F] focus:outline-none"
                >
                  {state.goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Target: ₹{g.targetAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Category for Expense and Income */}
          {activeTab !== 'goal_deposit' && (
            <div className="space-y-1">
              <Label htmlFor="qa-category" className="text-xs font-semibold">
                Category
              </Label>
              <select
                id="qa-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-xl text-[#16140F] focus:outline-none"
              >
                {CATEGORIES.filter((c) => c.id !== 'savings').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description / Note */}
          <div className="space-y-1">
            <Label htmlFor="qa-note" className="text-xs font-semibold">
              Note
            </Label>
            <Input
              id="qa-note"
              type="text"
              placeholder={
                activeTab === 'expense'
                  ? 'e.g. Lunch with team'
                  : activeTab === 'income'
                  ? 'e.g. Freelance advance'
                  : 'Goal deposit note'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-10 text-xs bg-[#FBF8F3] border-[#E6DFD2] rounded-xl"
            />
          </div>

          {/* Need / Want & Unexpected switches for expense */}
          {activeTab === 'expense' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2]">
                <div>
                  <span className="text-xs font-bold block text-[#16140F]">
                    Discretionary Classification
                  </span>
                  <span className="text-[11px] text-[#5E5A52]">
                    Helps monitor need vs want discipline
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white border border-[#E6DFD2] p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTag('need')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      tag === 'need'
                        ? 'bg-[#16140F] text-[#FBF8F3]'
                        : 'text-[#5E5A52]'
                    }`}
                  >
                    Need
                  </button>
                  <button
                    type="button"
                    onClick={() => setTag('want')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      tag === 'want'
                        ? 'bg-[#16140F] text-[#FBF8F3]'
                        : 'text-[#5E5A52]'
                    }`}
                  >
                    Want
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2]">
                <input
                  id="qa-unexpected-checkbox"
                  type="checkbox"
                  checked={unexpected}
                  onChange={(e) => setUnexpected(e.target.checked)}
                  className="mt-0.5 rounded text-[#16140F] focus:ring-[#16140F] cursor-pointer"
                />
                <label htmlFor="qa-unexpected-checkbox" className="cursor-pointer">
                  <span className="text-xs font-bold text-[#16140F] block">
                    Unexpected Expense (Emergency)
                  </span>
                  <span className="text-[11px] text-[#5E5A52] leading-tight block">
                    Draws directly from safety cushion without depleting daily allowance.
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 text-xs border-[#E6DFD2] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 text-xs font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 rounded-xl px-5"
            >
              Log Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
