"use server"

import { eachDayOfInterval, eachMonthOfInterval, format, getDay, getHours } from "date-fns"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { formatCurrency } from "@/lib/format"
import { paymentMethodLabels, appointmentStatusLabels } from "@/lib/labels"
import {
  resolveRange, ROW_CAP,
  type ReportFilters, type ResolvedRange, type TabReport, type SeriesPoint, type Slice, type Kpi,
} from "@/components/reports/types"

const num = (v: unknown) => Number(v ?? 0)
const r2 = (n: number) => Math.round(n * 100) / 100
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0)
const change = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null)
const fmtPct = (n: number) => `${Math.abs(n).toFixed(0)}%`
const cmp = (c: number | null) => (c === null ? "" : `, ${c >= 0 ? "up" : "down"} ${fmtPct(c)} vs previous period`)
const METHODS = ["UPI", "CASH", "CARD", "NET_BANKING", "INSURANCE", "ADVANCE"] as const
type Method = (typeof METHODS)[number]
const asMethod = (m?: string): Method | undefined => ((METHODS as readonly string[]).includes(m ?? "") ? (m as Method) : undefined)
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

async function ctx(f: ReportFilters) {
  const user = await requireRole("ADMIN", "BILLING", "RECEPTIONIST")
  return { user, range: resolveRange(f), method: asMethod(f.method) }
}

// ── Where-clause builders ──────────────────────────────────────────────

function billRel(f: ReportFilters): Prisma.BillWhereInput {
  return {
    ...(f.service ? { serviceId: f.service } : {}),
    ...(f.doctor ? { appointment: { doctorId: f.doctor } } : {}),
  }
}
const hasBillRel = (f: ReportFilters) => !!(f.service || f.doctor)

function billWhere(f: ReportFilters, from: Date, to: Date): Prisma.BillWhereInput {
  return { issuedAt: { gte: from, lte: to }, status: { not: "CANCELLED" }, ...billRel(f) }
}
function payWhere(f: ReportFilters, from: Date, to: Date, method?: Method): Prisma.PaymentWhereInput {
  return {
    status: "SUCCESS",
    paidAt: { gte: from, lte: to },
    ...(method ? { method } : {}),
    ...(hasBillRel(f) ? { bill: billRel(f) } : {}),
  }
}
function refundWhere(f: ReportFilters, from: Date, to: Date, method?: Method): Prisma.RefundWhereInput {
  return {
    status: { in: ["APPROVED", "COMPLETED"] },
    requestedAt: { gte: from, lte: to },
    ...(method ? { method } : {}),
    ...(hasBillRel(f) ? { bill: billRel(f) } : {}),
  }
}
function apptWhere(f: ReportFilters, from: Date, to: Date): Prisma.AppointmentWhereInput {
  return {
    scheduledAt: { gte: from, lte: to },
    ...(f.service ? { serviceId: f.service } : {}),
    ...(f.doctor ? { doctorId: f.doctor } : {}),
  }
}

// ── Bucketing ──────────────────────────────────────────────────────────

function buckets(range: ResolvedRange) {
  if (range.bucket === "day") {
    const days = eachDayOfInterval({ start: range.from, end: range.to })
    return { keys: days.map((d) => format(d, "yyyy-MM-dd")), labels: days.map((d) => format(d, "dd MMM")), keyOf: (d: Date) => format(d, "yyyy-MM-dd") }
  }
  const months = eachMonthOfInterval({ start: range.from, end: range.to })
  return { keys: months.map((d) => format(d, "yyyy-MM")), labels: months.map((d) => format(d, "MMM yyyy")), keyOf: (d: Date) => format(d, "yyyy-MM") }
}

function sumByBucket(rows: { at: Date; amount: number }[], keyOf: (d: Date) => string) {
  const m = new Map<string, number>()
  for (const r of rows) m.set(keyOf(r.at), (m.get(keyOf(r.at)) ?? 0) + r.amount)
  return m
}

/** Collections trend for the current period, with previous period aligned by day index. */
async function collectionsTrend(f: ReportFilters, range: ResolvedRange, method?: Method) {
  const b = buckets(range)
  const [cur, prev] = await Promise.all([
    prisma.payment.findMany({ where: payWhere(f, range.from, range.to, method), select: { paidAt: true, amount: true } }),
    range.bucket === "day"
      ? prisma.payment.findMany({ where: payWhere(f, range.prevFrom, range.prevTo, method), select: { paidAt: true, amount: true } })
      : Promise.resolve([] as { paidAt: Date; amount: unknown }[]),
  ])
  const curMap = sumByBucket(cur.map((p) => ({ at: p.paidAt, amount: num(p.amount) })), b.keyOf)
  const prevDays = range.bucket === "day" ? eachDayOfInterval({ start: range.prevFrom, end: range.prevTo }).map((d) => format(d, "yyyy-MM-dd")) : []
  const prevMap = sumByBucket(prev.map((p) => ({ at: p.paidAt, amount: num(p.amount) })), (d) => format(d, "yyyy-MM-dd"))
  const points: SeriesPoint[] = b.keys.map((k, i) => ({
    label: b.labels[i],
    value: r2(curMap.get(k) ?? 0),
    prev: range.bucket === "day" ? r2(prevMap.get(prevDays[i]) ?? 0) : undefined,
  }))
  return { points, hasPrev: range.bucket === "day" }
}

