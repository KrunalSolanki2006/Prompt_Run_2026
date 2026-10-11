import type {
  ISODate,
  Rupees,
  FinanceState,
  Snapshot,
  Decision,
  GoalProjection,
  ForecastPoint,
  Driver,
  HealthComponent,
  RiskLevel,
  Transaction,
  Commitment,
  Subscription,
} from './types'
import {
  diffDays,
  addDays,
  isBefore,
  isAfter,
  cycleEndDate,
} from './dates'
import {
  generateOccurrences,
  Occurrence,
  OccurrenceOverrides,
} from './occurrences'
import {
  CYCLE_LENGTH_DAYS,
  RISK_WEIGHTS,
  HEALTH_WEIGHTS,
  FORECAST_CONSTANTS,
} from './constants'

export interface ScenarioDeltas {
  walletDelta: number
  allowanceDelta: number
  riskDelta: number
  healthDelta: number
  endExpectedDelta: number
}

export type ScenarioVerdict = 'comfortable' | 'manageable' | 'tight' | 'not_advisable'

export interface ScenarioEvaluation {
  before: Snapshot
  after: Snapshot
  deltas: ScenarioDeltas
  verdict: ScenarioVerdict
  reasons: string[]
}

interface ComputeOptions {
  occurrenceOverrides?: OccurrenceOverrides
  spendingChangePercent?: number
}

/**
 * Pure calculation engine for RUNWAY.
 * Produces an immutable Snapshot from state and date.
 */
