"use server"

import { addDays, endOfDay, endOfMonth, format, startOfDay, startOfMonth, startOfWeek } from "date-fns"
import { prisma } from "@/lib/prisma"
import { requireScheduleAccess } from "@/lib/schedule-access"
import { formatToken } from "@/lib/tokens"
import { patientDisplayName } from "@/lib/format"
import {
  actualMinutes,
  availableMinutesOn,
  computeWorkload,
  dayKey,
  hhmmToMin,
  minuteOfDay,
  parseDayKey,
  resolveRange,
  type RangePreset,
} from "@/lib/schedule-stats"

export type CalView = "day" | "week" | "month"

export type CalAppt = {
  id: string
  patientId: string
  patientName: string
  uhid: string
  token: string
  type: string
  status: string
  reason: string | null
  dayKey: string
  startMin: number
  durMin: number
  /** actual start/end, minute-of-day in the server timezone (null when not recorded) */
  startedMin: number | null
  completedMin: number | null
  scheduledLabel: string
  scheduledEndLabel: string
  checkedInLabel: string | null
  startedLabel: string | null
  completedLabel: string | null
  actualMinutes: number | null
}

export type CalendarData = {
  doctor: { id: string; name: string; specialization: string | null }
  view: CalView
  date: string
  days: string[]
  appointments: CalAppt[]
  /** dayOfWeek (0-6) -> [startMin, endMin][] of rostered hours */
  roster: Record<number, [number, number][]>
  leaves: { dayKey: string; reason: string | null }[]
  /** month view only */
  month: { dayKey: string; count: number; bookedMin: number; availMin: number; leave: boolean }[]
  serverNowMin: number
  serverNowDay: string
}

const t = (d: Date | null) => (d ? format(d, "h:mm a") : null)

/** Doctors the caller may inspect: a doctor sees only themself; admin/reception see all active doctors. */
export async function getScheduleDoctors() {
  const me = await requireScheduleAccess()
  return prisma.user.findMany({
    where: { role: "DOCTOR", active: true, ...(me.role === "DOCTOR" ? { id: me.id } : {}) },
    select: { id: true, name: true, specialization: true },
    orderBy: { name: "asc" },
  })
}

async function loadDoctor(doctorId: string) {
  await requireScheduleAccess(doctorId)
  const doctor = await prisma.user.findFirst({
    where: { id: doctorId, role: "DOCTOR" },
    select: { id: true, name: true, specialization: true },
  })
  if (!doctor) throw new Error("Doctor not found")
  return doctor
}

