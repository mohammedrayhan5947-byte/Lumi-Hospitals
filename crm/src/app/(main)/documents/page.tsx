import Link from "next/link"
import { FileText, Download, Eye } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { listStoredPdfs } from "@/actions/documents"
import { RefreshAllButton } from "@/components/documents/refresh-button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SectionPdfActions } from "@/components/shared/pdf-row-actions"
import { Pagination } from "@/components/shared/pagination"
import { formatDateTime } from "@/lib/format"

const KINDS = [
  { key: "", label: "All" },
  { key: "prescription", label: "Prescriptions" },
  { key: "bill", label: "Invoices" },
  { key: "receipt", label: "Receipts" },
  { key: "certificate", label: "Certificates" },
  { key: "report", label: "Reports" },
  { key: "refund", label: "Refunds" },
]

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : `${(n / 1024).toFixed(1)} KB`)

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; q?: string; from?: string; to?: string; page?: string }>
}) {
  const user = await getCurrentUser()
  if (user.role !== "ADMIN") {
    return <p className="mt-10 text-center text-sm text-muted-foreground">Only administrators can open the document store.</p>
  }
  const sp = await searchParams
  const data = await listStoredPdfs({ kind: sp.kind, q: sp.q, from: sp.from, to: sp.to, page: Number(sp.page) || 1 })
  const allCount = Object.values(data.counts).reduce((a, b) => a + b, 0)
  const href = (kind: string) => {
    const p = new URLSearchParams()
    if (kind) p.set("kind", kind)
    if (sp.q) p.set("q", sp.q)
    if (sp.from) p.set("from", sp.from)
    if (sp.to) p.set("to", sp.to)
    const s = p.toString()
    return s ? `/documents?${s}` : "/documents"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stored documents</h1>
          <p className="text-sm text-muted-foreground">
            Every prescription, invoice, receipt, certificate, report and refund note, saved as a compressed PDF inside the database. Admin only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sp.kind && sp.kind in { prescription: 1, bill: 1, receipt: 1, certificate: 1, report: 1, refund: 1 } && (
            <SectionPdfActions kind={sp.kind as "bill"} label={`all ${sp.kind === "bill" ? "invoice" : sp.kind}s`} filters={{ from: sp.from, to: sp.to }} />
          )}
          <RefreshAllButton />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card><CardContent className="pt-5"><p className="text-xs uppercase text-muted-foreground">Documents</p><p className="mt-1 text-2xl font-semibold tabular-nums">{data.total}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs uppercase text-muted-foreground">Total size</p><p className="mt-1 text-2xl font-semibold tabular-nums">{kb(data.totalBytes)}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs uppercase text-muted-foreground">Average</p><p className="mt-1 text-2xl font-semibold tabular-nums">{data.total ? kb(data.totalBytes / data.total) : "—"}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs uppercase text-muted-foreground">Largest</p><p className="mt-1 text-2xl font-semibold tabular-nums">{kb(data.largestBytes)}</p><p className="text-xs text-muted-foreground">limit 200 KB</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Document type">
        {KINDS.map((k) => {
          const active = (sp.kind ?? "") === k.key
          const count = k.key ? data.counts[k.key] ?? 0 : allCount
          return (
            <Link
              key={k.key || "all"}
              href={href(k.key)}
              aria-current={active ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {k.label} <span className="opacity-70">{count}</span>
            </Link>
          )
        })}
      </div>

      <form className="flex flex-wrap items-end gap-3 print:hidden" action="/documents">
        {sp.kind && <input type="hidden" name="kind" value={sp.kind} />}
        <label className="space-y-1 text-xs text-muted-foreground">
          Search
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Patient, UHID or title" className="block h-9 w-56 rounded-md border bg-background px-3 text-sm text-foreground" />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          From
          <input type="date" name="from" defaultValue={sp.from ?? ""} className="block h-9 rounded-md border bg-background px-3 text-sm text-foreground" />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          To
          <input type="date" name="to" defaultValue={sp.to ?? ""} className="block h-9 rounded-md border bg-background px-3 text-sm text-foreground" />
        </label>
        <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Apply</button>
        {(sp.q || sp.from || sp.to) && <Link href={href("").split("?")[0] + (sp.kind ? `?kind=${sp.kind}` : "")} className="pb-2 text-sm text-primary hover:underline">Reset</Link>}
      </form>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  {["Document", "Type", "Patient", "Size", "Saved", ""].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-left ${h === "Size" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No stored documents match. Use “Rebuild all PDFs” to generate them from the records.</td></tr>
                )}
                {data.rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5"><span className="inline-flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-primary" />{r.title}</span></td>
                    <td className="px-4 py-2.5"><Badge variant="secondary" className="capitalize">{r.kind === "bill" ? "invoice" : r.kind}</Badge></td>
                    <td className="px-4 py-2.5">
                      <Link href={`/patients/${r.patientId}`} className="hover:underline">{r.patientName}</Link>
                      <span className="block font-mono text-xs text-muted-foreground">{r.uhid}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{kb(r.sizeBytes)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted-foreground">{formatDateTime(r.updatedAt)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-2">
                        <a href={`/api/pdf/${r.kind}/${r.entityId}?stored=1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"><Eye className="h-3.5 w-3.5" />View</a>
                        <a href={`/api/pdf/${r.kind}/${r.entityId}?stored=1&download=1`} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"><Download className="h-3.5 w-3.5" />Download</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination total={data.total} pageSize={data.pageSize} currentPage={data.page} />
    </div>
  )
}
