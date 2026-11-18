import { addDays, addMonths, differenceInCalendarDays, endOfMonth, format, parse, startOfDay, startOfMonth, startOfWeek } from "date-fns"

/** Pure data-shaping helpers for the doctor calendar & workload analytics (no DB, no auth). */

export const dayKey = (d: Date) => format(d, "yyyy-MM-dd")
export const parseDayKey = (k: string) => parse(k, "yyyy-MM-dd", new Date())
export const minuteOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes()
export const hhmmToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

export type ApptInput = {
  id: string
  scheduledAt: Date
  durationMinutes: number
  status: string
  checkedInAt: Date | null
  startedAt: Date | null
  completedAt: Date | null
}
export type AvailInput = { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }

/** Actual consultation minutes (completedAt - startedAt) for COMPLETED appointments, else null. */
export function actualMinutes(a: Pick<ApptInput, "status" | "startedAt" | "completedAt">) {
  if (a.status !== "COMPLETED" || !a.startedAt || !a.completedAt) return null
  const m = (a.completedAt.getTime() - a.startedAt.getTime()) / 60000
  return m > 0 ? m : null
}

export type RangePreset = "week" | "month" | "6m" | "12m" | "custom"

export function resolveRange(preset: RangePreset, now: Date, from?: string, to?: string) {
  const today = startOfDay(now)
  let a: Date
  let b: Date
  if (preset === "week") {
    a = startOfWeek(today, { weekStartsOn: 1 })
    b = addDays(a, 6)
  } else if (preset === "month") {
    a = startOfMonth(today)
    b = endOfMonth(today)
  } else if (preset === "6m") {
    a = startOfMonth(addMonths(today, -5))
    b = today
  } else if (preset === "12m") {
    a = startOfMonth(addMonths(today, -11))
    b = today
  } else {
    a = from ? parseDayKey(from) : startOfMonth(today)
    b = to ? parseDayKey(to) : today
    if (isNaN(a.getTime())) a = startOfMonth(today)
    if (isNaN(b.getTime())) b = today
    if (b < a) [a, b] = [b, a]
    if (differenceInCalendarDays(b, a) > 730) a = addDays(b, -730)
  }
  return { from: a, to: b }
}

export type Granularity = "day" | "week" | "month"
export function granularityFor(from: Date, to: Date): Granularity {
  const days = differenceInCalendarDays(to, from) + 1
  return days <= 10 ? "day" : days <= 62 ? "week" : "month"
}

function bucketKey(d: Date, g: Granularity) {
  if (g === "day") return dayKey(d)
  if (g === "week") return dayKey(startOfWeek(d, { weekStartsOn: 1 }))
  return format(d, "yyyy-MM")
}
function bucketLabel(k: string, g: Granularity) {
  if (g === "day") return format(parseDayKey(k), "EEE d")
  if (g === "week") return format(parseDayKey(k), "d MMM")
  return format(parse(k, "yyyy-MM", new Date()), "MMM yy")
}

const COUNTED = (s: string) => s !== "CANCELLED" && s !== "RESCHEDULED"
const BOOKED = (s: string) => s !== "CANCELLED" && s !== "RESCHEDULED" && s !== "NO_SHOW"

/** Minutes the doctor is rostered on a date (0 on leave), optionally clipped to `until`. */
export function availableMinutesOn(date: Date, avail: AvailInput[], onLeave: boolean, until?: Date) {
  if (onLeave) return 0
  const dow = date.getDay()
  let total = 0
  const cap = until && dayKey(until) === dayKey(date) ? minuteOfDay(until) : until && until < date ? 0 : 24 * 60
  for (const a of avail) {
    if (!a.isActive || a.dayOfWeek !== dow) continue
    const s = hhmmToMin(a.startTime)
    const e = Math.min(hhmmToMin(a.endTime), cap)
    if (e > s) total += e - s
  }
  return total
}

export type Workload = ReturnType<typeof computeWorkload>

