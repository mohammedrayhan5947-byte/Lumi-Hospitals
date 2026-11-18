"use client"

import Link from "next/link"
import { LumiMark, LumiWordmark } from "@/components/brand/logo"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ListOrdered,
  Clock,
  CheckSquare,
  MessageSquare,
  CalendarClock,
  Stethoscope,
  FileEdit,
  PenTool,
  Receipt,
  Undo2,
  TrendingUp,
  AlertCircle,
  Wallet,
  BarChart3,
  Package,
  CalendarCheck2,
  Globe,
  MessagesSquare,
  HelpCircle,
  Boxes,
  ShieldAlert,
  FileBarChart,
  UserCog,
  Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { canAccess, type Scope } from "@/lib/permissions"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  scope: Scope
}

interface NavGroup {
  label: string
  dot: string
  text: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Care",
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, scope: "dashboard" },
      { href: "/patients", label: "Patients", icon: Users, scope: "patients" },
      { href: "/appointments", label: "Appointments", icon: CalendarDays, scope: "appointments" },
      { href: "/queue", label: "Queue", icon: ListOrdered, scope: "queue" },
      { href: "/inventory", label: "Inventory", icon: Boxes, scope: "inventory" },
      { href: "/waiting-list", label: "Waiting List", icon: Clock, scope: "waiting-list" },
      { href: "/follow-ups", label: "Follow-ups", icon: CheckSquare, scope: "follow-ups" },
      { href: "/communications", label: "Communications", icon: MessageSquare, scope: "communications" },
    ],
  },
  {
    label: "Clinical",
    dot: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    items: [
      { href: "/appointments/availability", label: "Doctor Availability", icon: CalendarClock, scope: "schedule" },
      { href: "/templates", label: "Doctor Templates", icon: FileEdit, scope: "clinical" },
      { href: "/settings/signature", label: "Digital Signature", icon: PenTool, scope: "clinical" },
      { href: "/audit-logs", label: "Audit Logs", icon: ShieldAlert, scope: "audit-logs" },
      { href: "/staff", label: "Staff & Access", icon: UserCog, scope: "staff" },
      { href: "/documents", label: "Stored Documents", icon: Archive, scope: "documents" },
    ],
  },
  {
    label: "Billing & Finance",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    items: [
      { href: "/billing", label: "Billing", icon: Receipt, scope: "billing" },
      { href: "/billing/refunds", label: "Refunds", icon: Undo2, scope: "billing" },
      { href: "/finance/dashboard", label: "Finance Dashboard", icon: TrendingUp, scope: "finance" },
      { href: "/finance/outstanding", label: "Outstanding Dues", icon: AlertCircle, scope: "finance" },
      { href: "/finance/cash-counter", label: "Cash Counter", icon: Wallet, scope: "finance" },
      { href: "/finance/expenses", label: "Expenses", icon: Receipt, scope: "finance" },
      { href: "/reports", label: "Insights & Reports", icon: FileBarChart, scope: "reports" },
      { href: "/finance/reports", label: "Financial Reports", icon: BarChart3, scope: "reports" },
      { href: "/services", label: "Services", icon: Package, scope: "services" },
    ],
  },
  {
    label: "Website",
    dot: "bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    items: [
      { href: "/website/content", label: "Site Content", icon: Globe, scope: "website" },
      { href: "/website/reviews", label: "Reviews", icon: MessagesSquare, scope: "website" },
      { href: "/website/faqs", label: "FAQs", icon: HelpCircle, scope: "website" },
    ],
  },
  {
    label: "Calendar",
    dot: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    items: [{ href: "/calendar", label: "Calendar", icon: CalendarCheck2, scope: "schedule" }],
  },
]

/** Logo + navigation. Shared by the desktop sidebar and the mobile drawer. */
export function NavPanel({
  role = "ADMIN",
  permissions = [],
  onNavigate,
}: {
  role?: string
  permissions?: string[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const me = { role, permissions }

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(me, item.scope)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <>
      <div className="flex items-center gap-2 px-5 h-16 border-b shrink-0">
        <LumiMark className="h-9 w-9 shrink-0" />
        <LumiWordmark subtitle={role === "ADMIN" ? "Admin CRM" : "Reception Desk"} />
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 px-3 space-y-4">
        {visibleGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className={cn("flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide", group.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", group.dot)} />
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/appointments" && pathname.startsWith("/appointments/")) ||
                (item.href === "/inventory" && pathname.startsWith("/inventory/")) ||
                (item.href === "/billing" && pathname.startsWith("/billing/") && !pathname.startsWith("/billing/refunds")) ||
                (!["/appointments", "/billing", "/inventory", "/finance/reports", "/reports"].includes(item.href) && item.href.length > 1 && pathname.startsWith(`${item.href}/`))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 lg:py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", !isActive && group.text)} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </>
  )
}

export function SidebarNav({ role = "ADMIN", permissions = [] }: { role?: string; permissions?: string[] }) {
  return (
    <aside className="sticky top-0 hidden h-dvh print:!hidden w-64 shrink-0 self-start flex-col border-r bg-background lg:flex">
      <NavPanel role={role} permissions={permissions} />
    </aside>
  )
}