export function computeSnapshot(
  state: FinanceState,
  asOf: ISODate,
  options?: ComputeOptions
): Snapshot {
  const { cycle } = state

  // If no cycle configured yet, return uninitialized baseline snapshot
  if (!cycle) {
    return createEmptySnapshot(asOf)
  }

  const cycleStart = cycle.startDate
  const cycleEnd = cycleEndDate(cycleStart)
  const D = CYCLE_LENGTH_DAYS

  // 1. Cycle dayNumber and daysLeft
  const isCycleCompleted = isAfter(asOf, cycleEnd)
  const effectiveAsOf = isCycleCompleted ? cycleEnd : asOf
  const cyclePhase = isCycleCompleted ? 'completed' : 'active'

  const rawDayNum = diffDays(cycleStart, effectiveAsOf) + 1
  const dayNumber = Math.max(1, Math.min(D, rawDayNum))
  const daysLeft = Math.max(1, D - dayNumber + 1) // includes today

  // 2. Generate occurrences in cycle
  const occurrences = generateOccurrences(
    state.incomes,
    state.commitments,
    state.subscriptions,
    cycleStart,
    cycleEnd,
    effectiveAsOf,
    state.transactions,
    options?.occurrenceOverrides
  )

  // 3. Wallet and Goal balances
  const pastTxns = state.transactions.filter((t) => !isAfter(t.date, effectiveAsOf))
  let incomeTxnTotal = 0
  let expenseTxnTotal = 0
  let goalDepositTxnTotal = 0
  let unexpectedExpenseTotal = 0
  let discretionarySpendToday = 0

  const goalDepositsMap = new Map<string, number>()

  for (const t of pastTxns) {
    if (t.kind === 'income') {
      incomeTxnTotal += t.amount
    } else if (t.kind === 'expense') {
      expenseTxnTotal += t.amount
      if (t.unexpected) {
        unexpectedExpenseTotal += t.amount
      } else if (!t.link) {
        if (t.date === effectiveAsOf) {
          discretionarySpendToday += t.amount
        }
      }
    } else if (t.kind === 'goal_deposit') {
      goalDepositTxnTotal += t.amount
      if (t.goalId) {
        goalDepositsMap.set(
          t.goalId,
          (goalDepositsMap.get(t.goalId) ?? 0) + t.amount
        )
      }
    }
  }

  const wallet = cycle.startingBalance + incomeTxnTotal - expenseTxnTotal - goalDepositTxnTotal
  let savedInGoals = 0
  for (const g of state.goals) {
    savedInGoals += g.startingSaved + (goalDepositsMap.get(g.id) ?? 0)
  }

  // 4. Buffer
  const bufferTarget = Math.round((cycle.startingBalance * cycle.bufferPercent) / 100)
  const bufferUsed = unexpectedExpenseTotal
  const bufferRemaining = Math.max(0, bufferTarget - bufferUsed)

  // 5. Obligations & Incomes upcoming
  let pendingObligations = 0
  let confirmedPendingIncome = 0
  let likelyPendingIncome = 0
  let overdueCount = 0
  let lateIncomeCount = 0

  for (const occ of occurrences) {
    if (occ.type === 'income') {
      if (occ.late) {
        lateIncomeCount++
      } else if (!occ.settled && !isBefore(occ.date, effectiveAsOf)) {
        if (occ.certainty === 'confirmed') {
          confirmedPendingIncome += occ.amount
        } else {
          likelyPendingIncome += occ.amount
        }
      }
    } else {
      // Commitment or Subscription
      if (!occ.settled) {
        pendingObligations += occ.amount
        if (occ.overdue) {
          overdueCount++
        }
      }
    }
  }

  // 6. PRIORITY WATERFALL
  // Cash available = wallet + confirmed pending income
  const cash = wallet + confirmedPendingIncome
  const obligationsFunded = Math.min(Math.max(0, cash), pendingObligations)
  const obligationShortfall = pendingObligations - obligationsFunded

  let pool = cash - pendingObligations

  let bufferFunded = 0
  if (pool > 0) {
    bufferFunded = Math.min(pool, bufferRemaining)
    pool -= bufferFunded
  }

  // Goal remaining plans sorted by priority (1 first), then createdAt
  const sortedGoals = [...state.goals].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.createdAt.localeCompare(b.createdAt)
  })

  const goalFundingMap = new Map<string, number>()
  let goalsFundedTotal = 0

  for (const g of sortedGoals) {
    const dep = goalDepositsMap.get(g.id) ?? 0
    const remPlan = Math.max(0, g.cycleContribution - dep)
    let funded = 0
    if (pool > 0 && remPlan > 0) {
      funded = Math.min(pool, remPlan)
      pool -= funded
    }
    goalFundingMap.set(g.id, funded)
    goalsFundedTotal += funded
  }

  // 7. Allowance
  const S = discretionarySpendToday
  const startOfDayAllowance = Math.floor(Math.max(0, pool + S) / daysLeft)
  const leftToday = startOfDayAllowance - S

  let allowanceStatus: 'ok' | 'overspent' | 'overcommitted' = 'ok'
  if (pool < 0 || obligationShortfall > 0) {
    allowanceStatus = 'overcommitted'
  } else if (leftToday < 0) {
    allowanceStatus = 'overspent'
  }

  // 8. Run Rate
  const completedDays = dayNumber - 1
  let runRate = startOfDayAllowance

  if (completedDays >= 1) {
    // Collect daily discretionary spends for completed days
    const dailySpends: number[] = []
    for (let i = 0; i < completedDays; i++) {
      const d = addDays(cycleStart, i)
      let daySpend = 0
      for (const t of pastTxns) {
        if (t.date === d && t.kind === 'expense' && !t.unexpected && !t.link) {
          daySpend += t.amount
        }
      }
      dailySpends.push(daySpend)
    }

    const observed = dailySpends.reduce((a, b) => a + b, 0) / dailySpends.length
    const last7Count = Math.min(FORECAST_CONSTANTS.rampDays, dailySpends.length)
    const last7Slice = dailySpends.slice(-last7Count)
    const last7 = last7Slice.reduce((a, b) => a + b, 0) / last7Slice.length

    const blended =
      FORECAST_CONSTANTS.observedWeight * observed +
      FORECAST_CONSTANTS.last7Weight * last7
    const w = Math.min(1, completedDays / FORECAST_CONSTANTS.rampDays)
    runRate = w * blended + (1 - w) * startOfDayAllowance
  }

  if (options?.spendingChangePercent !== undefined) {
    runRate = runRate * (1 + options.spendingChangePercent / 100)
  }

  // 9. Forecast
  let totalRemainingGoalPlan = 0
  for (const g of state.goals) {
    const dep = goalDepositsMap.get(g.id) ?? 0
    totalRemainingGoalPlan += Math.max(0, g.cycleContribution - dep)
  }
  const goalDrip = totalRemainingGoalPlan / daysLeft

  // Build occurrences by date lookup for fast iteration
  const occsByDate = new Map<ISODate, Occurrence[]>()
  for (const occ of occurrences) {
    const list = occsByDate.get(occ.date) ?? []
    list.push(occ)
    occsByDate.set(occ.date, list)
  }

  // Overdue obligations amount (assumed paid tomorrow)
  let overdueObligationsTotal = 0
  for (const occ of occurrences) {
    if (occ.type !== 'income' && !occ.settled && occ.overdue) {
      overdueObligationsTotal += occ.amount
    }
  }

  const forecastPoints: ForecastPoint[] = []
  let expectedBal = wallet
  let pessimisticBal = wallet
  let cashOutDate: ISODate | null = null
  let pessimisticCashOutDate: ISODate | null = null
  let minExpected = wallet

  // Day 0: effectiveAsOf
  forecastPoints.push({
    date: effectiveAsOf,
    expected: Math.round(expectedBal),
    pessimistic: Math.round(pessimisticBal),
  })

  const tomorrow = addDays(effectiveAsOf, 1)

  for (let i = 1; i <= daysLeft - 1; i++) {
    const d = addDays(effectiveAsOf, i)
    const dayOccs = occsByDate.get(d) ?? []

    let expInc = 0
    let pessInc = 0
    let obs = 0

    for (const occ of dayOccs) {
      if (!occ.settled) {
        if (occ.type === 'income') {
          if (occ.certainty === 'confirmed') {
            expInc += occ.amount
            pessInc += occ.amount
          } else {
            expInc += occ.amount
          }
        } else {
          obs += occ.amount
        }
      }
    }

    if (d === tomorrow) {
      obs += overdueObligationsTotal
    }

    expectedBal = expectedBal + expInc - obs - runRate - goalDrip
    pessimisticBal =
      pessimisticBal +
      pessInc -
      obs -
      runRate * FORECAST_CONSTANTS.pessimisticRunRateMultiplier -
      goalDrip

    if (expectedBal < 0 && cashOutDate === null) {
      cashOutDate = d
    }
    if (pessimisticBal < 0 && pessimisticCashOutDate === null) {
      pessimisticCashOutDate = d
    }
    if (expectedBal < minExpected) {
      minExpected = expectedBal
    }

    forecastPoints.push({
      date: d,
      expected: Math.round(expectedBal),
      pessimistic: Math.round(pessimisticBal),
    })
  }

  const lastPoint = forecastPoints[forecastPoints.length - 1]
  const endExpected = lastPoint ? lastPoint.expected : Math.round(expectedBal)
  const endPessimistic = lastPoint ? lastPoint.pessimistic : Math.round(pessimisticBal)

  // 10. Goals Projections
  const goalProjections: GoalProjection[] = state.goals.map((g) => {
    const dep = goalDepositsMap.get(g.id) ?? 0
    const saved = g.startingSaved + dep
    const target = g.targetAmount
    const remPlan = Math.max(0, g.cycleContribution - dep)
    const funded = goalFundingMap.get(g.id) ?? 0
    const fundedPercent = remPlan === 0 ? 100 : Math.round((funded / remPlan) * 100)
    const projectedSavedAtCycleEnd = saved + funded
    const ratePerDay = (dep + funded) / D

    let status: 'complete' | 'on_track' | 'behind' | 'unfunded' = 'behind'
    let estimatedCompletion: ISODate | null = null

    if (projectedSavedAtCycleEnd >= target) {
      status = 'complete'
      if (ratePerDay > 0 && target > saved) {
        const daysNeeded = Math.ceil((target - saved) / ratePerDay)
        estimatedCompletion = addDays(cycleStart, Math.min(D, daysNeeded) - 1)
      } else {
        estimatedCompletion = effectiveAsOf
      }
    } else if (ratePerDay > 0) {
      const daysNeededAfterEnd = Math.ceil(
        (target - projectedSavedAtCycleEnd) / ratePerDay
      )
      estimatedCompletion = addDays(cycleEnd, daysNeededAfterEnd)
      if (
        fundedPercent === 100 &&
        (!g.deadline || !isAfter(estimatedCompletion, g.deadline))
      ) {
        status = 'on_track'
      } else if (fundedPercent === 0 && remPlan > 0) {
        status = 'unfunded'
      } else {
        status = 'behind'
      }
    } else {
      estimatedCompletion = null
      status = fundedPercent === 0 && remPlan > 0 ? 'unfunded' : 'behind'
    }

    return {
      goalId: g.id,
      saved,
      target,
      remainingPlan: remPlan,
      funded,
      fundedPercent,
      projectedSavedAtCycleEnd,
      estimatedCompletion,
      status,
    }
  })

  // 11. RISK SCORE & DRIVERS
  const riskCalculation = calculateRisk(
    cycle.startingBalance,
    wallet,
    cash,
    pendingObligations,
    obligationShortfall,
    bufferRemaining,
    bufferTarget,
    runRate,
    startOfDayAllowance,
    minExpected,
    cashOutDate,
    pessimisticCashOutDate,
    likelyPendingIncome,
    confirmedPendingIncome
  )

  // 12. HEALTH SCORE & GRADE
  const healthCalculation = calculateHealth(
    state,
    cycle,
    effectiveAsOf,
    dayNumber,
    D,
    riskCalculation.score,
    bufferRemaining,
    bufferTarget,
    occurrences,
    goalDepositsMap
  )

  return {
    asOf: effectiveAsOf,
    dayNumber,
    daysLeft,
    cycleEnd,
    cyclePhase,
    wallet,
    savedInGoals,
    upcoming: {
      obligations: pendingObligations,
      confirmedIncome: confirmedPendingIncome,
      likelyIncome: likelyPendingIncome,
      overdueCount,
      lateIncomeCount,
    },
    allocation: {
      cash,
      obligationsFunded,
      obligationShortfall,
      bufferFunded,
      goalsFunded: goalsFundedTotal,
      pool,
    },
    buffer: {
      target: bufferTarget,
      used: bufferUsed,
      remaining: bufferRemaining,
    },
    allowance: {
      daily: startOfDayAllowance,
      spentToday: discretionarySpendToday,
      leftToday,
      status: allowanceStatus,
    },
    forecast: {
      runRate: Math.round(runRate),
      points: forecastPoints,
      endExpected,
      endPessimistic,
      cashOutDate,
      pessimisticCashOutDate,
      minExpected: Math.round(minExpected),
    },
    goals: goalProjections,
    risk: riskCalculation,
    health: healthCalculation,
  }
}

