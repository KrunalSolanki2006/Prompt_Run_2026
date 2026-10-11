export const PBKDF2_ITERATIONS = 600000
export const SALT_BYTES = 16
export const KEY_BITS = 256

/**
 * Converts a Uint8Array into a lowercase hex string.
 */
export function bytesToHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] ?? 0
    hex += b.toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * Converts a hex string into a Uint8Array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

/**
 * Generates a cryptographically random 16-byte salt as a hex string.
 */
export function generateSalt(): string {
  const bytes = new Uint8Array(SALT_BYTES)
  globalThis.crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

/**
 * Derives a 256-bit PBKDF2-SHA-256 hash from password and salt.
 * Uses 600,000 iterations as specified in the security requirements.
 */
export async function hashPassword(
  password: string,
  saltHex: string,
  iterations = PBKDF2_ITERATIONS
): Promise<string> {
  const enc = new TextEncoder()
  const passwordBytes = enc.encode(password)
  const saltBytes = hexToBytes(saltHex)

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_BITS
  )

  return bytesToHex(new Uint8Array(derivedBits))
}

/**
 * Constant-time comparison between two hex strings to prevent timing attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return mismatch === 0
}

/**
 * Verifies a plaintext password against stored salt and expected hash.
 */
export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHashHex: string,
  iterations = PBKDF2_ITERATIONS
): Promise<boolean> {
  const computedHash = await hashPassword(password, saltHex, iterations)
  return constantTimeCompare(computedHash, expectedHashHex)
}