// ── Options for filter bar ─────────────────────────────────────────────

export async function getReportOptions() {
  await requireRole("ADMIN", "BILLING", "RECEPTIONIST")
  const [services, doctors, items] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "DOCTOR", active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.inventoryItem.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])
  return { services, doctors, items }
}

// ── Overview ───────────────────────────────────────────────────────────

async function periodTotals(f: ReportFilters, from: Date, to: Date, method?: Method) {
  const [bills, outstanding, pays, refunds, expenses, patients, appts, completed] = await Promise.all([
    prisma.bill.aggregate({ where: billWhere(f, from, to), _sum: { netAmount: true }, _count: true }),
    prisma.bill.aggregate({ where: { ...billWhere(f, from, to), status: { in: ["PENDING", "PARTIALLY_PAID"] } }, _sum: { balanceDue: true } }),
    prisma.payment.aggregate({ where: payWhere(f, from, to, method), _sum: { amount: true } }),
    prisma.refund.aggregate({ where: refundWhere(f, from, to, method), _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { expenseDate: { gte: from, lte: to }, ...(method ? { method } : {}) }, _sum: { amount: true } }),
    prisma.patient.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.appointment.count({ where: apptWhere(f, from, to) }),
    prisma.appointment.count({ where: { ...apptWhere(f, from, to), status: "COMPLETED" } }),
  ])
  const collected = num(pays._sum.amount)
  const refundTotal = num(refunds._sum.amount)
  const expenseTotal = num(expenses._sum.amount)
  return {
    billed: num(bills._sum.netAmount), billCount: bills._count, outstanding: num(outstanding._sum.balanceDue),
    collected, refunds: refundTotal, expenses: expenseTotal, net: collected - refundTotal - expenseTotal,
    patients, appts, completed, completion: pct(completed, appts),
  }
}

