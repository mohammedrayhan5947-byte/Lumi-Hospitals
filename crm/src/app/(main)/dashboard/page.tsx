import Link from "next/link"
import {
  UserPlus,
  Repeat,
  CalendarClock,
  Users2,
  AlertTriangle,
  CheckSquare,
  Smartphone,
  Banknote,
  Wallet,
  Ticket,
  Plus,
  ListOrdered,
  Receipt,
  FileBarChart,
} from "lucide-react"
import { getDashboardStats, getRecentPatients, getDashboardInsights } from "@/actions/dashboard"
import { getTodayTokens } from "@/actions/appointments"
import { TokenRegister } from "@/components/appointments/token-register"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import { formatToken } from "@/lib/tokens"
import { StatCard } from "@/components/dashboard/stat-card"
import { LiveRefresh } from "@/components/dashboard/live-refresh"
import { WeekChart } from "@/components/dashboard/week-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatTime, formatRelative, formatCurrency, initials, patientDisplayName } from "@/lib/format"
import { appointmentStatusColors, appointmentStatusLabels, appointmentTypeLabels } from "@/lib/labels"

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const isDoctor = user.role === "DOCTOR"
  const [stats, recentPatients, insights, myTokens] = await Promise.all([
    getDashboardStats(),
    getRecentPatients(6),
    getDashboardInsights(),
    isDoctor ? getTodayTokens() : Promise.resolve([]),
  ])
  const who = (t: { n: number | null; doctor: string }) =>
    isDoctor ? formatToken(t.n) : `${formatToken(t.n)} · Dr. ${t.doctor.split(" ").slice(-1)[0]}`
  const showMoney = canAccess(user, "billing") || canAccess(user, "finance")
  const quick = [
    { href: "/patients/new", label: "New patient", icon: Plus, scope: "patients" as const },
    { href: "/queue", label: "Queue & tokens", icon: ListOrdered, scope: "queue" as const },
    { href: "/billing/new", label: "New bill", icon: Receipt, scope: "billing" as const },
    { href: "/reports", label: "Reports", icon: FileBarChart, scope: "reports" as const },
  ].filter((q) => canAccess(user, q.scope))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
            >
              <q.icon className="h-3.5 w-3.5 text-primary" />
              {q.label}
            </Link>
          ))}
          <LiveRefresh />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="New patients today" value={stats.newPatientsToday} icon={UserPlus} tone="default" href="/patients" />
        <StatCard label="Returning patients" value={stats.returningPatientsToday} icon={Repeat} tone="accent" />
        <StatCard label="Today's appointments" value={stats.todayAppointmentsCount} icon={CalendarClock} tone="info" href="/appointments" />
        <StatCard label="Waiting in queue" value={stats.waitingQueueCount} icon={Users2} tone="warning" href="/queue" />
        <StatCard label="Missed appointments" value={stats.missedAppointmentsCount} icon={AlertTriangle} tone="danger" href="/appointments" />
        <StatCard label="Follow-ups due" value={stats.followUpsDueCount} icon={CheckSquare} tone="success" href="/follow-ups" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" /> {isDoctor ? "My token flow today" : "Token flow today"}
            </CardTitle>
            <Link href="/queue" className="text-sm text-primary hover:underline">
              Open queue
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
              <p className="text-xs text-muted-foreground">Now serving</p>
              <p className="mt-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {insights.tokens.serving.length ? insights.tokens.serving.map(who).join(", ") : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
              <p className="text-xs text-muted-foreground">Next up</p>
              <p className="mt-1 font-mono text-xl font-bold text-amber-700 dark:text-amber-400">
                {insights.tokens.nextUp ? who(insights.tokens.nextUp) : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Tokens issued</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{insights.tokens.issued}</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs text-muted-foreground">Seen so far</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{insights.tokens.completed}</p>
            </div>
          </CardContent>
        </Card>

        {showMoney ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Collected today</CardTitle>
              <Link href="/billing" className="text-sm text-primary hover:underline">
                Billing
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-semibold tabular-nums">{formatCurrency(insights.collections.total)}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-violet-50 p-2 dark:bg-violet-950/30">
                  <Smartphone className="mx-auto h-4 w-4 text-violet-600" />
                  <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(insights.collections.upi)}</p>
                  <p className="text-[11px] text-muted-foreground">UPI</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
                  <Banknote className="mx-auto h-4 w-4 text-emerald-600" />
                  <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(insights.collections.cash)}</p>
                  <p className="text-[11px] text-muted-foreground">Cash</p>
                </div>
                <div className="rounded-lg bg-teal-50 p-2 dark:bg-teal-950/30">
                  <Wallet className="mx-auto h-4 w-4 text-teal-600" />
                  <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(insights.collections.other)}</p>
                  <p className="text-[11px] text-muted-foreground">Card & other</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.collections.count} payment{insights.collections.count === 1 ? "" : "s"} today
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Last 7 days</CardTitle>
            </CardHeader>
            <CardContent>
              <WeekChart week={insights.week.map((d) => ({ ...d, collected: 0 }))} />
            </CardContent>
          </Card>
        )}
      </div>

      {isDoctor && <TokenRegister tokens={myTokens} title="My patients today (by token)" />}

      {showMoney && (
        <Card>
          <CardHeader>
            <CardTitle>Last 7 days: appointments and collections</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekChart week={insights.week} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s schedule</CardTitle>
            <Link href="/appointments" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.todayAppointments.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No appointments scheduled today.</p>
            )}
            {stats.todayAppointments.map((apt) => (
              <Link
                key={apt.id}
                href={`/patients/${apt.patientId}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
              >
                <div className="w-16 shrink-0 text-sm font-medium tabular-nums">{formatTime(apt.scheduledAt)}</div>
                {apt.tokenNumber != null && (
                  <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-primary">
                    {formatToken(apt.tokenNumber)}
                  </span>
                )}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">{initials(patientDisplayName(apt.patient))}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{patientDisplayName(apt.patient)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Dr. {apt.doctor.name} · {appointmentTypeLabels[apt.type]}
                  </p>
                </div>
                <Badge variant="secondary" className={appointmentStatusColors[apt.status]}>
                  {appointmentStatusLabels[apt.status]}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Follow-ups due</CardTitle>
            <Link href="/follow-ups" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.followUpsDue.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing due. You&apos;re all caught up.</p>
            )}
            {stats.followUpsDue.map((f) => (
              <Link
                key={f.id}
                href={`/patients/${f.patientId}`}
                className="block rounded-lg px-2 py-2 transition-colors hover:bg-muted"
              >
                <p className="truncate text-sm font-medium">{patientDisplayName(f.patient)}</p>
                <p className="truncate text-xs text-muted-foreground">{f.reason}</p>
                <p className="text-xs text-muted-foreground/80">Due {formatRelative(f.dueDate)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recently registered patients</CardTitle>
          <Link href="/patients" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentPatients.map((p) => (
            <Link
              key={p.id}
              href={`/patients/${p.id}`}
              className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs">{initials(patientDisplayName(p))}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{patientDisplayName(p)}</p>
                <p className="text-xs text-muted-foreground">{p.uhid}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