/**
 * Calculates deterministic Risk score (0–100) and top drivers.
 */
function calculateRisk(
  startingBalance: Rupees,
  wallet: number,
  cash: number,
  pendingObligations: number,
  obligationShortfall: number,
  bufferRemaining: number,
  bufferTarget: number,
  runRate: number,
  startOfDayAllowance: number,
  minExpected: number,
  cashOutDate: ISODate | null,
  pessimisticCashOutDate: ISODate | null,
  likelyPendingIncome: number,
  confirmedPendingIncome: number
): { score: number; level: RiskLevel; drivers: Driver[] } {
  // 1. Liquidity subscore (35)
  let liquidityScore = 0
  let liquidityDetail = 'Cash balance maintains safe distance from zero.'
  let liquidityAction = 'Continue tracking discretionary spending against daily target.'

  if (cashOutDate !== null) {
    liquidityScore = 100
    liquidityDetail = `Expected cash-out projected on ${cashOutDate}.`
    liquidityAction = 'Cut discretionary spending or postpone scheduled commitments.'
  } else if (pessimisticCashOutDate !== null) {
    liquidityScore = 75
    liquidityDetail = `Pessimistic cash-out projected on ${pessimisticCashOutDate}.`
    liquidityAction = 'Build a reserve buffer against variable income shortfall.'
  } else {
    const cushion = 0.25 * startingBalance
    const raw = (1 - minExpected / cushion) * 60
    liquidityScore = Math.max(0, Math.min(60, raw))
    if (liquidityScore > 30) {
      liquidityDetail = 'Projected low point dips near the 25% safety reserve threshold.'
      liquidityAction = 'Reduce planned non-essential purchases this week.'
    }
  }

  // 2. Pace subscore (25)
  const paceRatio = runRate / Math.max(1, startOfDayAllowance)
  let paceScore = 0
  let paceDetail = 'Daily discretionary pace is aligned with allowance.'
  let paceAction = 'Maintain current daily burn rate.'

  if (paceRatio >= 1.4) {
    paceScore = 100
    paceDetail = `Daily burn rate is ${(paceRatio * 100).toFixed(0)}% of daily allowance.`
    paceAction = 'Pause recreational spending for 48 hours to restore allowance.'
  } else if (paceRatio > 1.0) {
    paceScore = ((paceRatio - 1.0) / 0.4) * 100
    paceDetail = 'Spending run rate exceeds current daily target allowance.'
    paceAction = 'Lower discretionary daily spending to stay within cycle targets.'
  }

  // 3. Obligation load subscore (15)
  const obligationRatio = pendingObligations / Math.max(1, cash)
  let obligationScore = 0
  let obligationDetail = 'Fixed commitments consume a healthy share of cash.'
  let obligationAction = 'Obligations are adequately funded.'

  if (obligationRatio >= 0.9) {
    obligationScore = 100
    obligationDetail = `Fixed obligations consume ${(obligationRatio * 100).toFixed(0)}% of available cash.`
    obligationAction = 'Review recurring subscriptions and cancel unused services.'
  } else if (obligationRatio > 0.3) {
    obligationScore = ((obligationRatio - 0.3) / 0.6) * 100
    obligationDetail = 'Upcoming commitments account for significant portion of cash.'
    obligationAction = 'Prioritize essential bills before non-essential spending.'
  }

  // 4. Buffer subscore (15)
  let bufferScore = 0
  let bufferDetail = 'Safety buffer remains fully intact.'
  let bufferAction = 'Keep emergency buffer reserved for unforeseen expenses.'

  if (bufferTarget > 0) {
    bufferScore = Math.max(
      0,
      Math.min(100, (1 - bufferRemaining / bufferTarget) * 100)
    )
    if (bufferScore > 50) {
      bufferDetail = `Safety cushion has been drawn down to ₹${bufferRemaining.toLocaleString('en-IN')}.`
      bufferAction = 'Replenish safety buffer with upcoming surplus income.'
    }
  }

  // 5. Income dependency subscore (10)
  const totalExpectedInflow = wallet + confirmedPendingIncome + likelyPendingIncome
  const incDepRatio = likelyPendingIncome / Math.max(1, totalExpectedInflow)
  const incDepScore = Math.min(100, (incDepRatio / 0.3) * 100)
  const incDepDetail =
    incDepScore > 40
      ? 'High reliance on unconfirmed or variable freelance income.'
      : 'Cash flow relies predominantly on confirmed income.'
  const incDepAction =
    incDepScore > 40
      ? 'Defer non-essential purchases until income is settled in wallet.'
      : 'Maintain steady inflow verification.'

  // Total weighted score
  let rawScore =
    (liquidityScore * RISK_WEIGHTS.liquidity +
      paceScore * RISK_WEIGHTS.pace +
      obligationScore * RISK_WEIGHTS.obligationLoad +
      bufferScore * RISK_WEIGHTS.buffer +
      incDepScore * RISK_WEIGHTS.incomeDependency) /
    100

  // Critical Overrides:
  if (cashOutDate !== null) {
    rawScore = Math.max(60, rawScore)
  }
  if (obligationShortfall > 0) {
    rawScore = Math.max(80, rawScore)
  }

  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)))

  let level: RiskLevel = 'low'
  if (finalScore >= 75) {
    level = 'critical'
  } else if (finalScore >= 50) {
    level = 'high'
  } else if (finalScore >= 25) {
    level = 'moderate'
  }

  // Build drivers list
  const driversList: Driver[] = [
    {
      id: 'liquidity',
      label: 'Cash Runway Liquidity',
      impact: Math.round((liquidityScore * RISK_WEIGHTS.liquidity) / 100),
      detail: liquidityDetail,
      action: liquidityAction,
    },
    {
      id: 'pace',
      label: 'Discretionary Burn Pace',
      impact: Math.round((paceScore * RISK_WEIGHTS.pace) / 100),
      detail: paceDetail,
      action: paceAction,
    },
    {
      id: 'obligation',
      label: 'Fixed Commitments Load',
      impact: Math.round((obligationScore * RISK_WEIGHTS.obligationLoad) / 100),
      detail: obligationDetail,
      action: obligationAction,
    },
    {
      id: 'buffer',
      label: 'Safety Cushion Reserve',
      impact: Math.round((bufferScore * RISK_WEIGHTS.buffer) / 100),
      detail: bufferDetail,
      action: bufferAction,
    },
    {
      id: 'income',
      label: 'Variable Income Reliance',
      impact: Math.round((incDepScore * RISK_WEIGHTS.incomeDependency) / 100),
      detail: incDepDetail,
      action: incDepAction,
    },
  ]

  // Pick top 3 by impact
  driversList.sort((a, b) => b.impact - a.impact)
  const topDrivers = driversList.slice(0, 3)

  return {
    score: finalScore,
    level,
    drivers: topDrivers,
  }
}