export async function getOverviewReport(f: ReportFilters): Promise<TabReport> {
  const { range, method } = await ctx(f)
  const [cur, prev, trend, byMethod, prevByMethod, byService, services] = await Promise.all([
    periodTotals(f, range.from, range.to, method),
    periodTotals(f, range.prevFrom, range.prevTo, method),
    collectionsTrend(f, range, method),
    prisma.payment.groupBy({ by: ["method"], where: payWhere(f, range.from, range.to, method), _sum: { amount: true } }),
    prisma.payment.groupBy({ by: ["method"], where: payWhere(f, range.prevFrom, range.prevTo, method), _sum: { amount: true } }),
    prisma.bill.groupBy({ by: ["serviceId"], where: billWhere(f, range.from, range.to), _sum: { netAmount: true } }),
    prisma.service.findMany({ select: { id: true, name: true } }),
  ])
  const svcName = new Map(services.map((s) => [s.id, s.name]))

  const kpis: Kpi[] = [
    { label: "Revenue (billed)", value: formatCurrency(cur.billed), change: change(cur.billed, prev.billed), hint: `${cur.billCount} bills` },
    { label: "Collected", value: formatCurrency(cur.collected), change: change(cur.collected, prev.collected) },
    { label: "Outstanding", value: formatCurrency(cur.outstanding), change: change(cur.outstanding, prev.outstanding), invert: true, hint: "Unpaid on bills issued in period" },
    { label: "Refunds", value: formatCurrency(cur.refunds), change: change(cur.refunds, prev.refunds), invert: true },
    { label: "Expenses", value: formatCurrency(cur.expenses), change: change(cur.expenses, prev.expenses), invert: true },
    { label: "Net (collected - refunds - expenses)", value: formatCurrency(cur.net), change: prev.net > 0 ? change(cur.net, prev.net) : null },
    { label: "Patients registered", value: String(cur.patients), change: change(cur.patients, prev.patients) },
    { label: "Appointments", value: String(cur.appts), change: change(cur.appts, prev.appts), hint: `${cur.completion.toFixed(0)}% completed` },
  ]

  const methodSlices: Slice[] = byMethod.map((m) => ({ label: paymentMethodLabels[m.method] ?? m.method, value: num(m._sum.amount) })).sort((a, b) => b.value - a.value)
  const prevMethod = new Map(prevByMethod.map((m) => [m.method, num(m._sum.amount)]))
  const svcSlices: Slice[] = byService.map((s) => ({ label: s.serviceId ? svcName.get(s.serviceId) ?? "Unknown" : "Unassigned", value: num(s._sum.netAmount) })).sort((a, b) => b.value - a.value)

  const insights: string[] = []
  const ch = change(cur.collected, prev.collected)
  if (cur.collected > 0) insights.push(`Collections were ${formatCurrency(cur.collected)}${cmp(ch)}.`)
  if (byMethod.length && cur.collected > 0) {
    const top = [...byMethod].sort((a, b) => num(b._sum.amount) - num(a._sum.amount))[0]
    const share = pct(num(top._sum.amount), cur.collected)
    insights.push(`${paymentMethodLabels[top.method] ?? top.method} is ${share.toFixed(0)}% of collections${cmp(change(num(top._sum.amount), prevMethod.get(top.method) ?? 0))}.`)
  }
  if (svcSlices[0] && svcSlices[0].value > 0) insights.push(`${svcSlices[0].label} is the top department by billed revenue (${formatCurrency(svcSlices[0].value)}).`)
  if (cur.outstanding > 0) insights.push(`${formatCurrency(cur.outstanding)} is still unpaid on bills issued in this period (${pct(cur.outstanding, cur.billed).toFixed(0)}% of billed).`)
  if (cur.appts > 0) insights.push(`${cur.completed} of ${cur.appts} appointments were completed (${cur.completion.toFixed(0)}%).`)
  if (cur.expenses > cur.collected && cur.expenses > 0) insights.push(`Expenses (${formatCurrency(cur.expenses)}) exceeded collections in this period.`)

  const metrics: [string, number, number][] = [
    ["Revenue (billed)", cur.billed, prev.billed],
    ["Collected", cur.collected, prev.collected],
    ["Outstanding", cur.outstanding, prev.outstanding],
    ["Refunds", cur.refunds, prev.refunds],
    ["Expenses", cur.expenses, prev.expenses],
    ["Net", cur.net, prev.net],
    ["Patients registered", cur.patients, prev.patients],
    ["Appointments", cur.appts, prev.appts],
    ["Completed appointments", cur.completed, prev.completed],
  ]
  const rows: (string | number)[][] = metrics.map(([l, a, b]) => {
    const c = change(a, b)
    return [l, r2(a), r2(b), c === null ? "-" : `${c.toFixed(1)}%`]
  })

  return {
    kpis, insights,
    trend: { title: range.bucket === "day" ? "Collections by day" : "Collections by month", ...trend, money: true },
    breakdowns: [
      { title: "Collections by payment method", data: methodSlices, money: true, kind: "donut" },
      { title: "Billed revenue by department", data: svcSlices.slice(0, 8), money: true, kind: "bars" },
    ],
    tableTitle: "Summary vs previous period",
    table: {
      filename: "overview",
      headers: ["Metric", "This period", "Previous period", "Change"],
      rows,
    },
  }
}

// ── Revenue & collections ──────────────────────────────────────────────

