import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  User,
  Sliders,
  Database,
  AlertOctagon,
  LogOut,
  Download,
  Upload,
  RotateCcw,
  Trash2,
} from 'lucide-react'

export const Settings: React.FC = () => {
  useDocumentTitle('Settings')
  const navigate = useNavigate()

  const [name, setName] = useState('Alex Sharma')
  const [bufferPercent, setBufferPercent] = useState('10')
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleExportJSON = () => {
    // STAGE-2: Export complete FinanceState as JSON file
  }

  const handleResetData = () => {
    // STAGE-2: Reset transactions, commitments, and goals
    setConfirmResetOpen(false)
  }

  const handleDeleteAccount = () => {
    // STAGE-2: Wipe local account and all state from localStorage
    setConfirmDeleteOpen(false)
    navigate('/')
  }

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Settings & Data Management"
        subtitle="Manage your profile, cycle parameters, local backups, and privacy controls."
      />

      {/* SECTION 1: PROFILE */}
      <section className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E6DFD2]">
          <User className="w-4 h-4 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
            Profile Credentials
          </h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="settings-name" className="text-xs font-semibold text-[#16140F]">
              Display Name
            </Label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#FBF8F3] border-[#E6DFD2]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="settings-email" className="text-xs font-semibold text-[#16140F]">
              Email Address (Local Only)
            </Label>
            <Input
              id="settings-email"
              disabled
              value="alex@example.com"
              className="bg-[#FBF8F3] border-[#E6DFD2] opacity-75 cursor-not-allowed"
            />
            <p className="text-[11px] text-[#5E5A52]">
              Account credentials persist strictly in this browser.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: CYCLE SETTINGS */}
      <section className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E6DFD2]">
          <Sliders className="w-4 h-4 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
            Active Cycle Configuration
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#5E5A52]">Starting Budget:</span>
            <span className="font-['Bricolage_Grotesque_Variable'] font-bold text-[#16140F] text-sm tabular-nums">
              ₹10,000 (30 Days)
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="settings-buffer" className="text-xs font-semibold text-[#16140F]">
                Safety Buffer Percentage
              </Label>
              <span className="text-xs font-bold text-[#16140F] bg-[#D4F23A] px-2 py-0.5 rounded">
                {bufferPercent}% (~₹1,000)
              </span>
            </div>
            <Input
              id="settings-buffer"
              type="number"
              min="0"
              max="50"
              value={bufferPercent}
              onChange={(e) => setBufferPercent(e.target.value)}
              className="bg-[#FBF8F3] border-[#E6DFD2]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: DATA MANAGEMENT */}
      <section className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E6DFD2]">
          <Database className="w-4 h-4 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
            Data Export & Backup
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleExportJSON}
            className="flex-1 h-10 border-[#E6DFD2] text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (JSON)</span>
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-10 border-[#E6DFD2] text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
          </Button>
        </div>
      </section>

      {/* SECTION 4: DANGER ZONE */}
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
                Clears all transactions, commitments, and goals while preserving account.
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
                Permanently destroys local keys, session tokens, and cycle snapshots.
              </span>
            </div>
            <Button
              variant="destructive"
              onClick={() => setConfirmDeleteOpen(true)}
              className="h-8 text-xs bg-[#B42318] text-white shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </section>

      {/* SIGN OUT */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={() => {
            // STAGE-2: Sign out and clear session
            navigate('/sign-in')
          }}
          className="w-full h-11 border-[#E6DFD2] text-[#B42318] hover:bg-[#B42318]/10 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Current Session</span>
        </Button>
      </div>

      {/* CONFIRM RESET DIALOG */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
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
            <Button onClick={handleResetData} className="bg-[#C2410C] text-white text-xs font-bold">
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg text-[#B42318]">
              Delete account and purge site data?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Permanently purges all records stored in this browser's localStorage. You will be redirected to the landing page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} className="border-[#E6DFD2] text-xs">
              Cancel
            </Button>
            <Button onClick={handleDeleteAccount} className="bg-[#B42318] text-white text-xs font-bold">
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default Settings