/**
 * Calculates explainable Health score (0–100), components, and grade.
 */
function calculateHealth(
  state: FinanceState,
  cycle: NonNullable<FinanceState['cycle']>,
  asOf: ISODate,
  dayNumber: number,
  D: number,
  riskScore: number,
  bufferRemaining: number,
  bufferTarget: number,
  occurrences: Occurrence[],
  goalDepositsMap: Map<string, number>
): {
  score: number | null
  grade: 'strong' | 'steady' | 'shaky' | 'attention' | null
  components: HealthComponent[]
} {
  const hasTxns = state.transactions.length > 0
  const hasPlanItems =
    state.incomes.length > 0 ||
    state.commitments.length > 0 ||
    state.subscriptions.length > 0 ||
    state.goals.length > 0

  if (!hasTxns && !hasPlanItems) {
    return {
      score: null,
      grade: null,
      components: [],
    }
  }

  const completedDays = dayNumber - 1

  // 1. Budget Adherence (25)
  let adherenceScore: number | null = null
  let adherenceDetail = 'Requires completed cycle days to measure consistency.'
  if (completedDays >= 1) {
    // Check adherence: replay allowance vs discretionary spend for completed days
    let adherentDays = 0
    for (let i = 0; i < completedDays; i++) {
      const pastDate = addDays(cycle.startDate, i)
      // compute snapshot as of pastDate with transactions before pastDate
      const subState: FinanceState = {
        ...state,
        transactions: state.transactions.filter((t) => isBefore(t.date, pastDate)),
      }
      const daySnap = computeSnapshot(subState, pastDate)
      const allowed = daySnap.allowance.daily

      let dayActualSpend = 0
      for (const t of state.transactions) {
        if (t.date === pastDate && t.kind === 'expense' && !t.unexpected && !t.link) {
          dayActualSpend += t.amount
        }
      }

      if (dayActualSpend <= allowed) {
        adherentDays++
      }
    }
    adherenceScore = Math.round((adherentDays / completedDays) * 100)
    adherenceDetail = `${adherentDays} of ${completedDays} completed days stayed within daily allowance.`
  }

  // 2. Outlook (20)
  const outlookScore = Math.max(0, 100 - riskScore)
  const outlookDetail = `Inverse of financial risk score (${riskScore}/100).`

  // 3. Buffer Protection (15)
  let bufferScore: number | null = null
  let bufferDetail = 'Buffer percentage is unconfigured.'
  if (bufferTarget > 0) {
    bufferScore = Math.round(
      Math.max(0, Math.min(100, (bufferRemaining / bufferTarget) * 100))
    )
    bufferDetail = `₹${bufferRemaining.toLocaleString('en-IN')} remaining of ₹${bufferTarget.toLocaleString('en-IN')} target.`
  }

  // 4. Goal Progress (15)
  let goalScore: number | null = null
  let goalDetail = 'No active savings goals configured.'
  const plannedGoals = state.goals.filter((g) => g.cycleContribution > 0)
  if (plannedGoals.length > 0) {
    let sumProgress = 0
    for (const g of plannedGoals) {
      const dep = goalDepositsMap.get(g.id) ?? 0
      const expectedAtCurrentDay = g.cycleContribution * (dayNumber / D)
      const prog = Math.min(1, dep / Math.max(1, expectedAtCurrentDay))
      sumProgress += prog
    }
    goalScore = Math.round((sumProgress / plannedGoals.length) * 100)
    goalDetail = `Tracking pacing across ${plannedGoals.length} savings goal targets.`
  }

  // 5. Bills on Time (15)
  let billsScore: number | null = null
  let billsDetail = 'No fixed commitments due yet in cycle.'
  const dueOutflows = occurrences.filter(
    (o) => o.type !== 'income' && !isAfter(o.date, asOf)
  )
  if (dueOutflows.length > 0) {
    let onTimeCount = 0
    for (const o of dueOutflows) {
      if (o.settled && o.settledByTxnId) {
        const txn = state.transactions.find((t) => t.id === o.settledByTxnId)
        if (txn && !isAfter(txn.date, o.date)) {
          onTimeCount++
        }
      }
    }
    billsScore = Math.round((onTimeCount / dueOutflows.length) * 100)
    billsDetail = `${onTimeCount} of ${dueOutflows.length} bills settled on or before due date.`
  }

  // 6. Subscription Load (10)
  let subScore: number | null = null
  let subDetail = 'No active recurring subscriptions.'
  let totalSubCost = 0
  for (const occ of occurrences) {
    if (occ.type === 'subscription') {
      totalSubCost += occ.amount
    }
  }
  const subRatio = totalSubCost / Math.max(1, cycle.startingBalance)
  if (subRatio <= 0.1) {
    subScore = 100
  } else if (subRatio >= 0.3) {
    subScore = 0
  } else {
    subScore = Math.round(((0.3 - subRatio) / 0.2) * 100)
  }
  subDetail = `Subscriptions account for ${(subRatio * 100).toFixed(1)}% of starting budget.`

  const components: HealthComponent[] = [
    {
      id: 'adherence',
      label: 'Budget Adherence',
      weight: HEALTH_WEIGHTS.budgetAdherence,
      score: adherenceScore,
      detail: adherenceDetail,
    },
    {
      id: 'outlook',
      label: 'Trajectory Outlook',
      weight: HEALTH_WEIGHTS.outlook,
      score: outlookScore,
      detail: outlookDetail,
    },
    {
      id: 'buffer',
      label: 'Buffer Protection',
      weight: HEALTH_WEIGHTS.bufferProtection,
      score: bufferScore,
      detail: bufferDetail,
    },
    {
      id: 'goals',
      label: 'Savings Goal Pacing',
      weight: HEALTH_WEIGHTS.goalProgress,
      score: goalScore,
      detail: goalDetail,
    },
    {
      id: 'bills',
      label: 'Bills Paid on Time',
      weight: HEALTH_WEIGHTS.billsOnTime,
      score: billsScore,
      detail: billsDetail,
    },
    {
      id: 'subscriptions',
      label: 'Subscription Load',
      weight: HEALTH_WEIGHTS.subscriptionLoad,
      score: subScore,
      detail: subDetail,
    },
  ]

  // Compute normalized score
  let weightedSum = 0
  let totalWeight = 0
  for (const comp of components) {
    if (comp.score !== null) {
      weightedSum += comp.score * comp.weight
      totalWeight += comp.weight
    }
  }

  if (totalWeight === 0) {
    return {
      score: null,
      grade: null,
      components,
    }
  }

  const finalScore = Math.round(weightedSum / totalWeight)

  let grade: 'strong' | 'steady' | 'shaky' | 'attention' = 'attention'
  if (finalScore >= 80) {
    grade = 'strong'
  } else if (finalScore >= 60) {
    grade = 'steady'
  } else if (finalScore >= 40) {
    grade = 'shaky'
  }

  return {
    score: finalScore,
    grade,
    components,
  }
}