export async function getRevenueReport(f: ReportFilters): Promise<TabReport> {
  const { range, method } = await ctx(f)
  const [byMethod, prevByMethod, trend, items, refundAgg, refundCount, payAgg, pays] = await Promise.all([
    prisma.payment.groupBy({ by: ["method"], where: payWhere(f, range.from, range.to, method), _sum: { amount: true }, _count: true }),
    prisma.payment.groupBy({ by: ["method"], where: payWhere(f, range.prevFrom, range.prevTo, method), _sum: { amount: true } }),
    collectionsTrend(f, range, method),
    prisma.billItem.groupBy({ by: ["description"], where: { bill: billWhere(f, range.from, range.to) }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } }, take: 8 }),
    prisma.refund.aggregate({ where: refundWhere(f, range.from, range.to, method), _sum: { amount: true } }),
    prisma.refund.count({ where: refundWhere(f, range.from, range.to, method) }),
    prisma.payment.aggregate({ where: payWhere(f, range.from, range.to, method), _sum: { amount: true }, _count: true }),
    prisma.payment.findMany({
      where: payWhere(f, range.from, range.to, method), orderBy: { paidAt: "desc" }, take: ROW_CAP,
      select: { receiptNumber: true, paidAt: true, amount: true, method: true, referenceNumber: true, patient: { select: { firstName: true, lastName: true } }, bill: { select: { billNumber: true } } },
    }),
  ])
  const collected = num(payAgg._sum.amount)
  const refunds = num(refundAgg._sum.amount)
  const prevMap = new Map(prevByMethod.map((m) => [m.method, num(m._sum.amount)]))
  const methodSlices: Slice[] = byMethod.map((m) => ({ label: paymentMethodLabels[m.method] ?? m.method, value: num(m._sum.amount) })).sort((a, b) => b.value - a.value)
  const itemSlices: Slice[] = items.map((i) => ({ label: i.description, value: num(i._sum.amount) }))

  const insights: string[] = []
  if (byMethod.length && collected > 0) {
    const top = [...byMethod].sort((a, b) => num(b._sum.amount) - num(a._sum.amount))[0]
    insights.push(`${paymentMethodLabels[top.method] ?? top.method} is ${pct(num(top._sum.amount), collected).toFixed(0)}% of collections${cmp(change(num(top._sum.amount), prevMap.get(top.method) ?? 0))}.`)
    const digital = byMethod.filter((m) => ["UPI", "CARD", "NET_BANKING"].includes(m.method)).reduce((s, m) => s + num(m._sum.amount), 0)
    insights.push(`Digital payments (UPI, card, net banking) make up ${pct(digital, collected).toFixed(0)}% of collections.`)
  }
  if (itemSlices[0]) insights.push(`"${itemSlices[0].label}" is the top billed line item (${formatCurrency(itemSlices[0].value)}).`)
  if (refundCount > 0) insights.push(`${refundCount} approved/completed refund${refundCount === 1 ? "" : "s"} totalling ${formatCurrency(refunds)}${collected > 0 ? ` (${pct(refunds, collected).toFixed(1)}% of collections)` : ""}.`)
  const peak = [...trend.points].sort((a, b) => b.value - a.value)[0]
  if (peak && peak.value > 0) insights.push(`Highest collection ${range.bucket === "day" ? "day" : "month"}: ${peak.label} with ${formatCurrency(peak.value)}.`)

  return {
    kpis: [
      { label: "Collected", value: formatCurrency(collected), hint: `${payAgg._count} payments` },
      { label: "Refunds", value: formatCurrency(refunds), invert: true, hint: `${refundCount} refunds` },
      { label: "Net collections", value: formatCurrency(collected - refunds) },
      { label: "Average payment", value: formatCurrency(payAgg._count ? collected / payAgg._count : 0) },
    ],
    insights,
    trend: { title: range.bucket === "day" ? "Collections by day" : "Collections by month", ...trend, money: true },
    breakdowns: [
      { title: "By payment method", data: methodSlices, money: true, kind: "donut" },
      { title: "Top billed services / items", data: itemSlices, money: true, kind: "bars" },
    ],
    tableTitle: "Transactions",
    table: {
      filename: "revenue-transactions",
      headers: ["Date", "Receipt", "Patient", "Bill", "Method", "Reference", "Amount"],
      rows: pays.map((p) => [format(p.paidAt, "dd MMM yyyy HH:mm"), p.receiptNumber, [p.patient.firstName, p.patient.lastName].filter(Boolean).join(" "), p.bill?.billNumber ?? "-", paymentMethodLabels[p.method] ?? p.method, p.referenceNumber ?? "-", r2(num(p.amount))]),
      totals: ["Total (all matching payments)", "", "", "", "", "", r2(collected)],
      currencyCols: [6],
      truncated: payAgg._count > ROW_CAP,
      totalRowCount: payAgg._count,
    },
  }
}

// ── Departments ────────────────────────────────────────────────────────

