import type { Account, Session, LockoutState } from './types'

const ACCOUNTS_KEY = 'runway:v1:accounts'
const SESSION_KEY = 'runway:v1:session'
const LOCKOUT_KEY = 'runway:v1:lockout'

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function getStoredAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredAccounts(accounts: Account[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch (err) {
    console.error('Failed to save accounts to localStorage:', err)
  }
}

export function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.userId === 'string') {
      // Check expiry (7 days)
      if (new Date(parsed.expiresAt).getTime() > Date.now()) {
        return parsed
      }
      // Session expired
      localStorage.removeItem(SESSION_KEY)
    }
    return null
  } catch {
    return null
  }
}

export function saveStoredSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  } catch (err) {
    console.error('Failed to save session to localStorage:', err)
  }
}

export function getLockoutState(): LockoutState {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY)
    if (!raw) return { failedAttempts: 0, lockedUntil: null }
    return JSON.parse(raw)
  } catch {
    return { failedAttempts: 0, lockedUntil: null }
  }
}

export function saveLockoutState(state: LockoutState): void {
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save lockout state:', err)
  }
}

export function deleteUserData(userId: string): void {
  try {
    localStorage.removeItem(`runway:v1:data:${userId}`)
  } catch (err) {
    console.error('Failed to delete user finance data:', err)
  }
}
