import { getRefunds } from "@/actions/payments"
import { RefundsQueue } from "@/components/billing/refunds-queue"
import { SectionPdfActions } from "@/components/shared/pdf-row-actions"
import { PrintButton } from "@/components/shared/print-button"

export default async function RefundsPage() {
  const refunds = await getRefunds()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <h1 className="text-2xl font-semibold tracking-tight">Refunds</h1>
        <p className="text-sm text-muted-foreground">{refunds.length} refund request{refunds.length === 1 ? "" : "s"}</p>
      </div>
        <div className="flex flex-wrap items-center gap-2"><SectionPdfActions kind="refund" label="all refunds" /><PrintButton /></div>
      </div>
      <RefundsQueue refunds={refunds} />
    </div>
  )
}