export function computeWorkload(
  appts: ApptInput[],
  avail: AvailInput[],
  leaveKeys: Set<string>,
  from: Date,
  to: Date,
  now: Date
) {
  const byStatus: Record<string, number> = {}
  for (const a of appts) byStatus[a.status] = (byStatus[a.status] ?? 0) + 1

  const counted = appts.filter((a) => COUNTED(a.status))
  const seen = appts.filter((a) => a.status === "COMPLETED" || a.status === "IN_CONSULTATION")
  const scheduledMinutes = appts.filter((a) => BOOKED(a.status)).reduce((s, a) => s + a.durationMinutes, 0)

  const done = appts.map((a) => ({ a, act: actualMinutes(a) })).filter((x): x is { a: ApptInput; act: number } => x.act !== null)
  const actualTotal = done.reduce((s, x) => s + x.act, 0)
  const avgActual = done.length ? actualTotal / done.length : null
  const avgScheduledOfDone = done.length ? done.reduce((s, x) => s + x.a.durationMinutes, 0) / done.length : null

  // Available time up to now (future days are not "idle yet").
  let availableMinutes = 0
  const days = differenceInCalendarDays(to, from) + 1
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i)
    if (startOfDay(d) > now) break
    availableMinutes += availableMinutesOn(d, avail, leaveKeys.has(dayKey(d)), now)
  }
  const bookedPastMinutes = appts
    .filter((a) => BOOKED(a.status) && a.scheduledAt <= now)
    .reduce((s, a) => s + (actualMinutes(a) ?? a.durationMinutes), 0)

  const weekday = Array.from({ length: 7 }, () => 0)
  const hours = Array.from({ length: 24 }, () => 0)
  for (const a of counted) {
    weekday[a.scheduledAt.getDay()]++
    hours[a.scheduledAt.getHours()]++
  }
  const maxWd = Math.max(...weekday)
  const maxHr = Math.max(...hours)

  const noShow = byStatus.NO_SHOW ?? 0
  const cancelled = byStatus.CANCELLED ?? 0
  const denom = appts.filter((a) => a.status !== "RESCHEDULED").length

  const g = granularityFor(from, to)
  const buckets = new Map<string, { count: number; actualHours: number; scheduledHours: number }>()
  // pre-seed so empty periods show as zero
  for (let d = new Date(from); d <= to; d = g === "month" ? startOfMonth(addMonths(d, 1)) : addDays(d, g === "week" ? 7 : 1)) {
    buckets.set(bucketKey(d, g), { count: 0, actualHours: 0, scheduledHours: 0 })
    if (g === "week" && bucketKey(d, g) !== dayKey(d)) d = parseDayKey(bucketKey(d, g))
  }
  buckets.set(bucketKey(to, g), buckets.get(bucketKey(to, g)) ?? { count: 0, actualHours: 0, scheduledHours: 0 })
  for (const a of counted) {
    const b = buckets.get(bucketKey(a.scheduledAt, g))
    if (!b) continue
    b.count++
    if (BOOKED(a.status)) b.scheduledHours += a.durationMinutes / 60
    b.actualHours += (actualMinutes(a) ?? 0) / 60
  }
  const trend = [...buckets.entries()]
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([k, v]) => ({ key: k, label: bucketLabel(k, g), ...v }))

  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null)
  return {
    total: appts.length,
    byStatus,
    patientsSeen: new Set(seen.map((a) => a.id)).size,
    scheduledHours: Math.round((scheduledMinutes / 60) * 10) / 10,
    actualHours: Math.round((actualTotal / 60) * 10) / 10,
    availableHours: Math.round((availableMinutes / 60) * 10) / 10,
    actualUtilisation: pct(actualTotal, availableMinutes),
    bookedUtilisation: pct(bookedPastMinutes, availableMinutes),
    avgActualMinutes: avgActual === null ? null : Math.round(avgActual * 10) / 10,
    avgScheduledMinutes: avgScheduledOfDone === null ? null : Math.round(avgScheduledOfDone * 10) / 10,
    consultationsMeasured: done.length,
    weekday,
    hours,
    busiestWeekday: maxWd > 0 ? weekday.indexOf(maxWd) : null,
    busiestHour: maxHr > 0 ? hours.indexOf(maxHr) : null,
    noShowRate: pct(noShow, denom),
    cancelRate: pct(cancelled, denom),
    granularity: g,
    trend,
  }
}
