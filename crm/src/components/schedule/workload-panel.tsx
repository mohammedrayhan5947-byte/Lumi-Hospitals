"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Download } from "lucide-react"
import type { getWorkloadAnalytics } from "@/actions/schedule"
import { Button } from "@/components/ui/button"
import { PrintButton } from "@/components/shared/print-button"
import { statusLabel, STATUS_STYLE } from "./status"

type Result = Awaited<ReturnType<typeof getWorkloadAnalytics>>

const PRESETS: [string, string][] = [
  ["week", "This week"],
  ["month", "This month"],
  ["6m", "Last 6 months"],
  ["12m", "Last 12 months"],
  ["custom", "Custom"],
]
const WD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`
const fmtH = (n: number) => `${n}h`
const fmtPct = (n: number | null) => (n === null ? "—" : `${n}%`)

export function WorkloadPanel({ data, baseQuery }: { data: Result; baseQuery: string }) {
  const router = useRouter()
  const { stats, range } = data
  const [from, setFrom] = useState(range.from)
  const [to, setTo] = useState(range.to)
  const href = (preset: string) => {
    const p = new URLSearchParams(baseQuery)
    p.set("range", preset)
    return `?${p.toString()}`
  }

  const exportCsv = () => {
    const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const rows = [
      ["Date", "Time", "Patient", "Token", "Scheduled min", "Actual min", "Status"],
      ...data.records.map((r) => [r.date, r.time, r.patientName, r.token, r.scheduledMinutes, r.actualMinutes, statusLabel(r.status)]),
    ]
    const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `workload-${data.doctor.name.replace(/\s+/g, "-")}-${range.from}-to-${range.to}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const cards: [string, string, string?][] = [
    ["Appointments", String(stats.total)],
    ["Patients seen", String(stats.patientsSeen)],
    ["Scheduled hours", fmtH(stats.scheduledHours)],
    ["Actual working hours", fmtH(stats.actualHours), `${stats.consultationsMeasured} timed consultations`],
    ["Utilisation (actual)", fmtPct(stats.actualUtilisation), `of ${stats.availableHours}h rostered so far`],
    ["Utilisation (booked)", fmtPct(stats.bookedUtilisation)],
    ["Avg consultation", stats.avgActualMinutes === null ? "—" : `${stats.avgActualMinutes} min`, stats.avgScheduledMinutes === null ? undefined : `scheduled ${stats.avgScheduledMinutes} min`],
    ["No-show / cancel", `${fmtPct(stats.noShowRate)} / ${fmtPct(stats.cancelRate)}`],
    ["Busiest weekday", stats.busiestWeekday === null ? "—" : WD[stats.busiestWeekday]],
    ["Busiest hour", stats.busiestHour === null ? "—" : hourLabel(stats.busiestHour)],
  ]

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Workload — {data.doctor.name}</h2>
          <p className="text-xs text-muted-foreground">
            {range.from} to {range.to}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex flex-wrap gap-1">
            {PRESETS.map(([k, label]) => (
              <Link
                key={k}
                href={href(k)}
                className={`rounded-md border px-2.5 py-1.5 text-xs ${range.preset === k ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {label}
              </Link>
            ))}
          </div>
          <PrintButton label="Print" />
        </div>
      </div>

      {range.preset === "custom" && (
        <form
          className="flex flex-wrap items-end gap-2 print:hidden"
          onSubmit={(e) => {
            e.preventDefault()
            const p = new URLSearchParams(baseQuery)
            p.set("range", "custom")
            p.set("from", from)
            p.set("to", to)
            router.push(`?${p.toString()}`)
          }}
        >
          <label className="text-xs">
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block h-9 rounded-md border bg-background px-2 text-sm" />
          </label>
          <label className="text-xs">
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block h-9 rounded-md border bg-background px-2 text-sm" />
          </label>
          <Button type="submit" size="sm">Apply</Button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map(([k, v, sub]) => (
          <div key={k} className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="text-xl font-semibold">{v}</div>
            {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(stats.byStatus).map(([s, n]) => (
          <span key={s} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[s]?.dot ?? "bg-slate-400"}`} />
            {statusLabel(s)}: <b>{n}</b>
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={`Appointments per ${stats.granularity}`}>
          <TrendChart
            points={stats.trend.map((t) => ({ label: t.label, value: t.count }))}
            unit=""
            color="var(--chart-1, #6366f1)"
          />
        </ChartCard>
        <ChartCard title={`Actual vs scheduled hours per ${stats.granularity}`}>
          <TrendChart
            points={stats.trend.map((t) => ({ label: t.label, value: Math.round(t.actualHours * 10) / 10 }))}
            line={stats.trend.map((t) => Math.round(t.scheduledHours * 10) / 10)}
            unit="h"
            color="#10b981"
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="By weekday">
          <TrendChart points={[1, 2, 3, 4, 5, 6, 0].map((d) => ({ label: WD[d].slice(0, 3), value: stats.weekday[d] }))} unit="" color="#0ea5e9" />
        </ChartCard>
        <ChartCard title="By start hour">
          <TrendChart
            points={stats.hours.map((v, h) => ({ label: String(h), value: v })).filter((p) => Number(p.label) >= 7 && Number(p.label) <= 21)}
            unit=""
            color="#f59e0b"
          />
        </ChartCard>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
          <div>
            <h3 className="text-sm font-semibold">Previous records</h3>
            {data.totalRecords > data.recordCap && (
              <p className="text-xs text-muted-foreground">
                Showing the latest {data.recordCap} of {data.totalRecords}. Narrow the date range to see older rows.
              </p>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                {["Date", "Time", "Patient", "Token", "Scheduled", "Actual", "Status"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-1.5 whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap">{r.time}</td>
                  <td className="px-3 py-1.5">
                    <Link href={`/patients/${r.patientId}`} className="text-primary hover:underline">{r.patientName}</Link>
                  </td>
                  <td className="px-3 py-1.5">{r.token}</td>
                  <td className="px-3 py-1.5">{r.scheduledMinutes} min</td>
                  <td className="px-3 py-1.5">{r.actualMinutes === null ? "—" : `${r.actualMinutes} min`}</td>
                  <td className="px-3 py-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[r.status]?.dot ?? ""}`} />
                      {statusLabel(r.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {data.records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">No appointments in this range.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  )
}

/** Inline-SVG bar chart with an optional overlay line (e.g. scheduled hours over actual hours). */
function TrendChart({
  points,
  line,
  unit,
  color,
}: {
  points: { label: string; value: number }[]
  line?: number[]
  unit: string
  color: string
}) {
  const W = 480
  const H = 180
  const pad = { l: 30, r: 8, t: 10, b: 24 }
  const max = Math.max(1, ...points.map((p) => p.value), ...(line ?? []))
  const niceMax = Math.ceil(max)
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const bw = iw / Math.max(points.length, 1)
  const y = (v: number) => pad.t + ih - (v / niceMax) * ih
  const every = Math.ceil(points.length / 12)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="chart">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={W - pad.r} y1={y(niceMax * f)} y2={y(niceMax * f)} stroke="currentColor" strokeOpacity={0.12} />
          <text x={pad.l - 4} y={y(niceMax * f) + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity={0.6}>
            {Math.round(niceMax * f * 10) / 10}
            {unit}
          </text>
        </g>
      ))}
      {points.map((p, i) => (
        <g key={i}>
          <rect x={pad.l + i * bw + bw * 0.15} y={y(p.value)} width={bw * 0.7} height={Math.max(0, pad.t + ih - y(p.value))} rx={2} fill={color}>
            <title>{`${p.label}: ${p.value}${unit}`}</title>
          </rect>
          {i % every === 0 && (
            <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
              {p.label}
            </text>
          )}
        </g>
      ))}
      {line && line.length > 1 && (
        <polyline
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          points={line.map((v, i) => `${pad.l + i * bw + bw / 2},${y(v)}`).join(" ")}
        />
      )}
      {line && <text x={W - pad.r} y={10} textAnchor="end" fontSize="9" fill="#6366f1">line: scheduled</text>}
    </svg>
  )
}
