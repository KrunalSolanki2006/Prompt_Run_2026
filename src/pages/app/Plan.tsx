import React, { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/engine/constants'
import { todayISO } from '@/engine/dates'
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

  const [addDialogOpen, setAddDialogOpen] = useState<string | null>(null)

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // STAGE-2: Save planned item in state and recompute snapshot
    setAddDialogOpen(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commitments & Financial Plan"
        subtitle="Organize recurring income, fixed obligations, digital subscriptions, and savings goals."
        actions={
          <Button
            onClick={() => setAddDialogOpen(currentTab)}
            className="h-9 bg-[#16140F] text-[#FBF8F3] font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
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
            <span>Income</span>
          </TabsTrigger>
          <TabsTrigger
            value="commitments"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            <span>Commitments</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="text-xs font-semibold py-2.5 data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]"
          >
            <PiggyBank className="w-3.5 h-3.5 mr-1.5" />
            <span>Savings Goals</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INCOME */}
        <TabsContent value="income">
          <EmptyState
            icon={<ArrowDownLeft className="w-6 h-6 text-[#1D7A53]" />}
            title="No income sources configured"
            description="Add your salary, freelance gigs, or allowances to incorporate predictable cash inflows."
            action={
              <Button
                onClick={() => setAddDialogOpen('income')}
                className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
              >
                Add First Income Source
              </Button>
            }
          />
        </TabsContent>

        {/* TAB 2: COMMITMENTS */}
        <TabsContent value="commitments">
          <EmptyState
            icon={<Receipt className="w-6 h-6 text-[#5E5A52]" />}
            title="No fixed commitments logged"
            description="Add fixed monthly commitments like rent, loan EMIs, or utility bills so they are ring-fenced from daily allowance."
            action={
              <Button
                onClick={() => setAddDialogOpen('commitments')}
                className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
              >
                Add First Commitment
              </Button>
            }
          />
        </TabsContent>

        {/* TAB 3: SUBSCRIPTIONS */}
        <TabsContent value="subscriptions">
          <EmptyState
            icon={<CreditCard className="w-6 h-6 text-[#A15C07]" />}
            title="No active subscriptions tracked"
            description="Log your streaming services, cloud storage, and gym memberships to track upcoming billing cycles."
            action={
              <Button
                onClick={() => setAddDialogOpen('subscriptions')}
                className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
              >
                Track a Subscription
              </Button>
            }
          />
        </TabsContent>

        {/* TAB 4: GOALS */}
        <TabsContent value="goals">
          <EmptyState
            icon={<PiggyBank className="w-6 h-6 text-[#1D7A53]" />}
            title="No savings goals established"
            description="Create milestone targets (emergency fund, travel, courses) to reserve savings during your 30-day cycle."
            action={
              <Button
                onClick={() => setAddDialogOpen('goals')}
                className="h-9 bg-[#16140F] text-[#FBF8F3] text-xs font-bold rounded-lg"
              >
                Create First Goal
              </Button>
            }
          />
        </TabsContent>
      </Tabs>

      {/* ADD/EDIT DIALOGS */}
      {/* 1. INCOME DIALOG */}
      <Dialog open={addDialogOpen === 'income'} onOpenChange={(o) => !o && setAddDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl text-[#16140F]">
              Add Income Stream
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Record anticipated or confirmed income to incorporate into your runway.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="plan-inc-label" className="text-xs font-semibold text-[#16140F]">
                Source / Employer
              </Label>
              <Input
                id="plan-inc-label"
                placeholder="e.g. Freelance Client / Allowance"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="plan-inc-amount" className="text-xs font-semibold text-[#16140F]">
                  Amount (₹)
                </Label>
                <Input
                  id="plan-inc-amount"
                  type="number"
                  placeholder="3000"
                  min="1"
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-inc-certainty" className="text-xs font-semibold text-[#16140F]">
                  Certainty
                </Label>
                <select
                  id="plan-inc-certainty"
                  defaultValue="confirmed"
                  className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="likely">Likely (Pending)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="plan-inc-anchor" className="text-xs font-semibold text-[#16140F]">
                Date Expected
              </Label>
              <Input
                id="plan-inc-anchor"
                type="date"
                defaultValue={todayISO()}
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold rounded-lg">
              Save Income Stream
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. COMMITMENT DIALOG */}
      <Dialog open={addDialogOpen === 'commitments'} onOpenChange={(o) => !o && setAddDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl text-[#16140F]">
              Add Commitment or EMI
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Ringfence non-negotiable fixed expenses from your daily spend pool.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="plan-com-label" className="text-xs font-semibold text-[#16140F]">
                Commitment Label
              </Label>
              <Input
                id="plan-com-label"
                placeholder="e.g. Room Rent or Laptop EMI"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="plan-com-amount" className="text-xs font-semibold text-[#16140F]">
                  Amount (₹)
                </Label>
                <Input
                  id="plan-com-amount"
                  type="number"
                  placeholder="2500"
                  min="1"
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-com-category" className="text-xs font-semibold text-[#16140F]">
                  Category
                </Label>
                <select
                  id="plan-com-category"
                  defaultValue="bills"
                  className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="plan-com-freq" className="text-xs font-semibold text-[#16140F]">
                  Frequency
                </Label>
                <select
                  id="plan-com-freq"
                  defaultValue="monthly"
                  className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                >
                  <option value="once">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-com-date" className="text-xs font-semibold text-[#16140F]">
                  Due Date
                </Label>
                <Input
                  id="plan-com-date"
                  type="date"
                  defaultValue={todayISO()}
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold rounded-lg">
              Save Commitment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. SUBSCRIPTIONS DIALOG */}
      <Dialog open={addDialogOpen === 'subscriptions'} onOpenChange={(o) => !o && setAddDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl text-[#16140F]">
              Add Subscription
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Track recurring software, streaming, or membership fees.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="plan-sub-name" className="text-xs font-semibold text-[#16140F]">
                Subscription Name
              </Label>
              <Input
                id="plan-sub-name"
                placeholder="e.g. Netflix, iCloud, YouTube"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="plan-sub-amount" className="text-xs font-semibold text-[#16140F]">
                  Amount (₹)
                </Label>
                <Input
                  id="plan-sub-amount"
                  type="number"
                  placeholder="199"
                  min="1"
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-sub-freq" className="text-xs font-semibold text-[#16140F]">
                  Billing Cycle
                </Label>
                <select
                  id="plan-sub-freq"
                  defaultValue="monthly"
                  className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="plan-sub-date" className="text-xs font-semibold text-[#16140F]">
                Next Renewal Date
              </Label>
              <Input
                id="plan-sub-date"
                type="date"
                defaultValue={todayISO()}
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold rounded-lg">
              Save Subscription
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. GOALS DIALOG */}
      <Dialog open={addDialogOpen === 'goals'} onOpenChange={(o) => !o && setAddDialogOpen(null)}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl text-[#16140F]">
              Create Savings Goal
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Set a savings target to reserve cycle contributions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="plan-goal-name" className="text-xs font-semibold text-[#16140F]">
                Goal Name
              </Label>
              <Input
                id="plan-goal-name"
                placeholder="e.g. Emergency Moat"
                required
                className="bg-[#FBF8F3] border-[#E6DFD2]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="plan-goal-target" className="text-xs font-semibold text-[#16140F]">
                  Target (₹)
                </Label>
                <Input
                  id="plan-goal-target"
                  type="number"
                  placeholder="5000"
                  min="1"
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2] font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-goal-cycle" className="text-xs font-semibold text-[#16140F]">
                  Cycle Contribution (₹)
                </Label>
                <Input
                  id="plan-goal-cycle"
                  type="number"
                  placeholder="1000"
                  min="1"
                  required
                  className="bg-[#FBF8F3] border-[#E6DFD2]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="plan-goal-priority" className="text-xs font-semibold text-[#16140F]">
                Priority Level
              </Label>
              <select
                id="plan-goal-priority"
                defaultValue="1"
                className="w-full h-9 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
              >
                <option value="1">Priority 1 (Crucial)</option>
                <option value="2">Priority 2 (Important)</option>
                <option value="3">Priority 3 (Optional / Flexible)</option>
              </select>
            </div>
            <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold rounded-lg">
              Create Goal
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default Plan
