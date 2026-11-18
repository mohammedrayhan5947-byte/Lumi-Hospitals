import "server-only"
import { prisma } from "@/lib/prisma"
import type { PdfKind } from "./documents"

export const pdfRoute = (kind: PdfKind, id: string) => `/api/pdf/${kind}/${id}`

export interface StoreInput {
  kind: PdfKind
  id: string
  patientId: string
  bytes: Uint8Array
  title: string
  fileName: string
  category: "PRESCRIPTION" | "LAB_REPORT" | "OTHER"
  uploadedById?: string | null
}

/**
 * Saves the PDF inside the database (StoredPdf.data, Postgres bytea) and keeps the patient's Document row
 * pointing at it. Idempotent: keyed by (kind, entityId), so regenerating replaces the stored bytes.
 */
export async function storePdf(input: StoreInput) {
  const fileUrl = pdfRoute(input.kind, input.id)
  const data = Buffer.from(input.bytes)
  await prisma.storedPdf.upsert({
    where: { kind_entityId: { kind: input.kind, entityId: input.id } },
    create: {
      kind: input.kind,
      entityId: input.id,
      patientId: input.patientId,
      title: input.title,
      fileName: input.fileName,
      sizeBytes: data.length,
      data,
      createdById: input.uploadedById ?? null,
    },
    update: { title: input.title, fileName: input.fileName, sizeBytes: data.length, data },
  })
  try {
    const existing = await prisma.document.findFirst({ where: { patientId: input.patientId, fileUrl }, select: { id: true } })
    if (existing) {
      await prisma.document.update({ where: { id: existing.id }, data: { title: input.title, category: input.category, fileType: "application/pdf", uploadedAt: new Date() } })
    } else {
      await prisma.document.create({
        data: { patientId: input.patientId, title: input.title, category: input.category, fileUrl, fileType: "application/pdf", uploadedById: input.uploadedById ?? null },
      })
    }
  } catch {
    console.warn("[pdf] could not record Document row")
  }
  return { where: "database" as const, fileUrl, size: data.length }
}
