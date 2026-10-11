import { describe, it, expect } from 'vitest'
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  constantTimeCompare,
  bytesToHex,
  hexToBytes,
} from './crypto'

describe('Auth Crypto (PBKDF2-SHA-256)', () => {
  it('generates unique 16-byte hex salts', () => {
    const salt1 = generateSalt()
    const salt2 = generateSalt()

    expect(salt1).toHaveLength(32) // 16 bytes = 32 hex chars
    expect(salt2).toHaveLength(32)
    expect(salt1).not.toBe(salt2)
  })

  it('converts bytes to hex and back accurately', () => {
    const original = new Uint8Array([0, 15, 255, 128, 64])
    const hex = bytesToHex(original)
    const restored = hexToBytes(hex)

    expect(restored).toEqual(original)
  })

  it('verifies correct passwords and rejects incorrect passwords', async () => {
    const salt = generateSalt()
    const password = 'SuperSecretPassword123'
    // Use smaller iteration count in test for speed
    const hash = await hashPassword(password, salt, 1000)

    const isMatch = await verifyPassword(password, salt, hash, 1000)
    expect(isMatch).toBe(true)

    const wrongMatch = await verifyPassword('WrongPassword123', salt, hash, 1000)
    expect(wrongMatch).toBe(false)
  })

  it('constantTimeCompare returns false on length mismatch and different characters', () => {
    expect(constantTimeCompare('abcdef', 'abcdef')).toBe(true)
    expect(constantTimeCompare('abcdef', 'abcdeg')).toBe(false)
    expect(constantTimeCompare('abcdef', 'abcde')).toBe(false)
  })
})
