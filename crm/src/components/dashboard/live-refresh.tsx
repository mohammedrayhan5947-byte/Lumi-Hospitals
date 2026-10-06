"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

// Re-runs the dashboard's server queries on an interval (and when the tab regains focus).
export function LiveRefresh({ everySeconds = 30 }: { everySeconds?: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  useEffect(() => {
    setUpdatedAt(new Date())
    const refresh = () => {
      if (document.visibilityState !== "visible") return
      startTransition(() => {
        router.refresh()
        setUpdatedAt(new Date())
      })
    }
    const id = setInterval(refresh, everySeconds * 1000)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [router, everySeconds])

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
      <RefreshCw className={`h-3 w-3 ${pending ? "animate-spin" : ""}`} />
      Live{updatedAt ? ` · updated ${updatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
    </span>
  )
}
