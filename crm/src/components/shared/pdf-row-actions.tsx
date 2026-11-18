import { Download, Eye, FileStack } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PdfActionKind } from "@/components/shared/pdf-actions"

const btn = "inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium hover:bg-muted print:hidden"

/** Compact View + Download links for one row's document. */
export function PdfRowActions({ kind, id, className }: { kind: PdfActionKind; id: string; className?: string }) {
  const href = `/api/pdf/${kind}/${id}`
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <a href={href} target="_blank" rel="noopener noreferrer" className={btn} title="View PDF"><Eye className="h-3.5 w-3.5" />View</a>
      <a href={`${href}?download=1`} download className={btn} title="Download PDF"><Download className="h-3.5 w-3.5" />PDF</a>
    </span>
  )
}

/** One PDF holding the whole section (use the filters to narrow it: patientId, status, range, from, to). */
export function SectionPdfActions({
  kind,
  label = "all",
  filters = {},
  className,
}: {
  kind: PdfActionKind
  label?: string
  filters?: Record<string, string | undefined>
  className?: string
}) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) if (v) p.set(k, v)
  const base = `/api/pdf-bundle/${kind}`
  const qs = p.toString()
  const view = qs ? `${base}?${qs}` : base
  const dl = `${base}?${qs ? qs + "&" : ""}download=1`
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <a href={view} target="_blank" rel="noopener noreferrer" className={btn} title={`View ${label} as one PDF`}><FileStack className="h-3.5 w-3.5" />View {label}</a>
      <a href={dl} download className={btn} title={`Download ${label} as one PDF`}><Download className="h-3.5 w-3.5" />Download {label}</a>
    </span>
  )
}
