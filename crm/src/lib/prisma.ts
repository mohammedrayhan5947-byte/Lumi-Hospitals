import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Serverless: keep each instance to one connection; Supavisor (port 6543) does the pooling.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: process.env.VERCEL ? 1 : 10,
})

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