/**
 * Creates an empty baseline snapshot when no cycle is active.
 */
function createEmptySnapshot(asOf: ISODate): Snapshot {
  return {
    asOf,
    dayNumber: 1,
    daysLeft: 30,
    cycleEnd: addDays(asOf, 29),
    cyclePhase: 'active',
    wallet: 0,
    savedInGoals: 0,
    upcoming: {
      obligations: 0,
      confirmedIncome: 0,
      likelyIncome: 0,
      overdueCount: 0,
      lateIncomeCount: 0,
    },
    allocation: {
      cash: 0,
      obligationsFunded: 0,
      obligationShortfall: 0,
      bufferFunded: 0,
      goalsFunded: 0,
      pool: 0,
    },
    buffer: {
      target: 0,
      used: 0,
      remaining: 0,
    },
    allowance: {
      daily: 0,
      spentToday: 0,
      leftToday: 0,
      status: 'ok',
    },
    forecast: {
      runRate: 0,
      points: [],
      endExpected: 0,
      endPessimistic: 0,
      cashOutDate: null,
      pessimisticCashOutDate: null,
      minExpected: 0,
    },
    goals: [],
    risk: {
      score: 0,
      level: 'low',
      drivers: [],
    },
    health: {
      score: null,
      grade: null,
      components: [],
    },
  }
}

