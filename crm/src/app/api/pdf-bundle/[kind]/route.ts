import { NextResponse } from "next/server"
import { getCurrentUserOrNull } from "@/lib/auth"
import { BUNDLE_ALLOWED, bundleIds, isPdfKind, mergePdfs } from "@/lib/pdf/bundle"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// One PDF containing every document of a section (optionally filtered by patient, status, period).
export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const user = await getCurrentUserOrNull()
  if (!user) return new NextResponse("Unauthorized", { status: 401 })
  const { kind } = await params
  if (!isPdfKind(kind)) return new NextResponse("Not found", { status: 404 })
  if (!BUNDLE_ALLOWED[kind].includes(user.role)) return new NextResponse("Forbidden", { status: 403 })

  const q = new URL(req.url).searchParams
  const get = (k: string) => q.get(k) || undefined
  const ids = await bundleIds(kind, user.role, user.id, { patientId: get("patientId"), status: get("status"), range: get("range"), from: get("from"), to: get("to") })
  if (ids.length === 0) return new NextResponse("No documents to export", { status: 404 })
  const { bytes, count } = await mergePdfs(kind, ids)
  if (count === 0) return new NextResponse("Could not generate documents", { status: 500 })

  const name = `lumi-${kind}s-${new Date().toISOString().slice(0, 10)}.pdf`
  const disp = q.get("download") === "1" ? "attachment" : "inline"
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.length),
      "Content-Disposition": `${disp}; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
