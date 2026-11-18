import "server-only"
import { PDFDocument } from "pdf-lib"
import { prisma } from "@/lib/prisma"
import { build, PDF_KINDS } from "@/lib/pdf/build"
import type { PdfKind } from "@/lib/pdf/documents"
import type { StaffRole } from "@/generated/prisma/client"

export const BUNDLE_ALLOWED: Record<PdfKind, StaffRole[]> = {
  prescription: ["ADMIN", "DOCTOR"],
  certificate: ["ADMIN", "DOCTOR"],
  report: ["ADMIN", "DOCTOR"],
  bill: ["ADMIN", "BILLING", "RECEPTIONIST"],
  receipt: ["ADMIN", "BILLING", "RECEPTIONIST"],
  refund: ["ADMIN", "BILLING"],
}

export const BUNDLE_MAX = 300
export const isPdfKind = (k: string): k is PdfKind => PDF_KINDS.includes(k as PdfKind)

export interface BundleOpts {
  patientId?: string
  status?: string
  range?: string // today | week | month | all
  from?: string
  to?: string
}

function dateWindow(o: BundleOpts) {
  const now = new Date()
  let from: Date | undefined
  let to: Date | undefined
  if (o.range === "today") from = new Date(new Date(now).setHours(0, 0, 0, 0))
  else if (o.range === "week") from = new Date(now.getTime() - 7 * 86400000)
  else if (o.range === "month") from = new Date(now.getFullYear(), now.getMonth(), 1)
  if (o.from) from = new Date(o.from)
  if (o.to) to = new Date(`${o.to}T23:59:59.999`)
  if (from && isNaN(+from)) from = undefined
  if (to && isNaN(+to)) to = undefined
  return from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } : undefined
}

/** Ids of every document of this kind the caller may see, newest first. Doctors only get their own. */
export async function bundleIds(kind: PdfKind, role: StaffRole, userId: string, o: BundleOpts) {
  const win = dateWindow(o)
  const pat = o.patientId ? { patientId: o.patientId } : {}
  const doc = role === "DOCTOR" ? { doctorId: userId } : {}
  const take = BUNDLE_MAX
  const pick = (rows: { id: string }[]) => rows.map((r) => r.id)
  switch (kind) {
    case "prescription":
      return pick(await prisma.prescription.findMany({ where: { ...pat, ...doc, ...(win ? { issuedAt: win } : {}) }, select: { id: true }, orderBy: { issuedAt: "desc" }, take }))
    case "bill":
      return pick(await prisma.bill.findMany({ where: { ...pat, ...(o.status ? { status: o.status as never } : { status: { not: "CANCELLED" } }), ...(win ? { issuedAt: win } : {}) }, select: { id: true }, orderBy: { issuedAt: "desc" }, take }))
    case "receipt":
      return pick(await prisma.payment.findMany({ where: { ...pat, status: "SUCCESS", ...(win ? { paidAt: win } : {}) }, select: { id: true }, orderBy: { paidAt: "desc" }, take }))
    case "certificate":
      return pick(await prisma.certificate.findMany({ where: { ...pat, ...doc, ...(win ? { createdAt: win } : {}) }, select: { id: true }, orderBy: { createdAt: "desc" }, take }))
    case "report":
      return pick(await prisma.clinicalReport.findMany({ where: { ...pat, ...doc, ...(win ? { createdAt: win } : {}) }, select: { id: true }, orderBy: { createdAt: "desc" }, take }))
    case "refund":
      return pick(await prisma.refund.findMany({ where: { ...pat, ...(win ? { requestedAt: win } : {}) }, select: { id: true }, orderBy: { requestedAt: "desc" }, take }))
  }
}

/** Merges the letterhead PDFs of all ids into one document (one section = one file). */
export async function mergePdfs(kind: PdfKind, ids: string[]) {
  const out = await PDFDocument.create()
  let n = 0
  for (const id of ids) {
    const built = await build(kind, id).catch(() => null)
    if (!built) continue
    const src = await PDFDocument.load(built.result.bytes)
    for (const page of await out.copyPages(src, src.getPageIndices())) out.addPage(page)
    n++
  }
  const bytes = await out.save({ useObjectStreams: true })
  return { bytes, count: n }
}
