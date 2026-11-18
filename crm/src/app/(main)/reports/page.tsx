import Link from "next/link"
import { X } from "lucide-react"
import { format } from "date-fns"
import { getCurrentUser } from "@/lib/auth"
import { CLINIC_INFO } from "@/lib/hospital-info"
import { paymentMethodLabels } from "@/lib/labels"
import {
  getReportOptions, getOverviewReport, getRevenueReport, getDepartmentsReport,
  getDoctorsReport, getInventoryReport, getAppointmentsReport,
} from "@/actions/analytics"
import { PrintButton } from "@/components/shared/print-button"
import { ReportFilterBar } from "@/components/reports/filter-bar"
import { ReportView } from "@/components/reports/report-view"
import { REPORT_TABS, resolveRange, type ReportFilters, type ReportTab } from "@/components/reports/types"

type SP = Record<string, string | string[] | undefined>
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined

export default async function ReportsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await getCurrentUser()
  const sp = await searchParams
  const tab: ReportTab = REPORT_TABS.some((t) => t.key === first(sp.tab)) ? (first(sp.tab) as ReportTab) : "overview"
  const filters: ReportFilters = {
    period: first(sp.period), month: first(sp.month), from: first(sp.from), to: first(sp.to),
    service: first(sp.service), doctor: first(sp.doctor), method: first(sp.method), item: first(sp.item),
  }

  if (user.role === "DOCTOR") {
    return <div className="rounded-lg border p-6 text-sm text-muted-foreground">Reports are available to admin, billing and reception staff.</div>
  }

  const range = resolveRange(filters)
  const loaders = {
    overview: getOverviewReport, revenue: getRevenueReport, departments: getDepartmentsReport,
    doctors: getDoctorsReport, inventory: getInventoryReport, appointments: getAppointmentsReport,
  }
  const [options, report] = await Promise.all([getReportOptions(), loaders[tab](filters)])

  const qs = (patch: Partial<Record<keyof ReportFilters | "tab", string | null>>) => {
    const merged: Record<string, string | undefined | null> = { ...filters, tab, ...patch }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v)
    return `/reports?${p.toString()}`
  }

  const chips: { label: string; href: string }[] = []
  const svc = options.services.find((s) => s.id === filters.service)
  const doc = options.doctors.find((s) => s.id === filters.doctor)
  const itm = options.items.find((s) => s.id === filters.item)
  if (svc) chips.push({ label: `Department: ${svc.name}`, href: qs({ service: null }) })
  if (doc) chips.push({ label: `Doctor: ${doc.name}`, href: qs({ doctor: null }) })
  if (filters.method && paymentMethodLabels[filters.method]) chips.push({ label: `Method: ${paymentMethodLabels[filters.method]}`, href: qs({ method: null }) })
  if (itm) chips.push({ label: `Medicine: ${itm.name}`, href: qs({ item: null }) })
  if (filters.month) chips.push({ label: `Month: ${filters.month}`, href: qs({ month: null }) })
  else if (filters.period && filters.period !== "month") chips.push({ label: `Period: ${filters.period === "custom" ? "Custom" : filters.period}`, href: qs({ period: null, from: null, to: null }) })

  const filterText = [`Period: ${range.label}`, svc && `Department: ${svc.name}`, doc && `Doctor: ${doc.name}`, filters.method && paymentMethodLabels[filters.method] && `Method: ${paymentMethodLabels[filters.method]}`, itm && `Medicine: ${itm.name}`].filter(Boolean).join(" | ")
  const tabLabel = REPORT_TABS.find((t) => t.key === tab)!.label
  const printedOn = format(new Date(), "dd MMM yyyy, hh:mm a")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground print:hidden">{range.label} — compared with the previous period of equal length.</p>
        </div>
        <PrintButton />
      </div>

      {/* Print-only title block */}
      <div className="hidden border-b pb-3 print:block">
        <p className="text-lg font-bold">{CLINIC_INFO.name}</p>
        <p className="text-xs">{CLINIC_INFO.address}</p>
        <p className="mt-2 text-base font-semibold">{tabLabel} report</p>
        <p className="text-xs">{filterText}</p>
        <p className="text-xs">Printed on {printedOn}</p>
      </div>

      <ReportFilterBar tab={tab} filters={filters} periodKey={range.periodKey === "month_pick" ? "" : range.periodKey} options={options} />

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {chips.map((c) => (
            <Link key={c.label} href={c.href} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-muted/70">
              {c.label}<X className="h-3 w-3" />
            </Link>
          ))}
          <Link href={`/reports?tab=${tab}`} className="text-xs text-primary underline-offset-2 hover:underline">Reset</Link>
        </div>
      )}

      <nav className="flex flex-wrap gap-1 border-b print:hidden" aria-label="Report sections">
        {REPORT_TABS.map((t) => (
          <Link
            key={t.key}
            href={qs({ tab: t.key })}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${t.key === tab ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {filters.method && (tab === "departments" || tab === "doctors" || tab === "appointments") && (
        <p className="text-xs text-muted-foreground print:hidden">Payment method filter does not apply to this section.</p>
      )}
      {tab !== "inventory" && filters.item && <p className="text-xs text-muted-foreground print:hidden">Medicine filter applies only to Medicines &amp; inventory.</p>}

      <ReportView report={report} suffix={`${format(range.from, "yyyyMMdd")}-${format(range.to, "yyyyMMdd")}`} />
    </div>
  )
}
