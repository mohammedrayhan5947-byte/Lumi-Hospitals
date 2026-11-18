// Run: npx tsx scripts/pdf-check.ts [outDir]
// Builds every document type with realistic sample data, checks sizes and exercises ensureUnder().
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { PDFDocument } from "pdf-lib"
import { generatePdf, groupIndian, amountInWords, type PatientInfo } from "../src/lib/pdf/documents"
import { ensureUnder } from "../src/lib/pdf/compress"

const out = process.argv[2] || path.join(process.cwd(), "storage", "pdf-check")
mkdirSync(out, { recursive: true })

const assert = (c: unknown, m: string) => {
  if (!c) throw new Error("FAIL: " + m)
}

const patient: PatientInfo = { name: "Anitha Krishnamurthy", uhid: "LUMI-000123", age: 42, gender: "FEMALE", phone: "+91 98450 12345", address: "12, 4th Cross, Jaraganahalli, Bengaluru" }
const doctor = { name: "Dr. Rayhan Mohammed", specialization: "General Medicine" }

async function signaturePng(w: number, h: number) {
  // noisy scribble-ish transparent PNG, intentionally big, to exercise compression
  const raw = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const x = i % w
    const y = Math.floor(i / w)
    const on = Math.abs(Math.sin(x / 40) * 60 + h / 2 - y) < 4 + (x % 17) / 6
    raw[i * 4] = 10
    raw[i * 4 + 1] = 20 + (x % 50)
    raw[i * 4 + 2] = 120
    raw[i * 4 + 3] = on ? 255 : 0
  }
  return new Uint8Array(await sharp(raw, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer())
}

