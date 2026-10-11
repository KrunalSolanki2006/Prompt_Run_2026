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
import { ShieldCheck } from 'lucide-react'
import type { Decision } from '@/engine/types'

interface LabCommitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committableDecisions: Decision[]
  stressTestDecisions: Decision[]
  onConfirm: () => void
}

export const LabCommitDialog: React.FC<LabCommitDialogProps> = ({
  open,
  onOpenChange,
  committableDecisions,
  stressTestDecisions,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
        <DialogHeader>
          <DialogTitle className="font-['Bricolage_Grotesque_Variable'] text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1D7A53]" />
            <span>Commit Simulated Decisions</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#5E5A52]">
            The following committable items will be permanently written to your cycle record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <span className="text-xs font-bold text-[#16140F] block mb-2">
              Committable Actions:
            </span>
            <div className="space-y-2">
              {committableDecisions.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-lg bg-[#FBF8F3] border border-[#E6DFD2] text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-[#16140F] block">
                      {'label' in d ? d.label : 'name' in d ? d.name : d.type}
                    </span>
                    <span className="text-[11px] text-[#5E5A52]">Type: {d.type}</span>
                  </div>
                  <span className="font-bold text-[#16140F]">
                    {'amount' in d ? `₹${d.amount.toLocaleString('en-IN')}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {stressTestDecisions.length > 0 && (
            <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs space-y-1">
              <span className="font-bold text-[#A15C07] block">
                Excluded Stress Tests ({stressTestDecisions.length}):
              </span>
              <p className="text-[11px] text-[#5E5A52]">
                Stress test scenarios (surprise outlays, late income, pace shifts) are informational sandbox simulations and are NOT committed to permanent state.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs border-[#E6DFD2]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="text-xs font-bold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 px-4"
          >
            Confirm & Commit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
