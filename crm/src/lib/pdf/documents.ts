// Printable document builders (prescription, invoice, receipt, certificate, clinical report, refund note).
// Plain-data inputs (no Prisma types) so they can be unit-run with sample data.
import { format } from "date-fns"
import { rgb, type PDFImage, type PDFPage } from "pdf-lib"
import { LetterheadDoc, MARGIN_X, safe, wrapText, type BodyRect } from "./letterhead"
import { buildWithinBudget, prepareImage, type EnsureResult } from "./compress"

const NAVY = rgb(0x1f / 255, 0x3f / 255, 0x9e / 255)
const INK = rgb(0.11, 0.12, 0.15)
const MUTED = rgb(0.42, 0.44, 0.5)
const LINE = rgb(0.85, 0.86, 0.9)
const ZEBRA = rgb(0.955, 0.962, 0.98)
const HEAD_BG = rgb(0.9, 0.925, 0.98)
const BOX_BG = rgb(0.972, 0.976, 0.988)
const RED = rgb(0.75, 0.15, 0.18)
const GREEN = rgb(0.06, 0.45, 0.28)

// ── formatting ───────────────────────────────────────────────────────────

/** Indian digit grouping: 1,23,456.50 */
export function groupIndian(n: number, decimals = 2): string {
  const neg = n < 0
  const [int, frac] = Math.abs(n).toFixed(decimals).split(".")
  let head = int.slice(-3)
  let rest = int.slice(0, -3)
  while (rest.length > 2) {
    head = `${rest.slice(-2)},${head}`
    rest = rest.slice(0, -2)
  }
  if (rest) head = `${rest},${head}`
  return `${neg ? "-" : ""}${head}${frac ? `.${frac}` : ""}`
}
export const inr = (n: number | string | null | undefined) => `Rs. ${groupIndian(Number(n ?? 0))}`

const fmtDate = (d: Date | string | null | undefined) => (d ? format(new Date(d), "dd MMM yyyy") : "-")
const fmtDateTime = (d: Date | string | null | undefined) => (d ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-")

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
function below100(n: number) {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`
}
function below1000(n: number) {
  return `${n >= 100 ? ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " : "") : ""}${below100(n % 100)}`
}
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount))
  const paise = Math.round((Math.abs(amount) - rupees) * 100)
  if (rupees === 0 && paise === 0) return "Zero Rupees Only"
  const parts: string[] = []
  const crore = Math.floor(rupees / 10000000)
  const lakh = Math.floor((rupees / 100000) % 100)
  const thousand = Math.floor((rupees / 1000) % 100)
  const rest = rupees % 1000
  if (crore) parts.push(`${below1000(crore)} Crore`)
  if (lakh) parts.push(`${below100(lakh)} Lakh`)
  if (thousand) parts.push(`${below100(thousand)} Thousand`)
  if (rest) parts.push(below1000(rest))
  let out = `${parts.join(" ")} Rupees`
  if (paise) out += ` and ${below100(paise)} Paise`
  return `${out} Only`
}

// ── layout engine ────────────────────────────────────────────────────────

type Align = "left" | "right" | "center"
interface Col {
  header: string
  /** relative width */
  w: number
  align?: Align
}
type Cell = string | { text: string; bold?: boolean; color?: ReturnType<typeof rgb> }

class Flow {
  page!: PDFPage
  body!: BodyRect
  y = 0
  constructor(readonly doc: LetterheadDoc) {
    this.newPage()
  }
  get f() {
    return this.doc.fonts
  }
  newPage() {
    const p = this.doc.addPage()
    this.page = p.page
    this.body = p.body
    this.y = p.body.top
  }
  ensure(h: number, onBreak?: () => void) {
    if (this.y - h < this.body.y) {
      this.newPage()
      onBreak?.()
    }
  }
  space(h: number) {
    this.y -= h
  }
  private textAt(s: string, x: number, y: number, size: number, bold = false, color = INK, align: Align = "left", width = 0) {
    const font = bold ? this.f.bold : this.f.regular
    const w = font.widthOfTextAtSize(s, size)
    const dx = align === "right" ? width - w : align === "center" ? (width - w) / 2 : 0
    this.page.drawText(s, { x: x + dx, y, size, font, color })
  }

  title(title: string, right: string[]) {
    this.textAt(safe(title), this.body.x, this.y - 14, 15, true, NAVY)
    right.forEach((r, i) => this.textAt(safe(r), this.body.x, this.y - 12 - i * 11, i === 0 ? 9.5 : 8.5, i === 0, i === 0 ? INK : MUTED, "right", this.body.width))
    this.y -= Math.max(24, 8 + right.length * 11)
  }

