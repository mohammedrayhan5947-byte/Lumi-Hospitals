import { formatCurrency } from "@/lib/format"

type Day = { label: string; appts: number; collected: number }

/** Last-7-days bars (appointments) with the day's collections underneath. Pure CSS, no chart library. */
export function WeekChart({ week }: { week: Day[] }) {
  const maxA = Math.max(1, ...week.map((d) => d.appts))
  return (
    <div className="grid grid-cols-7 gap-2" role="img" aria-label="Appointments and collections for the last 7 days">
      {week.map((d, i) => {
        const today = i === week.length - 1
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 text-center">
            <span className="text-xs font-semibold tabular-nums">{d.appts}</span>
            <div className="flex h-24 w-full items-end rounded-lg bg-muted/60 p-1">
              <div
                className={`w-full rounded-md ${today ? "bg-primary" : "bg-primary/45"}`}
                style={{ height: `${Math.max(6, (d.appts / maxA) * 100)}%` }}
              />
            </div>
            <span className={`text-xs ${today ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{d.label}</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">{d.collected ? formatCurrency(d.collected) : "—"}</span>
          </div>
        )
      })}
    </div>
  )
}