export async function getDepartmentsReport(f: ReportFilters): Promise<TabReport> {
  const { range } = await ctx(f)
  const [services, bills, appts] = await Promise.all([
    prisma.service.findMany({ select: { id: true, name: true } }),
    prisma.bill.groupBy({ by: ["serviceId"], where: billWhere(f, range.from, range.to), _sum: { netAmount: true, amountPaid: true }, _count: true }),
    prisma.appointment.groupBy({ by: ["serviceId"], where: apptWhere(f, range.from, range.to), _count: true }),
  ])
  const name = new Map(services.map((s) => [s.id, s.name]))
  const ids = new Set<string | null>([...bills.map((b) => b.serviceId), ...appts.map((a) => a.serviceId)])
  const billBy = new Map(bills.map((b) => [b.serviceId, b]))
  const apptBy = new Map(appts.map((a) => [a.serviceId, a._count]))
  const totalRev = bills.reduce((s, b) => s + num(b._sum.netAmount), 0)

  const data = [...ids].map((id) => {
    const b = billBy.get(id)
    const revenue = num(b?._sum.netAmount)
    const count = b?._count ?? 0
    return { label: id ? name.get(id) ?? "Unknown" : "Unassigned", appts: apptBy.get(id) ?? 0, bills: count, revenue, collected: num(b?._sum.amountPaid), avg: count ? revenue / count : 0, share: pct(revenue, totalRev) }
  }).sort((a, b) => b.revenue - a.revenue || b.appts - a.appts)

  const insights: string[] = []
  const top = data[0]
  if (top && top.revenue > 0) insights.push(`${top.label} is the top department by billed revenue: ${formatCurrency(top.revenue)} (${top.share.toFixed(0)}% of total).`)
  const busiest = [...data].sort((a, b) => b.appts - a.appts)[0]
  if (busiest && busiest.appts > 0) insights.push(`${busiest.label} has the most appointments (${busiest.appts}).`)
  const avgTop = [...data].filter((d) => d.bills >= 2).sort((a, b) => b.avg - a.avg)[0]
  if (avgTop) insights.push(`${avgTop.label} has the highest average bill (${formatCurrency(avgTop.avg)}, ${avgTop.bills} bills).`)
  const noBill = data.filter((d) => d.appts > 0 && d.bills === 0)
  if (noBill.length) insights.push(`${noBill.length} department${noBill.length === 1 ? "" : "s"} had appointments but no bills in this period (${noBill.slice(0, 3).map((d) => d.label).join(", ")}).`)

  const tot = data.reduce((a, d) => ({ appts: a.appts + d.appts, bills: a.bills + d.bills, revenue: a.revenue + d.revenue, collected: a.collected + d.collected }), { appts: 0, bills: 0, revenue: 0, collected: 0 })
  return {
    kpis: [
      { label: "Departments with activity", value: String(data.length) },
      { label: "Bills", value: String(tot.bills) },
      { label: "Revenue (billed)", value: formatCurrency(tot.revenue) },
      { label: "Average bill", value: formatCurrency(tot.bills ? tot.revenue / tot.bills : 0) },
    ],
    insights,
    breakdowns: [
      { title: "Revenue share", data: data.filter((d) => d.revenue > 0).map((d) => ({ label: d.label, value: d.revenue })).slice(0, 8), money: true, kind: "donut" },
      { title: "Appointments", data: data.filter((d) => d.appts > 0).map((d) => ({ label: d.label, value: d.appts })).sort((a, b) => b.value - a.value).slice(0, 8), money: false, kind: "bars" },
    ],
    tableTitle: "Department performance",
    table: {
      filename: "departments",
      headers: ["Department", "Appointments", "Bills", "Revenue", "Collected", "Average bill", "Share %"],
      rows: data.slice(0, ROW_CAP).map((d) => [d.label, d.appts, d.bills, r2(d.revenue), r2(d.collected), r2(d.avg), r2(d.share)]),
      totals: ["Total", tot.appts, tot.bills, r2(tot.revenue), r2(tot.collected), r2(tot.bills ? tot.revenue / tot.bills : 0), 100],
      currencyCols: [3, 4, 5],
      truncated: data.length > ROW_CAP,
      totalRowCount: data.length,
    },
  }
}

// ── Doctors ────────────────────────────────────────────────────────────