  heading(text: string) {
    this.ensure(30)
    this.y -= 6
    this.textAt(safe(text).toUpperCase(), this.body.x, this.y - 9, 8.5, true, NAVY)
    this.page.drawLine({ start: { x: this.body.x, y: this.y - 13 }, end: { x: this.body.x + this.body.width, y: this.y - 13 }, thickness: 0.6, color: LINE })
    this.y -= 20
  }

  /** Two-column label/value box. */
  infoBox(pairs: Array<[string, string | null | undefined]>) {
    const rows = pairs.filter(([, v]) => v)
    const colW = this.body.width / 2 - 14
    const half = Math.ceil(rows.length / 2)
    const cols = [rows.slice(0, half), rows.slice(half)]
    const cellLines = (v: string) => wrapText(v, this.f.regular, 9, colW - 62)
    const heightOf = (col: Array<[string, string | null | undefined]>) =>
      col.reduce((h, [, v]) => h + Math.max(1, cellLines(v!).length) * 11.5 + 2, 0)
    const h = Math.max(heightOf(cols[0]), heightOf(cols[1])) + 14
    this.ensure(h + 6)
    this.page.drawRectangle({ x: this.body.x, y: this.y - h, width: this.body.width, height: h, color: BOX_BG, borderColor: LINE, borderWidth: 0.6 })
    cols.forEach((col, ci) => {
      let cy = this.y - 15
      const cx = this.body.x + 10 + ci * (this.body.width / 2)
      for (const [k, v] of col) {
        this.textAt(safe(k), cx, cy, 7.8, false, MUTED)
        const lines = cellLines(v!)
        lines.forEach((l, li) => this.textAt(l, cx + 62, cy - li * 11.5, 9, li === 0 && /^(Name|Patient)$/.test(k), INK))
        cy -= Math.max(1, lines.length) * 11.5 + 2
      }
    })
    this.y -= h + 8
  }

  paragraph(text: string, opts: { size?: number; color?: ReturnType<typeof rgb>; bold?: boolean; indent?: number; lead?: number } = {}) {
    const size = opts.size ?? 9.5
    const lead = opts.lead ?? size * 1.45
    const font = opts.bold ? this.f.bold : this.f.regular
    const lines = wrapText(text, font, size, this.body.width - (opts.indent ?? 0))
    for (const l of lines) {
      this.ensure(lead)
      this.y -= lead
      if (l) this.page.drawText(l, { x: this.body.x + (opts.indent ?? 0), y: this.y + lead * 0.25, size, font, color: opts.color ?? INK })
    }
    this.y -= 3
  }

  table(cols: Col[], rows: Cell[][], opts: { size?: number; boldLast?: boolean } = {}) {
    const size = opts.size ?? 8.8
    const lead = size * 1.4
    const total = cols.reduce((s, c) => s + c.w, 0)
    const widths = cols.map((c) => (c.w / total) * this.body.width)
    const pad = 5
    const header = () => {
      const h = 18
      this.page.drawRectangle({ x: this.body.x, y: this.y - h, width: this.body.width, height: h, color: HEAD_BG })
      let x = this.body.x
      cols.forEach((c, i) => {
        this.textAt(safe(c.header).toUpperCase(), x + pad, this.y - 12, 7.3, true, NAVY, c.align ?? "left", widths[i] - pad * 2)
        x += widths[i]
      })
      this.y -= h
    }
    this.ensure(18 + 24)
    header()
    rows.forEach((row, ri) => {
      const wrapped = row.map((cell, i) => {
        const bold = typeof cell !== "string" && cell.bold
        const text = typeof cell === "string" ? cell : cell.text
        return wrapText(text, bold ? this.f.bold : this.f.regular, size, widths[i] - pad * 2)
      })
      const lines = Math.max(...wrapped.map((w) => w.length), 1)
      const h = lines * lead + 7
      this.ensure(h, header)
      if (ri % 2 === 0) this.page.drawRectangle({ x: this.body.x, y: this.y - h, width: this.body.width, height: h, color: ZEBRA })
      let x = this.body.x
      row.forEach((cell, i) => {
        const bold = (typeof cell !== "string" && cell.bold) || (opts.boldLast && ri === rows.length - 1)
        const color = typeof cell !== "string" && cell.color ? cell.color : INK
        const align = cols[i].align ?? "left"
        wrapped[i].forEach((l, li) => this.textAt(l, x + pad, this.y - 4 - size - li * lead + 1, size, !!bold, color, align, widths[i] - pad * 2))
        x += widths[i]
      })
      this.y -= h
    })
    this.page.drawLine({ start: { x: this.body.x, y: this.y }, end: { x: this.body.x + this.body.width, y: this.y }, thickness: 0.6, color: LINE })
    this.y -= 8
  }

