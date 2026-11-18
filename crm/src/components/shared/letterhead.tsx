import { LETTERHEAD_INFO } from "@/lib/letterhead-info"

// HTML/CSS twin of src/lib/pdf/letterhead.ts so Ctrl+P output matches the PDF.
// Everything here is hidden on screen and shown only when printing.

const RED = "#d8262f"
const NAVY = "#1f3f9e"
const BLUE = "#1d6fd8"

function Logo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M14 3h12v11h11v12H26v11H14V26H3V14h11z" fill="#fff" stroke={RED} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M16.6 6.2h6.8v10.4h10.4v6.8H23.4v10.4h-6.8V23.4H6.2v-6.8h10.4z" fill={RED} />
      <path d="M20 12.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5z" fill="#fff" />
    </svg>
  )
}

export function LetterheadHeader() {
  return (
    <header className="letterhead-header relative hidden print:block" style={{ breakInside: "avoid" }}>
      <svg viewBox="0 0 210 92" className="absolute -right-[10mm] -top-[10mm] h-[32mm] w-[74mm]" aria-hidden="true">
        <path d="M40 0H210V92C178 84 148 62 118 40 92 20 54 6 40 0Z" fill={BLUE} />
        <path d="M60 0H210V62C186 58 158 44 132 26 112 12 86 4 60 0Z" fill={NAVY} />
      </svg>
      <div className="flex items-center gap-3 pb-3">
        <Logo size={52} />
        <div className="leading-none">
          <p className="relative inline-block text-[28px] font-extrabold tracking-[0.06em]" style={{ color: NAVY }}>
            LUM
            <span className="relative inline-block">
              I
              <span className="absolute left-1/2 top-[2px] -ml-[3px] h-[6px] w-[6px] rounded-full" style={{ background: RED }} />
            </span>
          </p>
          <p className="mt-1 text-[12px] font-bold tracking-[0.34em]" style={{ color: NAVY }}>
            {LETTERHEAD_INFO.subName}
          </p>
          <p className="mt-1 text-[9px] italic text-neutral-600">{LETTERHEAD_INFO.tagline}</p>
        </div>
      </div>
      <hr className="mb-4 border-0 border-t border-neutral-300" />
    </header>
  )
}

/** Fixed to the bottom of every printed page, with the faint left-edge watermark. */
export function LetterheadFooter() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed bottom-0 left-0 top-0 hidden w-[14mm] items-center justify-center print:flex"
      >
        <span className="-rotate-90 whitespace-nowrap text-[28px] italic text-neutral-200/80">{LETTERHEAD_INFO.tagline}</span>
      </div>
      <footer className="letterhead-footer fixed inset-x-0 bottom-0 hidden bg-white print:block">
        <svg viewBox="0 0 800 18" preserveAspectRatio="none" className="h-[5mm] w-full" aria-hidden="true">
          <path d="M0 18C20 18 36 2 80 2L800 2" fill="none" stroke="#1a1a1f" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="flex items-start justify-between gap-6 px-[18mm] pb-[6mm] pt-1 text-[9px] text-neutral-900">
          <p className="flex max-w-[95mm] items-start gap-1.5">
            <svg viewBox="0 0 10 14" width="9" height="12" className="mt-[1px] shrink-0" aria-hidden="true">
              <path d="M5 0C2.2 0 0 2.2 0 5c0 3.6 5 9 5 9s5-5.4 5-9c0-2.8-2.2-5-5-5z" fill={BLUE} />
              <circle cx="5" cy="5" r="1.8" fill="#fff" />
            </svg>
            <span>{LETTERHEAD_INFO.address}</span>
          </p>
          <div className="space-y-1 text-right">
            <p className="flex items-center justify-end gap-1.5 font-bold">
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M2.2.4 4.2.2 5.4 3 4 4C4.7 5.6 6 6.9 8 7.9L9 6.5l2.8 1.2-.2 2c-.2 1.2-1.1 2.1-2.4 2.1C4.6 11.4.6 7.4.2 2.8.2 1.5 1 .6 2.2.4Z" fill={BLUE} />
              </svg>
              {LETTERHEAD_INFO.phone}
            </p>
            <p className="flex items-center justify-end gap-1.5">
              <svg viewBox="0 0 10 7" width="10" height="7" aria-hidden="true">
                <rect width="10" height="7" fill={BLUE} />
                <path d="M0 0 5 3.4 10 0" stroke="#fff" strokeWidth=".8" fill="none" />
              </svg>
              {LETTERHEAD_INFO.email}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
