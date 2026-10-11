export interface Account {
  id: string
  name: string
  email: string // normalized lowercased
  salt: string // hex encoded 16 bytes
  hash: string // hex encoded 32 bytes (256-bit)
  iterations: number // 600,000
  createdAt: string // ISO timestamp
}

export interface Session {
  userId: string
  issuedAt: string
  expiresAt: string // 7 days from issue
}

export interface LockoutState {
  failedAttempts: number
  lockedUntil: number | null // epoch timestamp ms
}