export async function getDoctorsReport(f: ReportFilters): Promise<TabReport> {
  const { range } = await ctx(f)
  const [doctors, grouped, bills] = await Promise.all([
    prisma.user.findMany({ where: { role: "DOCTOR", ...(f.doctor ? { id: f.doctor } : {}) }, select: { id: true, name: true, specialization: true }, orderBy: { name: "asc" } }),
    prisma.appointment.groupBy({ by: ["doctorId", "status"], where: apptWhere(f, range.from, range.to), _count: true }),
    prisma.bill.findMany({ where: { ...billWhere(f, range.from, range.to), appointmentId: { not: null } }, select: { netAmount: true, appointment: { select: { doctorId: true } } } }),
  ])
  const rev = new Map<string, number>()
  for (const b of bills) if (b.appointment) rev.set(b.appointment.doctorId, (rev.get(b.appointment.doctorId) ?? 0) + num(b.netAmount))
  const st = new Map<string, Record<string, number>>()
  for (const g of grouped) {
    const o = st.get(g.doctorId) ?? {}
    o[g.status] = g._count
    st.set(g.doctorId, o)
  }
  const data = doctors.map((d) => {
    const s = st.get(d.id) ?? {}
    const total = Object.values(s).reduce((a, b) => a + b, 0)
    const completed = s.COMPLETED ?? 0
    const revenue = rev.get(d.id) ?? 0
    return { id: d.id, label: d.name, spec: d.specialization ?? "-", total, completed, cancelled: s.CANCELLED ?? 0, noShow: s.NO_SHOW ?? 0, open: total - completed - (s.CANCELLED ?? 0) - (s.NO_SHOW ?? 0), revenue, avg: completed ? revenue / completed : 0, noShowRate: pct(s.NO_SHOW ?? 0, total) }
  }).filter((d) => d.total > 0 || d.revenue > 0 || f.doctor).sort((a, b) => b.total - a.total)

  const insights: string[] = []
  if (data[0] && data[0].total > 0) insights.push(`${data[0].label} has the most appointments (${data[0].total}, ${data[0].completed} completed).`)
  const topRev = [...data].sort((a, b) => b.revenue - a.revenue)[0]
  if (topRev && topRev.revenue > 0) insights.push(`${topRev.label} generated the most billed revenue from their appointments (${formatCurrency(topRev.revenue)}).`)
  const nsr = [...data].filter((d) => d.total >= 5 && d.noShow > 0).sort((a, b) => b.noShowRate - a.noShowRate)[0]
  if (nsr) insights.push(`${nsr.label} has the highest no-show rate: ${nsr.noShowRate.toFixed(0)}% (${nsr.noShow} of ${nsr.total}).`)
  const tot = data.reduce((a, d) => ({ total: a.total + d.total, completed: a.completed + d.completed, cancelled: a.cancelled + d.cancelled, noShow: a.noShow + d.noShow, open: a.open + d.open, revenue: a.revenue + d.revenue }), { total: 0, completed: 0, cancelled: 0, noShow: 0, open: 0, revenue: 0 })
  if (tot.total > 0) insights.push(`Across doctors, ${pct(tot.completed, tot.total).toFixed(0)}% of appointments were completed and ${pct(tot.noShow, tot.total).toFixed(0)}% were no-shows.`)

  return {
    kpis: [
      { label: "Doctors with activity", value: String(data.length) },
      { label: "Appointments", value: String(tot.total) },
      { label: "Completed", value: String(tot.completed), hint: `${pct(tot.completed, tot.total).toFixed(0)}%` },
      { label: "No-shows", value: String(tot.noShow), invert: true, hint: `${pct(tot.noShow, tot.total).toFixed(0)}%` },
    ],
    insights,
    breakdowns: [
      { title: "Appointments per doctor", data: data.slice(0, 10).map((d) => ({ label: d.label, value: d.total })), money: false, kind: "bars" },
      { title: "Billed revenue per doctor", data: data.filter((d) => d.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 10).map((d) => ({ label: d.label, value: d.revenue })), money: true, kind: "bars" },
    ],
    tableTitle: "Doctor performance",
    table: {
      filename: "doctors",
      headers: ["Doctor", "Specialisation", "Appointments", "Completed", "Cancelled", "No-show", "Other (open)", "No-show %", "Revenue", "Avg per completed visit"],
      rows: data.slice(0, ROW_CAP).map((d) => [d.label, d.spec, d.total, d.completed, d.cancelled, d.noShow, d.open, r2(d.noShowRate), r2(d.revenue), r2(d.avg)]),
      totals: ["Total", "", tot.total, tot.completed, tot.cancelled, tot.noShow, tot.open, r2(pct(tot.noShow, tot.total)), r2(tot.revenue), r2(tot.completed ? tot.revenue / tot.completed : 0)],
      currencyCols: [8, 9],
    },
  }
}

// ── Medicines & inventory ──────────────────────────────────────────────

