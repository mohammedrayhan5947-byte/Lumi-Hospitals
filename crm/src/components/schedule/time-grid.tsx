"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Activity, X } from "lucide-react"
import type { CalAppt, CalendarData } from "@/actions/schedule"
import { STATUS_STYLE, statusLabel } from "./status"

const PX_PER_MIN = 1 // 60px per hour
const gutter = 48

type Placed = CalAppt & { top: number; end: number; lane: number; lanes: number; live: boolean }

function fmtMin(m: number) {
  const h = Math.floor(m / 60) % 24
  const mm = Math.floor(m % 60)
  return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
}

function layout(items: (CalAppt & { eStart: number; eEnd: number; live: boolean })[]): Placed[] {
  const sorted = [...items].sort((a, b) => a.eStart - b.eStart || b.eEnd - a.eEnd)
  const out: Placed[] = []
  let cluster: Placed[] = []
  let clusterEnd = -1
  const laneEnds: number[] = []
  const flush = () => {
    for (const p of cluster) p.lanes = laneEnds.length
    out.push(...cluster)
    cluster = []
    laneEnds.length = 0
  }
  for (const a of sorted) {
    if (cluster.length && a.eStart >= clusterEnd) flush()
    let lane = laneEnds.findIndex((e) => e <= a.eStart)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = a.eEnd
    clusterEnd = Math.max(clusterEnd, a.eEnd)
    cluster.push({ ...a, top: a.eStart, end: a.eEnd, lane, lanes: 1, live: a.live })
  }
  flush()
  return out
}

