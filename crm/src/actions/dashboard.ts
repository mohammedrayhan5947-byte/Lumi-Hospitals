"use server"

import { startOfDay, endOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function getDashboardStats() {
  const me = await getCurrentUser()
  const mine = me.role === "DOCTOR" ? { doctorId: me.id } : {}
  const now = new Date()
  const dayStart = startOfDay(now)
  const dayEnd = endOfDay(now)

  const [
    newPatientsToday,
    todayAppointments,
    waitingQueueCount,
    inProgressCount,
    noShowToday,
    overdueScheduled,
    followUpsDue,
    totalActivePatients,
  ] = await Promise.all([
    prisma.patient.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.appointment.findMany({
      where: {
        ...mine,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELLED", "RESCHEDULED"] },
      },
      include: { patient: true, doctor: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.appointment.count({
      where: { ...mine, checkedInAt: { gte: dayStart, lte: dayEnd }, status: "ARRIVED" },
    }),
    prisma.appointment.count({
      where: { ...mine, status: "IN_CONSULTATION" },
    }),
    prisma.appointment.count({
      where: { ...mine, scheduledAt: { gte: dayStart, lte: dayEnd }, status: "NO_SHOW" },
    }),
    prisma.appointment.count({
      where: {
        ...mine,
        scheduledAt: { gte: dayStart, lt: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.followUp.findMany({
      where: { status: "PENDING", dueDate: { lte: dayEnd } },
      include: { patient: true, assignedTo: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.patient.count({ where: { status: "ACTIVE" } }),
  ])

  const todayPatientIds = [...new Set(todayAppointments.map((a) => a.patientId))]
  const priorVisits = todayPatientIds.length
    ? await prisma.appointment.findMany({
        where: {
          patientId: { in: todayPatientIds },
          status: "COMPLETED",
          scheduledAt: { lt: dayStart },
        },
        select: { patientId: true },
        distinct: ["patientId"],
      })
    : []
  const returningPatientIds = new Set(priorVisits.map((v) => v.patientId))

  return {
    newPatientsToday,
    returningPatientsToday: returningPatientIds.size,
    todayAppointmentsCount: todayAppointments.length,
    todayAppointments,
    waitingQueueCount,
    inProgressCount,
    missedAppointmentsCount: noShowToday + overdueScheduled,
    followUpsDue,
    followUpsDueCount: followUpsDue.length,
    totalActivePatients,
  }
}

export async function getRecentPatients(limit = 8) {
  await getCurrentUser()
  return prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { tags: { include: { tag: true } } },
  })
}

/** Extra live numbers for the dashboard: today's collections, token flow and a 7-day trend. */
export async function getDashboardInsights() {
  const me = await getCurrentUser()
  const mine = me.role === "DOCTOR" ? { doctorId: me.id } : {}
  const now = new Date()
  const dayStart = startOfDay(now)
  const dayEnd = endOfDay(now)
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))
  const tokenDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  const [pays, tokens, weekAppts, weekPays] = await Promise.all([
    prisma.payment.groupBy({
      by: ["method"],
      where: { status: "SUCCESS", paidAt: { gte: dayStart, lte: dayEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.appointment.findMany({
      where: { tokenDate, ...mine },
      select: { tokenNumber: true, status: true, doctor: { select: { name: true } } },
      orderBy: { tokenNumber: "asc" },
    }),
    prisma.appointment.findMany({
      where: { ...mine, scheduledAt: { gte: weekStart, lte: dayEnd }, status: { notIn: ["CANCELLED", "RESCHEDULED"] } },
      select: { scheduledAt: true },
    }),
    prisma.payment.findMany({
      where: { status: "SUCCESS", paidAt: { gte: weekStart, lte: dayEnd } },
      select: { paidAt: true, amount: true },
    }),
  ])

  const sum = (m: string) => Number(pays.find((p) => p.method === m)?._sum.amount ?? 0)
  const total = pays.reduce((a, p) => a + Number(p._sum.amount ?? 0), 0)
  const upi = sum("UPI")
  const cash = sum("CASH")

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
    return { key: d.toDateString(), label: d.toLocaleDateString("en-IN", { weekday: "short" }), appts: 0, collected: 0 }
  })
  for (const a of weekAppts) days.find((d) => d.key === a.scheduledAt.toDateString())!.appts++
  for (const p of weekPays) {
    const d = days.find((x) => x.key === p.paidAt.toDateString())
    if (d) d.collected += Number(p.amount)
  }

  const serving = tokens
    .filter((t) => t.status === "IN_CONSULTATION")
    .map((t) => ({ n: t.tokenNumber, doctor: t.doctor.name }))
  const waiting = tokens
    .filter((t) => t.status === "ARRIVED")
    .map((t) => ({ n: t.tokenNumber, doctor: t.doctor.name }))
  return {
    collections: { total, upi, cash, other: Math.max(0, total - upi - cash), count: pays.reduce((a, p) => a + p._count, 0) },
    tokens: {
      issued: tokens.length,
      serving,
      nextUp: waiting[0] ?? null,
      waiting: waiting.length,
      completed: tokens.filter((t) => t.status === "COMPLETED").length,
    },
    week: days.map(({ label, appts, collected }) => ({ label, appts, collected })),
  }
}