/**
 * Pure state cloning and transformation for Decisions in Decision Lab.
 */
export function applyDecisions(
  state: FinanceState,
  decisions: Decision[],
  asOf: ISODate
): {
  state: FinanceState
  overrides?: OccurrenceOverrides
  spendingChangePercent?: number
} {
  // Deep clone state
  const nextState: FinanceState = JSON.parse(JSON.stringify(state))
  const overrides: OccurrenceOverrides = {}
  let spendingChangePercent: number | undefined

  for (const d of decisions) {
    if (d.type === 'purchase') {
      if (!isAfter(d.date, asOf)) {
        // Purchase today or past: add immediate expense transaction
        const txn: Transaction = {
          id: `sim_txn_${d.id}`,
          date: d.date,
          amount: d.amount,
          kind: 'expense',
          category: d.category,
          note: d.label,
          tag: d.tag,
          unexpected: false,
        }
        nextState.transactions.push(txn)
      } else {
        // Purchase on a future date: adds a one-time commitment
        const com: Commitment = {
          id: `sim_com_${d.id}`,
          label: d.label,
          amount: d.amount,
          category: d.category,
          recurrence: {
            freq: 'once',
            anchor: d.date,
          },
        }
        nextState.commitments.push(com)
      }
    } else if (d.type === 'new_subscription') {
      const sub: Subscription = {
        id: `sim_sub_${d.id}`,
        name: d.name,
        amount: d.amount,
        freq: d.freq,
        nextBillingDate: d.firstBillingDate,
        status: 'active',
      }
      nextState.subscriptions.push(sub)
    } else if (d.type === 'cancel_subscription') {
      const target = nextState.subscriptions.find((s) => s.id === d.subscriptionId)
      if (target) {
        target.status = 'paused'
      }
    } else if (d.type === 'new_commitment') {
      const com: Commitment = {
        id: `sim_com_${d.id}`,
        label: d.label,
        amount: d.amount,
        category: d.category,
        recurrence: d.recurrence,
      }
      nextState.commitments.push(com)
    } else if (d.type === 'goal_deposit') {
      const txn: Transaction = {
        id: `sim_dep_${d.id}`,
        date: asOf,
        amount: d.amount,
        kind: 'goal_deposit',
        category: 'savings',
        note: 'Simulated goal deposit',
        tag: 'need',
        unexpected: false,
        goalId: d.goalId,
      }
      nextState.transactions.push(txn)
    } else if (d.type === 'unexpected_expense') {
      const txn: Transaction = {
        id: `sim_unexp_${d.id}`,
        date: asOf,
        amount: d.amount,
        kind: 'expense',
        category: 'other',
        note: d.label,
        tag: 'need',
        unexpected: true,
      }
      nextState.transactions.push(txn)
    } else if (d.type === 'income_change') {
      // Find next pending occurrence of incomeId
      if (d.change === 'delay') {
        overrides[d.incomeId] = { shiftDays: d.days ?? 7 }
      } else {
        overrides[d.incomeId] = { skip: true }
      }
    } else if (d.type === 'spending_change') {
      spendingChangePercent = d.percent
    }
  }

  return {
    state: nextState,
    overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    spendingChangePercent,
  }
}

