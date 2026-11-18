import { NextResponse } from "next/server"
import { getCurrentUserOrNull } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { PdfKind } from "@/lib/pdf/documents"
import { build, PDF_KINDS } from "@/lib/pdf/build"
import { storePdf } from "@/lib/pdf/store"
import type { StaffRole } from "@/generated/prisma/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Who may fetch which document. ADMIN can open everything. Others only what their job needs;
// doctors only the clinical documents they authored. Signed-out callers never get anything.
const ALLOWED: Record<PdfKind, StaffRole[]> = {
  prescription: ["ADMIN", "DOCTOR"],
  certificate: ["ADMIN", "DOCTOR"],
  report: ["ADMIN", "DOCTOR"],
  bill: ["ADMIN", "BILLING", "RECEPTIONIST"],
  receipt: ["ADMIN", "BILLING", "RECEPTIONIST"],
  refund: ["ADMIN", "BILLING"],
}
const ID_RE = /^[A-Za-z0-9_-]{6,40}$/

export async function GET(req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const user = await getCurrentUserOrNull()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })

  const { kind, id } = await params
  if (!PDF_KINDS.includes(kind as PdfKind) || !ID_RE.test(id)) return new NextResponse("Not found", { status: 404 })
  if (!ALLOWED[kind as PdfKind].includes(user.role)) return new NextResponse("Forbidden", { status: 403 })

  const url = new URL(req.url)
  const download = url.searchParams.get("download") === "1"
  const asAttachment = (name: string) => `${download ? "attachment" : "inline"}; filename="${name.replace(/[^A-Za-z0-9._-]+/g, "_")}.pdf"`
  const send = (bytes: Uint8Array, name: string) =>
    new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(bytes.length),
        "Content-Disposition": asAttachment(name),
        "Cache-Control": "private, no-store",
      },
    })

  // Admin Documents page: serve the exact copy stored in the database.
  if (url.searchParams.get("stored") === "1") {
    if (user.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 })
    const row = await prisma.storedPdf.findUnique({ where: { kind_entityId: { kind, entityId: id } } })
    if (!row) return new NextResponse("Not found", { status: 404 })
    return send(row.data, row.fileName)
  }

  let built
  try {
    built = await build(kind as PdfKind, id)
  } catch {
    return new NextResponse("Could not generate document", { status: 500 })
  }
  if (!built) return new NextResponse("Not found", { status: 404 })
  if (user.role === "DOCTOR" && built.doctorId !== user.id) return new NextResponse("Forbidden", { status: 403 })

  const { bytes } = built.result
  await storePdf({ kind: kind as PdfKind, id, patientId: built.patientId, bytes, title: built.title, fileName: built.filename, category: built.category, uploadedById: user.id })
  return send(bytes, built.filename)
}
