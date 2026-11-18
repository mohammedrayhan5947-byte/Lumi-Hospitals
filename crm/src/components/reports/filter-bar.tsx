"use client"

import { useRouter } from "next/navigation"
import { PERIODS, type ReportFilters } from "./types"

interface Opt { id: string; name: string }

const METHOD_OPTS = [
  ["UPI", "UPI"], ["CASH", "Cash"], ["CARD", "Card"], ["NET_BANKING", "Net Banking"], ["INSURANCE", "Insurance"], ["ADVANCE", "Advance Balance"],
]

const field = "h-8 rounded-md border bg-background px-2 text-sm"

export function ReportFilterBar({
  tab, filters, periodKey, options,
}: {
  tab: string
  filters: ReportFilters
  periodKey: string
  options: { services: Opt[]; doctors: Opt[]; items: Opt[] }
}) {
  const router = useRouter()

  function go(patch: Partial<Record<keyof ReportFilters, string | null>>) {
    const next: Record<string, string | undefined> = { ...filters, ...patch } as Record<string, string | undefined>
    const sp = new URLSearchParams()
    sp.set("tab", tab)
    for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v)
    router.push(`/reports?${sp.toString()}`)
  }

  const custom = periodKey === "custom"
  return (
    <div className="space-y-3 rounded-lg border bg-card p-3 print:hidden">
      <div className="flex flex-wrap items-center gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => go({ period: p.key, month: null, ...(p.key === "custom" ? {} : { from: null, to: null }) })}
            className={`h-8 rounded-md border px-3 text-sm ${periodKey === p.key ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          Month
          <input type="month" className={`${field} block`} value={filters.month ?? ""} onChange={(e) => go({ month: e.target.value || null, period: null, from: null, to: null })} />
        </label>
        {custom && (
          <>
            <label className="space-y-1 text-xs text-muted-foreground">
              From
              <input type="date" className={`${field} block`} value={filters.from ?? ""} onChange={(e) => go({ from: e.target.value || null })} />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              To
              <input type="date" className={`${field} block`} value={filters.to ?? ""} onChange={(e) => go({ to: e.target.value || null })} />
            </label>
          </>
        )}
        <label className="space-y-1 text-xs text-muted-foreground">
          Department
          <select className={`${field} block`} value={filters.service ?? ""} onChange={(e) => go({ service: e.target.value || null })}>
            <option value="">All departments</option>
            {options.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Doctor
          <select className={`${field} block`} value={filters.doctor ?? ""} onChange={(e) => go({ doctor: e.target.value || null })}>
            <option value="">All doctors</option>
            {options.doctors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Payment method
          <select className={`${field} block`} value={filters.method ?? ""} onChange={(e) => go({ method: e.target.value || null })}>
            <option value="">All methods</option>
            {METHOD_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Medicine
          <select className={`${field} block max-w-48`} value={filters.item ?? ""} onChange={(e) => go({ item: e.target.value || null })}>
            <option value="">All medicines</option>
            {options.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
    </div>
  )
}
