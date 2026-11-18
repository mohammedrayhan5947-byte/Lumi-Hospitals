"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { build, PDF_KINDS } from "@/lib/pdf/build"
import { storePdf } from "@/lib/pdf/store"
import type { PdfKind } from "@/lib/pdf/documents"
import { patientDisplayName } from "@/lib/format"

const PAGE_SIZE = 50

export interface DocumentFilters {
  kind?: string
  q?: string
  from?: string
  to?: string
  page?: number
}

/** Admin only: every PDF stored in the database, with filters and totals. */
export async function listStoredPdfs(filters: DocumentFilters = {}) {
  await requireRole("ADMIN")
  const kind = PDF_KINDS.includes(filters.kind as PdfKind) ? filters.kind : undefined
  const q = filters.q?.trim()
  const from = filters.from ? new Date(filters.from) : undefined
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`) : undefined
  const where = {
    ...(kind ? { kind } : {}),
    ...(from || to ? { updatedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { patient: { firstName: { contains: q, mode: "insensitive" as const } } },
            { patient: { lastName: { contains: q, mode: "insensitive" as const } } },
            { patient: { uhid: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  }
  const page = Math.max(1, Number(filters.page) || 1)
  const [rows, total, agg, byKind] = await Promise.all([
    prisma.storedPdf.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, kind: true, entityId: true, title: true, sizeBytes: true, updatedAt: true, patientId: true, patient: { select: { firstName: true, lastName: true, uhid: true } } },
    }),
    prisma.storedPdf.count({ where }),
    prisma.storedPdf.aggregate({ where, _sum: { sizeBytes: true }, _max: { sizeBytes: true } }),
    prisma.storedPdf.groupBy({ by: ["kind"], _count: true }),
  ])
  return {
    rows: rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      entityId: r.entityId,
      title: r.title,
      sizeBytes: r.sizeBytes,
      updatedAt: r.updatedAt,
      patientId: r.patientId,
      patientName: patientDisplayName(r.patient),
      uhid: r.patient.uhid,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalBytes: agg._sum.sizeBytes ?? 0,
    largestBytes: agg._max.sizeBytes ?? 0,
    counts: Object.fromEntries(byKind.map((k) => [k.kind, k._count])) as Record<string, number>,
  }
}

/** Admin only: (re)build every prescription, invoice, receipt, certificate, report and refund PDF into the database. */
export async function refreshAllStoredPdfs() {
  const user = await requireRole("ADMIN")
  const ids: Record<PdfKind, string[]> = {
    prescription: (await prisma.prescription.findMany({ select: { id: true } })).map((r) => r.id),
    bill: (await prisma.bill.findMany({ where: { status: { not: "CANCELLED" } }, select: { id: true } })).map((r) => r.id),
    receipt: (await prisma.payment.findMany({ where: { status: "SUCCESS" }, select: { id: true } })).map((r) => r.id),
    certificate: (await prisma.certificate.findMany({ select: { id: true } })).map((r) => r.id),
    report: (await prisma.clinicalReport.findMany({ select: { id: true } })).map((r) => r.id),
    refund: (await prisma.refund.findMany({ select: { id: true } })).map((r) => r.id),
  }
  let done = 0
  let failed = 0
  for (const kind of PDF_KINDS) {
    for (const id of ids[kind]) {
      try {
        const built = await build(kind, id)
        if (!built) continue
        await storePdf({ kind, id, patientId: built.patientId, bytes: built.result.bytes, title: built.title, fileName: built.filename, category: built.category, uploadedById: user.id })
        done++
      } catch {
        failed++
      }
    }
  }
  revalidatePath("/documents")
  return { done, failed }
}
