import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Tone = "default" | "info" | "accent" | "warning" | "danger" | "success"

const tones: Record<Tone, { chip: string; bar: string }> = {
  default: { chip: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", bar: "bg-blue-500" },
  info: { chip: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300", bar: "bg-violet-500" },
  accent: { chip: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300", bar: "bg-teal-500" },
  warning: { chip: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", bar: "bg-amber-500" },
  danger: { chip: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", bar: "bg-red-500" },
  success: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", bar: "bg-emerald-500" },
}

/** KPI tile: the label wraps instead of truncating, a coloured edge marks the tone, and it can link through. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  href,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: Tone
  hint?: string
  href?: string
}) {
  const t = tones[tone]
  const body = (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl border bg-card p-4 shadow-xs transition",
        href && "hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", t.bar)} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug text-muted-foreground">{label}</p>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", t.chip)}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div>
        <p className="text-3xl font-semibold leading-none tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  )
}