export async function getInventoryReport(f: ReportFilters): Promise<TabReport> {
  const { range } = await ctx(f)
  const itemWhere: Prisma.InventoryItemWhereInput = { active: true, ...(f.item ? { id: f.item } : {}) }
  const txWhere: Prisma.InventoryTransactionWhereInput = { timestamp: { gte: range.from, lte: range.to }, ...(f.item ? { itemId: f.item } : {}) }
  const [items, tx, moves, moveCount] = await Promise.all([
    prisma.inventoryItem.findMany({ where: itemWhere, orderBy: { name: "asc" } }),
    prisma.inventoryTransaction.groupBy({ by: ["itemId", "type"], where: txWhere, _sum: { quantity: true } }),
    prisma.inventoryTransaction.findMany({
      where: txWhere, orderBy: { timestamp: "desc" }, take: ROW_CAP,
      select: { timestamp: true, type: true, quantity: true, previousStock: true, newStock: true, reason: true, item: { select: { name: true, unit: true } }, performedBy: { select: { name: true } } },
    }),
    prisma.inventoryTransaction.count({ where: txWhere }),
  ])
  const m = new Map<string, Record<string, number>>()
  for (const t of tx) {
    const o = m.get(t.itemId) ?? {}
    o[t.type] = num(t._sum.quantity)
    m.set(t.itemId, o)
  }
  const data = items.map((i) => {
    const t = m.get(i.id) ?? {}
    const low = i.currentStock <= i.lowStockThresholdQty || i.currentStock <= (i.referenceStock * num(i.lowStockThresholdPercent)) / 100
    const price = i.unitPrice === null ? null : num(i.unitPrice)
    return { name: i.name, sku: i.sku, unit: i.unit, stockIn: t.STOCK_IN ?? 0, stockOut: t.STOCK_OUT ?? 0, returns: t.RETURN ?? 0, adj: t.ADJUSTMENT ?? 0, current: i.currentStock, ref: i.referenceStock, low, out: i.currentStock <= 0, value: price === null ? null : price * i.currentStock }
  }).sort((a, b) => Number(b.low) - Number(a.low) || a.name.localeCompare(b.name))

  const lowItems = data.filter((d) => d.low)
  const outItems = data.filter((d) => d.out)
  const value = data.reduce((s, d) => s + (d.value ?? 0), 0)
  const insights: string[] = []
  if (lowItems.length) insights.push(`${lowItems.length} item${lowItems.length === 1 ? " is" : "s are"} at or below the low-stock threshold: ${lowItems.slice(0, 3).map((d) => `${d.name} (${d.current}/${d.ref} ${d.unit})`).join(", ")}${lowItems.length > 3 ? ", ..." : ""}.`)
  else if (data.length) insights.push("No item is currently at or below its low-stock threshold.")
  if (outItems.length) insights.push(`${outItems.length} item${outItems.length === 1 ? " is" : "s are"} out of stock: ${outItems.slice(0, 3).map((d) => d.name).join(", ")}.`)
  const mostOut = [...data].sort((a, b) => b.stockOut - a.stockOut)[0]
  if (mostOut && mostOut.stockOut > 0) insights.push(`${mostOut.name} had the highest stock-out in this period (${mostOut.stockOut} ${mostOut.unit}).`)
  const totIn = data.reduce((s, d) => s + d.stockIn, 0)
  const totOut = data.reduce((s, d) => s + d.stockOut, 0)
  if (totIn + totOut > 0) insights.push(`${totIn} units received and ${totOut} units issued in this period across ${data.length} item${data.length === 1 ? "" : "s"}.`)
  else insights.push("No stock movements were recorded in this period.")

  return {
    kpis: [
      { label: "Items tracked", value: String(data.length) },
      { label: "Low-stock items", value: String(lowItems.length), invert: true, hint: `${outItems.length} out of stock` },
      { label: "Stock in / out", value: `${totIn} / ${totOut}` },
      { label: "Stock value", value: formatCurrency(value), hint: "Items with a unit price" },
    ],
    insights,
    breakdowns: [
      { title: "Top stock-out (units)", data: [...data].filter((d) => d.stockOut > 0).sort((a, b) => b.stockOut - a.stockOut).slice(0, 8).map((d) => ({ label: d.name, value: d.stockOut })), money: false, kind: "bars" },
      { title: "Top stock-in (units)", data: [...data].filter((d) => d.stockIn > 0).sort((a, b) => b.stockIn - a.stockIn).slice(0, 8).map((d) => ({ label: d.name, value: d.stockIn })), money: false, kind: "bars" },
    ],
    tableTitle: "Stock levels and movement",
    table: {
      filename: "inventory",
      headers: ["Medicine", "SKU", "Unit", "Stock in", "Stock out", "Returns", "Adjustments", "Current", "Reference", "Value", "Status"],
      rows: data.slice(0, ROW_CAP).map((d) => [d.name, d.sku, d.unit, d.stockIn, d.stockOut, d.returns, d.adj, d.current, d.ref, d.value === null ? "-" : r2(d.value), d.out ? "Out of stock" : d.low ? "Low stock" : "OK"]),
      totals: ["Total", "", "", totIn, totOut, data.reduce((s, d) => s + d.returns, 0), data.reduce((s, d) => s + d.adj, 0), data.reduce((s, d) => s + d.current, 0), data.reduce((s, d) => s + d.ref, 0), r2(value), ""],
      currencyCols: [9],
      truncated: data.length > ROW_CAP,
      totalRowCount: data.length,
    },
    secondaryTable: {
      title: `Movement list${moveCount > ROW_CAP ? ` (latest ${ROW_CAP} of ${moveCount})` : ""}`,
      filename: "inventory-movements",
      headers: ["Date", "Medicine", "Type", "Qty", "Stock before", "Stock after", "Reason", "By"],
      rows: moves.map((t) => [format(t.timestamp, "dd MMM yyyy HH:mm"), t.item.name, t.type.replace("_", " "), t.quantity, t.previousStock, t.newStock, t.reason ?? "-", t.performedBy.name]),
      truncated: moveCount > ROW_CAP,
      totalRowCount: moveCount,
    },
  }
}

// ── Appointments ───────────────────────────────────────────────────────

