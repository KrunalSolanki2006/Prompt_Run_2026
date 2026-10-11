import React, { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFinance } from '@/features/store/FinanceContext'
import { useToday } from '@/hooks/useToday'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { IncomesTab } from './plan/IncomesTab'
import { CommitmentsTab } from './plan/CommitmentsTab'
import { SubscriptionsTab } from './plan/SubscriptionsTab'
import { GoalsTab } from './plan/GoalsTab'
import {
  ArrowDownLeft,
  Receipt,
  CreditCard,
  PiggyBank,
  Plus,
} from 'lucide-react'

export const Plan: React.FC = () => {
  useDocumentTitle('Financial Plan')
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') || 'commitments'

  const {
    state,
    snapshot,
    addIncome,
    deleteIncome,
    addCommitment,
    deleteCommitment,
    addSubscription,
    deleteSubscription,
    toggleSubscription,
    addGoal,
    deleteGoal,
    addTransaction,
  } = useFinance()
  const today = useToday()

  const [dialogOpen, setDialogOpen] = useState<string | null>(null)

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  const handleDepositToGoal = (goalId: string, amount: number) => {
    const goal = state.goals.find((g) => g.id === goalId)
    addTransaction({
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: today,
      amount,
      kind: 'goal_deposit',
      category: 'savings',
      note: `Deposit to ${goal?.name ?? 'Goal'}`,
      tag: 'need',
      unexpected: false,
      goalId,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commitments & Financial Plan"
        subtitle="Organize recurring income, fixed obligations, digital subscriptions, and savings goals."
        actions={
          <Button
            onClick={() => setDialogOpen(currentTab)}
            className="h-9 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4F23A]" />
            <span>
              {currentTab === 'income'
                ? 'Add Income'
                : currentTab === 'commitments'
                ? 'Add Commitment'
                : currentTab === 'subscriptions'
                ? 'Add Subscription'
                : 'Create Goal'}
            </span>
          </Button>
        }
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border border-[#E6DFD2] rounded-xl p-1 grid grid-cols-2 sm:grid-cols-4 h-auto shadow-xs">
          <TabsTrigger
            value="income"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Income ({state.incomes.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="commitments"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            <span>Commitments ({state.commitments.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            <span>Subscriptions ({state.subscriptions.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <PiggyBank className="w-3.5 h-3.5 mr-1.5" />
            <span>Goals ({state.goals.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="animate-slide-in-left">
          <IncomesTab
            incomes={state.incomes}
            today={today}
            isAddOpen={dialogOpen === 'income'}
            onCloseAdd={() => setDialogOpen(null)}
            onOpenAdd={() => setDialogOpen('income')}
            onAddIncome={addIncome}
            onDeleteIncome={deleteIncome}
          />
        </TabsContent>

        <TabsContent value="commitments" className="animate-slide-in-left">
          <CommitmentsTab
            commitments={state.commitments}
            today={today}
            isAddOpen={dialogOpen === 'commitments'}
            onCloseAdd={() => setDialogOpen(null)}
            onOpenAdd={() => setDialogOpen('commitments')}
            onAddCommitment={addCommitment}
            onDeleteCommitment={deleteCommitment}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="animate-slide-in-left">
          <SubscriptionsTab
            subscriptions={state.subscriptions}
            today={today}
            isAddOpen={dialogOpen === 'subscriptions'}
            onCloseAdd={() => setDialogOpen(null)}
            onOpenAdd={() => setDialogOpen('subscriptions')}
            onAddSubscription={addSubscription}
            onDeleteSubscription={deleteSubscription}
            onToggleSubscription={toggleSubscription}
          />
        </TabsContent>

        <TabsContent value="goals" className="animate-slide-in-left">
          <GoalsTab
            goals={state.goals}
            goalProjections={snapshot.goals}
            walletBalance={snapshot.wallet}
            isAddOpen={dialogOpen === 'goals'}
            onCloseAdd={() => setDialogOpen(null)}
            onOpenAdd={() => setDialogOpen('goals')}
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            onDepositToGoal={handleDepositToGoal}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Plan
