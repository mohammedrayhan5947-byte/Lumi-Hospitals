import Link from "next/link"
import { Plus } from "lucide-react"
import { getBills, getCollectionSummary, getTransactions, type CollectionRange } from "@/actions/billing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BillFilters } from "@/components/billing/bill-filters"
import { BillTable } from "@/components/billing/bill-table"
import { CollectionSummary } from "@/components/billing/collection-summary"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateTime, patientDisplayName } from "@/lib/format"
import { PdfRowActions, SectionPdfActions } from "@/components/shared/pdf-row-actions"
import { Pagination } from "@/components/shared/pagination"

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; range?: string }>
}) {
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const range: CollectionRange = sp.range === "week" || sp.range === "month" || sp.range === "all" ? sp.range : "today"
  const [{ bills, total, pageSize }, summary, txns] = await Promise.all([
    getBills({ status: sp.status, page }),
    getCollectionSummary(range),
    getTransactions(range),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">{total} bill{total === 1 ? "" : "s"}</p>
        </div>
        <Button
          className="gap-1.5"
          nativeButton={false}
          render={
            <Link href="/billing/new">
              <Plus className="h-4 w-4" />
              New Bill
            </Link>
          }
        />
      </div>

      <CollectionSummary summary={summary} range={range} />

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">Transactions</h2>
            <span className="flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">{txns.length} payment{txns.length === 1 ? "" : "s"}</span><SectionPdfActions kind="receipt" label="all receipts" filters={{ range }} /></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Receipt", "Date", "Patient", "Bill", "Method", "Reference", "Received by", "Amount", "Status", ""].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-left ${h === "Amount" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {txns.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No payments in this period.</td></tr>
                )}
                {txns.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-mono text-xs">{t.receiptNumber}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(t.paidAt)}</td>
                    <td className="px-4 py-2.5">{patientDisplayName(t.patient)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{t.bill?.billNumber ?? "—"}</td>
                    <td className="px-4 py-2.5"><Badge variant="secondary">{t.method.replace("_", " ")}</Badge></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{t.referenceNumber ?? "—"}</td>
                    <td className="px-4 py-2.5 text-xs">{t.receivedBy?.name ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatCurrency(Number(t.amount))}</td>
                    <td className="px-4 py-2.5"><Badge variant={t.status === "SUCCESS" ? "secondary" : "destructive"}>{t.status}</Badge></td>
                    <td className="px-4 py-2.5 text-right">{t.status === "SUCCESS" && <PdfRowActions kind="receipt" id={t.id} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BillFilters />
        <SectionPdfActions kind="bill" label="all invoices" filters={{ status: sp.status }} />
      </div>

      <Card>
        <CardContent className="p-0">
          <BillTable bills={bills} />
        </CardContent>
      </Card>

      <Pagination total={total} pageSize={pageSize} currentPage={page} />
    </div>
  )
}