export async function getCalendarData(input: { doctorId: string; view: CalView; date: string }): Promise<CalendarData> {
  const doctor = await loadDoctor(input.doctorId)
  const view: CalView = input.view === "week" || input.view === "month" ? input.view : "day"
  let anchor = parseDayKey(input.date)
  if (isNaN(anchor.getTime())) anchor = new Date()
  anchor = startOfDay(anchor)

  const from = view === "day" ? anchor : view === "week" ? startOfWeek(anchor, { weekStartsOn: 1 }) : startOfMonth(anchor)
  const to = view === "day" ? anchor : view === "week" ? addDays(from, 6) : endOfMonth(anchor)
  const days: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(dayKey(d))

  const [availability, leaves, appts] = await Promise.all([
    prisma.doctorAvailability.findMany({ where: { doctorId: doctor.id, isActive: true } }),
    prisma.doctorLeave.findMany({ where: { doctorId: doctor.id, date: { gte: startOfDay(from), lte: endOfDay(to) } } }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, scheduledAt: { gte: startOfDay(from), lte: endOfDay(to) } },
      include: { patient: true },
      orderBy: { scheduledAt: "asc" },
    }),
  ])

  const roster: Record<number, [number, number][]> = {}
  for (const a of availability) (roster[a.dayOfWeek] ??= []).push([hhmmToMin(a.startTime), hhmmToMin(a.endTime)])
  const leaveList = leaves.map((l) => ({ dayKey: dayKey(l.date), reason: l.reason }))
  const leaveSet = new Set(leaveList.map((l) => l.dayKey))

  const shaped: CalAppt[] = appts.map((a) => {
    const end = new Date(a.scheduledAt.getTime() + a.durationMinutes * 60000)
    const act = actualMinutes(a)
    return {
      id: a.id,
      patientId: a.patientId,
      patientName: patientDisplayName(a.patient),
      uhid: a.patient.uhid,
      token: formatToken(a.tokenNumber),
      type: a.type,
      status: a.status,
      reason: a.reason,
      dayKey: dayKey(a.scheduledAt),
      startMin: minuteOfDay(a.scheduledAt),
      durMin: a.durationMinutes,
      startedMin: a.startedAt && dayKey(a.startedAt) === dayKey(a.scheduledAt) ? minuteOfDay(a.startedAt) : null,
      completedMin: a.completedAt && dayKey(a.completedAt) === dayKey(a.scheduledAt) ? minuteOfDay(a.completedAt) : null,
      scheduledLabel: t(a.scheduledAt)!,
      scheduledEndLabel: t(end)!,
      checkedInLabel: t(a.checkedInAt),
      startedLabel: t(a.startedAt),
      completedLabel: t(a.completedAt),
      actualMinutes: act === null ? null : Math.round(act),
    }
  })

  const now = new Date()
  const month: CalendarData["month"] = []
  if (view === "month") {
    const avail = availability.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime, isActive: true }))
    for (const k of days) {
      const d = parseDayKey(k)
      const day = appts.filter((a) => dayKey(a.scheduledAt) === k && a.status !== "CANCELLED" && a.status !== "RESCHEDULED")
      month.push({
        dayKey: k,
        count: day.length,
        bookedMin: day.reduce((s, a) => s + a.durationMinutes, 0),
        availMin: availableMinutesOn(d, avail, leaveSet.has(k)),
        leave: leaveSet.has(k),
      })
    }
  }

  return {
    doctor,
    view,
    date: dayKey(anchor),
    days,
    appointments: view === "month" ? [] : shaped,
    roster,
    leaves: leaveList,
    month,
    serverNowMin: minuteOfDay(now),
    serverNowDay: dayKey(now),
  }
}

export type WorkloadRecord = {
  id: string
  date: string
  time: string
  patientId: string
  patientName: string
  token: string
  scheduledMinutes: number
  actualMinutes: number | null
  status: string
}

export async function getWorkloadAnalytics(input: { doctorId: string; range: RangePreset; from?: string; to?: string }) {
  const doctor = await loadDoctor(input.doctorId)
  const now = new Date()
  const range = resolveRange(input.range, now, input.from, input.to)

  const [availability, leaves, appts] = await Promise.all([
    prisma.doctorAvailability.findMany({ where: { doctorId: doctor.id } }),
    prisma.doctorLeave.findMany({ where: { doctorId: doctor.id, date: { gte: startOfDay(range.from), lte: endOfDay(range.to) } } }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id, scheduledAt: { gte: startOfDay(range.from), lte: endOfDay(range.to) } },
      include: { patient: true },
      orderBy: { scheduledAt: "desc" },
    }),
  ])

  const stats = computeWorkload(appts, availability, new Set(leaves.map((l) => dayKey(l.date))), range.from, range.to, now)

  const RECORD_CAP = 200
  const records: WorkloadRecord[] = appts.slice(0, RECORD_CAP).map((a) => {
    const act = actualMinutes(a)
    return {
      id: a.id,
      date: format(a.scheduledAt, "dd MMM yyyy"),
      time: format(a.scheduledAt, "h:mm a"),
      patientId: a.patientId,
      patientName: patientDisplayName(a.patient),
      token: formatToken(a.tokenNumber),
      scheduledMinutes: a.durationMinutes,
      actualMinutes: act === null ? null : Math.round(act),
      status: a.status,
    }
  })

  return {
    doctor,
    range: { preset: input.range, from: dayKey(range.from), to: dayKey(range.to) },
    stats,
    records,
    totalRecords: appts.length,
    recordCap: RECORD_CAP,
  }
}
