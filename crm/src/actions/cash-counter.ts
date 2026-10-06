"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { toPlain } from "@/lib/serialize"
import { cashSessionCloseSchema, type CashSessionCloseInput } from "@/lib/validations/billing"

export async function getOpenCashSession() {
  const session = await prisma.cashSession.findFirst({
    where: { status: "OPEN" },
    include: { openedBy: true, payments: true },
    orderBy: { openedAt: "desc" },
  })
  if (!session) return null
  return toPlain(session)
}

export async function openCashSession(openingBalance: number) {
  const existing = await prisma.cashSession.findFirst({ where: { status: "OPEN" } })
  if (existing) throw new Error("A cash session is already open")

  const user = await getCurrentUser()
  const session = await prisma.cashSession.create({
    data: { openedById: user.id, openingBalance },
  })
  revalidatePath("/finance/cash-counter")
  return toPlain(session)
}

export async function closeCashSession(id: string, input: CashSessionCloseInput) {
  const data = cashSessionCloseSchema.parse(input)
  const user = await getCurrentUser()

  const session = await prisma.cashSession.findUniqueOrThrow({ where: { id }, include: { payments: true } })
  const cashCollected = session.payments
    .filter((p) => p.status === "SUCCESS" && p.method === "CASH")
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const cashRefunded = await prisma.refund.aggregate({
    where: { status: "COMPLETED", method: "CASH", processedAt: { gte: session.openedAt } },
    _sum: { amount: true },
  })
  const expectedClosing = Number(session.openingBalance) + cashCollected - Number(cashRefunded._sum.amount ?? 0)

  await prisma.cashSession.update({
    where: { id },
    data: {
      status: "CLOSED",
      closingBalance: data.closingBalance,
      expectedClosing,
      notes: data.notes || null,
      closedAt: new Date(),
      closedById: user.id,
    },
  })
  revalidatePath("/finance/cash-counter")
}

export async function getCashSessionHistory(limit = 20) {
  const sessions = await prisma.cashSession.findMany({
    include: { openedBy: true, closedBy: true, payments: true },
    orderBy: { openedAt: "desc" },
    take: limit,
  })
  return toPlain(
    sessions.map((s) => ({
      ...s,
      cashCollected: s.payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + Number(p.amount), 0),
    }))
  )
}