export function TimeGrid({ data }: { data: CalendarData }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  // Live clock: server minute-of-day plus time elapsed since this page was rendered (timezone-proof).
  const [mountedAt] = useState(() => Date.now())
  const [elapsedMin, setElapsedMin] = useState(0)
  const hasToday = data.days.includes(data.serverNowDay)

  useEffect(() => {
    const id = setInterval(() => setElapsedMin((Date.now() - mountedAt) / 60000), 15000)
    return () => clearInterval(id)
  }, [mountedAt])
  useEffect(() => {
    if (!hasToday) return
    const id = setInterval(() => router.refresh(), 60000)
    return () => clearInterval(id)
  }, [hasToday, router])

  const nowMin = data.serverNowMin + elapsedMin

  const byDay = useMemo(() => {
    const map: Record<string, Placed[]> = {}
    for (const day of data.days) {
      const items = data.appointments
        .filter((a) => a.dayKey === day)
        .map((a) => {
          const live = a.status === "IN_CONSULTATION" && day === data.serverNowDay
          const baseStart = a.startedMin !== null && a.status === "IN_CONSULTATION" ? Math.min(a.startMin, a.startedMin) : a.startMin
          const baseEnd = a.startMin + a.durMin
          const eEnd = live ? Math.max(baseEnd, nowMin) : baseEnd
          return { ...a, eStart: baseStart, eEnd: Math.min(eEnd, 24 * 60), live }
        })
      map[day] = layout(items)
    }
    return map
  }, [data.days, data.appointments, data.serverNowDay, nowMin])

  const all = Object.values(byDay).flat()
  const startH = Math.min(8, ...all.map((a) => Math.floor(a.top / 60)))
  const endH = Math.min(24, Math.max(20, ...all.map((a) => Math.ceil(a.end / 60))))
  const hours = Array.from({ length: endH - startH }, (_, i) => startH + i)
  const height = (endH - startH) * 60 * PX_PER_MIN
  const y = (min: number) => (min - startH * 60) * PX_PER_MIN
  const week = data.days.length > 1
  const sel = all.find((a) => a.id === selected) ?? null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground print:hidden">
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${v.dot}`} />
            {v.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted ring-1 ring-border" />Off hours</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[repeating-linear-gradient(45deg,#fca5a5,#fca5a5_2px,transparent_2px,transparent_5px)]" />Leave</span>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <div style={{ minWidth: week ? gutter + data.days.length * 120 : 320 }}>
          {/* header */}
          <div className="flex border-b text-center text-xs font-medium">
            <div style={{ width: gutter }} className="shrink-0" />
            {data.days.map((d) => {
              const dt = new Date(`${d}T00:00:00`)
              const isToday = d === data.serverNowDay
              return (
                <Link
                  key={d}
                  href={`?${new URLSearchParams({ view: "day", date: d }).toString()}`}
                  onClick={(e) => {
                    // keep the other params (doctor, range...) by merging into the current URL
                    e.preventDefault()
                    const p = new URLSearchParams(window.location.search)
                    p.set("view", "day")
                    p.set("date", d)
                    router.push(`?${p.toString()}`)
                  }}
                  className={`flex-1 border-l px-1 py-2 hover:bg-muted ${isToday ? "bg-primary/5 text-primary" : ""}`}
                >
                  {format(dt, "EEE d MMM")}
                </Link>
              )
            })}
          </div>
          {/* body */}
          <div className="relative flex" style={{ height }}>
            <div style={{ width: gutter }} className="relative shrink-0 text-[10px] text-muted-foreground">
              {hours.map((h) => (
                <div key={h} className="absolute right-1 -translate-y-1.5" style={{ top: y(h * 60) }}>
                  {h % 12 || 12} {h < 12 ? "AM" : "PM"}
                </div>
              ))}
            </div>
            {data.days.map((d) => {
              const dow = new Date(`${d}T00:00:00`).getDay()
              const leave = data.leaves.find((l) => l.dayKey === d)
              const roster = [...(data.roster[dow] ?? [])].sort((a, b) => a[0] - b[0])
              // off-hour gaps between startH..endH
              const gaps: [number, number][] = []
              let cursor = startH * 60
              for (const [s, e] of roster) {
                if (s > cursor) gaps.push([cursor, Math.min(s, endH * 60)])
                cursor = Math.max(cursor, e)
              }
              if (cursor < endH * 60) gaps.push([cursor, endH * 60])
              return (
                <div key={d} className="relative flex-1 border-l">
                  {hours.map((h) => (
                    <div key={h} className="absolute inset-x-0 border-t border-border/60" style={{ top: y(h * 60) }} />
                  ))}
                  {gaps.map(([s, e], i) => (
                    <div key={i} className="absolute inset-x-0 bg-muted/70" style={{ top: y(s), height: (e - s) * PX_PER_MIN }} />
                  ))}
                  {leave && (
                    <div
                      className="absolute inset-0 z-[1] bg-[repeating-linear-gradient(45deg,rgba(252,165,165,0.35),rgba(252,165,165,0.35)_6px,transparent_6px,transparent_14px)]"
                      title={leave.reason ?? "On leave"}
                    >
                      <span className="m-1 inline-block rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-800">
                        On leave{leave.reason ? `: ${leave.reason}` : ""}
                      </span>
                    </div>
                  )}
                  {d === data.serverNowDay && nowMin >= startH * 60 && nowMin <= endH * 60 && (
                    <div className="absolute inset-x-0 z-20 border-t-2 border-red-500" style={{ top: y(nowMin) }}>
                      <span className="absolute -top-1.5 left-0 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </div>
                  )}
                  {(byDay[d] ?? []).map((a) => {
                    const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.PENDING
                    const h = Math.max((a.end - a.top) * PX_PER_MIN, 24)
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelected(a.id === selected ? null : a.id)}
                        className={`absolute z-10 overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-left text-[11px] leading-tight shadow-sm transition hover:brightness-95 ${st.block} ${a.live ? "ring-2 ring-violet-500 ring-offset-1" : ""} ${a.id === selected ? "outline outline-2 outline-primary" : ""}`}
                        style={{
                          top: y(a.top),
                          height: h,
                          left: `${(a.lane / a.lanes) * 100}%`,
                          width: `${100 / a.lanes}%`,
                        }}
                      >
                        <div className="flex items-center gap-1 font-semibold">
                          {a.live && <Activity className="h-3 w-3 shrink-0 animate-pulse" />}
                          <span className="truncate">{a.token} {a.patientName}</span>
                        </div>
                        <div className="truncate opacity-80">
                          {a.live ? `In consultation · until ${fmtMin(a.end)}` : `${a.scheduledLabel} – ${a.scheduledEndLabel}`}
                        </div>
                        {h > 48 && <div className="truncate opacity-70">{a.type.replace("_", " ").toLowerCase()}</div>}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {sel && (
        <div className="rounded-xl border bg-card p-4 text-sm print:hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/patients/${sel.patientId}`} className="text-base font-semibold text-primary hover:underline">
                  {sel.patientName}
                </Link>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{sel.token}</span>
                <span className={`rounded border px-1.5 py-0.5 text-xs ${STATUS_STYLE[sel.status]?.block ?? ""}`}>{statusLabel(sel.status)}</span>
                {sel.live && <span className="rounded bg-violet-600 px-1.5 py-0.5 text-xs font-medium text-white">In consultation</span>}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {sel.uhid} · {sel.type.replace("_", " ").toLowerCase()}
                {sel.reason ? ` · ${sel.reason}` : ""}
              </div>
            </div>
            <button type="button" aria-label="Close" onClick={() => setSelected(null)} className="rounded p-1 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            <Item k="Scheduled" v={`${sel.scheduledLabel} – ${sel.scheduledEndLabel} (${sel.durMin} min)`} />
            <Item k="Checked in" v={sel.checkedInLabel ?? "—"} />
            <Item k="Actual start" v={sel.startedLabel ?? "—"} />
            <Item
              k="Actual end"
              v={sel.completedLabel ?? (sel.live ? "In progress" : "—")}
            />
            <Item
              k="Actual duration"
              v={
                sel.actualMinutes !== null
                  ? `${sel.actualMinutes} min`
                  : sel.live && sel.startedMin !== null
                    ? `${Math.max(0, Math.round(nowMin - sel.startedMin))} min so far`
                    : "—"
              }
            />
          </dl>
        </div>
      )}
    </div>
  )
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  )
}