  /** Right-aligned label/value pairs (money summary). */
  totals(pairs: Array<{ label: string; value: string; bold?: boolean; color?: ReturnType<typeof rgb>; rule?: boolean }>) {
    const w = 230
    const x = this.body.x + this.body.width - w
    this.ensure(pairs.length * 15 + 8)
    for (const p of pairs) {
      if (p.rule) this.page.drawLine({ start: { x, y: this.y - 1 }, end: { x: x + w, y: this.y - 1 }, thickness: 0.7, color: LINE })
      this.y -= 15
      this.textAt(safe(p.label), x, this.y + 3, p.bold ? 10 : 9, !!p.bold, p.color ?? (p.bold ? INK : MUTED))
      this.textAt(safe(p.value), x, this.y + 3, p.bold ? 10 : 9, !!p.bold, p.color ?? INK, "right", w)
    }
    this.y -= 6
  }

  async signature(opts: { name: string; role?: string | null; image?: Uint8Array | null; caption?: string }) {
    const blockH = 70
    this.ensure(blockH + 10)
    const w = 170
    const x = this.body.x + this.body.width - w
    let img: PDFImage | null = null
    if (opts.image) {
      try {
        img = await this.doc.pdf.embedJpg(opts.image)
      } catch {
        img = null
      }
    }
    const top = this.y - 6
    if (img) {
      const s = Math.min(w / img.width, 38 / img.height)
      this.page.drawImage(img, { x: x + (w - img.width * s) / 2, y: top - 40, width: img.width * s, height: img.height * s })
    } else if (opts.caption) {
      this.textAt(safe(opts.caption), x, top - 30, 7.5, false, MUTED, "center", w)
    }
    this.page.drawLine({ start: { x, y: top - 44 }, end: { x: x + w, y: top - 44 }, thickness: 0.6, color: MUTED })
    this.textAt(safe(opts.name), x, top - 55, 9.5, true, INK, "center", w)
    if (opts.role) this.textAt(safe(opts.role), x, top - 66, 8, false, MUTED, "center", w)
    this.y -= blockH
  }

  note(text: string) {
    this.y -= 4
    this.paragraph(text, { size: 7.8, color: MUTED })
  }
}

// ── data shapes ──────────────────────────────────────────────────────────

export interface PatientInfo {
  name: string
  uhid: string
  age?: number | null
  gender?: string | null
  phone?: string | null
  address?: string | null
}
export interface DoctorInfo {
  name: string
  specialization?: string | null
}
const drName = (n: string) => (/^dr\.?\s/i.test(n) ? n : `Dr. ${n}`)
const ageSex = (p: PatientInfo) =>
  [p.age != null ? `${p.age} yrs` : null, p.gender ? p.gender[0] + p.gender.slice(1).toLowerCase() : null].filter(Boolean).join(" / ") || null

function patientPairs(p: PatientInfo, date: Date | string | null | undefined, dateLabel = "Date"): Array<[string, string | null | undefined]> {
  return [
    ["Name", p.name],
    ["UHID", p.uhid],
    ["Age / Sex", ageSex(p)],
    ["Phone", p.phone],
    [dateLabel, fmtDate(date)],
  ]
}

async function startDoc(title: string) {
  const doc = await LetterheadDoc.create({ title })
  return new Flow(doc)
}

// ── (a) prescription ─────────────────────────────────────────────────────

export interface PrescriptionData {
  id?: string
  issuedAt: Date | string
  patient: PatientInfo
  doctor: DoctorInfo
  diagnosis?: string | null
  notes?: string | null
  followUp?: string | null
  items: Array<{ medicineName: string; dosage?: string | null; frequency?: string | null; duration?: string | null; instructions?: string | null }>
  /** raw signature image bytes (any format sharp reads); compressed at build time */
  signature?: Uint8Array | null
}

