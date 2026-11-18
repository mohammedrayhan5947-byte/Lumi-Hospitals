"use client"

import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatToken } from "@/lib/tokens"

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c])

/** Opens a small printable token slip (thermal-printer friendly) for the patient to carry. */
export function PrintTokenButton({
  token,
  patient,
  doctor,
  hospital = "Lumi Hospital",
  size = "sm",
}: {
  token: number | null
  patient: string
  doctor: string
  hospital?: string
  size?: "sm" | "default"
}) {
  function print() {
    const w = window.open("", "_blank", "width=380,height=520")
    if (!w) return
    const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    const closeScript = "<" + "script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}</" + "script>"
    w.document.write(
      `<!doctype html><title>Token ${formatToken(token)}</title>` +
        `<style>body{font-family:system-ui,sans-serif;text-align:center;padding:18px;color:#111}` +
        `h1{font-size:18px;margin:0 0 2px}.s{font-size:12px;color:#555}` +
        `.t{font-size:72px;font-weight:800;margin:14px 0 6px;letter-spacing:2px}` +
        `.r{font-size:14px;margin:4px 0}hr{border:0;border-top:1px dashed #999;margin:12px 0}</style>` +
        `<h1>${esc(hospital)}</h1><div class="s">Queue token</div><div class="t">${formatToken(token)}</div><hr>` +
        `<div class="r"><b>${esc(patient)}</b></div><div class="r">Dr. ${esc(doctor)}</div><div class="s">${now}</div><hr>` +
        `<div class="s">Please wait for your token to be called.</div>` +
        closeScript
    )
    w.document.close()
  }
  return (
    <Button type="button" size={size} variant="outline" className="gap-1.5 print:hidden" onClick={print}>
      <Printer className="h-3.5 w-3.5" />
      Token
    </Button>
  )
}
