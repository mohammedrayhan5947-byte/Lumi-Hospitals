import "server-only"
import { differenceInYears } from "date-fns"
import { prisma } from "@/lib/prisma"
import { generatePdf, type PatientInfo, type PdfKind } from "@/lib/pdf/documents"
import { loadImageBytes } from "@/lib/pdf/compress"

export const PDF_KINDS: PdfKind[] = ["prescription", "bill", "receipt", "certificate", "report", "refund"]

type PatientRow = {
  firstName: string
  lastName: string | null
  uhid: string
  dob: Date | null
  gender: string | null
  phone: string
  addressLine1: string | null
  city: string | null
  state: string | null
}
const patientInfo = (p: PatientRow): PatientInfo => ({
  name: [p.firstName, p.lastName].filter(Boolean).join(" "),
  uhid: p.uhid,
  age: p.dob ? differenceInYears(new Date(), p.dob) : null,
  gender: p.gender,
  phone: p.phone,
  address: [p.addressLine1, p.city, p.state].filter(Boolean).join(", ") || null,
})

async function signatureFor(doctorId: string | null | undefined) {
  if (!doctorId) return null
  const sig = await prisma.digitalSignature.findUnique({ where: { doctorId }, select: { signatureUrl: true } })
  return loadImageBytes(sig?.signatureUrl)
}

const n = (v: unknown) => Number(v ?? 0)

export interface Built {
  patientId: string
  doctorId: string | null
  filename: string
  title: string
  category: "PRESCRIPTION" | "LAB_REPORT" | "OTHER"
  result: Awaited<ReturnType<typeof generatePdf>>
}

export async function build(kind: PdfKind, id: string): Promise<Built | null> {
  switch (kind) {
    case "prescription": {
      const rx = await prisma.prescription.findUnique({ where: { id }, include: { patient: true, doctor: true, items: true } })
      if (!rx) return null
      const result = await generatePdf("prescription", {
        id: rx.id,
        issuedAt: rx.issuedAt,
        patient: patientInfo(rx.patient),
        doctor: { name: rx.doctor.name, specialization: rx.doctor.specialization },
        diagnosis: rx.diagnosis,
        notes: rx.notes,
        items: rx.items,
        signature: await signatureFor(rx.doctorId),
      })
      return { patientId: rx.patientId, doctorId: rx.doctorId, filename: `Prescription-${rx.patient.uhid}`, title: `Prescription - ${rx.issuedAt.toISOString().slice(0, 10)}`, category: "PRESCRIPTION", result }
    }
    case "bill": {
      const b = await prisma.bill.findUnique({ where: { id }, include: { patient: true, items: true, payments: { orderBy: { paidAt: "asc" } }, insurance: true, service: true } })
      if (!b) return null
      const result = await generatePdf("bill", {
        billNumber: b.billNumber,
        issuedAt: b.issuedAt,
        status: b.status,
        patient: patientInfo(b.patient),
        service: b.service?.name,
        insurance: b.insurance ? `${b.insurance.provider} - ${b.insurance.policyNumber}` : null,
        items: b.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: n(i.unitPrice), taxRatePercent: n(i.taxRatePercent), taxAmount: n(i.taxAmount), amount: n(i.amount) })),
        totalAmount: n(b.totalAmount),
        discountAmount: n(b.discountAmount),
        taxAmount: n(b.taxAmount),
        netAmount: n(b.netAmount),
        amountPaid: n(b.amountPaid),
        balanceDue: n(b.balanceDue),
        payments: b.payments.filter((p) => p.status === "SUCCESS").map((p) => ({ receiptNumber: p.receiptNumber, method: p.method, amount: n(p.amount), referenceNumber: p.referenceNumber, paidAt: p.paidAt })),
      })
      return { patientId: b.patientId, doctorId: null, filename: `Invoice-${b.billNumber}`, title: `Invoice ${b.billNumber}`, category: "OTHER", result }
    }
    case "receipt": {
      const p = await prisma.payment.findUnique({ where: { id }, include: { patient: true, bill: true, receivedBy: true } })
      if (!p) return null
      const result = await generatePdf("receipt", {
        receiptNumber: p.receiptNumber,
        paidAt: p.paidAt,
        patient: patientInfo(p.patient),
        billNumber: p.bill?.billNumber,
        method: p.method,
        referenceNumber: p.referenceNumber,
        receivedBy: p.receivedBy?.name,
        amount: n(p.amount),
        billNet: p.bill ? n(p.bill.netAmount) : null,
        billBalance: p.bill ? n(p.bill.balanceDue) : null,
      })
      return { patientId: p.patientId, doctorId: null, filename: `Receipt-${p.receiptNumber}`, title: `Receipt ${p.receiptNumber}`, category: "OTHER", result }
    }
    case "certificate": {
      const c = await prisma.certificate.findUnique({ where: { id }, include: { patient: true, doctor: true } })
      if (!c) return null
      const result = await generatePdf("certificate", {
        title: c.title,
        type: c.type,
        content: c.content,
        validFrom: c.validFrom,
        validTo: c.validTo,
        issuedAt: c.createdAt,
        signedAt: c.signedAt,
        patient: patientInfo(c.patient),
        doctor: { name: c.doctor.name, specialization: c.doctor.specialization },
        signature: c.signedAt ? await signatureFor(c.doctorId) : null,
      })
      return { patientId: c.patientId, doctorId: c.doctorId, filename: `Certificate-${c.patient.uhid}`, title: `Certificate - ${c.title}`, category: "OTHER", result }
    }
    case "report": {
      const r = await prisma.clinicalReport.findUnique({ where: { id }, include: { patient: true, doctor: true, labResults: true } })
      if (!r) return null
      const result = await generatePdf("report", {
        title: r.title,
        type: r.type,
        modality: r.modality,
        findings: r.findings,
        impression: r.impression,
        status: r.status,
        reportDate: r.reportDate,
        patient: patientInfo(r.patient),
        doctor: r.doctor ? { name: r.doctor.name, specialization: r.doctor.specialization } : null,
        labResults: r.labResults,
        signature: await signatureFor(r.doctorId),
      })
      return { patientId: r.patientId, doctorId: r.doctorId, filename: `Report-${r.patient.uhid}`, title: `Report - ${r.title}`, category: r.type === "LAB" ? "LAB_REPORT" : "OTHER", result }
    }
    case "refund": {
      const f = await prisma.refund.findUnique({ where: { id }, include: { patient: true, bill: true, processedBy: true } })
      if (!f) return null
      const result = await generatePdf("refund", {
        id: f.id,
        requestedAt: f.requestedAt,
        processedAt: f.processedAt,
        patient: patientInfo(f.patient),
        billNumber: f.bill?.billNumber,
        amount: n(f.amount),
        method: f.method,
        reason: f.reason,
        status: f.status,
        processedBy: f.processedBy?.name,
      })
      return { patientId: f.patientId, doctorId: null, filename: `Refund-${f.patient.uhid}`, title: `Refund note - ${f.requestedAt.toISOString().slice(0, 10)}`, category: "OTHER", result }
    }
  }
}

