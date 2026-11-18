// Official Lumi Hospital letterhead, drawn as vector graphics on pdf-lib pages.
// Only the standard PDF fonts are used (never embedded), so files stay tiny.
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, degrees } from "pdf-lib"
import { LETTERHEAD_INFO } from "@/lib/letterhead-info"

export const PAGE_W = 595.28
export const PAGE_H = 841.89
export const MARGIN_X = 51 // ~18 mm

const RED = rgb(0xd8 / 255, 0x26 / 255, 0x2f / 255)
const NAVY = rgb(0x1f / 255, 0x3f / 255, 0x9e / 255)
const BLUE = rgb(0x1d / 255, 0x6f / 255, 0xd8 / 255)
const GREY = rgb(0.33, 0.33, 0.35)
const RULE = rgb(0.82, 0.83, 0.86)
const INK = rgb(0.1, 0.1, 0.12)
const WHITE = rgb(1, 1, 1)

const HEADER_RULE_FROM_TOP = 104
const FOOTER_RULE_Y = 64

export interface Fonts {
  regular: PDFFont
  bold: PDFFont
  oblique: PDFFont
}

export interface BodyRect {
  x: number
  /** bottom edge (pdf-lib y, origin bottom-left) */
  y: number
  /** top edge */
  top: number
  width: number
  height: number
}

export const BODY: BodyRect = {
  x: MARGIN_X,
  y: FOOTER_RULE_Y + 14,
  top: PAGE_H - HEADER_RULE_FROM_TOP - 16,
  width: PAGE_W - MARGIN_X * 2,
  height: PAGE_H - HEADER_RULE_FROM_TOP - 16 - (FOOTER_RULE_Y + 14),
}

const WIN_ANSI_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ")

/** Standard fonts only encode WinAnsi: replace anything else so drawText never throws. */
export function safe(text: string | null | undefined): string {
  if (!text) return ""
  let out = ""
  for (const ch of text.replace(/\t/g, " ").replace(/\r/g, "")) {
    const code = ch.codePointAt(0)!
    if (ch === "\n") out += ch
    else if (ch === "₹") out += "Rs."
    else if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255) || WIN_ANSI_EXTRA.has(ch)) out += ch
    else if (code === 0x2192) out += "->"
    else if (code === 0x2264) out += "<="
    else if (code === 0x2265) out += ">="
    else out += "?"
  }
  return out
}

export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const para of safe(text).split("\n")) {
    if (!para.trim()) {
      lines.push("")
      continue
    }
    let line = ""
    for (const word of para.split(/ +/)) {
      const trial = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        line = trial
        continue
      }
      if (line) lines.push(line)
      let rest = word
      while (font.widthOfTextAtSize(rest, size) > maxWidth && rest.length > 1) {
        let n = rest.length - 1
        while (n > 1 && font.widthOfTextAtSize(rest.slice(0, n), size) > maxWidth) n--
        lines.push(rest.slice(0, n))
        rest = rest.slice(n)
      }
      line = rest
    }
    lines.push(line)
  }
  return lines
}

// ── vector marks ─────────────────────────────────────────────────────────

function drawLogo(page: PDFPage, x: number, topY: number, size: number) {
  const scale = size / 40
  const o = { x, y: topY, scale }
  page.drawSvgPath("M14 3h12v11h11v12H26v11H14V26H3V14h11z", {
    ...o,
    color: WHITE,
    borderColor: RED,
    borderWidth: 2.4 * scale,
  })
  page.drawSvgPath("M16.6 6.2h6.8v10.4h10.4v6.8H23.4v10.4h-6.8V23.4H6.2v-6.8h10.4z", { ...o, color: RED })
  page.drawSvgPath(
    "M20 12.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5z",
    { ...o, color: WHITE },
  )
}

