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
import type { Goal, GoalProjection } from '@/engine/types'
import { PiggyBank, Trash2, Plus } from 'lucide-react'

interface GoalsTabProps {
  goals: Goal[]
  goalProjections: GoalProjection[]
  walletBalance: number
  isAddOpen: boolean
  onCloseAdd: () => void
  onOpenAdd: () => void
  onAddGoal: (goal: Goal) => void
  onDeleteGoal: (id: string) => void
  onDepositToGoal: (goalId: string, amount: number) => void
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  goals,
  goalProjections,
  walletBalance,
  isAddOpen,
  onCloseAdd,
  onOpenAdd,
  onAddGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('5000')
  const [goalStarting, setGoalStarting] = useState('0')
  const [goalContribution, setGoalContribution] = useState('1000')
  const [goalPriority, setGoalPriority] = useState<1 | 2 | 3>(1)
  const [goalDeadline, setGoalDeadline] = useState('')

  const [depositGoal, setDepositGoal] = useState<Goal | null>(null)
  const [depositAmountStr, setDepositAmountStr] = useState('')

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(goalTarget, 10)
    if (!target || target <= 0) return

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      name: cleanText(goalName || 'Savings Goal'),
      targetAmount: target,
      startingSaved: parseInt(goalStarting, 10) || 0,
      cycleContribution: parseInt(goalContribution, 10) || 0,
      priority: goalPriority,
      deadline: goalDeadline || undefined,
      createdAt: new Date().toISOString(),
    }
    onAddGoal(newGoal)
    setGoalName('')
    onCloseAdd()
  }

  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositGoal) return
    const amount = parseInt(depositAmountStr, 10)
    if (!amount || amount <= 0 || amount > walletBalance) return

    onDepositToGoal(depositGoal.id, amount)
    setDepositGoal(null)
    setDepositAmountStr('')
  }

  return (
    <>
      {goals.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-6 h-6 text-[#1D7A53]" />}
          title="No savings goals established"
          description="Create milestone targets (emergency fund, travel, courses) to reserve savings during your 30-day cycle."
          action={
            <Button
              onClick={onOpenAdd}
              className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
            >
              Create First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const proj = goalProjections.find((p) => p.goalId === g.id)
            const currentSaved = proj?.saved ?? g.startingSaved
            const pct = Math.min(100, Math.round((currentSaved / g.targetAmount) * 100))

            return (
              <div
                key={g.id}
                className="bg-white border border-[#E6DFD2] rounded-xl p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-[#16140F]">{g.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#16140F] text-[#FBF8F3]">
                        P{g.priority}
                      </span>
                    </div>
                    <span className="text-xs text-[#5E5A52]">
                      Target: {formatRupees(g.targetAmount)} · Cycle Plan: {formatRupees(g.cycleContribution)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove goal "${g.name}"? Past deposits will remain in history.`)) {
                        onDeleteGoal(g.id)
                      }
                    }}
                    className="p-1.5 text-[#5E5A52] hover:text-[#B42318] transition-colors"
                    aria-label={`Delete ${g.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Saved: {formatRupees(currentSaved)}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#FBF8F3] border border-[#E6DFD2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#16140F] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6DFD2] flex justify-between items-center text-xs">
                  <span className="text-[#5E5A52]">
                    Status: <strong className="text-[#16140F] capitalize">{proj?.status.replace('_', ' ') ?? 'Active'}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setDepositGoal(g)
                      setDepositAmountStr('500')
                    }}
                    className="h-7 px-2.5 text-xs border-[#E6DFD2]"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span>Add Money</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Goal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && onCloseAdd()}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl">
              Create Savings Goal
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Ringfence contributions towards milestone savings targets.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Goal Name</Label>
              <Input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Emergency Moat / Certification"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Target Amount (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Cycle Plan (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={goalContribution}
                  onChange={(e) => setGoalContribution(e.target.value)}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Priority (1 = Highest)</Label>
                <select
                  value={goalPriority}
                  onChange={(e) => setGoalPriority(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                  className="w-full h-10 px-3 text-xs bg-[#FBF8F3] border border-[#E6DFD2] rounded-md"
                >
                  <option value={1}>Priority 1 (Crucial)</option>
                  <option value={2}>Priority 2 (Important)</option>
                  <option value={3}>Priority 3 (Discretionary)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Starting Saved (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={goalStarting}
                  onChange={(e) => setGoalStarting(e.target.value)}
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Target Deadline (Optional)</Label>
              <Input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl mt-2">
              Save Goal
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Goal Deposit Modal */}
      <Dialog open={depositGoal !== null} onOpenChange={(open) => !open && setDepositGoal(null)}>
        <DialogContent className="max-w-sm bg-white border-[#E6DFD2] rounded-2xl p-6 text-[#16140F]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-lg">
              Deposit to {depositGoal?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Transfer funds from liquid wallet (₹{walletBalance.toLocaleString('en-IN')}) to this goal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExecuteDeposit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Deposit Amount (₹)</Label>
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                max={walletBalance}
                value={depositAmountStr}
                onChange={(e) => setDepositAmountStr(e.target.value)}
                required
                className="bg-[#FBF8F3] border-[#E6DFD2] font-bold text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={parseInt(depositAmountStr, 10) > walletBalance}
              className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-xl"
            >
              Deposit Funds
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
