import React, { useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cleanText } from '@/lib/sanitize'
import { formatRupees } from '@/lib/format'
import type { IncomeSource } from '@/engine/types'
import { ArrowDownLeft, Trash2 } from 'lucide-react'

interface IncomesTabProps {
  incomes: IncomeSource[]
  today: string
  isAddOpen: boolean
  onCloseAdd: () => void
  onOpenAdd: () => void
  onAddIncome: (income: IncomeSource) => void
  onDeleteIncome: (id: string) => void
}

export const IncomesTab: React.FC<IncomesTabProps> = ({
  incomes,
  today,
  isAddOpen,
  onCloseAdd,
  onOpenAdd,
  onAddIncome,
  onDeleteIncome,
}) => {
  const [incLabel, setIncLabel] = useState('')
  const [incAmount, setIncAmount] = useState('3000')
  const [incFreq, setIncFreq] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [incAnchor, setIncAnchor] = useState(today)
  const [incCertainty, setIncCertainty] = useState<'confirmed' | 'likely'>('confirmed')

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(incAmount, 10)
    if (!amount || amount <= 0) return

    const newInc: IncomeSource = {
      id: `inc_${Date.now()}`,
      label: cleanText(incLabel || 'Income Source'),
      amount,
      recurrence: { freq: incFreq, anchor: incAnchor },
      certainty: incCertainty,
    }
    onAddIncome(newInc)
    setIncLabel('')
    onCloseAdd()
  }

  return (
    <>
      {incomes.length === 0 ? (
        <EmptyState
          icon={<ArrowDownLeft className="w-6 h-6 text-[#1D7A53]" />}
          title="No income sources configured"
          description="Add your salary, freelance gigs, or allowances to incorporate predictable cash inflows."
          action={
            <Button
              onClick={onOpenAdd}
              className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
            >
              Add First Income Source
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomes.map((inc) => (
            <div
              key={inc.id}
              className="bg-white border border-[#E6DFD2] rounded-xl p-4 flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-[#16140F]">{inc.label}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      inc.certainty === 'confirmed'
                        ? 'bg-[#1D7A53]/10 text-[#1D7A53]'
                        : 'bg-[#A15C07]/10 text-[#A15C07]'
                    }`}
                  >
                    {inc.certainty}
                  </span>
                </div>
                <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] block">
                  +{formatRupees(inc.amount)}
                </span>
                <span className="text-xs text-[#5E5A52]">
                  Recurrence: {inc.recurrence.freq} · Anchor: {inc.recurrence.anchor}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove income "${inc.label}"?`)) {
                    onDeleteIncome(inc.id)
                  }
                }}
                className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                aria-label={`Delete ${inc.label}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Income Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && onCloseAdd()}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Add Income Stream
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Record anticipated or confirmed income to incorporate into your cash flow.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveIncome} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Label / Employer</Label>
              <Input
                value={incLabel}
                onChange={(e) => setIncLabel(e.target.value)}
                placeholder="e.g. Freelance Stipend"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Amount (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Certainty</Label>
                <select
                  value={incCertainty}
                  onChange={(e) => setIncCertainty(e.target.value as 'confirmed' | 'likely')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="likely">Likely</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recurrence</Label>
                <select
                  value={incFreq}
                  onChange={(e) => setIncFreq(e.target.value as 'once' | 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="once">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Date Expected</Label>
                <Input
                  type="date"
                  value={incAnchor}
                  onChange={(e) => setIncAnchor(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Save Income
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
