import { cn } from "@/lib/utils"

/** Lumi Hospital mark: stepped red cross with a four-point star (same as the website logo). */
export function LumiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("h-8 w-8", className)}>
      <path d="M14 3h12v11h11v12H26v11H14V26H3V14h11z" fill="#fff" stroke="#d8262f" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M16.6 6.2h6.8v10.4h10.4v6.8H23.4v10.4h-6.8V23.4H6.2v-6.8h10.4z" fill="#d8262f" />
      <path d="M20 12.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5z" fill="#fff" />
    </svg>
  )
}

/** Wordmark: "Lumi" with the red dot on the i, and "HOSPITAL" underneath. */
export function LumiWordmark({ className, subtitle }: { className?: string; subtitle?: string }) {
  return (
    <div className={cn("leading-none", className)}>
      <p className="text-base font-semibold tracking-tight">
        Lum<span className="relative">ı<span className="absolute left-1/2 top-[0.02em] -ml-[0.1em] h-[0.2em] w-[0.2em] rounded-full bg-[#d8262f]" /></span>
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{subtitle ?? "Hospital"}</p>
    </div>
  )
}
