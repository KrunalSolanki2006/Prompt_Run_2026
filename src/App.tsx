import React from 'react'
import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthContext'
import { FinanceProvider } from '@/features/store/FinanceContext'
import { AppRouter } from '@/app/router'

export const App: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <AuthProvider>
          <FinanceProvider>
            <AppRouter />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className:
                  'bg-white text-[#16140F] border border-[#E6DFD2] rounded-xl shadow-lg font-sans text-xs',
              }}
            />
          </FinanceProvider>
        </AuthProvider>
      </LazyMotion>
    </MotionConfig>
  )
}

export default App
