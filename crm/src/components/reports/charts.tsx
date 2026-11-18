import { formatCurrency } from "@/lib/format"
import type { SeriesPoint, Slice } from "./types"

const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#db2777", "#65a30d", "#64748b"]
const fmt = (v: number, money: boolean) => (money ? formatCurrency(v) : v.toLocaleString("en-IN"))

export function TrendChart({ points, money, hasPrev }: { points: SeriesPoint[]; money: boolean; hasPrev: boolean }) {
  const W = 720, H = 220, L = 8, R = 8, T = 12, B = 28
  const max = Math.max(1, ...points.map((p) => Math.max(p.value, p.prev ?? 0)))
  const n = points.length
  const step = (W - L - R) / Math.max(n, 1)
  const bw = Math.max(2, Math.min(36, step * 0.7))
  const y = (v: number) => T + (H - T - B) * (1 - v / max)
  const x = (i: number) => L + step * i + step / 2
  const prevPath = hasPrev ? points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.prev ?? 0).toFixed(1)}`).join(" ") : ""
  const labelEvery = Math.ceil(n / 12)
  return (
    <div className="break-inside-avoid">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trend chart">
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="currentColor" strokeOpacity="0.25" />
        <line x1={L} x2={W - R} y1={y(max / 2)} y2={y(max / 2)} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3 3" />
        <text x={L} y={T - 2} fontSize="10" fill="currentColor" fillOpacity="0.6">{fmt(max, money)}</text>
        {points.map((p, i) => (
          <g key={i}>
            <rect x={x(i) - bw / 2} y={y(p.value)} width={bw} height={Math.max(0, H - B - y(p.value))} rx="2" fill="#2563eb" fillOpacity="0.85">
              <title>{`${p.label}: ${fmt(p.value, money)}${hasPrev ? ` (previous: ${fmt(p.prev ?? 0, money)})` : ""}`}</title>
            </rect>
            {i % labelEvery === 0 && <text x={x(i)} y={H - 10} fontSize="10" textAnchor="middle" fill="currentColor" fillOpacity="0.7">{p.label}</text>}
          </g>
        ))}
        {hasPrev && <path d={prevPath} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 3" />}
      </svg>
      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm bg-[#2563eb]" />This period</span>
        {hasPrev && <span className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-4 bg-[#d97706]" />Previous period</span>}
      </div>
    </div>
  )
}

export function DonutChart({ data, money }: { data: Slice[]; money: boolean }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total <= 0) return <p className="py-6 text-sm text-muted-foreground">No data for this selection.</p>
  const R = 48, C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="flex flex-wrap items-center gap-4 break-inside-avoid">
      <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0 -rotate-90" role="img" aria-label="Breakdown chart">
        {data.map((d, i) => {
          const len = (d.value / total) * C
          const el = (
            <circle key={d.label} cx="60" cy="60" r={R} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="20" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}>
              <title>{`${d.label}: ${fmt(d.value, money)}`}</title>
            </circle>
          )
          offset += len
          return el
        })}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} /><span className="truncate">{d.label}</span></span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{fmt(d.value, money)} ({((d.value / total) * 100).toFixed(0)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HBars({ data, money }: { data: Slice[]; money: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  if (!data.length) return <p className="py-6 text-sm text-muted-foreground">No data for this selection.</p>
  return (
    <ul className="space-y-2">
      {data.map((d, i) => (
        <li key={d.label} className="break-inside-avoid">
          <div className="flex justify-between gap-3 text-sm"><span className="truncate">{d.label}</span><span className="tabular-nums text-muted-foreground">{fmt(d.value, money)}</span></div>
          <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="mt-0.5 h-1.5 w-full" aria-hidden>
            <rect width="100" height="4" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect width={(d.value / max) * 100} height="4" rx="2" fill={COLORS[i % COLORS.length]} />
          </svg>
        </li>
      ))}
    </ul>
  )
}

export function Heatmap({ rows, cols, values }: { rows: string[]; cols: string[]; values: number[][] }) {
  const max = Math.max(1, ...values.flat())
  return (
    <div className="overflow-x-auto break-inside-avoid">
      <table className="text-xs">
        <thead><tr><th />{cols.map((c) => <th key={c} className="px-1 pb-1 font-normal text-muted-foreground">{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r}>
              <td className="pr-2 text-muted-foreground">{r}</td>
              {values[ri].map((v, ci) => (
                <td key={ci} title={`${r} ${cols[ci]}: ${v}`} className="h-7 w-9 min-w-9 rounded-sm text-center tabular-nums" style={{ background: v ? `rgba(37,99,235,${0.15 + 0.85 * (v / max)})` : "rgba(128,128,128,0.08)", color: v / max > 0.55 ? "#fff" : undefined, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
                  {v || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
