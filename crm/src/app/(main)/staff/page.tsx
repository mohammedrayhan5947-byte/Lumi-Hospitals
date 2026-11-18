import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { listStaff } from "@/actions/staff"
import { Card, CardContent } from "@/components/ui/card"
import { StaffDialog } from "@/components/staff/staff-dialog"
import { StaffTable } from "@/components/staff/staff-table"

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "ADMIN", label: "Admins" },
  { key: "DOCTOR", label: "Doctors" },
  { key: "RECEPTIONIST", label: "Reception" },
  { key: "BILLING", label: "Billing" },
  { key: "INACTIVE", label: "Inactive" },
] as const

export default async function StaffPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const admin = await requireRole("ADMIN")
  const { role } = await searchParams
  const active = FILTERS.find((f) => f.key === role)?.key ?? "ALL"
  const all = await listStaff()

  const count = (key: string) =>
    key === "ALL" ? all.length : key === "INACTIVE" ? all.filter((s) => !s.active).length : all.filter((s) => s.role === key && s.active).length
  const rows = all.filter((s) =>
    active === "ALL" ? true : active === "INACTIVE" ? !s.active : s.role === active && s.active
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff Management</h1>
          <p className="text-sm text-muted-foreground">{all.length} {all.length === 1 ? "account" : "accounts"} · manage logins and section access.</p>
        </div>
        <StaffDialog />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by role">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "ALL" ? "/staff" : `/staff?role=${f.key}`}
            aria-current={active === f.key ? "true" : undefined}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              active === f.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {f.label} <span className="opacity-70">{count(f.key)}</span>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <StaffTable staff={rows} currentUserId={admin.id} />
        </CardContent>
      </Card>
    </div>
  )
}
