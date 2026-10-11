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
  AlertTriangle,
  AlertOctagon,
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
  shortLabel: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Today', shortLabel: 'Today', to: '/app', icon: <CalendarDays className="w-4 h-4" /> },
  { label: 'Decision Lab', shortLabel: 'Lab', to: '/app/lab', icon: <FlaskConical className="w-4 h-4" /> },
  { label: 'Plan', shortLabel: 'Plan', to: '/app/plan', icon: <Layers className="w-4 h-4" /> },
  { label: 'Activity', shortLabel: 'Activity', to: '/app/activity', icon: <ReceiptText className="w-4 h-4" /> },
  { label: 'Insights', shortLabel: 'Insights', to: '/app/insights', icon: <LineChart className="w-4 h-4" /> },
]

export const AppShell: React.FC = () => {
  useFocusH1()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { state, snapshot, corruptBackupKey } = useFinance()
  const [isStorageBlocked] = useState(() => {
    try {
      const testKey = '__runway_storage_test__'
      localStorage.setItem(testKey, '1')
      localStorage.removeItem(testKey)
      return false
    } catch {
      return true
    }
  })

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
    <div className="min-h-screen bg-[#FBF8F3] text-[#16140F] flex flex-col md:flex-row">
      {/* Skip to Content */}
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-[#16140F] text-[#FBF8F3] px-4 py-2 rounded-md font-semibold text-sm outline-none ring-2 ring-[#D4F23A]"
      >
        Skip to main content
      </a>

      {/* TABLET RAIL & DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-20 lg:w-60 shrink-0 bg-white border-r border-[#E6DFD2] flex-col justify-between p-3 lg:p-5 sticky top-0 h-screen transition-all duration-200">
        <div>
          <div className="mb-7 flex justify-center lg:justify-start lg:pl-1">
            <Logo showTagline hideTextOnTablet />
          </div>

          <nav aria-label="App Navigation" className="space-y-1.5 lg:space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 px-2 lg:px-3.5 py-2.5 rounded-[10px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#16140F] text-[#FBF8F3]'
                      : 'text-[#5E5A52] hover:text-[#16140F] hover:bg-[#FBF8F3]'
                  }`
                }
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="lg:hidden text-[10px] leading-tight truncate">{item.shortLabel}</span>
                <span className="hidden lg:inline text-sm truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="pt-3 lg:pt-4 border-t border-[#E6DFD2]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-center lg:justify-between p-1.5 lg:p-2 rounded-lg hover:bg-[#FBF8F3] transition-colors text-left focus-visible:outline-2 focus-visible:outline-[#16140F]"
                aria-label="User account menu"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#16140F] text-[#FBF8F3] flex items-center justify-center font-bold text-xs shrink-0">
                    {userInitials}
                  </div>
                  <div className="hidden lg:block leading-tight truncate max-w-[120px]">
                    <span className="font-semibold text-xs text-[#16140F] block truncate">
                      {user?.name || 'Local User'}
                    </span>
                    <span className="text-[10px] text-[#5E5A52] block">
                      {state.cycle ? `₹${state.cycle.startingBalance.toLocaleString('en-IN')} Cycle` : 'No Cycle'}
                    </span>
                  </div>
                </div>
                <Settings className="hidden lg:block w-4 h-4 text-[#5E5A52] shrink-0" />
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
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8">
        {/* TOP COCKPIT HEADER */}
        <header className="sticky top-0 z-30 bg-[#FBF8F3]/90 backdrop-blur-md border-b border-[#E6DFD2] px-3.5 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="md:hidden shrink-0">
              <Logo />
            </div>
            {cycleDayChip}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Global Quick Add Button */}
            {state.cycle && (
              <Button
                type="button"
                onClick={() => setQuickAddOpen(true)}
                className="h-9 min-h-[44px] px-3 sm:px-3.5 bg-[#16140F] text-[#FBF8F3] hover:bg-[#16140F]/90 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4F23A]" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>
            )}

            {/* Mobile User Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-full bg-white border border-[#E6DFD2] flex items-center justify-center text-[#16140F] font-bold text-xs"
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
        <main id="app-content" className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isStorageBlocked && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-xl bg-[#B42318]/10 border border-[#B42318]/30 text-xs text-[#B42318] flex items-center gap-2.5 shadow-xs"
            >
              <AlertOctagon className="w-4 h-4 shrink-0 text-[#B42318]" />
              <span>
                <strong>Storage Restricted:</strong> Browser local storage is blocked or full. Financial data will not be persisted across browser refreshes. Please enable cookies and local storage.
              </span>
            </div>
          )}

          {corruptBackupKey && (
            <div
              role="alert"
              className="mb-5 p-4 rounded-xl bg-[#A15C07]/10 border border-[#A15C07]/30 text-xs text-[#A15C07] flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#A15C07]" />
                <span>
                  <strong>Corrupt State Recovered:</strong> Corrupted cycle data was detected and backed up to <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E6DFD2]">{corruptBackupKey}</code>. A clean starting baseline has been initialized.
                </span>
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DFD2] px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex justify-around items-center"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
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
