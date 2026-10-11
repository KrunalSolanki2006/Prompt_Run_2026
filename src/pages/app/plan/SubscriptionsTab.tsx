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
import type { Subscription } from '@/engine/types'
import { CreditCard, Trash2, Pause, Play } from 'lucide-react'

interface SubscriptionsTabProps {
  subscriptions: Subscription[]
  today: string
  isAddOpen: boolean
  onCloseAdd: () => void
  onOpenAdd: () => void
  onAddSubscription: (sub: Subscription) => void
  onDeleteSubscription: (id: string) => void
  onToggleSubscription: (id: string) => void
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  subscriptions,
  today,
  isAddOpen,
  onCloseAdd,
  onOpenAdd,
  onAddSubscription,
  onDeleteSubscription,
  onToggleSubscription,
}) => {
  const [subName, setSubName] = useState('')
  const [subAmount, setSubAmount] = useState('299')
  const [subFreq, setSubFreq] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [subNextDate, setSubNextDate] = useState(today)

  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(subAmount, 10)
    if (!amount || amount <= 0) return

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      name: cleanText(subName || 'Digital Subscription'),
      amount,
      freq: subFreq,
      nextBillingDate: subNextDate,
      status: 'active',
    }
    onAddSubscription(newSub)
    setSubName('')
    onCloseAdd()
  }

  return (
    <>
      {subscriptions.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-6 h-6 text-[#A15C07]" />}
          title="No active subscriptions tracked"
          description="Log your streaming services, cloud storage, and gym memberships to track upcoming billing cycles."
          action={
            <Button
              onClick={onOpenAdd}
              className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
            >
              Track a Subscription
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`bg-white border rounded-xl p-4 flex justify-between items-start ${
                sub.status === 'paused'
                  ? 'border-[#E6DFD2]/60 opacity-60'
                  : 'border-[#E6DFD2]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-[#16140F]">{sub.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      sub.status === 'active'
                        ? 'bg-[#1D7A53]/10 text-[#1D7A53]'
                        : 'bg-[#5E5A52]/10 text-[#5E5A52]'
                    }`}
                  >
                    {sub.status.toUpperCase()}
                  </span>
                </div>
                <span className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F] block">
                  {formatRupees(sub.amount)}
                  <span className="text-xs font-normal text-[#5E5A52]">/{sub.freq}</span>
                </span>
                <span className="text-xs text-[#5E5A52]">
                  Next Billing: {sub.nextBillingDate}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleSubscription(sub.id)}
                  className="h-8 px-2 text-xs"
                  title={sub.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
                >
                  {sub.status === 'active' ? (
                    <Pause className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <Play className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>{sub.status === 'active' ? 'Pause' : 'Resume'}</span>
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove subscription "${sub.name}"?`)) {
                      onDeleteSubscription(sub.id)
                    }
                  }}
                  className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                  aria-label={`Delete ${sub.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && onCloseAdd()}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Track Digital Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Keep tabs on recurring entertainment, cloud, or fitness subscriptions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSubscription} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Service Name</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Music Stream"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Recurring Fee (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Billing Frequency</Label>
                <select
                  value={subFreq}
                  onChange={(e) => setSubFreq(e.target.value as 'weekly' | 'monthly' | 'yearly')}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Next Billing Date</Label>
              <Input
                type="date"
                value={subNextDate}
                onChange={(e) => setSubNextDate(e.target.value)}
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Track Subscription
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
