import { NextResponse } from "next/server"
import { getCurrentUserOrNull } from "@/lib/auth"
import { supabase, STORAGE_BUCKET } from "@/lib/supabase"

// Patient documents live in a private bucket. Staff get a short-lived signed URL.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await getCurrentUserOrNull())) return new NextResponse("Unauthorized", { status: 401 })
  if (!supabase) return new NextResponse("Storage not configured", { status: 503 })
  const { name } = await params
  if (!/^[\w-]{12}(\.\w+)?$/.test(name)) return new NextResponse("Not found", { status: 404 })
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(name, 60)
  if (error || !data) return new NextResponse("Not found", { status: 404 })
  return NextResponse.redirect(data.signedUrl, 302)
}
