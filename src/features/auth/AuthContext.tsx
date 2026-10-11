import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { Account, Session } from './types'
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  PBKDF2_ITERATIONS,
} from './crypto'
import {
  isStorageAvailable,
  getStoredAccounts,
  saveStoredAccounts,
  getStoredSession,
  saveStoredSession,
  getLockoutState,
  saveLockoutState,
  deleteUserData,
} from './storage'
import { cleanText } from '@/lib/sanitize'

interface AuthContextValue {
  user: Account | null
  session: Session | null
  isLoading: boolean
  storageError: string | null
  lockoutRemainingSeconds: number
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
  deleteAccount: (
    emailConfirmation: string
  ) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storageError] = useState<string | null>(() =>
    !isStorageAvailable()
      ? 'Browser local storage is not available or cookies/storage are blocked. RUNWAY requires localStorage to function.'
      : null
  )
  const [user, setUser] = useState<Account | null>(() => {
    if (!isStorageAvailable()) return null
    const stored = getStoredSession()
    if (!stored) return null
    const accounts = getStoredAccounts()
    const matched = accounts.find((a) => a.id === stored.userId)
    if (!matched) {
      saveStoredSession(null)
      return null
    }
    return matched
  })
  const [session, setSession] = useState<Session | null>(() => {
    if (!isStorageAvailable()) return null
    const stored = getStoredSession()
    if (!stored) return null
    const accounts = getStoredAccounts()
    const matched = accounts.find((a) => a.id === stored.userId)
    return matched ? stored : null
  })
  const [isLoading] = useState<boolean>(false)
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState(0)

  // Timer to update lockout countdown
  useEffect(() => {
    const checkLockout = () => {
      const lockout = getLockoutState()
      if (lockout.lockedUntil && lockout.lockedUntil > Date.now()) {
        const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000)
        setLockoutRemainingSeconds(remaining)
      } else {
        setLockoutRemainingSeconds(0)
      }
    }

    checkLockout()
    const timer = setInterval(checkLockout, 1000)
    return () => clearInterval(timer)
  }, [])

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isStorageAvailable()) {
        return { success: false, error: 'Local storage is disabled or unavailable.' }
      }

      const cleanName = cleanText(name)
      const cleanEmail = cleanText(email).toLowerCase()

      if (cleanName.length < 1 || cleanName.length > 60) {
        return { success: false, error: 'Full name must be between 1 and 60 characters.' }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
        return { success: false, error: 'Please enter a valid email address.' }
      }

      if (
        password.length < 8 ||
        !/[A-Za-z]/.test(password) ||
        !/\d/.test(password)
      ) {
        return {
          success: false,
          error:
            'Password must be at least 8 characters and contain both a letter and a number.',
        }
      }

      const accounts = getStoredAccounts()
      const existing = accounts.find((a) => a.email === cleanEmail)
      if (existing) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in.',
        }
      }

      try {
        const salt = generateSalt()
        const hash = await hashPassword(password, salt, PBKDF2_ITERATIONS)

        const newAccount: Account = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: cleanName,
          email: cleanEmail,
          salt,
          hash,
          iterations: PBKDF2_ITERATIONS,
          createdAt: new Date().toISOString(),
        }

        accounts.push(newAccount)
        saveStoredAccounts(accounts)

        // Create 7-day session
        const now = Date.now()
        const newSession: Session = {
          userId: newAccount.id,
          issuedAt: new Date(now).toISOString(),
          expiresAt: new Date(now + 7 * 86400000).toISOString(),
        }

        saveStoredSession(newSession)
        setUser(newAccount)
        setSession(newSession)

        return { success: true }
      } catch (err) {
        console.error('Sign-up failed:', err)
        return { success: false, error: 'Cryptographic key generation failed. Please try again.' }
      }
    },
    []
  )

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isStorageAvailable()) {
        return { success: false, error: 'Local storage is disabled or unavailable.' }
      }

      const lockout = getLockoutState()
      if (lockout.lockedUntil && lockout.lockedUntil > Date.now()) {
        const remaining = Math.ceil((lockout.lockedUntil - Date.now()) / 1000)
        return {
          success: false,
          error: `Too many failed attempts. Please wait ${remaining} seconds before trying again.`,
        }
      }

      const cleanEmail = cleanText(email).toLowerCase()
      const accounts = getStoredAccounts()
      const account = accounts.find((a) => a.email === cleanEmail)

      // Generic error message to prevent account enumeration
      const genericError = 'Email or password is incorrect.'

      if (!account) {
        const newAttempts = lockout.failedAttempts + 1
        let lockedUntil = lockout.lockedUntil
        if (newAttempts >= 5) {
          const exponent = Math.min(newAttempts - 5, 5)
          lockedUntil = Date.now() + 30000 * Math.pow(2, exponent)
        }
        saveLockoutState({ failedAttempts: newAttempts, lockedUntil })
        return { success: false, error: genericError }
      }

      try {
        const isValid = await verifyPassword(
          password,
          account.salt,
          account.hash,
          account.iterations
        )

        if (!isValid) {
          const newAttempts = lockout.failedAttempts + 1
          let lockedUntil = lockout.lockedUntil
          if (newAttempts >= 5) {
            const exponent = Math.min(newAttempts - 5, 5)
            lockedUntil = Date.now() + 30000 * Math.pow(2, exponent)
          }
          saveLockoutState({ failedAttempts: newAttempts, lockedUntil })
          return { success: false, error: genericError }
        }

        // Successful authentication: reset lockout
        saveLockoutState({ failedAttempts: 0, lockedUntil: null })

        const now = Date.now()
        const newSession: Session = {
          userId: account.id,
          issuedAt: new Date(now).toISOString(),
          expiresAt: new Date(now + 7 * 86400000).toISOString(),
        }

        saveStoredSession(newSession)
        setUser(account)
        setSession(newSession)

        return { success: true }
      } catch (err) {
        console.error('Sign-in failed:', err)
        return { success: false, error: 'Authentication verification failed. Please try again.' }
      }
    },
    []
  )

  const signOut = useCallback(() => {
    saveStoredSession(null)
    setUser(null)
    setSession(null)
  }, [])

  const deleteAccount = useCallback(
    async (
      emailConfirmation: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No active user session found.' }
      }

      if (cleanText(emailConfirmation).toLowerCase() !== user.email) {
        return {
          success: false,
          error: 'Email confirmation does not match your registered email address.',
        }
      }

      const accounts = getStoredAccounts()
      const filtered = accounts.filter((a) => a.id !== user.id)
      saveStoredAccounts(filtered)

      // Delete user-specific finance state
      deleteUserData(user.id)

      // Clear session
      saveStoredSession(null)
      setUser(null)
      setSession(null)

      return { success: true }
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        storageError,
        lockoutRemainingSeconds,
        signUp,
        signIn,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
