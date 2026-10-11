import type {
  FinanceState,
  Cycle,
  IncomeSource,
  Commitment,
  Subscription,
  Goal,
  Transaction,
  DecisionLogEntry,
  CycleSummary,
} from '@/engine/types'
import { addDays } from '@/engine/dates'

export type FinanceAction =
  | { type: 'SET_STATE'; payload: FinanceState }
  | { type: 'INIT_CYCLE'; payload: Cycle }
  | { type: 'UPDATE_CYCLE'; payload: Partial<Cycle> }
  | { type: 'COMPLETE_CYCLE'; payload: { summary: CycleSummary; newStartDate: string } }
  | { type: 'ADD_INCOME'; payload: IncomeSource }
  | { type: 'UPDATE_INCOME'; payload: IncomeSource }
  | { type: 'DELETE_INCOME'; payload: { id: string } }
  | { type: 'ADD_COMMITMENT'; payload: Commitment }
  | { type: 'UPDATE_COMMITMENT'; payload: Commitment }
  | { type: 'DELETE_COMMITMENT'; payload: { id: string } }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: { id: string } }
  | { type: 'TOGGLE_SUBSCRIPTION'; payload: { id: string } }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: { id: string } }
  | { type: 'LOG_DECISION'; payload: DecisionLogEntry }
  | { type: 'RESET_DATA' }

export const initialFinanceState: FinanceState = {
  version: 1,
  cycle: null,
  incomes: [],
  commitments: [],
  subscriptions: [],
  goals: [],
  transactions: [],
  decisions: [],
  cycleHistory: [],
}

export function financeReducer(
  state: FinanceState,
  action: FinanceAction
): FinanceState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload

    case 'INIT_CYCLE':
      return {
        ...state,
        cycle: action.payload,
      }

    case 'UPDATE_CYCLE':
      if (!state.cycle) return state
      return {
        ...state,
        cycle: {
          ...state.cycle,
          ...action.payload,
        },
      }

    case 'COMPLETE_CYCLE': {
      // Archive summary, roll over goals and recurring plan items
      const { summary, newStartDate } = action.payload

      // Calculate total saved per goal in the completed cycle
      const updatedGoals = state.goals.map((g) => {
        const depositsInCycle = state.transactions
          .filter((t) => t.kind === 'goal_deposit' && t.goalId === g.id)
          .reduce((sum, t) => sum + t.amount, 0)
        return {
          ...g,
          startingSaved: g.startingSaved + depositsInCycle,
        }
      })

      // Advance subscriptions nextBillingDate to be >= newStartDate
      const updatedSubs = state.subscriptions.map((s) => {
        let nextDate = s.nextBillingDate
        while (nextDate < newStartDate) {
          if (s.freq === 'weekly') {
            nextDate = addDays(nextDate, 7)
          } else {
            // monthly or yearly
            nextDate = addDays(nextDate, 30)
          }
        }
        return { ...s, nextBillingDate: nextDate }
      })

      // Keep only recurring incomes and commitments (filter out 'once')
      const recurringIncomes = state.incomes.filter(
        (i) => i.recurrence.freq !== 'once'
      )
      const recurringCommitments = state.commitments.filter(
        (c) => c.recurrence.freq !== 'once'
      )

      return {
        ...state,
        cycle: null, // returns to setup to initialize next cycle
        cycleHistory: [summary, ...state.cycleHistory],
        transactions: [], // reset transactions for new cycle
        decisions: [],
        goals: updatedGoals,
        subscriptions: updatedSubs,
        incomes: recurringIncomes,
        commitments: recurringCommitments,
      }
    }

    case 'ADD_INCOME':
      return {
        ...state,
        incomes: [...state.incomes, action.payload],
      }

    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      }

    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter((i) => i.id !== action.payload.id),
      }

    case 'ADD_COMMITMENT':
      return {
        ...state,
        commitments: [...state.commitments, action.payload],
      }

    case 'UPDATE_COMMITMENT':
      return {
        ...state,
        commitments: state.commitments.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      }

    case 'DELETE_COMMITMENT':
      return {
        ...state,
        commitments: state.commitments.filter((c) => c.id !== action.payload.id),
      }

    case 'ADD_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: [...state.subscriptions, action.payload],
      }

    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      }

    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter(
          (s) => s.id !== action.payload.id
        ),
      }

    case 'TOGGLE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === action.payload.id
            ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
            : s
        ),
      }

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
      }

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      }

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload.id),
      }

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      }

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      }

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload.id),
      }

    case 'LOG_DECISION':
      return {
        ...state,
        decisions: [action.payload, ...state.decisions],
      }

    case 'RESET_DATA':
      return initialFinanceState

    default:
      return state
  }
}
