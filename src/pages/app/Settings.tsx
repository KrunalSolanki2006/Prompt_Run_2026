import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/features/auth/AuthContext'
import { useFinance } from '@/features/store/FinanceContext'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SettingsDangerZone } from './settings/SettingsDangerZone'
import { formatRupees } from '@/lib/format'
import {
  User,
  Sliders,
  Database,
  LogOut,
  Download,
  Upload,
  RotateCcw,
  Check,
} from 'lucide-react'

export const Settings: React.FC = () => {
  useDocumentTitle('Settings')
  const navigate = useNavigate()
  const { user, signOut, deleteAccount } = useAuth()
  const { state, updateCycle, resetData, exportJSON, importJSON } = useFinance()

  const [bufferPercent, setBufferPercent] = useState(
    String(state.cycle?.bufferPercent ?? 10)
  )
  const [budgetAmount, setBudgetAmount] = useState(
    String(state.cycle?.startingBalance ?? 10000)
  )
  const [cycleSavedFeedback, setCycleSavedFeedback] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveCycleSettings = (e: React.FormEvent) => {
    e.preventDefault()
    const buf = parseInt(bufferPercent, 10)
    const bud = parseInt(budgetAmount, 10)

    if (isNaN(buf) || buf < 0 || buf > 30 || isNaN(bud) || bud < 1 || bud > 1000000) {
      return
    }

    updateCycle({
      bufferPercent: buf,
      startingBalance: bud,
    })

    setCycleSavedFeedback(true)
    setTimeout(() => setCycleSavedFeedback(false), 2500)
  }

  const handleExportJSON = () => {
    const dataStr = exportJSON()
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `runway-backup-${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const res = importJSON(text)
      if (!res.success) {
        setImportError(res.error ?? 'Failed to import JSON file.')
      } else {
        alert('Data backup successfully restored!')
      }
    }
    reader.readAsText(file)
  }

  const handleDeleteAccountConfirm = async () => {
    if (!user) return { success: false, error: 'Not logged in.' }
    const res = await deleteAccount(user.email)
    if (res.success) {
      navigate('/', { replace: true })
    }
    return res
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
              disabled
              value={user?.name ?? 'User'}
              className="bg-[#FBF8F3] border-[#E6DFD2] text-xs font-semibold opacity-80"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="settings-email" className="text-xs font-semibold text-[#16140F]">
              Email Address
            </Label>
            <Input
              id="settings-email"
              disabled
              value={user?.email ?? 'user@example.com'}
              className="bg-[#FBF8F3] border-[#E6DFD2] text-xs font-semibold opacity-80"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs text-[#5E5A52]">
            <p>
              Your credentials are securely hashed locally with PBKDF2-SHA256 and salted per-account. No passwords ever leave your machine.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: CYCLE PREFERENCES */}
      {state.cycle && (
        <section className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD2]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#16140F]" />
              <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
                30-Day Cycle Parameters
              </h2>
            </div>
            {cycleSavedFeedback && (
              <span className="text-xs font-semibold text-[#1D7A53] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCycleSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="settings-budget" className="text-xs font-semibold text-[#16140F]">
                  Cycle Budget (₹)
                </Label>
                <Input
                  id="settings-budget"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="1000000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="settings-buffer" className="text-xs font-semibold text-[#16140F]">
                  Safety Buffer (0%–30%)
                </Label>
                <Input
                  id="settings-buffer"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="30"
                  value={bufferPercent}
                  onChange={(e) => setBufferPercent(e.target.value)}
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[#5E5A52] pt-1">
              <span>
                Cycle Start Date: <strong className="text-[#16140F]">{state.cycle.startDate}</strong> (30 days)
              </span>
              <Button type="submit" size="sm" className="bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg h-8">
                Update Parameters
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* SECTION 2B: CYCLE HISTORY ARCHIVE */}
      {state.cycleHistory.length > 0 && (
        <section className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E6DFD2]">
            <RotateCcw className="w-4 h-4 text-[#16140F]" />
            <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
              Archived Cycle History ({state.cycleHistory.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {state.cycleHistory.map((h, idx) => (
              <div
                key={h.cycleId || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] text-xs"
              >
                <div>
                  <span className="font-bold text-[#16140F] block">
                    {h.startDate} → {h.endDate}
                  </span>
                  <span className="text-[#5E5A52] text-[11px]">
                    Spent: {formatRupees(h.totalSpent)} · Saved in Goals: {formatRupees(h.totalSaved)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      h.finalStatus === 'surplus'
                        ? 'bg-[#1D7A53]/15 text-[#1D7A53]'
                        : h.finalStatus === 'balanced'
                        ? 'bg-[#D4F23A] text-[#16140F]'
                        : 'bg-[#B42318]/15 text-[#B42318]'
                    }`}
                  >
                    {h.finalStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: DATA MANAGEMENT */}
      <section className="bg-white border border-[#E6DFD2] rounded-[16px] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E6DFD2]">
          <Database className="w-4 h-4 text-[#16140F]" />
          <h2 className="font-['Bricolage_Grotesque_Variable'] text-base font-bold text-[#16140F]">
            Data Export & Backup
          </h2>
        </div>

        {importError && (
          <p className="text-xs font-semibold text-[#B42318]">{importError}</p>
        )}

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
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-10 border-[#E6DFD2] text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Backup (JSON)</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </section>

      {/* SECTION 4: DANGER ZONE */}
      <SettingsDangerZone
        userEmail={user?.email}
        onResetData={resetData}
        onDeleteAccount={handleDeleteAccountConfirm}
      />

      {/* SIGN OUT */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={() => {
            signOut()
            navigate('/sign-in')
          }}
          className="w-full h-11 border-[#E6DFD2] text-[#B42318] hover:bg-[#B42318]/10 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Current Session</span>
        </Button>
      </div>
    </div>
  )
}

export default Settings
