import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { Logo } from '@/components/Logo'
import { useFocusH1 } from '@/hooks/useFocusH1'
import { useAuth } from '@/features/auth/AuthContext'
import { useFinance } from '@/features/store/FinanceContext'
import { QuickAddModal } from '@/components/QuickAddModal'
import {
  CalendarDays,
  FlaskConical,
  Layers,
  ReceiptText,
  LineChart,
  Plus,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

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
  const { user, signOut } = useAuth()
  const { state, snapshot } = useFinance()

  const [quickAddOpen, setQuickAddOpen] = useState(false)

  // Redirect to /app/setup if no active cycle and not already on /app/setup
  useEffect(() => {
    if (!state.cycle && location.pathname !== '/app/setup') {
      navigate('/app/setup', { replace: true })
    }
  }, [state.cycle, location.pathname, navigate])

  // Global keyboard shortcut: Ctrl/Cmd + K opens Quick Add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setQuickAddOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isSetupRoute = location.pathname === '/app/setup'
  const isCompleted = snapshot.cyclePhase === 'completed'

  const cycleDayChip = isSetupRoute ? (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6DFD2]/60 text-[#5E5A52]">
      Setup Mode
    </span>
  ) : isCompleted ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1D7A53] text-[#FBF8F3]">
      <CheckCircle className="w-3.5 h-3.5" />
      <span>Cycle Completed</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D4F23A] text-[#16140F]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#16140F] animate-pulse" />
      <span>Day {snapshot.dayNumber} of 30</span>
    </span>
  )

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

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
                    {userInitials}
                  </div>
                  <div className="leading-tight truncate max-w-[120px]">
                    <span className="font-semibold text-xs text-[#16140F] block truncate">
                      {user?.name || 'Local User'}
                    </span>
                    <span className="text-[10px] text-[#5E5A52] block">
                      {state.cycle ? `₹${state.cycle.startingBalance.toLocaleString('en-IN')} Cycle` : 'No Cycle'}
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
                  signOut()
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
            {state.cycle && (
              <Button
                type="button"
                onClick={() => setQuickAddOpen(true)}
                className="h-9 px-3.5 bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4F23A]" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>
            )}

            {/* Mobile User Menu */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-9 h-9 rounded-full bg-white border border-[#E6DFD2] flex items-center justify-center text-[#16140F] font-bold text-xs"
                    aria-label="User menu"
                  >
                    {userInitials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-[#E6DFD2]">
                  <DropdownMenuLabel className="text-xs text-[#5E5A52]">
                    {user?.name || 'Local Account'}
                  </DropdownMenuLabel>
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
                      signOut()
                      navigate('/sign-in')
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* OUTLET PAGE CONTAINER */}
        <main id="app-content" className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DFD2] px-2 py-1.5 flex justify-around items-center"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-[#16140F]' : 'text-[#5E5A52]'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* GLOBAL QUICK ADD TRANSACTION MODAL */}
      <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  )
}
export default AppShell