export async function buildPrescriptionPdf(d: PrescriptionData, imageLevel = 0): Promise<Uint8Array> {
  const fl = await startDoc("Prescription")
  fl.title("PRESCRIPTION", [`Date: ${fmtDate(d.issuedAt)}`])
  fl.infoBox([...patientPairs(d.patient, d.issuedAt), ["Doctor", drName(d.doctor.name)], ["Speciality", d.doctor.specialization]])
  if (d.diagnosis) {
    fl.heading("Diagnosis")
    fl.paragraph(d.diagnosis)
  }
  fl.heading("Rx")
  if (d.items.length === 0) fl.paragraph("No medication items listed.", { color: MUTED })
  else
    fl.table(
      [
        { header: "#", w: 4 },
        { header: "Medicine", w: 24 },
        { header: "Dose", w: 12 },
        { header: "Frequency", w: 14 },
        { header: "Duration", w: 12 },
        { header: "Instructions", w: 24 },
      ],
      d.items.map((it, i) => [String(i + 1), { text: it.medicineName, bold: true }, it.dosage || "-", it.frequency || "-", it.duration || "-", it.instructions || "-"]),
    )
  if (d.notes) {
    fl.heading("Advice / Notes")
    fl.paragraph(d.notes)
  }
  if (d.followUp) {
    fl.heading("Follow-up")
    fl.paragraph(d.followUp)
  }
  fl.space(10)
  const img = await prepareImage(d.signature, imageLevel)
  await fl.signature({ name: drName(d.doctor.name), role: d.doctor.specialization, image: img })
  return fl.doc.finish()
}

// ── (b) bill / invoice ───────────────────────────────────────────────────

const METHOD: Record<string, string> = { CASH: "Cash", CARD: "Card", UPI: "UPI", NET_BANKING: "Net Banking", INSURANCE: "Insurance", ADVANCE: "Advance" }
const BILL_STATUS: Record<string, string> = { PENDING: "Pending", PAID: "Paid", PARTIALLY_PAID: "Partially Paid", CANCELLED: "Cancelled", REFUNDED: "Refunded" }

export interface BillData {
  billNumber: string
  issuedAt: Date | string
  status: string
  patient: PatientInfo
  service?: string | null
  insurance?: string | null
  items: Array<{ description: string; quantity: number; unitPrice: number; taxRatePercent: number; taxAmount: number; amount: number }>
  totalAmount: number
  discountAmount: number
  taxAmount: number
  netAmount: number
  amountPaid: number
  balanceDue: number
  payments: Array<{ receiptNumber: string; method: string; amount: number; referenceNumber?: string | null; paidAt: Date | string }>
}

export async function buildBillPdf(d: BillData): Promise<Uint8Array> {
  const fl = await startDoc(`Invoice ${d.billNumber}`)
  fl.title("INVOICE", [d.billNumber, `Date: ${fmtDate(d.issuedAt)}`, `Status: ${BILL_STATUS[d.status] ?? d.status}`])
  fl.infoBox([...patientPairs(d.patient, d.issuedAt, "Bill date"), ["Address", d.patient.address], ["Service", d.service], ["Insurance", d.insurance]])
  fl.heading("Items")
  fl.table(
    [
      { header: "#", w: 4 },
      { header: "Description", w: 34 },
      { header: "Qty", w: 6, align: "right" },
      { header: "Unit price", w: 14, align: "right" },
      { header: "Tax", w: 12, align: "right" },
      { header: "Amount", w: 15, align: "right" },
    ],
    d.items.map((it, i) => [
      String(i + 1),
      it.description,
      String(it.quantity),
      groupIndian(it.unitPrice),
      Number(it.taxRatePercent) ? `${groupIndian(it.taxAmount)} (${Number(it.taxRatePercent)}%)` : "-",
      groupIndian(it.amount),
    ]),
  )
  fl.totals([
    { label: "Subtotal", value: inr(d.totalAmount) },
    { label: "Discount", value: `- ${inr(d.discountAmount)}` },
    { label: "Tax", value: inr(d.taxAmount) },
    { label: "Net amount", value: inr(d.netAmount), bold: true, rule: true },
    { label: "Amount paid", value: inr(d.amountPaid), color: GREEN },
    { label: "Balance due", value: inr(d.balanceDue), bold: true, color: d.balanceDue > 0 ? RED : INK },
  ])
  if (d.payments.length) {
    fl.heading("Payments")
    fl.table(
      [
        { header: "Receipt", w: 20 },
        { header: "Date", w: 20 },
        { header: "Method", w: 14 },
        { header: "Reference", w: 24 },
        { header: "Amount", w: 14, align: "right" },
      ],
      d.payments.map((p) => [p.receiptNumber, fmtDateTime(p.paidAt), METHOD[p.method] ?? p.method, p.referenceNumber || "-", groupIndian(p.amount)]),
    )
  }
  fl.note("This is a computer-generated invoice and does not require a signature.")
  return fl.doc.finish()
}

