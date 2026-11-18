"use client"

import { SectionPdfActions } from "@/components/shared/pdf-row-actions"
import { PdfActions } from "@/components/shared/pdf-actions"
import { Pill, Stethoscope, Clock, Calendar, User, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatDate } from "@/lib/format"
import type { getPatientPrescriptions } from "@/actions/patients"

type Prescriptions = Awaited<ReturnType<typeof getPatientPrescriptions>>

export function PrescriptionsTab({
  patientName,
  uhid,
  prescriptions,
}: {
  patientName: string
  uhid: string
  prescriptions: Prescriptions
}) {

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Prescription History</h2>
          <p className="text-sm text-muted-foreground">
            All medications and prescriptions written across consultations ({prescriptions.length} total).
          </p>
        </div>
        {prescriptions.length > 0 && <SectionPdfActions kind="prescription" label="all" filters={{ patientId: prescriptions[0].patientId }} />}
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No prescriptions recorded for this patient yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id} className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                      <Pill className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold">
                          Dr. {prescription.doctor?.name || "Consultant"}
                        </CardTitle>
                        {prescription.doctor?.specialization && (
                          <Badge variant="outline" className="text-xs">
                            {prescription.doctor.specialization}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateTime(prescription.issuedAt || new Date())}
                        {prescription.encounter && (
                          <span className="text-primary font-medium">
                            · Linked to Consultation ({formatDate(prescription.encounter.encounterDate)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <PdfActions kind="prescription" id={prescription.id} className="self-start sm:self-auto" />
                </div>

                {prescription.diagnosis && (
                  <div className="mt-2 text-xs bg-background/80 rounded px-2.5 py-1.5 border inline-block">
                    <span className="font-semibold text-foreground">Diagnosis:</span>{" "}
                    <span className="text-muted-foreground">{prescription.diagnosis}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b">
                      <tr>
                        <th className="px-4 py-2.5">#</th>
                        <th className="px-4 py-2.5">Medicine Name</th>
                        <th className="px-4 py-2.5">Dosage</th>
                        <th className="px-4 py-2.5">Frequency</th>
                        <th className="px-4 py-2.5">Duration</th>
                        <th className="px-4 py-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {prescription.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-center text-xs text-muted-foreground">
                            No specific medication items listed.
                          </td>
                        </tr>
                      ) : (
                        prescription.items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-muted/20">
                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-medium text-foreground">{item.medicineName}</td>
                            <td className="px-4 py-2.5 text-xs">{item.dosage || "—"}</td>
                            <td className="px-4 py-2.5 text-xs">
                              <Badge variant="secondary" className="text-xs font-normal">
                                {item.frequency || "—"}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5 text-xs">{item.duration || "—"}</td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground">{item.instructions || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {prescription.notes && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground border">
                    <span className="font-semibold text-foreground">Clinical Advice & Notes:</span> {prescription.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
