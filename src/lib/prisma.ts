import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null }

function createPrismaClient(): PrismaClient | null {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.warn('[Prisma] DATABASE_URL이 설정되지 않았습니다. DB 기능이 비활성화됩니다.')
    return null
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('@neondatabase/serverless')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaNeon } = require('@prisma/adapter-neon')
    const pool = new Pool({ connectionString: dbUrl })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter } as never)
  } catch (e) {
    console.error('[Prisma] 클라이언트 생성 실패:', e)
    return null
  }
}

export const prisma = globalForPrisma.prisma !== undefined
  ? globalForPrisma.prisma
  : (() => {
      const client = createPrismaClient()
      if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
      return client
    })()