// ── (c) payment receipt ──────────────────────────────────────────────────

export interface ReceiptData {
  receiptNumber: string
  paidAt: Date | string
  patient: PatientInfo
  billNumber?: string | null
  method: string
  referenceNumber?: string | null
  receivedBy?: string | null
  amount: number
  billNet?: number | null
  billBalance?: number | null
}

export async function buildReceiptPdf(d: ReceiptData): Promise<Uint8Array> {
  const fl = await startDoc(`Receipt ${d.receiptNumber}`)
  fl.title("PAYMENT RECEIPT", [d.receiptNumber, `Date: ${fmtDateTime(d.paidAt)}`])
  fl.infoBox([...patientPairs(d.patient, d.paidAt, "Paid on"), ["Bill no.", d.billNumber], ["Method", METHOD[d.method] ?? d.method], ["Reference", d.referenceNumber], ["Received by", d.receivedBy]])
  fl.space(8)
  fl.totals([{ label: "Amount received", value: inr(d.amount), bold: true, rule: true }])
  fl.paragraph(`Received with thanks from ${d.patient.name} the sum of ${amountInWords(d.amount)}.`, { size: 9.5 })
  if (d.billNet != null && d.billBalance != null) {
    fl.totals([
      { label: "Bill net amount", value: inr(d.billNet) },
      { label: "Balance due after this payment", value: inr(d.billBalance), color: d.billBalance > 0 ? RED : GREEN },
    ])
  }
  fl.space(14)
  await fl.signature({ name: "Authorised signatory", role: "Lumi Hospital - Accounts" })
  fl.note("This is a computer-generated receipt.")
  return fl.doc.finish()
}

// ── (d) medical certificate ──────────────────────────────────────────────

const CERT_TYPE: Record<string, string> = { FITNESS: "Fitness Certificate", SICK_LEAVE: "Sick Leave Certificate", MEDICAL: "Medical Certificate", OTHER: "Certificate" }

export interface CertificateData {
  title: string
  type: string
  content: string
  validFrom?: Date | string | null
  validTo?: Date | string | null
  issuedAt: Date | string
  signedAt?: Date | string | null
  patient: PatientInfo
  doctor: DoctorInfo
  signature?: Uint8Array | null
}

export async function buildCertificatePdf(d: CertificateData, imageLevel = 0): Promise<Uint8Array> {
  const fl = await startDoc(d.title)
  fl.title((CERT_TYPE[d.type] ?? "Certificate").toUpperCase(), [`Date: ${fmtDate(d.issuedAt)}`])
  fl.paragraph(d.title, { size: 11, bold: true, color: NAVY })
  fl.space(4)
  fl.infoBox([...patientPairs(d.patient, d.issuedAt, "Issued"), ["Valid from", d.validFrom ? fmtDate(d.validFrom) : null], ["Valid to", d.validTo ? fmtDate(d.validTo) : null]])
  fl.space(6)
  fl.paragraph(d.content, { size: 10.5, lead: 16 })
  fl.space(16)
  const img = d.signedAt ? await prepareImage(d.signature, imageLevel) : null
  await fl.signature({
    name: drName(d.doctor.name),
    role: d.doctor.specialization,
    image: img,
    caption: d.signedAt ? `Digitally signed ${fmtDate(d.signedAt)}` : undefined,
  })
  return fl.doc.finish()
}

// ── (e) clinical / lab report ────────────────────────────────────────────

const FLAG: Record<string, string> = { NORMAL: "Normal", LOW: "Low", HIGH: "High", CRITICAL: "Critical" }

export interface ReportData {
  title: string
  type: string
  modality?: string | null
  findings?: string | null
  impression?: string | null
  status: string
  reportDate: Date | string
  patient: PatientInfo
  doctor?: DoctorInfo | null
  labResults: Array<{ testName: string; value: string; unit?: string | null; referenceRange?: string | null; flag: string }>
  signature?: Uint8Array | null
}

