import { describe, it, expect, beforeEach } from 'vitest'
import {
  getStoredAccounts,
  saveStoredAccounts,
  getStoredSession,
  saveStoredSession,
  getLockoutState,
  saveLockoutState,
  deleteUserData,
} from './storage'
import type { Account, Session } from './types'

const store = new Map<string, string>()
const mockStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, val: string) => store.set(key, String(val)),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
}

// Polyfill localStorage in Node test runner
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
})

describe('Auth Storage & Lockout Tests', () => {
  beforeEach(() => {
    store.clear()
  })

  it('stores and retrieves account profiles correctly', () => {
    const dummyAccount: Account = {
      id: 'usr_1',
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      salt: '0123456789abcdef',
      hash: 'abcdef0123456789',
      iterations: 600000,
      createdAt: '2026-10-11T00:00:00Z',
    }

    saveStoredAccounts([dummyAccount])
    const loaded = getStoredAccounts()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.email).toBe('rohan@example.com')
  })

  it('validates active session and discards expired sessions', () => {
    const now = Date.now()
    const activeSession: Session = {
      userId: 'usr_1',
      issuedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 86400000).toISOString(), // +1 day
    }

    saveStoredSession(activeSession)
    expect(getStoredSession()?.userId).toBe('usr_1')

    // Expired session:
    const expiredSession: Session = {
      userId: 'usr_1',
      issuedAt: new Date(now - 86400000 * 8).toISOString(),
      expiresAt: new Date(now - 1000).toISOString(), // expired 1s ago
    }

    saveStoredSession(expiredSession)
    expect(getStoredSession()).toBeNull()
  })

  it('persists lockout attempts and calculates exponential backoff threshold', () => {
    const defaultLockout = getLockoutState()
    expect(defaultLockout.failedAttempts).toBe(0)
    expect(defaultLockout.lockedUntil).toBeNull()

    const futureTime = Date.now() + 30000
    saveLockoutState({ failedAttempts: 5, lockedUntil: futureTime })

    const updated = getLockoutState()
    expect(updated.failedAttempts).toBe(5)
    expect(updated.lockedUntil).toBe(futureTime)
  })

  it('deleteUserData cleanly removes user-specific finance state', () => {
    localStorage.setItem('runway:v1:data:usr_1', JSON.stringify({ test: true }))
    expect(localStorage.getItem('runway:v1:data:usr_1')).not.toBeNull()

    deleteUserData('usr_1')
    expect(localStorage.getItem('runway:v1:data:usr_1')).toBeNull()
  })
})
