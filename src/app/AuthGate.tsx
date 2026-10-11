import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'
import { GenericPageSkeleton } from '@/components/SkeletonLayouts'
import { AlertTriangle } from 'lucide-react'

interface AuthGateProps {
  children: React.ReactNode
}

/**
 * Protected route wrapper. Redirects unauthenticated users to /sign-in
 * with returning location state.
 */
export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { user, isLoading, storageError } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <GenericPageSkeleton />
  }

  if (storageError) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E6DFD2] rounded-2xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#B42318]/10 text-[#B42318] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#16140F]">Storage Unavailable</h2>
          <p className="text-xs text-[#5E5A52] leading-relaxed">{storageError}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
  }

  return <>{children}</>
}
