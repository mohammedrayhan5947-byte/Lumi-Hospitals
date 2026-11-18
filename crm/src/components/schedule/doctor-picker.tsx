"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type Doc = { id: string; name: string; specialization: string | null }

/** Searchable doctor selector; writes ?doctor= into the URL. */
export function DoctorPicker({ doctors, selectedId }: { doctors: Doc[]; selectedId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [q, setQ] = useState("")
  const list = useMemo(() => {
    const f = doctors.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || (d.specialization ?? "").toLowerCase().includes(q.toLowerCase()))
    const sel = doctors.find((d) => d.id === selectedId)
    return sel && !f.some((d) => d.id === sel.id) ? [sel, ...f] : f
  }, [doctors, q, selectedId])

  return (
    <div className="flex flex-col gap-2 sm:flex-row print:hidden">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search doctor..."
        aria-label="Search doctors"
        className="h-9 rounded-md border bg-background px-3 text-sm sm:w-44"
      />
      <select
        value={selectedId}
        aria-label="Doctor"
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString())
          p.set("doctor", e.target.value)
          router.push(`${pathname}?${p.toString()}`)
        }}
        className="h-9 rounded-md border bg-background px-3 text-sm sm:min-w-56"
      >
        {list.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
            {d.specialization ? ` — ${d.specialization}` : ""}
          </option>
        ))}
      </select>
    </div>
  )
}
