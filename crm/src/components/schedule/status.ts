export const STATUS_STYLE: Record<string, { label: string; block: string; dot: string }> = {
  PENDING: { label: "Pending", block: "bg-slate-100 border-slate-400 text-slate-900 dark:bg-slate-800 dark:text-slate-100", dot: "bg-slate-400" },
  CONFIRMED: { label: "Confirmed", block: "bg-sky-100 border-sky-500 text-sky-950 dark:bg-sky-950 dark:text-sky-100", dot: "bg-sky-500" },
  ARRIVED: { label: "Arrived", block: "bg-amber-100 border-amber-500 text-amber-950 dark:bg-amber-950 dark:text-amber-100", dot: "bg-amber-500" },
  IN_CONSULTATION: { label: "In consultation", block: "bg-violet-200 border-violet-600 text-violet-950 dark:bg-violet-900 dark:text-violet-50", dot: "bg-violet-600" },
  COMPLETED: { label: "Completed", block: "bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", block: "bg-rose-50 border-rose-300 text-rose-900 line-through opacity-60 dark:bg-rose-950 dark:text-rose-100", dot: "bg-rose-400" },
  NO_SHOW: { label: "No-show", block: "bg-orange-50 border-orange-400 text-orange-900 opacity-70 dark:bg-orange-950 dark:text-orange-100", dot: "bg-orange-500" },
  RESCHEDULED: { label: "Rescheduled", block: "bg-zinc-50 border-zinc-300 text-zinc-700 opacity-60 dark:bg-zinc-900 dark:text-zinc-200", dot: "bg-zinc-400" },
}

export const statusLabel = (s: string) => STATUS_STYLE[s]?.label ?? s
