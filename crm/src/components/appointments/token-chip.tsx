import { cn } from "@/lib/utils"
import { formatToken } from "@/lib/tokens"

/** Compact queue-token badge, e.g. "T-007". */
export function TokenChip({ n, className }: { n: number | null | undefined; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[3.4rem] items-center justify-center rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-bold tabular-nums text-primary",
        className
      )}
      title="Queue token for the day"
    >
      {formatToken(n)}
    </span>
  )
}
