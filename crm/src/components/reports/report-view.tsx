import { ArrowDown, ArrowUp, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { ExportCsvButton } from "./export-csv-button"
import { TrendChart, DonutChart, HBars, Heatmap } from "./charts"
import { ROW_CAP, type TabReport, type ReportTable } from "./types"

function Delta({ value, invert }: { value: number | null | undefined; invert?: boolean }) {
  if (value === null || value === undefined) return null
  const up = value >= 0
  const good = invert ? !up : up
  const Icon = up ? ArrowUp : ArrowDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${good ? "text-emerald-700" : "text-red-600"}`}>
      <Icon className="h-3 w-3" />{Math.abs(value).toFixed(0)}% <span className="font-normal text-muted-foreground">vs prev.</span>
    </span>
  )
}

function DataTable({ title, table, suffix }: { title: string; table: ReportTable; suffix: string }) {
  const money = new Set(table.currencyCols ?? [])
  const show = (v: string | number, i: number) => (money.has(i) && typeof v === "number" ? formatCurrency(v) : typeof v === "number" ? v.toLocaleString("en-IN") : v)
  const numeric = (v: string | number) => typeof v === "number"
  return (
    <Card className="break-inside-avoid-page">
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">
              {table.truncated ? `Showing first ${ROW_CAP} of ${table.totalRowCount} rows (CSV contains the same ${ROW_CAP}).` : `${table.rows.length} row${table.rows.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <ExportCsvButton table={table} suffix={suffix} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                {table.headers.map((h) => <th key={h} className="whitespace-nowrap px-2 py-2 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, ri) => (
                <tr key={ri} className="break-inside-avoid border-b last:border-0">
                  {r.map((v, i) => <td key={i} className={`px-2 py-1.5 ${numeric(v) ? "text-right tabular-nums" : ""}`}>{show(v, i)}</td>)}
                </tr>
              ))}
              {!table.rows.length && <tr><td colSpan={table.headers.length} className="px-2 py-6 text-center text-muted-foreground">No data for this selection.</td></tr>}
            </tbody>
            {table.totals && (
              <tfoot>
                <tr className="break-inside-avoid border-t-2 font-semibold">
                  {table.totals.map((v, i) => <td key={i} className={`px-2 py-2 ${numeric(v) ? "text-right tabular-nums" : ""}`}>{show(v, i)}</td>)}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportView({ report, suffix }: { report: TabReport; suffix: string }) {
  return (
    <div className="space-y-4">
      {report.insights.length > 0 && (
        <div className="break-inside-avoid rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-amber-600" />Insights</div>
          <ul className="list-disc space-y-0.5 pl-5 text-sm">
            {report.insights.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {report.kpis.map((k) => (
          <Card key={k.label} className="break-inside-avoid">
            <CardContent className="pt-5">
              <p className="text-xs uppercase text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{k.value}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2">
                <Delta value={k.change} invert={k.invert} />
                {k.hint && <span className="text-xs text-muted-foreground">{k.hint}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {report.trend && (
        <Card className="break-inside-avoid">
          <CardContent className="space-y-2 pt-6">
            <h3 className="font-semibold">{report.trend.title}</h3>
            <TrendChart points={report.trend.points} money={report.trend.money} hasPrev={report.trend.hasPrev} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {report.breakdowns.map((b) => (
          <Card key={b.title} className="break-inside-avoid">
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-semibold">{b.title}</h3>
              {b.kind === "donut" ? <DonutChart data={b.data} money={b.money} /> : <HBars data={b.data} money={b.money} />}
            </CardContent>
          </Card>
        ))}
      </div>

      {report.heatmap && (
        <Card className="break-inside-avoid">
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">{report.heatmap.title}</h3>
            <Heatmap rows={report.heatmap.rows} cols={report.heatmap.cols} values={report.heatmap.values} />
          </CardContent>
        </Card>
      )}

      <DataTable title={report.tableTitle} table={report.table} suffix={suffix} />
      {report.secondaryTable && <DataTable title={report.secondaryTable.title} table={report.secondaryTable} suffix={suffix} />}
    </div>
  )
}