async function main() {
  assert(groupIndian(1234567.5) === "12,34,567.50", "indian grouping")
  assert(groupIndian(999) === "999.00", "grouping small")
  assert(amountInWords(1250) === "One Thousand Two Hundred Fifty Rupees Only", "words")

  const sig = await signaturePng(1600, 600)
  const meds = Array.from({ length: 8 }, (_, i) => ({
    medicineName: ["Tab. Paracetamol 650mg", "Cap. Omeprazole 20mg", "Syp. Cetirizine 5ml", "Tab. Azithromycin 500mg", "Tab. Metformin 500mg", "Tab. Atorvastatin 10mg", "Cap. Vitamin D3 60000 IU", "Tab. Pantoprazole 40mg"][i],
    dosage: "1 tablet",
    frequency: "1-0-1",
    duration: `${3 + i} days`,
    instructions: "After food with a full glass of water; avoid on an empty stomach",
  }))
  const lines = Array.from({ length: 12 }, (_, i) => ({
    description: ["Consultation - General Medicine", "CBC", "Lipid profile", "Chest X-ray PA view", "ECG", "Nebulisation", "Injection charges", "Dressing", "Blood sugar fasting", "Urine routine", "Ultrasound abdomen", "Room charges (per day)"][i],
    quantity: 1 + (i % 3),
    unitPrice: 350 + i * 175.5,
    taxRatePercent: i % 4 === 0 ? 5 : 0,
    taxAmount: i % 4 === 0 ? 20 : 0,
    amount: (350 + i * 175.5) * (1 + (i % 3)),
  }))
  const net = lines.reduce((s, l) => s + l.amount + l.taxAmount, 0)
  const results: Record<string, number> = {}
  const save = async (name: string, p: Promise<{ bytes: Uint8Array; size: number; ok: boolean; level: number; steps: string[] }>) => {
    const r = await p
    writeFileSync(path.join(out, name + ".pdf"), r.bytes)
    const doc = await PDFDocument.load(r.bytes)
    results[name] = r.size
    console.log(`${name.padEnd(22)} ${String(r.size).padStart(7)} B  pages=${doc.getPageCount()}  ok=${r.ok}  level=${r.level}`)
    assert(r.ok && r.size < 200 * 1024, name + " under budget")
  }

  await save("prescription", generatePdf("prescription", { issuedAt: new Date(), patient, doctor, diagnosis: "Acute viral fever with upper respiratory tract infection", notes: "Plenty of oral fluids and rest.\nReview if fever persists beyond 3 days.", followUp: "After 5 days", items: meds, signature: sig }))
  await save("bill", generatePdf("bill", { billNumber: "INV-2026-000451", issuedAt: new Date(), status: "PARTIALLY_PAID", patient, service: "General Consultation", insurance: "Star Health - SH123456", items: lines, totalAmount: net - 80, discountAmount: 200, taxAmount: 80, netAmount: net - 200, amountPaid: 5000, balanceDue: net - 5200, payments: [{ receiptNumber: "RCT-0001", method: "UPI", amount: 3000, referenceNumber: "UPI4829384928", paidAt: new Date() }, { receiptNumber: "RCT-0002", method: "CASH", amount: 2000, paidAt: new Date() }] }))
  await save("bill-long", generatePdf("bill", { billNumber: "INV-2026-000452", issuedAt: new Date(), status: "PAID", patient, items: Array.from({ length: 60 }, (_, i) => ({ ...lines[i % 12], description: lines[i % 12].description + " " + i })), totalAmount: 1e6, discountAmount: 0, taxAmount: 0, netAmount: 1e6, amountPaid: 1e6, balanceDue: 0, payments: [] }))
  await save("receipt", generatePdf("receipt", { receiptNumber: "RCT-0001", paidAt: new Date(), patient, billNumber: "INV-2026-000451", method: "UPI", referenceNumber: "UPI4829384928", receivedBy: "Front desk", amount: 3000, billNet: 9800, billBalance: 4800 }))
  await save("certificate", generatePdf("certificate", { title: "Medical Fitness to Resume Work", type: "FITNESS", content: "This is to certify that the above-named patient was examined by me and is found medically fit to resume duties with effect from the date mentioned.\n\nNo restrictions are advised.", validFrom: new Date(), validTo: new Date(Date.now() + 7 * 864e5), issuedAt: new Date(), signedAt: new Date(), patient, doctor, signature: sig }))
  await save("report", generatePdf("report", { title: "Complete Blood Count", type: "LAB", findings: "Mild leucocytosis noted.", impression: "Suggestive of a bacterial infection; clinical correlation advised.", status: "COMPLETED", reportDate: new Date(), patient, doctor, signature: sig, labResults: Array.from({ length: 14 }, (_, i) => ({ testName: ["Haemoglobin", "RBC", "WBC", "Platelets", "Hematocrit", "MCV", "MCH", "MCHC", "Neutrophils", "Lymphocytes", "Eosinophils", "Monocytes", "Basophils", "ESR"][i], value: String(10 + i * 1.3), unit: "g/dL", referenceRange: "12.0 - 15.5", flag: i === 2 ? "HIGH" : i === 5 ? "LOW" : "NORMAL" })) }))
  await save("refund", generatePdf("refund", { requestedAt: new Date(), patient, billNumber: "INV-2026-000451", amount: 1500, method: "UPI", reason: "Duplicate charge for chest X-ray", status: "COMPLETED", processedAt: new Date(), processedBy: "Admin" }))

  // ensureUnder: tiny budget forces every ladder step down to dropping images
  const first = (await generatePdf("prescription", { issuedAt: new Date(), patient, doctor, items: meds, signature: sig })).bytes
  const forced = await ensureUnder(first, 1, async (level) => {
    const r = await generatePdf("prescription", { issuedAt: new Date(), patient, doctor, items: meds, signature: level >= 4 ? null : sig })
    return r.bytes
  })
  console.log("ensureUnder(1 byte budget) steps:", forced.steps.join(" | "), "ok=", forced.ok)
  assert(forced.steps.length === 5, "all ladder levels tried")
  const noRebuild = await ensureUnder(new Uint8Array(10), 5)
  assert(!noRebuild.ok, "reports not ok without rebuild")
  const fine = await ensureUnder(new Uint8Array(10), 100)
  assert(fine.ok && fine.steps.length === 0, "passes through when small")
  console.log("pdf-check OK ->", out)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
