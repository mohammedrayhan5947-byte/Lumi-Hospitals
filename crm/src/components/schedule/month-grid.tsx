import Link from "next/link"
import { getDay } from "date-fns"
import type { CalendarData } from "@/actions/schedule"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function loadClass(count: number, booked: number, avail: number, leave: boolean) {
  if (leave) return "bg-rose-50 border-rose-200 dark:bg-rose-950/40"
  if (count === 0) return "bg-card"
  const ratio = avail > 0 ? booked / avail : 1
  if (ratio >= 0.85) return "bg-red-100 border-red-300 dark:bg-red-950/50"
  if (ratio >= 0.5) return "bg-amber-100 border-amber-300 dark:bg-amber-950/50"
  return "bg-emerald-100 border-emerald-300 dark:bg-emerald-950/50"
}

/** Month overview: per-day appointment count, coloured by booked time / rostered time. Links to the day view. */
export function MonthGrid({ data, dayHref }: { data: CalendarData; dayHref: (day: string) => string }) {
  const first = new Date(`${data.month[0]?.dayKey}T00:00:00`)
  const lead = (getDay(first) + 6) % 7
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
        {data.month.map((c) => {
          const isToday = c.dayKey === data.serverNowDay
          return (
            <Link
              key={c.dayKey}
              href={dayHref(c.dayKey)}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg border p-1 text-xs transition hover:ring-2 hover:ring-primary/40 sm:min-h-20 sm:text-sm ${loadClass(c.count, c.bookedMin, c.availMin, c.leave)} ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <span className="font-medium">{Number(c.dayKey.slice(8))}</span>
              {c.leave ? (
                <span className="text-[10px] text-rose-700">Leave</span>
              ) : c.count > 0 ? (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">{c.count}</span>
              ) : null}
              {!c.leave && c.availMin > 0 && c.count > 0 && (
                <span className="hidden text-[10px] text-muted-foreground sm:inline">{Math.round((c.bookedMin / c.availMin) * 100)}% booked</span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <Legend c="bg-emerald-200" t="Light (under 50%)" />
        <Legend c="bg-amber-200" t="Busy (50-85%)" />
        <Legend c="bg-red-200" t="Full (85%+)" />
        <Legend c="bg-rose-100" t="Leave" />
      </div>
    </div>
  )
}

function Legend({ c, t }: { c: string; t: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${c}`} />
      {t}
    </span>
  )
}
