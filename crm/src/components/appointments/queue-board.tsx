"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TokenChip } from "@/components/appointments/token-chip"
import { PrintTokenButton } from "@/components/appointments/print-token"
import { formatToken } from "@/lib/tokens"
import { initials, patientDisplayName, formatRelative } from "@/lib/format"
import { appointmentTypeLabels } from "@/lib/labels"
import { startConsultation, completeConsultation, markNoShow, type getTodayQueue } from "@/actions/appointments"

type Queue = Awaited<ReturnType<typeof getTodayQueue>>
type Doctor = { id: string; name: string; specialization: string | null }

export function QueueBoard({ queue, doctors }: { queue: Queue; doctors: Doctor[] }) {
  const [doctorFilter, setDoctorFilter] = useState("ALL")

  const filtered = doctorFilter === "ALL" ? queue : queue.filter((q) => q.doctorId === doctorFilter)
  const grouped = new Map<string, Queue>()
  for (const entry of filtered) {
    const key = entry.doctorId
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(entry)
  }

  const serving = filtered.filter((q) => q.status === "IN_CONSULTATION")
  const waiting = filtered.filter((q) => q.status !== "IN_CONSULTATION")
  const nextUp = waiting[0]
  const multi = new Set(filtered.map((q) => q.doctorId)).size > 1
  const label = (q: Queue[number]) =>
    multi ? `${formatToken(q.tokenNumber)} · Dr. ${q.doctor.name.split(" ").slice(-1)[0]}` : formatToken(q.tokenNumber)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Now serving</p>
          <p className="mt-1 font-mono text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {serving.length ? serving.map(label).join(", ") : "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-amber-50 p-3 dark:bg-amber-950/30">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Next up</p>
          <p className="mt-1 font-mono text-xl font-bold text-amber-700 dark:text-amber-400">{nextUp ? label(nextUp) : "—"}</p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Waiting</p>
          <p className="mt-1 text-2xl font-bold">{waiting.length}</p>
        </div>
      </div>
      <Select
        items={{ ALL: "All doctors", ...Object.fromEntries(doctors.map((d) => [d.id, `Dr. ${d.name}`])) }}
        value={doctorFilter}
        onValueChange={(value) => setDoctorFilter(value ?? "ALL")}
      >
        <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All doctors</SelectItem>
          {doctors.map((d) => (
            <SelectItem key={d.id} value={d.id}>Dr. {d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {grouped.size === 0 && (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No one in the queue right now.</CardContent></Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {[...grouped.entries()].map(([doctorId, entries]) => (
          <Card key={doctorId}>
            <CardHeader>
              <CardTitle className="text-base">Dr. {entries[0].doctor.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.map((entry) => (
                <QueueRow key={entry.id} entry={entry} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function QueueRow({ entry }: { entry: Queue[number] }) {
  const [pending, startTransition] = useTransition()
  const isInProgress = entry.status === "IN_CONSULTATION"

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <TokenChip n={entry.tokenNumber} />
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-sm font-semibold">{initials(patientDisplayName(entry.patient))}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <Link href={`/patients/${entry.patientId}`} className="text-sm font-medium hover:underline truncate block">
          {patientDisplayName(entry.patient)}
        </Link>
        <p className="text-xs text-muted-foreground">
          {appointmentTypeLabels[entry.type]} · checked in {entry.checkedInAt ? formatRelative(entry.checkedInAt) : "just now"}
        </p>
      </div>
      <Badge variant={isInProgress ? "default" : "secondary"}>{isInProgress ? "In Progress" : "Waiting"}</Badge>
      <div className="flex flex-wrap gap-1 shrink-0">
        <PrintTokenButton token={entry.tokenNumber} patient={patientDisplayName(entry.patient)} doctor={entry.doctor.name} />
        {!isInProgress && (
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await startConsultation(entry.id)
                } catch {
                  toast.error("Could not start consultation")
                }
              })
            }
          >
            Start
          </Button>
        )}
        {isInProgress && (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/patients/${entry.patientId}/encounters/new?appointmentId=${entry.id}`}>Chart</Link>}
          />
        )}
        {isInProgress && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await completeConsultation(entry.id)
                } catch {
                  toast.error("Could not complete consultation")
                }
              })
            }
          >
            Complete
          </Button>
        )}
        {!isInProgress && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await markNoShow(entry.id)
                } catch {
                  toast.error("Could not update")
                }
              })
            }
          >
            No-show
          </Button>
        )}
      </div>
    </div>
  )
}
