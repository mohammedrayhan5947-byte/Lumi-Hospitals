"use client"

import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getPatients } from "@/actions/patients"
import { patientDisplayName } from "@/lib/format"

type PatientOption = { id: string; name: string; uhid: string; phone: string }

export function PatientPicker({
  value,
  onChange,
  initial,
}: {
  value: string
  onChange: (patientId: string) => void
  initial?: PatientOption | null
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PatientOption[]>([])
  const [selected, setSelected] = useState<PatientOption | null>(initial ?? null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Loads recent patients when the box is focused empty, and live matches while typing.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { patients } = await getPatients({ query: query.trim(), pageSize: 8 })
        if (cancelled) return
        setResults(patients.map((p) => ({ id: p.id, name: patientDisplayName(p), uhid: p.uhid, phone: p.phone })))
        setActive(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, query.trim() ? 200 : 0)
    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, open])

  const choose = (p: PatientOption) => {
    setSelected(p)
    onChange(p.id)
    setOpen(false)
    setQuery("")
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p className="text-sm font-medium">{selected.name}</p>
          <p className="text-xs text-muted-foreground">{selected.uhid} · {selected.phone}</p>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            setSelected(null)
            onChange("")
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <input type="hidden" value={value} readOnly />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search patient by name, UHID, or phone…"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
            else if (e.key === "Enter" && open && results[active]) { e.preventDefault(); choose(results[active]) }
            else if (e.key === "Escape") setOpen(false)
          }}
        />
      </div>
      {open && (
        <div className="mt-1 max-h-64 overflow-y-auto rounded-md border bg-popover shadow-sm">
          <p className="border-b px-3 py-1.5 text-xs text-muted-foreground">{query.trim() ? "Matching patients" : "Recent patients"}</p>
          {loading && results.length === 0 && <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>}
          {!loading && results.length === 0 && <p className="px-3 py-3 text-sm text-muted-foreground">No patients found.</p>}
          {results.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted ${i === active ? "bg-muted" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(p)}
            >
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.uhid} · {p.phone}</span>
            </button>
          ))}
          <button type="button" className="w-full border-t px-3 py-1.5 text-right text-xs text-muted-foreground hover:bg-muted" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </div>
  )
}
