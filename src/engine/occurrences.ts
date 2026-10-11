import type {
  ISODate,
  Rupees,
  CategoryId,
  IncomeSource,
  Commitment,
  Subscription,
  Transaction,
  Recurrence,
} from './types'
import { addDays, addMonthsClamped, isBefore, isAfter } from './dates'

export interface Occurrence {
  id: string
  type: 'income' | 'commitment' | 'subscription'
  sourceId: string
  label: string
  amount: Rupees
  date: ISODate
  category?: CategoryId
  certainty?: 'confirmed' | 'likely'
  settled: boolean
  settledByTxnId?: string
  overdue: boolean
  late: boolean
}

export type OccurrenceOverrides = Record<
  string, // keyed by occurrence ID or sourceId
  { skip?: boolean; shiftDays?: number }
>

/**
 * Expands a recurrence into dated occurrences within [cycleStart, cycleEnd].
 * Handles anchor dates that started before cycleStart by projecting forward.
 */
function expandRecurrence(
  recurrence: Recurrence,
  cycleStart: ISODate,
  cycleEnd: ISODate
): ISODate[] {
  const dates: ISODate[] = []
  const { freq, anchor, repeatCount } = recurrence

  if (freq === 'once') {
    if (!isBefore(anchor, cycleStart) && !isAfter(anchor, cycleEnd)) {
      dates.push(anchor)
    }
    return dates
  }

  let current = anchor
  let count = 0

  // If anchor is after cycleEnd, no occurrences fall in cycle
  if (isAfter(anchor, cycleEnd)) {
    return dates
  }

  // Iterate occurrences starting from anchor
  while (!isAfter(current, cycleEnd)) {
    count++
    if (repeatCount !== undefined && count > repeatCount) {
      break
    }

    if (!isBefore(current, cycleStart)) {
      dates.push(current)
    }

    if (freq === 'weekly') {
      current = addDays(current, 7)
    } else if (freq === 'monthly') {
      current = addMonthsClamped(current, 1)
    } else if (freq === 'yearly') {
      current = addMonthsClamped(current, 12)
    } else {
      break
    }
  }

  return dates
}

/**
 * Expands a subscription into occurrences starting from nextBillingDate until cycleEnd.
 */
function expandSubscription(
  sub: Subscription,
  cycleStart: ISODate,
  cycleEnd: ISODate
): ISODate[] {
  if (sub.status === 'paused') {
    return []
  }

  const dates: ISODate[] = []
  let current = sub.nextBillingDate

  // If next billing is after cycleEnd, nothing in this cycle
  if (isAfter(current, cycleEnd)) {
    return dates
  }

  while (!isAfter(current, cycleEnd)) {
    if (!isBefore(current, cycleStart)) {
      dates.push(current)
    }

    if (sub.freq === 'weekly') {
      current = addDays(current, 7)
    } else if (sub.freq === 'monthly') {
      current = addMonthsClamped(current, 1)
    } else if (sub.freq === 'yearly') {
      current = addMonthsClamped(current, 12)
    } else {
      break
    }
  }

  return dates
}

/**
 * Generates all dated occurrences for the cycle, determines settlement,
 * overdue/late flags, and applies scenario overrides.
 */
export function generateOccurrences(
  incomes: IncomeSource[],
  commitments: Commitment[],
  subscriptions: Subscription[],
  cycleStart: ISODate,
  cycleEnd: ISODate,
  asOf: ISODate,
  transactions: Transaction[],
  overrides?: OccurrenceOverrides
): Occurrence[] {
  const result: Occurrence[] = []

  // Build a lookup for settled transactions
  const settledLinks = new Map<string, string>() // key -> txnId
  for (const txn of transactions) {
    if (txn.link) {
      const key = `${txn.link.type}:${txn.link.id}:${txn.link.occurrence}`
      settledLinks.set(key, txn.id)
    }
  }

  // 1. Incomes
  for (const inc of incomes) {
    const rawDates = expandRecurrence(inc.recurrence, cycleStart, cycleEnd)
    for (const rawDate of rawDates) {
      const occId = `income:${inc.id}:${rawDate}`
      const override = overrides?.[occId] ?? overrides?.[inc.id]

      if (override?.skip) {
        continue
      }

      const date = override?.shiftDays ? addDays(rawDate, override.shiftDays) : rawDate
      const key = `income:${inc.id}:${rawDate}`
      const settledTxnId = settledLinks.get(key)
      const settled = settledTxnId !== undefined
      const isPast = isBefore(date, asOf)

      result.push({
        id: occId,
        type: 'income',
        sourceId: inc.id,
        label: inc.label,
        amount: inc.amount,
        date,
        certainty: inc.certainty,
        settled,
        settledByTxnId: settledTxnId,
        overdue: false,
        late: !settled && isPast,
      })
    }
  }

  // 2. Commitments
  for (const com of commitments) {
    const rawDates = expandRecurrence(com.recurrence, cycleStart, cycleEnd)
    for (const rawDate of rawDates) {
      const occId = `commitment:${com.id}:${rawDate}`
      const override = overrides?.[occId] ?? overrides?.[com.id]

      if (override?.skip) {
        continue
      }

      const date = override?.shiftDays ? addDays(rawDate, override.shiftDays) : rawDate
      const key = `commitment:${com.id}:${rawDate}`
      const settledTxnId = settledLinks.get(key)
      const settled = settledTxnId !== undefined
      const isPast = isBefore(date, asOf)

      result.push({
        id: occId,
        type: 'commitment',
        sourceId: com.id,
        label: com.label,
        amount: com.amount,
        date,
        category: com.category,
        settled,
        settledByTxnId: settledTxnId,
        overdue: !settled && isPast,
        late: false,
      })
    }
  }

  // 3. Subscriptions
  for (const sub of subscriptions) {
    const rawDates = expandSubscription(sub, cycleStart, cycleEnd)
    for (const rawDate of rawDates) {
      const occId = `subscription:${sub.id}:${rawDate}`
      const override = overrides?.[occId] ?? overrides?.[sub.id]

      if (override?.skip) {
        continue
      }

      const date = override?.shiftDays ? addDays(rawDate, override.shiftDays) : rawDate
      const key = `subscription:${sub.id}:${rawDate}`
      const settledTxnId = settledLinks.get(key)
      const settled = settledTxnId !== undefined
      const isPast = isBefore(date, asOf)

      result.push({
        id: occId,
        type: 'subscription',
        sourceId: sub.id,
        label: sub.name,
        amount: sub.amount,
        date,
        category: 'subscriptions',
        settled,
        settledByTxnId: settledTxnId,
        overdue: !settled && isPast,
        late: false,
      })
    }
  }

  // Sort chronologically
  result.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

  return result
}