function drawPin(page: PDFPage, x: number, baseY: number) {
  page.drawSvgPath("M5 0C2.2 0 0 2.2 0 5c0 3.6 5 9 5 9s5-5.4 5-9c0-2.8-2.2-5-5-5z", {
    x,
    y: baseY + 11,
    scale: 0.78,
    color: BLUE,
  })
  page.drawCircle({ x: x + 3.9, y: baseY + 7.1, size: 1.5, color: WHITE })
}

function drawPhone(page: PDFPage, x: number, baseY: number) {
  page.drawSvgPath(
    "M2.2 0.4 L4.2 0.2 L5.4 3 L4 4 C4.7 5.6 6 6.9 8 7.9 L9 6.5 L11.8 7.7 L11.6 9.7 C11.4 10.9 10.5 11.8 9.2 11.8 C4.6 11.4 0.6 7.4 0.2 2.8 C0.2 1.5 1 0.6 2.2 0.4 Z",
    { x, y: baseY + 9.4, scale: 0.78, color: BLUE },
  )
}

function drawMail(page: PDFPage, x: number, baseY: number) {
  page.drawRectangle({ x, y: baseY, width: 9.6, height: 7, color: BLUE })
  page.drawLine({ start: { x, y: baseY + 7 }, end: { x: x + 4.8, y: baseY + 3.2 }, thickness: 0.8, color: WHITE })
  page.drawLine({ start: { x: x + 9.6, y: baseY + 7 }, end: { x: x + 4.8, y: baseY + 3.2 }, thickness: 0.8, color: WHITE })
}

// ── letterhead frame ─────────────────────────────────────────────────────

function drawFrame(page: PDFPage, fonts: Fonts) {
  // faint watermark running bottom-to-top near the left edge
  const wm = LETTERHEAD_INFO.tagline
  const wmSize = 30
  const wmW = fonts.oblique.widthOfTextAtSize(wm, wmSize)
  page.drawText(wm, {
    x: 38,
    y: (PAGE_H - wmW) / 2 - 20,
    size: wmSize,
    font: fonts.oblique,
    color: rgb(0.945, 0.95, 0.96),
    rotate: degrees(90),
  })

  // top-right swoosh bleeding off the corner (svg y points down from the anchor)
  const sw = 210
  page.drawSvgPath(`M40 0 L${sw} 0 L${sw} 92 C${sw - 32} 84 ${sw - 62} 62 ${sw - 92} 40 C${sw - 118} 20 ${sw - 156} 6 40 0 Z`, {
    x: PAGE_W - sw,
    y: PAGE_H,
    color: BLUE,
  })
  page.drawSvgPath(
    `M${sw - 150} 0 L${sw} 0 L${sw} 62 C${sw - 24} 58 ${sw - 52} 44 ${sw - 78} 26 C${sw - 98} 12 ${sw - 124} 4 ${sw - 150} 0 Z`,
    { x: PAGE_W - sw, y: PAGE_H, color: NAVY },
  )

  // logo + wordmark
  const logoSize = 50
  drawLogo(page, MARGIN_X, PAGE_H - 26, logoSize)

  const tx = MARGIN_X + logoSize + 10
  const big = 27
  const baseline = PAGE_H - 26 - 27
  let cx = tx
  for (const ch of "LUM") {
    page.drawText(ch, { x: cx, y: baseline, size: big, font: fonts.bold, color: NAVY })
    cx += fonts.bold.widthOfTextAtSize(ch, big) + 1.6
  }
  // the "I": a stem with a red dot
  const capH = big * 0.72
  const stemW = big * 0.14
  page.drawRectangle({ x: cx + 1, y: baseline, width: stemW, height: capH * 0.68, color: NAVY })
  page.drawCircle({ x: cx + 1 + stemW / 2, y: baseline + capH * 0.68 + stemW * 0.95, size: stemW * 0.72, color: RED })

  let hx = tx
  const hospBase = baseline - 15
  for (const ch of LETTERHEAD_INFO.subName) {
    page.drawText(ch, { x: hx, y: hospBase, size: 11.5, font: fonts.bold, color: NAVY })
    hx += fonts.bold.widthOfTextAtSize(ch, 11.5) + 4.6
  }
  page.drawText(LETTERHEAD_INFO.tagline, { x: tx + 1, y: hospBase - 13, size: 8.6, font: fonts.oblique, color: GREY })

  // header rule
  page.drawLine({
    start: { x: MARGIN_X - 18, y: PAGE_H - HEADER_RULE_FROM_TOP },
    end: { x: PAGE_W - MARGIN_X + 18, y: PAGE_H - HEADER_RULE_FROM_TOP },
    thickness: 0.7,
    color: RULE,
  })

  // footer rule: curved at the left edge, then straight across
  page.drawSvgPath(`M0 16 C16 16 28 0 60 0 L${PAGE_W} 0`, {
    x: 0,
    y: FOOTER_RULE_Y,
    borderColor: INK,
    borderWidth: 1.5,
  })

  // footer contact
  const fs = 7.6
  const addrLines = wrapText(LETTERHEAD_INFO.address, fonts.regular, fs, 275)
  const top = FOOTER_RULE_Y - 15
  drawPin(page, MARGIN_X, top - 9)
  addrLines.forEach((l, i) =>
    page.drawText(l, { x: MARGIN_X + 14, y: top - 6 - i * 10, size: fs, font: fonts.regular, color: INK }),
  )

  const rightEdge = PAGE_W - MARGIN_X
  const phoneW = fonts.bold.widthOfTextAtSize(LETTERHEAD_INFO.phone, 8.6)
  const mailW = fonts.regular.widthOfTextAtSize(LETTERHEAD_INFO.email, 8.2)
  drawPhone(page, rightEdge - phoneW - 15, top - 7.5)
  page.drawText(LETTERHEAD_INFO.phone, { x: rightEdge - phoneW, y: top - 6, size: 8.6, font: fonts.bold, color: INK })
  drawMail(page, rightEdge - mailW - 15, top - 22)
  page.drawText(LETTERHEAD_INFO.email, { x: rightEdge - mailW, y: top - 19.5, size: 8.2, font: fonts.regular, color: INK })
}

