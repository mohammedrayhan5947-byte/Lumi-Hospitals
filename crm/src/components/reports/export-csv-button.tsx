"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReportTable } from "./types"

function cell(v: string | number) {
  const s = String(v ?? "")
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function ExportCsvButton({ table, suffix }: { table: ReportTable; suffix: string }) {
  function download() {
    const lines = [table.headers, ...table.rows, ...(table.totals ? [table.totals] : [])].map((r) => r.map(cell).join(","))
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${table.filename}-${suffix}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={download}>
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
