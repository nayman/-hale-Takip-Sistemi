import { Prisma, PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

if (!process.env.DATABASE_URL) {
  try {
    const dotenv = require("dotenv")
    const path = require("path")
    dotenv.config({ path: path.resolve(process.cwd(), ".env") })
    dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true })
  } catch (err) {
    console.warn("[PrismaClient] Failed to load dotenv:", err)
  }
}

const connectionString = process.env.DATABASE_URL

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Turbopack cache buster: 1
export const prismaClient = 
  globalForPrisma.prisma ?? 
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient

export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => PromiseLike<T>,
  options?: { timeoutMs?: number; maxWaitMs?: number }
): Promise<T> {
  return prismaClient.$transaction(async (tx) => {
    try {
      await tx.$executeRaw`SET LOCAL ROLE authenticated_user`
    } catch {}
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
    return fn(tx)
  }, {
    timeout: options?.timeoutMs ?? 20000,
    maxWait: options?.maxWaitMs ?? 5000,
  })
}
