import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TokenChip } from "@/components/appointments/token-chip"
import { PrintTokenButton } from "@/components/appointments/print-token"
import { formatTime } from "@/lib/format"
import { appointmentStatusColors, appointmentStatusLabels, appointmentTypeLabels } from "@/lib/labels"
import type { getTodayTokens } from "@/actions/appointments"

/** The day's full token register (walk-ins and scheduled visits) so numbering mix-ups are easy to spot. */
export function TokenRegister({
  tokens,
  title = "Today's token register",
}: {
  tokens: Awaited<ReturnType<typeof getTodayTokens>>
  title?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-muted-foreground">
          {tokens.length} token{tokens.length === 1 ? "" : "s"} today, numbered per doctor
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                {["Token", "Patient", "Doctor", "Type", "Time", "Status", ""].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {tokens.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No tokens issued yet today.</td>
                </tr>
              )}
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5"><TokenChip n={t.tokenNumber} /></td>
                  <td className="px-4 py-2.5">
                    <Link href={`/patients/${t.patientId}`} className="font-medium hover:underline">{t.patientName}</Link>
                    <span className="block font-mono text-xs text-muted-foreground">{t.uhid}</span>
                  </td>
                  <td className="px-4 py-2.5">Dr. {t.doctorName}</td>
                  <td className="px-4 py-2.5 text-xs">{appointmentTypeLabels[t.type]}</td>
                  <td className="px-4 py-2.5 tabular-nums">{formatTime(t.scheduledAt)}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary" className={appointmentStatusColors[t.status]}>{appointmentStatusLabels[t.status]}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <PrintTokenButton token={t.tokenNumber} patient={t.patientName} doctor={t.doctorName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
