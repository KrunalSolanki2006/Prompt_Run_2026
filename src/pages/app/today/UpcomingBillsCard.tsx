import React from 'react'
import { Link } from 'react-router'
import { Money } from '@/components/Money'
import { EmptyState } from '@/components/EmptyState'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Clock, Check } from 'lucide-react'
import type { Occurrence } from '@/engine/occurrences'

interface UpcomingBillsCardProps {
  occurrences: Occurrence[]
  onSettle: (occ: Occurrence) => void
}

export const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({
  occurrences,
  onSettle,
}) => {
  return (
    <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            Coming Up
          </h3>
          <p className="text-xs text-[#5E5A52]">Next 7 days & overdue obligations</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
          <Link to="/app/plan">Manage Plan</Link>
        </Button>
      </div>

      {occurrences.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-5 h-5" />}
          title="No upcoming obligations"
          description="Add fixed bills, EMIs, or subscriptions in your Plan to see upcoming due dates."
          receiptBorder={false}
          action={
            <Button asChild size="sm" variant="outline" className="h-8 text-xs border-[#E6DFD2]">
              <Link to="/app/plan?tab=commitments">Add Commitment</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {occurrences.map((occ) => (
            <div
              key={occ.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                occ.overdue || occ.late
                  ? 'bg-[#B42318]/5 border-[#B42318]/30'
                  : 'bg-[#FBF8F3] border-[#E6DFD2]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={occ.category ?? 'bills'} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#16140F] truncate">
                      {occ.label}
                    </span>
                    {occ.overdue && (
                      <span className="text-[10px] font-bold text-[#B42318] bg-[#B42318]/10 px-1.5 py-0.2 rounded">
                        Overdue
                      </span>
                    )}
                    {occ.late && (
                      <span className="text-[10px] font-bold text-[#A15C07] bg-[#A15C07]/10 px-1.5 py-0.2 rounded">
                        Late
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#5E5A52] block">
                    Due: {occ.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="font-['Bricolage_Grotesque_Variable'] font-bold text-xs tabular-nums text-[#16140F]">
                  <Money amount={occ.amount} />
                </span>
                <Button
                  size="sm"
                  onClick={() => onSettle(occ)}
                  className="h-7 px-2 sm:px-2.5 text-[11px] font-semibold bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/85 rounded-lg"
                >
                  <Check className="w-3 h-3 mr-1 text-[#D4F23A] shrink-0" />
                  <span>
                    <span className="hidden sm:inline">Mark </span>
                    {occ.type === 'income' ? 'Received' : 'Paid'}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
