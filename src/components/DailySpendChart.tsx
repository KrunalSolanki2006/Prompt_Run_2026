import React, { useState } from 'react'
import type { ISODate } from '@/engine/types'
import { formatINR, formatDateShort } from '@/lib/format'
import { EmptyState } from './EmptyState'
import { BarChart3, Table as TableIcon, BarChart2 } from 'lucide-react'

export interface DailySpendPoint {
  date: ISODate
  spent: number
  allowance: number
}

interface DailySpendChartProps {
  data: DailySpendPoint[]
  title?: string
  height?: number
  className?: string
}

export const DailySpendChart: React.FC<DailySpendChartProps> = ({
  data,
  title = 'Daily Spend vs Allowance',
  height = 200,
  className = '',
}) => {
  const [showTable, setShowTable] = useState(false)

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white border border-[#E6DFD2] rounded-[14px] p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            {title}
          </h3>
        </div>
        <EmptyState
          icon={<BarChart3 className="w-5 h-5" />}
          title="No spending logged"
          description="Log daily expenses to compare actual burn against your calculated daily allowance."
          receiptBorder={false}
        />
      </div>
    )
  }

  const maxSpend = Math.max(...data.map((d) => d.spent), ...data.map((d) => d.allowance), 500)
  const padding = { top: 20, right: 15, bottom: 30, left: 45 }
  const width = 500
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const barWidth = Math.max(Math.min(plotWidth / data.length - 4, 24), 6)

  const getY = (val: number) => {
    return padding.top + plotHeight * (1 - Math.min(val / maxSpend, 1))
  }

  return (
    <div className={`bg-white border border-[#E6DFD2] rounded-[14px] p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div>
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            {title}
          </h3>
          <p className="text-xs text-[#5E5A52]">
            Bars: actual spend · Dashed line: daily target allowance
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FBF8F3] hover:bg-[#E6DFD2]/60 text-[#16140F] border border-[#E6DFD2] transition-colors"
          aria-expanded={showTable}
          aria-controls="spend-table-view"
        >
          {showTable ? (
            <>
              <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View chart</span>
            </>
          ) : (
            <>
              <TableIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View as table</span>
            </>
          )}
        </button>
      </div>

      {showTable ? (
        <div id="spend-table-view" className="overflow-x-auto max-h-60 mt-2">
          <table className="w-full text-xs text-left border-collapse">
            <caption className="sr-only">Daily spend log vs allowance</caption>
            <thead>
              <tr className="border-b border-[#E6DFD2] bg-[#FBF8F3] text-[#5E5A52]">
                <th className="py-2 px-3 font-semibold">Date</th>
                <th className="py-2 px-3 font-semibold text-right">Spent</th>
                <th className="py-2 px-3 font-semibold text-right">Allowance</th>
                <th className="py-2 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const over = row.spent > row.allowance
                return (
                  <tr key={row.date} className="border-b border-[#E6DFD2]/50 hover:bg-[#FBF8F3]/50">
                    <td className="py-1.5 px-3 font-medium text-[#16140F]">{formatDateShort(row.date)}</td>
                    <td className="py-1.5 px-3 text-right font-semibold tabular-nums text-[#16140F]">
                      {formatINR(row.spent)}
                    </td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-[#5E5A52]">
                      {formatINR(row.allowance)}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          over ? 'bg-[#C2410C]/10 text-[#C2410C]' : 'bg-[#1D7A53]/10 text-[#1D7A53]'
                        }`}
                      >
                        {over ? 'Over' : 'Within'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            role="img"
            aria-label="Daily spend vs allowance chart"
          >
            {/* Allowance reference line */}
            {data[0] && (
              <>
                <line
                  x1={padding.left}
                  y1={getY(data[0].allowance)}
                  x2={width - padding.right}
                  y2={getY(data[0].allowance)}
                  stroke="#5E5A52"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text
                  x={width - padding.right}
                  y={getY(data[0].allowance) - 4}
                  textAnchor="end"
                  className="text-[10px] fill-[#5E5A52] font-semibold tabular-nums"
                >
                  Allowance {formatINR(data[0].allowance)}
                </text>
              </>
            )}

            {/* Zero Axis */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#E6DFD2"
            />

            {/* Bars */}
            {data.map((d, i) => {
              const x = padding.left + (i / Math.max(data.length - 1, 1)) * (plotWidth - barWidth)
              const y = getY(d.spent)
              const barHeight = Math.max((height - padding.bottom) - y, 2)
              const isOver = d.spent > d.allowance

              return (
                <g key={d.date}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={isOver ? '#C2410C' : '#16140F'}
                  />
                  {/* Show date label on every nth bar if many points */}
                  {(data.length <= 10 || i % Math.ceil(data.length / 7) === 0) && (
                    <text
                      x={x + barWidth / 2}
                      y={height - 10}
                      textAnchor="middle"
                      className="text-[9px] fill-[#5E5A52]"
                    >
                      {formatDateShort(d.date)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </div>
  )
}
