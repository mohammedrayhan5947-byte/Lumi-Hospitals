import {
  startOfDay, endOfDay, startOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear,
  differenceInCalendarDays, subDays, isValid, parse, format,
} from "date-fns"

export const REPORT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "revenue", label: "Revenue & collections" },
  { key: "departments", label: "Departments" },
  { key: "doctors", label: "Doctors" },
  { key: "inventory", label: "Medicines & inventory" },
  { key: "appointments", label: "Appointments" },
] as const
export type ReportTab = (typeof REPORT_TABS)[number]["key"]

export const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "3m", label: "Last 3 months" },
  { key: "year", label: "This year" },
  { key: "custom", label: "Custom" },
] as const

export interface ReportFilters {
  period?: string
  month?: string
  from?: string
  to?: string
  service?: string
  doctor?: string
  method?: string
  item?: string
}

export interface ResolvedRange {
  from: Date
  to: Date
  prevFrom: Date
  prevTo: Date
  label: string
  periodKey: string
  /** "day" buckets for ranges up to ~92 days, otherwise "month" */
  bucket: "day" | "month"
}

function parseIso(s?: string) {
  if (!s) return null
  const d = parse(s, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : null
}

export function resolveRange(f: ReportFilters, now = new Date()): ResolvedRange {
  let from: Date
  let to: Date
  let periodKey = f.period ?? "month"
  const monthParsed = f.month ? parse(f.month, "yyyy-MM", new Date()) : null
  if (monthParsed && isValid(monthParsed)) {
    from = startOfMonth(monthParsed)
    to = endOfMonth(monthParsed)
    periodKey = "month_pick"
  } else {
    switch (periodKey) {
      case "today": from = startOfDay(now); to = endOfDay(now); break
      case "week": from = startOfWeek(now, { weekStartsOn: 1 }); to = endOfDay(now); break
      case "last_month": from = startOfMonth(subMonths(now, 1)); to = endOfMonth(subMonths(now, 1)); break
      case "3m": from = startOfMonth(subMonths(now, 2)); to = endOfDay(now); break
      case "year": from = startOfYear(now); to = endOfDay(now); break
      case "custom": {
        const a = parseIso(f.from)
        const b = parseIso(f.to)
        from = startOfDay(a ?? subDays(now, 29))
        to = endOfDay(b ?? now)
        if (from > to) [from, to] = [startOfDay(to), endOfDay(from)]
        break
      }
      default: periodKey = "month"; from = startOfMonth(now); to = endOfDay(now)
    }
  }
  const days = differenceInCalendarDays(to, from) + 1
  const prevTo = endOfDay(subDays(from, 1))
  const prevFrom = startOfDay(subDays(from, days))
  const label = days === 1 ? format(from, "dd MMM yyyy") : `${format(from, "dd MMM yyyy")} – ${format(to, "dd MMM yyyy")}`
  return { from, to, prevFrom, prevTo, label, periodKey, bucket: days > 92 ? "month" : "day" }
}

export interface ReportTable {
  filename: string
  headers: string[]
  /** numbers are exported raw; strings as-is */
  rows: (string | number)[][]
  /** optional totals row appended in table and CSV */
  totals?: (string | number)[]
  /** column indexes (0-based) formatted as currency in the UI */
  currencyCols?: number[]
  /** true when rows were truncated to the row cap */
  truncated?: boolean
  totalRowCount?: number
}

export interface Kpi {
  label: string
  value: string
  /** % change vs previous period (undefined = not applicable) */
  change?: number | null
  /** when true, an increase is bad (expenses, refunds, outstanding) */
  invert?: boolean
  hint?: string
}

export interface SeriesPoint { label: string; value: number; prev?: number }
export interface Slice { label: string; value: number }

export interface TabReport {
  kpis: Kpi[]
  insights: string[]
  trend?: { title: string; points: SeriesPoint[]; money: boolean; hasPrev: boolean }
  breakdowns: { title: string; data: Slice[]; money: boolean; kind: "donut" | "bars" }[]
  heatmap?: { title: string; rows: string[]; cols: string[]; values: number[][] }
  table: ReportTable
  secondaryTable?: ReportTable & { title: string }
  tableTitle: string
}

export const ROW_CAP = 200
