"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { refreshAllStoredPdfs } from "@/actions/documents"

/** Rebuilds every document PDF into the database (admin only). */
export function RefreshAllButton() {
  const [pending, start] = useTransition()
  const router = useRouter()
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="gap-1.5 print:hidden"
      onClick={() =>
        start(async () => {
          try {
            const r = await refreshAllStoredPdfs()
            toast.success(`${r.done} document${r.done === 1 ? "" : "s"} stored in the database${r.failed ? `, ${r.failed} failed` : ""}`)
            router.refresh()
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not refresh documents")
          }
        })
      }
    >
      <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Building PDFs…" : "Rebuild all PDFs"}
    </Button>
  )
}
