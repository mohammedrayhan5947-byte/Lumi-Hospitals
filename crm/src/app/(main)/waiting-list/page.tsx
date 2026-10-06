import Link from "next/link"
import { getWaitingList } from "@/actions/appointments"
import { getDoctors } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { AddWaitingListDialog } from "@/components/appointments/add-waiting-list-dialog"
import { WaitingListTable } from "@/components/appointments/waiting-list-table"

const FILTERS = [
  { key: "WAITING", label: "Waiting" },
  { key: "NOTIFIED", label: "Notified" },
  { key: "CONVERTED", label: "Converted" },
  { key: "EXPIRED", label: "Expired" },
  { key: "ALL", label: "All" },
] as const

export default async function WaitingListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const active = FILTERS.find((f) => f.key === status)?.key ?? "WAITING"
  const [entries, doctors] = await Promise.all([
    getWaitingList(active === "ALL" ? undefined : active),
    getDoctors(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Waiting List</h1>
          <p className="text-sm text-muted-foreground">Patients waiting for the next available slot.</p>
        </div>
        <AddWaitingListDialog doctors={doctors} />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "WAITING" ? "/waiting-list" : `/waiting-list?status=${f.key}`}
            aria-current={active === f.key ? "true" : undefined}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              active === f.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <WaitingListTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  )
}