/**
 * Evaluates simulated scenario without mutating state, calculating all 6 impact metrics.
 */
export function evaluateScenario(
  state: FinanceState,
  asOf: ISODate,
  decisions: Decision[]
): ScenarioEvaluation {
  const before = computeSnapshot(state, asOf)

  if (decisions.length === 0) {
    return {
      before,
      after: before,
      deltas: {
        walletDelta: 0,
        allowanceDelta: 0,
        riskDelta: 0,
        healthDelta: 0,
        endExpectedDelta: 0,
      },
      verdict: 'comfortable',
      reasons: ['No scenario decisions active. Current baseline preserved.'],
    }
  }

  const {
    state: simState,
    overrides,
    spendingChangePercent,
  } = applyDecisions(state, decisions, asOf)

  const after = computeSnapshot(simState, asOf, {
    occurrenceOverrides: overrides,
    spendingChangePercent,
  })

  const deltas: ScenarioDeltas = {
    walletDelta: after.wallet - before.wallet,
    allowanceDelta: after.allowance.daily - before.allowance.daily,
    riskDelta: after.risk.score - before.risk.score,
    healthDelta: (after.health.score ?? 0) - (before.health.score ?? 0),
    endExpectedDelta: after.forecast.endExpected - before.forecast.endExpected,
  }

  // Determine Verdict
  let verdict: ScenarioVerdict = 'comfortable'
  const reasons: string[] = []

  const riskLevels: Record<RiskLevel, number> = {
    low: 0,
    moderate: 1,
    high: 2,
    critical: 3,
  }

  const riskWorsened = riskLevels[after.risk.level] > riskLevels[before.risk.level]
  const newCashOut =
    before.forecast.cashOutDate === null && after.forecast.cashOutDate !== null
  const newShortfall =
    before.allocation.obligationShortfall === 0 &&
    after.allocation.obligationShortfall > 0

  let goalFundedDropped = false
  for (const bGoal of before.goals) {
    const aGoal = after.goals.find((g) => g.goalId === bGoal.goalId)
    if (aGoal && aGoal.fundedPercent < bGoal.fundedPercent) {
      goalFundedDropped = true
      break
    }
  }

  const bufferTouched = after.buffer.remaining < before.buffer.remaining
  const allowanceDropPercent =
    before.allowance.daily > 0
      ? ((before.allowance.daily - after.allowance.daily) / before.allowance.daily) * 100
      : 0

  if (
    (riskWorsened && (after.risk.level === 'high' || after.risk.level === 'critical')) ||
    newCashOut ||
    newShortfall
  ) {
    verdict = 'not_advisable'
    if (newCashOut) {
      reasons.push(`Projects a cash deficit on ${after.forecast.cashOutDate}.`)
    }
    if (newShortfall) {
      reasons.push(
        `Causes an obligation shortfall of ₹${after.allocation.obligationShortfall.toLocaleString('en-IN')}.`
      )
    }
    if (riskWorsened) {
      reasons.push(`Escalates overall risk to ${after.risk.level.toUpperCase()} tier.`)
    }
  } else if (
    riskWorsened ||
    goalFundedDropped ||
    bufferTouched ||
    allowanceDropPercent > 30
  ) {
    verdict = 'tight'
    if (allowanceDropPercent > 30) {
      reasons.push(
        `Reduces daily allowance by ${allowanceDropPercent.toFixed(0)}% (₹${Math.abs(deltas.allowanceDelta)} / day).`
      )
    }
    if (bufferTouched) {
      reasons.push(
        `Draws ₹${(before.buffer.remaining - after.buffer.remaining).toLocaleString('en-IN')} from the safety cushion.`
      )
    }
    if (goalFundedDropped) {
      reasons.push('Reduces funding allocation towards priority savings goals.')
    }
    if (riskWorsened) {
      reasons.push(`Increases risk tier from ${before.risk.level} to ${after.risk.level}.`)
    }
  } else if (allowanceDropPercent >= 10 || deltas.allowanceDelta !== 0) {
    verdict = 'manageable'
    reasons.push(
      `Daily allowance adjusts by ₹${deltas.allowanceDelta}/day with no risk tier shift.`
    )
    reasons.push('Safety cushion and upcoming fixed commitments remain fully protected.')
  } else {
    verdict = 'comfortable'
    reasons.push('Negligible impact on daily allowance and trajectory.')
    reasons.push('All upcoming commitments and goals remain 100% on track.')
  }

  // Ensure 2–4 reasons
  if (reasons.length < 2) {
    reasons.push(
      `Projected cycle-end balance shifts by ₹${deltas.endExpectedDelta.toLocaleString('en-IN')}.`
    )
  }

  return {
    before,
    after,
    deltas,
    verdict,
    reasons: reasons.slice(0, 4),
  }
}

