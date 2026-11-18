import Link from "next/link"
import { Banknote, Smartphone, CreditCard, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { formatCurrency } from "@/lib/format"
import type { getCollectionSummary, CollectionRange } from "@/actions/billing"

const RANGES: { key: CollectionRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
]

export function CollectionSummary({
  summary,
  range,
}: {
  summary: Awaited<ReturnType<typeof getCollectionSummary>>
  range: CollectionRange
}) {
  const hint = (n: number) => `${n} payment${n === 1 ? "" : "s"}`
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>Collections</CardTitle>
        <div className="flex gap-2" role="group" aria-label="Collection period">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={r.key === "today" ? "/billing" : `/billing?range=${r.key}`}
              aria-current={range === r.key ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                range === r.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="UPI Collected" value={formatCurrency(summary.upi.amount)} icon={Smartphone} tone="info" hint={hint(summary.upi.count)} />
        <StatCard label="Cash Collected" value={formatCurrency(summary.cash.amount)} icon={Banknote} tone="success" hint={hint(summary.cash.count)} />
        <StatCard label="Card & Other" value={formatCurrency(summary.other.amount)} icon={CreditCard} tone="accent" hint={hint(summary.other.count)} />
        <StatCard label="Total Collected" value={formatCurrency(summary.total)} icon={Wallet} tone="default" />
      </CardContent>
    </Card>
  )
}
