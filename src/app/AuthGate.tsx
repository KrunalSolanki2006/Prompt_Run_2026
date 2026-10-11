import React from 'react'

interface AuthGateProps {
  children: React.ReactNode
}

// STAGE-1 TEMPORARY: replaced by real auth in Stage 2
export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  return <>{children}</>
}