/**
 * Binary search for maximum safe purchase today where verdict is comfortable or manageable.
 */
export function maxSafePurchaseToday(
  state: FinanceState,
  asOf: ISODate
): number {
  if (!state.cycle) return 0

  let low = 0
  let high = Math.min(state.cycle.startingBalance, 1000000)
  let best = 0

  // 16 iterations gives precision to 1 rupee within 1,000,000
  for (let i = 0; i < 20; i++) {
    const mid = Math.floor((low + high) / 2)
    if (mid === best) break

    const decision: Decision = {
      id: 'max_search',
      type: 'purchase',
      label: 'Safe check',
      amount: mid,
      date: asOf,
      category: 'shopping',
      tag: 'want',
    }

    const res = evaluateScenario(state, asOf, [decision])
    if (res.verdict === 'comfortable' || res.verdict === 'manageable') {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }

    if (low > high) break
  }

  return best
}

/**
 * Calculates better timing hint: the earliest date within the cycle
 * on which the purchase would improve the verdict by one step.
 */
export function betterTimingHint(
  state: FinanceState,
  asOf: ISODate,
  purchase: Decision
): ISODate | null {
  if (purchase.type !== 'purchase' || !state.cycle) return null

  const currentEval = evaluateScenario(state, asOf, [purchase])
  if (currentEval.verdict === 'comfortable') {
    return null // already optimal
  }

  const cycleEnd = cycleEndDate(state.cycle.startDate)
  const daysRemaining = diffDays(asOf, cycleEnd)

  const verdictRank: Record<ScenarioVerdict, number> = {
    not_advisable: 0,
    tight: 1,
    manageable: 2,
    comfortable: 3,
  }

  const currentRank = verdictRank[currentEval.verdict]

  // Scan future dates in cycle
  for (let d = 1; d <= daysRemaining; d++) {
    const candidateDate = addDays(asOf, d)
    const shiftedPurchase: Decision = {
      ...purchase,
      date: candidateDate,
    }

    const testEval = evaluateScenario(state, asOf, [shiftedPurchase])
    const testRank = verdictRank[testEval.verdict]

    if (testRank > currentRank) {
      return candidateDate
    }
  }

  return null
}