export async function buildReportPdf(d: ReportData, imageLevel = 0): Promise<Uint8Array> {
  const fl = await startDoc(d.title)
  fl.title(d.type === "LAB" ? "LABORATORY REPORT" : "RADIOLOGY REPORT", [d.title, `Date: ${fmtDate(d.reportDate)}`, `Status: ${d.status === "COMPLETED" ? "Completed" : "Pending"}`])
  fl.infoBox([...patientPairs(d.patient, d.reportDate, "Report date"), ["Modality", d.modality], ["Referred by", d.doctor ? drName(d.doctor.name) : null]])
  if (d.labResults.length) {
    fl.heading("Results")
    fl.table(
      [
        { header: "Test", w: 30 },
        { header: "Result", w: 16, align: "right" },
        { header: "Unit", w: 12 },
        { header: "Reference range", w: 24 },
        { header: "Flag", w: 12 },
      ],
      d.labResults.map((r) => {
        const abnormal = r.flag !== "NORMAL"
        return [
          r.testName,
          { text: r.value, bold: abnormal, color: abnormal ? RED : INK },
          r.unit || "-",
          r.referenceRange || "-",
          { text: FLAG[r.flag] ?? r.flag, bold: abnormal, color: abnormal ? RED : INK },
        ]
      }),
    )
  }
  if (d.findings) {
    fl.heading("Findings")
    fl.paragraph(d.findings)
  }
  if (d.impression) {
    fl.heading("Impression")
    fl.paragraph(d.impression, { bold: true })
  }
  if (d.doctor) {
    fl.space(10)
    const img = await prepareImage(d.signature, imageLevel)
    await fl.signature({ name: drName(d.doctor.name), role: d.doctor.specialization, image: img })
  }
  return fl.doc.finish()
}

// ── (f) refund note ──────────────────────────────────────────────────────

export interface RefundData {
  id?: string
  requestedAt: Date | string
  processedAt?: Date | string | null
  patient: PatientInfo
  billNumber?: string | null
  amount: number
  method: string
  reason: string
  status: string
  processedBy?: string | null
}

export async function buildRefundPdf(d: RefundData): Promise<Uint8Array> {
  const fl = await startDoc("Refund note")
  fl.title("REFUND NOTE", [`Requested: ${fmtDate(d.requestedAt)}`, `Status: ${d.status[0] + d.status.slice(1).toLowerCase()}`])
  fl.infoBox([...patientPairs(d.patient, d.requestedAt, "Requested"), ["Bill no.", d.billNumber], ["Method", METHOD[d.method] ?? d.method], ["Processed", d.processedAt ? fmtDateTime(d.processedAt) : null], ["Processed by", d.processedBy]])
  fl.heading("Reason")
  fl.paragraph(d.reason)
  fl.space(6)
  fl.totals([{ label: "Refund amount", value: inr(d.amount), bold: true, rule: true }])
  fl.paragraph(`In words: ${amountInWords(d.amount)}`, { size: 9 })
  fl.space(14)
  await fl.signature({ name: "Authorised signatory", role: "Lumi Hospital - Accounts" })
  fl.note("This is a computer-generated document.")
  return fl.doc.finish()
}

// ── size-guaranteed generation ───────────────────────────────────────────

export type PdfKind = "prescription" | "bill" | "receipt" | "certificate" | "report" | "refund"

/** Builds the PDF, re-encoding / dropping signature images if it would exceed the byte budget. */
export function generatePdf(kind: "prescription", data: PrescriptionData): Promise<EnsureResult>
export function generatePdf(kind: "bill", data: BillData): Promise<EnsureResult>
export function generatePdf(kind: "receipt", data: ReceiptData): Promise<EnsureResult>
export function generatePdf(kind: "certificate", data: CertificateData): Promise<EnsureResult>
export function generatePdf(kind: "report", data: ReportData): Promise<EnsureResult>
export function generatePdf(kind: "refund", data: RefundData): Promise<EnsureResult>
export function generatePdf(kind: PdfKind, data: unknown): Promise<EnsureResult> {
  switch (kind) {
    case "prescription":
      return buildWithinBudget((l) => buildPrescriptionPdf(data as PrescriptionData, l))
    case "bill":
      return buildWithinBudget(() => buildBillPdf(data as BillData))
    case "receipt":
      return buildWithinBudget(() => buildReceiptPdf(data as ReceiptData))
    case "certificate":
      return buildWithinBudget((l) => buildCertificatePdf(data as CertificateData, l))
    case "report":
      return buildWithinBudget((l) => buildReportPdf(data as ReportData, l))
    case "refund":
      return buildWithinBudget(() => buildRefundPdf(data as RefundData))
  }
}

export { MARGIN_X }
