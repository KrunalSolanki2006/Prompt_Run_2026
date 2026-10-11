import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowRight } from 'lucide-react'
import { formatRupees } from '@/lib/format'
import type { FinanceState, Snapshot } from '@/engine/types'

interface CycleCompletionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: FinanceState
  snapshot: Snapshot
  finalSpent: number
  finalSaved: number
  finalStatus: 'surplus' | 'balanced' | 'deficit'
  onConfirm: () => void
}

export const CycleCompletionModal: React.FC<CycleCompletionModalProps> = ({
  open,
  onOpenChange,
  state,
  snapshot,
  finalSpent,
  finalSaved,
  finalStatus,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[18px] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-[#A15C07]" />
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] text-lg font-bold text-[#16140F]">
              Archive 30-Day Cycle
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#5E5A52]">
            Verify your final metrics before closing this cycle and starting your next 30-day runway.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#5E5A52]">Cycle Duration:</span>
              <span className="font-semibold text-[#16140F]">
                {state.cycle?.startDate} → {snapshot.cycleEnd} (30 days)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5E5A52]">Starting Budget:</span>
              <span className="font-semibold text-[#16140F]">
                {formatRupees(state.cycle?.startingBalance ?? 10000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5E5A52]">Total Spent:</span>
              <span className="font-semibold text-[#16140F]">
                {formatRupees(finalSpent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5E5A52]">Saved in Goals:</span>
              <span className="font-bold text-[#1D7A53]">
                {formatRupees(finalSaved)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#E6DFD2] pt-2">
              <span className="font-semibold text-[#16140F]">Final Status:</span>
              <span className="font-bold uppercase tracking-wider text-xs">
                {finalStatus}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#5E5A52] space-y-1">
            <p className="font-semibold text-[#16140F]">What happens when you roll over?</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Cycle summary is archived permanently to your cycle history.</li>
              <li>Goal deposits are locked into each goal's starting principal.</li>
              <li>Recurring subscriptions & commitments advance into the next cycle.</li>
              <li>Discretionary transaction log resets for fresh daily allowance pacing.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 border-[#E6DFD2] text-xs font-semibold rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
          >
            Start Next Cycle
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#D4F23A]" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
