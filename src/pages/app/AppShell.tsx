import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { Logo } from '@/components/Logo'
import { useFocusH1 } from '@/hooks/useFocusH1'
import {
  CalendarDays,
  FlaskConical,
  Layers,
  ReceiptText,
  LineChart,
  Plus,
  Settings,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CATEGORIES } from '@/engine/constants'
import { todayISO } from '@/engine/dates'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Today', to: '/app', icon: <CalendarDays className="w-4 h-4" /> },
  { label: 'Decision Lab', to: '/app/lab', icon: <FlaskConical className="w-4 h-4" /> },
  { label: 'Plan', to: '/app/plan', icon: <Layers className="w-4 h-4" /> },
  { label: 'Activity', to: '/app/activity', icon: <ReceiptText className="w-4 h-4" /> },
  { label: 'Insights', to: '/app/insights', icon: <LineChart className="w-4 h-4" /> },
]

export const AppShell: React.FC = () => {
  useFocusH1()
  const navigate = useNavigate()
  const location = useLocation()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'goal'>('expense')

  // STAGE-1: Static cycle day status. In Stage 2 this reads snapshot.dayNumber.
  const isSetupRoute = location.pathname === '/app/setup'
  const cycleDayChip = isSetupRoute ? (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6DFD2]/60 text-[#5E5A52]">
      Setup Mode
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4F23A] text-[#16140F]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#16140F] animate-pulse" />
      <span>Day 1 of 30</span>
    </span>
  )

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // STAGE-2: Commit transaction into state and recalculate snapshot
    setQuickAddOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#16140F] flex flex-col lg:flex-row">
      {/* Skip to Content */}
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#16140F] text-[#FBF8F3] px-4 py-2 rounded-md font-semibold text-sm outline-none ring-2 ring-[#D4F23A]"
      >
        Skip to main content
      </a>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-white border-r border-[#E6DFD2] flex-col justify-between p-5 sticky top-0 h-screen">
        <div>
          <div className="mb-7 pl-1">
            <Logo showTagline />
          </div>

          <nav aria-label="App Navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#16140F] text-[#FBF8F3]'
                      : 'text-[#5E5A52] hover:text-[#16140F] hover:bg-[#FBF8F3]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="pt-4 border-t border-[#E6DFD2]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#FBF8F3] transition-colors text-left focus-visible:outline-2 focus-visible:outline-[#16140F]"
                aria-label="User account menu"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#16140F] text-[#FBF8F3] flex items-center justify-center font-bold text-xs">
                    RZ
                  </div>
                  <div className="leading-tight">
                    <span className="font-semibold text-xs text-[#16140F] block">
                      Local Account
                    </span>
                    <span className="text-[10px] text-[#5E5A52] block">
                      ₹10,000 Cycle
                    </span>
                  </div>
                </div>
                <Settings className="w-4 h-4 text-[#5E5A52]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-[#E6DFD2]">
              <DropdownMenuLabel className="text-xs text-[#5E5A52]">Session Options</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/setup')}>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Cycle Setup</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#E6DFD2]" />
              <DropdownMenuItem
                className="text-[#B42318] focus:text-[#B42318]"
                onClick={() => {
                  // STAGE-2: Clear session and navigate to sign-in
                  navigate('/sign-in')
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MAIN COCKPIT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* TOP COCKPIT HEADER */}
        <header className="sticky top-0 z-30 bg-[#FBF8F3]/90 backdrop-blur-md border-b border-[#E6DFD2] px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo />
            </div>
            {cycleDayChip}
          </div>

          <div className="flex items-center gap-3">
            {/* Global Quick Add Button */}
            <Button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="h-9 px-3.5 bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>

            {/* Mobile User Menu */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full bg-white border border-[#E6DFD2] flex items-center justify-center text-[#16140F]"
                    aria-label="User menu"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-[#E6DFD2]">
                  <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#E6DFD2]" />
                  <DropdownMenuItem
                    className="text-[#B42318]"
                    onClick={() => navigate('/sign-in')}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* OUTLET CONTENT */}
        <main id="app-content" className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DFD2] px-2 py-1.5 flex items-center justify-around safe-bottom"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#16140F]' : 'text-[#5E5A52] hover:text-[#16140F]'
              }`
            }
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* GLOBAL QUICK-ADD DIALOG */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="max-w-md bg-white border-[#E6DFD2] rounded-[16px]">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque_Variable'] font-bold text-xl text-[#16140F]">
              Quick Log Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5E5A52]">
              Record a real cash movement to instantly update your 30-day runway.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid grid-cols-3 bg-[#FBF8F3] border border-[#E6DFD2] rounded-lg p-1 mb-4">
              <TabsTrigger value="expense" className="text-xs font-semibold data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]">
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="text-xs font-semibold data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]">
                Income
              </TabsTrigger>
              <TabsTrigger value="goal" className="text-xs font-semibold data-[state=active]:bg-[#16140F] data-[state=active]:text-[#FBF8F3]">
                Goal Deposit
              </TabsTrigger>
            </TabsList>

            {/* EXPENSE FORM */}
            <TabsContent value="expense">
              <form onSubmit={handleQuickAddSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="qa-expense-amount" className="text-xs font-semibold text-[#16140F]">
                    Amount (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-[#5E5A52]">₹</span>
                    <Input
                      id="qa-expense-amount"
                      type="number"
                      placeholder="e.g. 150"
                      min="1"
                      required
                      className="pl-7 h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="qa-expense-date" className="text-xs font-semibold text-[#16140F]">
                      Date
                    </Label>
                    <Input
                      id="qa-expense-date"
                      type="date"
                      defaultValue={todayISO()}
                      required
                      className="h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="qa-expense-category" className="text-xs font-semibold text-[#16140F]">
                      Category
                    </Label>
                    <select
                      id="qa-expense-category"
                      defaultValue="food"
                      className="w-full h-10 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="qa-expense-note" className="text-xs font-semibold text-[#16140F]">
                    Note / Description
                  </Label>
                  <Input
                    id="qa-expense-note"
                    placeholder="e.g. Chai and snacks"
                    maxLength={100}
                    className="h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Checkbox id="qa-unexpected" />
                    <Label htmlFor="qa-unexpected" className="text-xs text-[#5E5A52] font-medium cursor-pointer">
                      Unexpected expense
                    </Label>
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold rounded-lg mt-2">
                  Log Expense
                </Button>
              </form>
            </TabsContent>

            {/* INCOME FORM */}
            <TabsContent value="income">
              <form onSubmit={handleQuickAddSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="qa-income-amount" className="text-xs font-semibold text-[#16140F]">
                    Amount Received (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-[#5E5A52]">₹</span>
                    <Input
                      id="qa-income-amount"
                      type="number"
                      placeholder="e.g. 2000"
                      min="1"
                      required
                      className="pl-7 h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="qa-income-label" className="text-xs font-semibold text-[#16140F]">
                    Source / Label
                  </Label>
                  <Input
                    id="qa-income-label"
                    placeholder="e.g. Freelance stipend"
                    required
                    className="h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="qa-income-date" className="text-xs font-semibold text-[#16140F]">
                    Date Received
                  </Label>
                  <Input
                    id="qa-income-date"
                    type="date"
                    defaultValue={todayISO()}
                    required
                    className="h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                  />
                </div>

                <Button type="submit" className="w-full h-10 bg-[#1D7A53] text-[#FBF8F3] font-bold rounded-lg mt-2">
                  Record Income
                </Button>
              </form>
            </TabsContent>

            {/* GOAL DEPOSIT FORM */}
            <TabsContent value="goal">
              <form onSubmit={handleQuickAddSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="qa-goal-select" className="text-xs font-semibold text-[#16140F]">
                    Select Goal
                  </Label>
                  <select
                    id="qa-goal-select"
                    className="w-full h-10 px-3 rounded-md bg-[#FBF8F3] border border-[#E6DFD2] text-sm text-[#16140F]"
                  >
                    <option value="emergency">Emergency Moat</option>
                    <option value="course">UX Design Certification</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="qa-goal-amount" className="text-xs font-semibold text-[#16140F]">
                    Deposit Amount (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-[#5E5A52]">₹</span>
                    <Input
                      id="qa-goal-amount"
                      type="number"
                      placeholder="e.g. 500"
                      min="1"
                      required
                      className="pl-7 h-10 bg-[#FBF8F3] border-[#E6DFD2]"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 bg-[#16140F] text-[#FBF8F3] font-bold rounded-lg mt-2">
                  Deposit to Goal
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AppShell