export class LetterheadDoc {
  readonly pdf: PDFDocument
  fonts!: Fonts
  pages: PDFPage[] = []

  private constructor(pdf: PDFDocument) {
    this.pdf = pdf
  }

  static async create(meta?: { title?: string }): Promise<LetterheadDoc> {
    const pdf = await PDFDocument.create()
    const d = new LetterheadDoc(pdf)
    d.fonts = {
      regular: await pdf.embedFont(StandardFonts.Helvetica),
      bold: await pdf.embedFont(StandardFonts.HelveticaBold),
      oblique: await pdf.embedFont(StandardFonts.HelveticaOblique),
    }
    pdf.setTitle(safe(meta?.title) || "Lumi Hospital document")
    pdf.setAuthor("Lumi Hospital")
    pdf.setCreator("Lumi Hospital CRM")
    pdf.setProducer("Lumi Hospital CRM")
    return d
  }

  /** Adds an A4 page with the letterhead already drawn; returns the usable body rectangle. */
  addPage(): { page: PDFPage; body: BodyRect } {
    const page = this.pdf.addPage([PAGE_W, PAGE_H])
    drawFrame(page, this.fonts)
    this.pages.push(page)
    return { page, body: BODY }
  }

  /** Stamps "Page x of y" on every page and serialises with object streams. */
  async finish(): Promise<Uint8Array> {
    const n = this.pages.length
    this.pages.forEach((p, i) => {
      const label = `Page ${i + 1} of ${n}`
      const w = this.fonts.regular.widthOfTextAtSize(label, 6.8)
      p.drawText(label, { x: (PAGE_W - w) / 2, y: 14, size: 6.8, font: this.fonts.regular, color: GREY })
    })
    return this.pdf.save({ useObjectStreams: true })
  }
}
