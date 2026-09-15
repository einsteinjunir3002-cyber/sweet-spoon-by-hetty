import { PrismaClient } from '@prisma/client'

// Prevent multiple PrismaClient instances in development (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const db = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = db
}
