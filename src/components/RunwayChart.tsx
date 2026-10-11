import React, { useState } from 'react'
import type { ForecastPoint } from '@/engine/types'
import { formatINR, formatDateShort } from '@/lib/format'
import { EmptyState } from './EmptyState'
import { TrendingDown, Table as TableIcon, LineChart as ChartIcon } from 'lucide-react'

interface RunwayChartProps {
  points: ForecastPoint[]
  title?: string
  height?: number
  className?: string
}

export const RunwayChart: React.FC<RunwayChartProps> = ({
  points,
  title = '30-Day Runway Trajectory',
  height = 240,
  className = '',
}) => {
  const [showTable, setShowTable] = useState(false)

  if (!points || points.length === 0) {
    return (
      <div className={`bg-white border border-[#E6DFD2] rounded-[14px] p-5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            {title}
          </h3>
        </div>
        <EmptyState
          icon={<TrendingDown className="w-5 h-5" />}
          title="No runway data"
          description="Initialize your 30-day cycle to view projected daily cash balances and stress tests."
          receiptBorder={false}
        />
      </div>
    )
  }

  // Calculate SVG bounds
  const minExpected = Math.min(...points.map((p) => p.expected), ...points.map((p) => p.pessimistic), 0)
  const maxExpected = Math.max(...points.map((p) => p.expected), 10000)

  const padding = { top: 20, right: 20, bottom: 35, left: 55 }
  const chartWidth = 600
  const chartHeight = height
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const getY = (val: number) => {
    const range = maxExpected - minExpected || 1
    const normalized = (val - minExpected) / range
    return padding.top + plotHeight * (1 - normalized)
  }

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left
    return padding.left + (index / (points.length - 1)) * plotWidth
  }

  // Construct SVG paths
  const expectedPoints = points.map((p, i) => `${getX(i)},${getY(p.expected)}`).join(' ')
  const pessimisticPoints = points.map((p, i) => `${getX(i)},${getY(p.pessimistic)}`).join(' ')

  const areaPoints = `${getX(0)},${getY(minExpected)} ${expectedPoints} ${getX(points.length - 1)},${getY(minExpected)}`

  const zeroY = getY(0)

  return (
    <div className={`bg-white border border-[#E6DFD2] rounded-[14px] p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div>
          <h3 className="font-['Bricolage_Grotesque_Variable'] font-bold text-base text-[#16140F]">
            {title}
          </h3>
          <p className="text-xs text-[#5E5A52]">
            Solid line: expected burn · Dashed: pessimistic burn with stress tests
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FBF8F3] hover:bg-[#E6DFD2]/60 text-[#16140F] border border-[#E6DFD2] transition-colors"
          aria-expanded={showTable}
          aria-controls="runway-table-view"
        >
          {showTable ? (
            <>
              <ChartIcon className="w-3.5 h-3.5" aria-hidden="true" />
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
        <div id="runway-table-view" className="overflow-x-auto max-h-64 mt-2">
          <table className="w-full text-xs text-left border-collapse">
            <caption className="sr-only">Runway forecast daily projections</caption>
            <thead>
              <tr className="border-b border-[#E6DFD2] bg-[#FBF8F3] text-[#5E5A52]">
                <th className="py-2 px-3 font-semibold">Date</th>
                <th className="py-2 px-3 font-semibold text-right">Expected Balance</th>
                <th className="py-2 px-3 font-semibold text-right">Pessimistic Balance</th>
              </tr>
            </thead>
            <tbody>
              {points.map((pt) => (
                <tr key={pt.date} className="border-b border-[#E6DFD2]/50 hover:bg-[#FBF8F3]/50">
                  <td className="py-1.5 px-3 font-medium text-[#16140F]">{formatDateShort(pt.date)}</td>
                  <td className="py-1.5 px-3 text-right font-semibold tabular-nums text-[#16140F]">
                    {formatINR(pt.expected)}
                  </td>
                  <td className="py-1.5 px-3 text-right tabular-nums text-[#C2410C]">
                    {formatINR(pt.pessimistic)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto"
            role="img"
            aria-label="Runway cash flow trajectory chart across 30 days"
          >
            {/* Grid lines */}
            <line
              x1={padding.left}
              y1={getY(maxExpected)}
              x2={chartWidth - padding.right}
              y2={getY(maxExpected)}
              stroke="#E6DFD2"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 6}
              y={getY(maxExpected) + 4}
              textAnchor="end"
              className="text-[10px] fill-[#5E5A52] tabular-nums"
            >
              {formatINR(maxExpected)}
            </text>

            <line
              x1={padding.left}
              y1={getY(maxExpected / 2)}
              x2={chartWidth - padding.right}
              y2={getY(maxExpected / 2)}
              stroke="#E6DFD2"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 6}
              y={getY(maxExpected / 2) + 4}
              textAnchor="end"
              className="text-[10px] fill-[#5E5A52] tabular-nums"
            >
              {formatINR(Math.round(maxExpected / 2))}
            </text>

            {/* Zero line */}
            <line
              x1={padding.left}
              y1={zeroY}
              x2={chartWidth - padding.right}
              y2={zeroY}
              stroke="#16140F"
              strokeWidth="1.5"
            />
            <text
              x={padding.left - 6}
              y={zeroY + 4}
              textAnchor="end"
              className="text-[10px] fill-[#16140F] font-bold tabular-nums"
            >
              ₹0
            </text>

            {/* Area fill for expected */}
            <polygon points={areaPoints} fill="#16140F" fillOpacity="0.04" />

            {/* Pessimistic line */}
            <polyline
              points={pessimisticPoints}
              fill="none"
              stroke="#C2410C"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Expected line */}
            <polyline
              points={expectedPoints}
              fill="none"
              stroke="#16140F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Start & End Date Labels */}
            {points[0] && (
              <text
                x={padding.left}
                y={chartHeight - 10}
                className="text-[10px] fill-[#5E5A52] font-medium"
              >
                {formatDateShort(points[0].date)}
              </text>
            )}
            {points[points.length - 1] && (
              <text
                x={chartWidth - padding.right}
                y={chartHeight - 10}
                textAnchor="end"
                className="text-[10px] fill-[#5E5A52] font-medium"
              >
                {formatDateShort(points[points.length - 1]!.date)}
              </text>
            )}
          </svg>
        </div>
      )}
    </div>
  )
}
