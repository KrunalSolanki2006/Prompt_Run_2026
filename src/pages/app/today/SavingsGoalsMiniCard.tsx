import React from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { PiggyBank } from 'lucide-react'
import type { Goal, GoalProjection } from '@/engine/types'

interface SavingsGoalsMiniCardProps {
  goals: Goal[]
  goalProjections: GoalProjection[]
}

export const SavingsGoalsMiniCard: React.FC<SavingsGoalsMiniCardProps> = ({
  goals,
  goalProjections,
}) => {
  return (
    <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            Savings Goals
          </h3>
          <p className="text-xs text-[#5E5A52]">Ringfenced funds towards targets</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
          <Link to="/app/plan?tab=goals">View Goals</Link>
        </Button>
      </div>

      {goalProjections.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-5 h-5" />}
          title="No savings goals created"
          description="Set a goal (e.g. emergency moat, certification) to reserve cycle contributions."
          receiptBorder={false}
          action={
            <Button asChild size="sm" variant="outline" className="h-8 text-xs border-[#E6DFD2]">
              <Link to="/app/plan?tab=goals">Create First Goal</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {goalProjections.map((gProj) => {
            const goalDef = goals.find((g) => g.id === gProj.goalId)
            const pct = Math.min(
              100,
              Math.round((gProj.saved / Math.max(1, gProj.target)) * 100)
            )

            return (
              <div
                key={gProj.goalId}
                data-testid="metric-goal"
                className="p-3.5 rounded-xl bg-[#FBF8F3] border border-[#E6DFD2] space-y-2"
              >
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-[#16140F] block">
                      {goalDef?.name ?? 'Goal'}
                    </span>
                    <span className="text-[11px] text-[#5E5A52]">
                      Saved ₹{gProj.saved.toLocaleString('en-IN')} of ₹{gProj.target.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#16140F] tabular-nums">
                    {pct}%
                  </span>
                </div>

                <div className="h-2 w-full bg-white border border-[#E6DFD2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16140F] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-[#5E5A52]">
                  <span>Cycle plan: ₹{goalDef?.cycleContribution.toLocaleString('en-IN') ?? 0}</span>
                  <span className="font-semibold text-[#16140F]">
                    Status: {gProj.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
