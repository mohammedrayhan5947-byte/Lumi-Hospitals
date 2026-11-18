// Size guarantees for generated PDFs. Text/vector content is tiny already; the only
// thing that can grow a file is raster images (doctor signatures), so those are
// re-encoded progressively and finally dropped if the budget is still exceeded.

export const MAX_PDF_BYTES = 200 * 1024

/** Progressive image ladder. Level 4 means "no image at all". */
export const IMAGE_LEVELS = [
  { maxWidth: 600, quality: 60 },
  { maxWidth: 420, quality: 45 },
  { maxWidth: 300, quality: 32 },
  { maxWidth: 200, quality: 22 },
] as const
export const DROP_IMAGES_LEVEL = IMAGE_LEVELS.length

/** Decodes a data: URL / raw buffer into bytes; returns null when unusable. */
export async function loadImageBytes(src: string | Uint8Array | null | undefined): Promise<Uint8Array | null> {
  if (!src) return null
  if (typeof src !== "string") return src
  const m = /^data:[^;,]+(;base64)?,([\s\S]*)$/.exec(src)
  if (m) return m[1] ? new Uint8Array(Buffer.from(m[2], "base64")) : new Uint8Array(Buffer.from(decodeURIComponent(m[2])))
  if (/^https?:\/\//.test(src)) {
    try {
      const res = await fetch(src, { signal: AbortSignal.timeout(4000) })
      if (res.ok) return new Uint8Array(await res.arrayBuffer())
    } catch {
      /* fall through */
    }
  }
  return null
}

/** Grayscale, flattened-on-white, size-limited JPEG. Returns null at the drop level or on failure. */
export async function prepareImage(raw: Uint8Array | null | undefined, level: number): Promise<Uint8Array | null> {
  if (!raw || level >= DROP_IMAGES_LEVEL) return null
  const { maxWidth, quality } = IMAGE_LEVELS[Math.max(0, level)]
  try {
    const sharp = (await import("sharp")).default
    const out = await sharp(raw)
      .flatten({ background: "#ffffff" })
      .grayscale()
      .toColourspace("b-w")
      .resize({ width: maxWidth, height: maxWidth, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()
    return new Uint8Array(out)
  } catch {
    return null
  }
}

export interface EnsureResult {
  bytes: Uint8Array
  size: number
  /** true when size <= maxBytes */
  ok: boolean
  /** which image level produced the result (0 = first attempt) */
  level: number
  steps: string[]
}

/**
 * Returns `bytes` if already small enough. Otherwise calls `rebuild(level)` with progressively
 * harsher image settings (and finally no images) until the file fits.
 */
export async function ensureUnder(
  bytes: Uint8Array,
  maxBytes: number = MAX_PDF_BYTES,
  rebuild?: (level: number) => Promise<Uint8Array>,
): Promise<EnsureResult> {
  const steps: string[] = []
  if (bytes.length <= maxBytes) return { bytes, size: bytes.length, ok: true, level: 0, steps }
  steps.push(`initial ${bytes.length}B > ${maxBytes}B`)
  if (!rebuild) return { bytes, size: bytes.length, ok: false, level: 0, steps }

  let best = bytes
  for (let level = 1; level <= DROP_IMAGES_LEVEL; level++) {
    const next = await rebuild(level)
    steps.push(level === DROP_IMAGES_LEVEL ? `dropped images -> ${next.length}B` : `level ${level} -> ${next.length}B`)
    if (next.length < best.length) best = next
    if (next.length <= maxBytes) return { bytes: next, size: next.length, ok: true, level, steps }
  }
  return { bytes: best, size: best.length, ok: best.length <= maxBytes, level: DROP_IMAGES_LEVEL, steps }
}

/** Builds a PDF at level 0 and enforces the size budget (rebuilding with smaller images if needed). */
export async function buildWithinBudget(
  build: (imageLevel: number) => Promise<Uint8Array>,
  maxBytes: number = MAX_PDF_BYTES,
): Promise<EnsureResult> {
  const first = await build(0)
  return ensureUnder(first, maxBytes, build)
}