export async function getAppointmentsReport(f: ReportFilters): Promise<TabReport> {
  const { range } = await ctx(f)
  const appts = await prisma.appointment.findMany({
    where: apptWhere(f, range.from, range.to),
    select: { scheduledAt: true, status: true, source: true, patient: { select: { createdAt: true } } },
  })
  const total = appts.length
  const byStatus = new Map<string, number>()
  const bySource = new Map<string, number>()
  const matrix = new Map<string, Record<string, number>>()
  const weekday = new Array(7).fill(0) as number[]
  const grid = Array.from({ length: 7 }, () => new Array(24).fill(0)) as number[][]
  let fresh = 0
  for (const a of appts) {
    byStatus.set(a.status, (byStatus.get(a.status) ?? 0) + 1)
    bySource.set(a.source, (bySource.get(a.source) ?? 0) + 1)
    const row = matrix.get(a.status) ?? {}
    row[a.source] = (row[a.source] ?? 0) + 1
    matrix.set(a.status, row)
    const d = getDay(a.scheduledAt)
    weekday[d]++
    grid[d][getHours(a.scheduledAt)]++
    if (a.patient.createdAt >= range.from && a.patient.createdAt <= range.to) fresh++
  }
  const completed = byStatus.get("COMPLETED") ?? 0
  const noShow = byStatus.get("NO_SHOW") ?? 0
  const cancelled = byStatus.get("CANCELLED") ?? 0
  const hourTotals = new Array(24).fill(0).map((_, h) => grid.reduce((s, r) => s + r[h], 0)) as number[]
  const used = hourTotals.map((v, h) => (v > 0 ? h : -1)).filter((h) => h >= 0)
  const h0 = used.length ? Math.min(...used) : 8
  const h1 = used.length ? Math.max(...used) : 18
  const hours = Array.from({ length: h1 - h0 + 1 }, (_, i) => h0 + i)
  const order = [1, 2, 3, 4, 5, 6, 0]

  const b = buckets(range)
  const perDay = new Map<string, number>()
  for (const a of appts) perDay.set(b.keyOf(a.scheduledAt), (perDay.get(b.keyOf(a.scheduledAt)) ?? 0) + 1)

  const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()
  const insights: string[] = []
  if (total > 0) {
    insights.push(`${completed} of ${total} appointments completed (${pct(completed, total).toFixed(0)}%); ${noShow} no-show${noShow === 1 ? "" : "s"} (${pct(noShow, total).toFixed(1)}%) and ${cancelled} cancelled.`)
    const topSrc = [...bySource.entries()].sort((a, b) => b[1] - a[1])[0]
    insights.push(`${cap(topSrc[0])} is the largest booking source (${pct(topSrc[1], total).toFixed(0)}%).`)
    const topDay = weekday.indexOf(Math.max(...weekday))
    insights.push(`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][topDay]} is the busiest weekday (${weekday[topDay]} appointments).`)
    const peakH = hourTotals.indexOf(Math.max(...hourTotals))
    insights.push(`Peak hour is ${format(new Date(2000, 0, 1, peakH), "h a")} (${hourTotals[peakH]} appointments); ${fresh} appointment${fresh === 1 ? " is" : "s are"} for patients registered in this period.`)
  }

  const statusOrder = ["COMPLETED", "CONFIRMED", "PENDING", "ARRIVED", "IN_CONSULTATION", "RESCHEDULED", "CANCELLED", "NO_SHOW"]
  const srcs = ["WEBSITE", "CRM", "PHONE"]
  const rows = statusOrder.filter((s) => byStatus.has(s)).map((s) => [appointmentStatusLabels[s] ?? s, ...srcs.map((x) => matrix.get(s)?.[x] ?? 0), byStatus.get(s) ?? 0, r2(pct(byStatus.get(s) ?? 0, total))])

  return {
    kpis: [
      { label: "Appointments", value: String(total) },
      { label: "Completed", value: String(completed), hint: `${pct(completed, total).toFixed(0)}%` },
      { label: "No-show rate", value: `${pct(noShow, total).toFixed(1)}%`, invert: true, hint: `${noShow} no-shows` },
      { label: "New vs returning", value: `${fresh} / ${total - fresh}`, hint: "New = patient registered in period" },
    ],
    insights,
    trend: { title: range.bucket === "day" ? "Appointments by day" : "Appointments by month", points: b.keys.map((k, i) => ({ label: b.labels[i], value: perDay.get(k) ?? 0 })), money: false, hasPrev: false },
    breakdowns: [
      { title: "By status", data: statusOrder.filter((s) => byStatus.has(s)).map((s) => ({ label: appointmentStatusLabels[s] ?? s, value: byStatus.get(s) ?? 0 })), money: false, kind: "donut" },
      { title: "By source", data: [...bySource.entries()].map(([k, v]) => ({ label: cap(k), value: v })), money: false, kind: "donut" },
      { title: "By weekday", data: order.map((d) => ({ label: WEEKDAYS[d], value: weekday[d] })), money: false, kind: "bars" },
    ],
    heatmap: { title: "Weekday x hour", rows: order.map((d) => WEEKDAYS[d]), cols: hours.map((h) => format(new Date(2000, 0, 1, h), "ha").toLowerCase()), values: order.map((d) => hours.map((h) => grid[d][h])) },
    tableTitle: "Status by source",
    table: {
      filename: "appointments",
      headers: ["Status", "Website", "CRM", "Phone", "Total", "Share %"],
      rows,
      totals: ["Total", bySource.get("WEBSITE") ?? 0, bySource.get("CRM") ?? 0, bySource.get("PHONE") ?? 0, total, total ? 100 : 0],
    },
  }
}
