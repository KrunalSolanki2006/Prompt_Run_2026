import React from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/EmptyState'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/engine/types'

interface RecentActivityCardProps {
  transactions: Transaction[]
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  transactions,
}) => {
  return (
    <div className="bg-white border border-[#E6DFD2] rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            Recent Activity
          </h3>
          <p className="text-xs text-[#5E5A52]">Latest transactions logged in this cycle</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-[#5E5A52]">
          <Link to="/app/activity">View All Activity</Link>
        </Button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title="No activity recorded yet"
          description="Use 'Add Transaction' to log expenses, income, or savings deposits."
          receiptBorder={false}
        />
      ) : (
        <div className="divide-y divide-[#E6DFD2]">
          {transactions.map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CategoryIcon category={t.category} size="sm" />
                <div>
                  <span className="text-xs font-bold text-[#16140F] block">
                    {t.note || t.category}
                  </span>
                  <span className="text-[11px] text-[#5E5A52]">
                    {t.date} · {t.tag.toUpperCase()}
                    {t.unexpected ? ' · Unexpected' : ''}
                  </span>
                </div>
              </div>

              <div className="font-['Bricolage_Grotesque_Variable'] font-bold text-sm tabular-nums">
                <span
                  className={
                    t.kind === 'income'
                      ? 'text-[#1D7A53]'
                      : 'text-[#16140F]'
                  }
                >
                  {t.kind === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
