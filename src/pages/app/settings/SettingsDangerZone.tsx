import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { AlertOctagon, RotateCcw, Trash2 } from 'lucide-react'

interface SettingsDangerZoneProps {
  userEmail: string | undefined
  onResetData: () => void
  onDeleteAccount: () => Promise<{ success: boolean; error?: string }>
}

export const SettingsDangerZone: React.FC<SettingsDangerZoneProps> = ({
  userEmail,
  onResetData,
  onDeleteAccount,
}) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteEmailInput, setDeleteEmailInput] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleExecuteReset = () => {
    onResetData()
    setConfirmResetOpen(false)
  }

  const handleExecuteDelete = async () => {
    setDeleteError(null)
    if (deleteEmailInput.trim().toLowerCase() !== userEmail?.toLowerCase()) {
      setDeleteError('Email confirmation does not match registered address.')
      return
    }

    const res = await onDeleteAccount()
    if (!res.success) {
      setDeleteError(res.error ?? 'Failed to delete account.')
    }
  }

  return (
    <>
      <section className="bg-white border border-[#B42318]/30 rounded-[16px] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#B42318]/20">
          <AlertOctagon className="w-4 h-4 text-[#B42318]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#B42318]">
            Danger Zone
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2]">
            <div>
              <span className="font-bold text-xs text-[#16140F] block">Reset Cycle Data</span>
              <span className="text-[11px] text-[#5E5A52]">
                Clears all transactions, commitments, and goals while preserving account credentials.
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setConfirmResetOpen(true)}
              className="h-8 text-xs text-[#C2410C] border-[#C2410C]/30 hover:bg-[#C2410C]/10 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Reset Data</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#B42318]/5 border border-[#B42318]/20">
            <div>
              <span className="font-bold text-xs text-[#B42318] block">Delete Account & Wipe Browser Data</span>
              <span className="text-[11px] text-[#5E5A52]">
                Permanently destroys local keys, session tokens, and cycle data from this browser.
              </span>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteEmailInput('')
                setDeleteError(null)
                setConfirmDeleteOpen(true)
              }}
              className="h-8 text-xs bg-[#B42318] text-white shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* CONFIRM RESET DIALOG */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-[#16140F]">
              Reset all cycle parameters?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              This removes all logged transactions, commitments, and goal records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmResetOpen(false)} className="border-[#E6DFD2] text-xs">
              Cancel
            </Button>
            <Button onClick={handleExecuteReset} className="bg-[#C2410C] text-white text-xs font-bold">
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG WITH EMAIL CONFIRMATION */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-[#B42318]">
              Delete account and purge site data?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              To confirm permanent deletion, please type your registered email address ({userEmail}):
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-2">
            <Input
              type="email"
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder={userEmail}
              className="bg-[#FBF8F3] border-[#E6DFD2] text-xs"
            />
            {deleteError && (
              <p className="text-xs font-semibold text-[#B42318]">{deleteError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} className="border-[#E6DFD2] text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleExecuteDelete}
              disabled={deleteEmailInput.trim().toLowerCase() !== userEmail?.toLowerCase()}
              className="bg-[#B42318] text-white text-xs font-bold"
            >
              Permanently Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
