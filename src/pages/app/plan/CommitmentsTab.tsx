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
import { CATEGORIES } from '@/engine/constants'
import { cleanText } from '@/lib/sanitize'
import { formatRupees } from '@/lib/format'
import type { Commitment, CategoryId } from '@/engine/types'
import { Receipt, Trash2 } from 'lucide-react'

interface CommitmentsTabProps {
  commitments: Commitment[]
  today: string
  isAddOpen: boolean
  onCloseAdd: () => void
  onOpenAdd: () => void
  onAddCommitment: (commitment: Commitment) => void
  onDeleteCommitment: (id: string) => void
}

export const CommitmentsTab: React.FC<CommitmentsTabProps> = ({
  commitments,
  today,
  isAddOpen,
  onCloseAdd,
  onOpenAdd,
  onAddCommitment,
  onDeleteCommitment,
}) => {
  const [comLabel, setComLabel] = useState('')
  const [comAmount, setComAmount] = useState('1500')
  const [comCategory, setComCategory] = useState<CategoryId>('bills')
  const [comFreq, setComFreq] = useState<'once' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [comAnchor, setComAnchor] = useState(today)

  const handleSaveCommitment = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(comAmount, 10)
    if (!amount || amount <= 0) return

    const newCom: Commitment = {
      id: `com_${Date.now()}`,
      label: cleanText(comLabel || 'Fixed Bill'),
      amount,
      category: comCategory,
      recurrence: { freq: comFreq, anchor: comAnchor },
    }
    onAddCommitment(newCom)
    setComLabel('')
    onCloseAdd()
  }

  return (
    <>
      {commitments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-6 h-6 text-[#5E5A52]" />}
          title="No fixed commitments logged"
          description="Add fixed commitments like rent, loan EMIs, or utility bills so they are ring-fenced from daily allowance."
          action={
            <Button
              onClick={onOpenAdd}
              className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
            >
              Add First Commitment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {commitments.map((com) => (
            <div
              key={com.id}
              className="bg-white border border-[#E6DFD2] rounded-xl p-4 flex justify-between items-start"
            >
              <div>
                <span className="font-bold text-sm text-[#16140F] block mb-1">
                  {com.label}
                </span>
                <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] block">
                  {formatRupees(com.amount)}
                </span>
                <span className="text-xs text-[#5E5A52]">
                  {com.category.toUpperCase()} · {com.recurrence.freq} · Due: {com.recurrence.anchor}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove commitment "${com.label}"?`)) {
                    onDeleteCommitment(com.id)
                  }
                }}
                className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                aria-label={`Delete ${com.label}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Commitment Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && onCloseAdd()}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Add Fixed Commitment or EMI
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Ringfence non-negotiable fixed expenses from your daily discretionary spend.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCommitment} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Obligation Label</Label>
              <Input
                value={comLabel}
                onChange={(e) => setComLabel(e.target.value)}
                placeholder="e.g. WiFi Bill or Rent"
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
                  value={comAmount}
                  onChange={(e) => setComAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Category</Label>
                <select
                  value={comCategory}
                  onChange={(e) => setComCategory(e.target.value as CategoryId)}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  {CATEGORIES.filter((c) => c.id !== 'savings').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recurrence</Label>
                <select
                  value={comFreq}
                  onChange={(e) => setComFreq(e.target.value as 'once' | 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="once">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Due Date</Label>
                <Input
                  type="date"
                  value={comAnchor}
                  onChange={(e) => setComAnchor(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Save Commitment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
