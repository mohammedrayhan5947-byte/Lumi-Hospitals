import Link from "next/link"
import { addDays, addMonths, format, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react"
import { getCalendarData, getScheduleDoctors, getWorkloadAnalytics, type CalView } from "@/actions/schedule"
import { checkScheduleAccess } from "@/lib/schedule-access"
import { dayKey, parseDayKey, type RangePreset } from "@/lib/schedule-stats"
import { DoctorPicker } from "@/components/schedule/doctor-picker"
import { TimeGrid } from "@/components/schedule/time-grid"
import { MonthGrid } from "@/components/schedule/month-grid"
import { WorkloadPanel } from "@/components/schedule/workload-panel"

type SP = Record<string, string | undefined>

export default async function CalendarPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const me = await checkScheduleAccess()
  if (!me) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl border bg-card p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-lg font-semibold">Access restricted</h1>
        <p className="mt-1 text-sm text-muted-foreground">Doctor schedules are visible only to admins, reception and the doctor concerned.</p>
      </div>
    )
  }

  const doctors = await getScheduleDoctors()
  if (doctors.length === 0) {
    return <p className="text-sm text-muted-foreground">No active doctors found.</p>
  }
  // A doctor is always pinned to themself, whatever ?doctor= says.
  const doctor = me.role === "DOCTOR" ? doctors.find((d) => d.id === me.id) ?? doctors[0] : doctors.find((d) => d.id === sp.doctor) ?? doctors[0]

  const view: CalView = sp.view === "week" || sp.view === "month" ? sp.view : sp.year && sp.month && !sp.view ? "month" : "day"
  let date = sp.date && !isNaN(parseDayKey(sp.date).getTime()) ? sp.date : null
  if (!date && sp.year && sp.month) date = `${sp.year}-${String(sp.month).padStart(2, "0")}-01`
  date ??= dayKey(new Date())
  const range = (["week", "month", "6m", "12m", "custom"].includes(sp.range ?? "") ? sp.range : "month") as RangePreset

  const [cal, workload] = await Promise.all([
    getCalendarData({ doctorId: doctor.id, view, date }),
    getWorkloadAnalytics({ doctorId: doctor.id, range, from: sp.from, to: sp.to }),
  ])

  const hrefFor = (over: Record<string, string>) => {
    const p = new URLSearchParams()
    p.set("doctor", doctor.id)
    p.set("view", view)
    p.set("date", date)
    p.set("range", range)
    if (sp.from) p.set("from", sp.from)
    if (sp.to) p.set("to", sp.to)
    for (const [k, v] of Object.entries(over)) p.set(k, v)
    return `/calendar?${p.toString()}`
  }

  const anchor = parseDayKey(date)
  const step = (dir: 1 | -1) =>
    dayKey(view === "day" ? addDays(anchor, dir) : view === "week" ? addDays(anchor, 7 * dir) : addMonths(anchor, dir))
  const title =
    view === "day"
      ? format(anchor, "EEEE, d MMMM yyyy")
      : view === "week"
        ? `${format(startOfWeek(anchor, { weekStartsOn: 1 }), "d MMM")} – ${format(addDays(startOfWeek(anchor, { weekStartsOn: 1 }), 6), "d MMM yyyy")}`
        : `${format(anchor, "MMMM yyyy")}`

  // query for the workload panel's own links (keeps doctor + calendar state, drops range params)
  const baseQuery = new URLSearchParams({ doctor: doctor.id, view, date }).toString()

  const btn = "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted"
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            {doctor.name}
            {doctor.specialization ? ` · ${doctor.specialization}` : ""} — schedule and workload
          </p>
        </div>
        {me.role !== "DOCTOR" ? (
          <DoctorPicker doctors={doctors} selectedId={doctor.id} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <div className="inline-flex overflow-hidden rounded-md border text-sm">
          {(["day", "week", "month"] as const).map((v) => (
            <Link key={v} href={hrefFor({ view: v })} className={`px-3 py-1.5 capitalize ${view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {v}
            </Link>
          ))}
        </div>
        <Link href={hrefFor({ date: step(-1) })} aria-label="Previous" className={btn}><ChevronLeft className="h-4 w-4" /></Link>
        <Link href={hrefFor({ date: dayKey(new Date()) })} className={btn}>Today</Link>
        <Link href={hrefFor({ date: step(1) })} aria-label="Next" className={btn}><ChevronRight className="h-4 w-4" /></Link>
        <span className="ml-1 text-sm font-medium">{title}</span>
      </div>

      {view === "month" ? (
        <MonthGrid data={cal} dayHref={(d) => hrefFor({ view: "day", date: d })} />
      ) : (
        <TimeGrid data={cal} />
      )}

      <WorkloadPanel data={workload} baseQuery={baseQuery} />
    </div>
  )
}
