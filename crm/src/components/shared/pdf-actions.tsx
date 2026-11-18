import { Download, Printer } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PdfActionKind = "prescription" | "bill" | "receipt" | "certificate" | "report" | "refund"

/** "Print" opens the letterhead PDF inline in a new tab (browser PDF viewer prints it); "PDF" downloads it. */
export function PdfActions({
  kind,
  id,
  size = "sm",
  className,
  showPrint = true,
}: {
  kind: PdfActionKind
  id: string
  size?: "sm" | "xs"
  className?: string
  showPrint?: boolean
}) {
  const href = `/api/pdf/${kind}/${id}`
  const cls = cn(buttonVariants({ variant: "outline", size: size === "xs" ? "xs" : "sm" }), "gap-1.5 print:hidden")
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <a href={`${href}?download=1`} download className={cls}>
        <Download className="h-3.5 w-3.5" />
        Download PDF
      </a>
      {showPrint && (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          <Printer className="h-3.5 w-3.5" />
          Print
        </a>
      )}
    </span>
  )
}
