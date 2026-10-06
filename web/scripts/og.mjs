/* Branded Open Graph images (1200×630), one per page type, plus a 512px logo for JSON-LD.
   Run: node scripts/og.mjs  (runs automatically before `npm run build`). Output: public/og/*.png */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { BIZ, DEPARTMENTS, DOCTORS, POSTS, PACKAGES } from "../src/data/site.js";

mkdirSync("public/og", { recursive: true });
const ACC = "#0e8a70", INK = "#0b0e0d", PAPER = "#f3f1ec";
const x = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const rays = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<line x1="${17 + 11.5 * Math.cos(a)}" y1="${17 + 11.5 * Math.sin(a)}" x2="${17 + 15.5 * Math.cos(a)}" y2="${17 + 15.5 * Math.sin(a)}"/>`; }).join("");
const mark = (s, fg = "#fff") => `<svg x="0" y="0" width="${s}" height="${s}" viewBox="0 0 34 34" fill="none" stroke-linecap="round"><g stroke="${ACC}" stroke-width="2">${rays}</g><circle cx="17" cy="17" r="8" fill="${ACC}"/><path d="M17 13.2v7.6M13.2 17h7.6" stroke="${fg}" stroke-width="2.2"/></svg>`;

const TYPES = {
  home: ["Multi-speciality hospital", "Care that shows up", "for you.", `${DEPARTMENTS.length} specialities · 24/7 emergency, ICU & pharmacy`],
  default: ["Lumi Hospital", "Towards a", "healthy life.", `${DEPARTMENTS.length} specialities · 24/7 emergency`],
  speciality: ["Specialities", "Senior specialists,", "one team.", DEPARTMENTS.slice(0, 3).map(d => d.name).join(" · ") + ` + ${DEPARTMENTS.length - 3} more`],
  doctor: ["Find a doctor", "Meet the people", "who'll care for you.", `${DOCTORS.length} consultants · OPD timings · online booking`],
  journal: ["Health journal", "Clear health advice,", "from our doctors.", `${POSTS.length} articles · reviewed by specialists`],
  packages: ["Health check-ups", "Prevention,", "packaged.", `${PACKAGES.length} packages · each with a doctor's consultation`],
  emergency: ["24/7 Emergency", "Emergency?", "We're already up.", "Emergency room · ICU · ambulance · pharmacy"]
};

for (const [type, [label, l1, l2, foot]] of Object.entries(TYPES)) {
  const er = type === "emergency";
  const bg = er || type === "home" ? INK : PAPER, fg = bg === INK ? "#fff" : INK, mute = bg === INK ? "#9fb1aa" : "#5d6763";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="85%" cy="10%" r="70%"><stop offset="0" stop-color="${er ? "#dc2626" : ACC}" stop-opacity="${bg === INK ? .55 : .28}"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="${bg}"/><rect width="1200" height="630" fill="url(#g)"/>
  ${er ? `<path d="M600 150 H840 l16 -8 16 8 H930 l12 0 9 -70 15 130 11 -85 9 25 H1200" fill="none" stroke="#dc2626" stroke-width="5" stroke-linejoin="round" opacity=".9"/>` : ""}
  <g transform="translate(80 72)">${mark(64, bg === INK ? INK : "#fff")}<text x="84" y="44" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="${fg}">${x(BIZ.short)} <tspan font-weight="400" fill="${mute}">Hospital</tspan></text></g>
  <text x="80" y="236" font-family="Consolas, Menlo, monospace" font-size="24" letter-spacing="4" fill="${er ? "#f87171" : ACC}">${x(label.toUpperCase())}</text>
  <text x="80" y="330" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="78" font-weight="700" fill="${fg}" letter-spacing="-2">${x(l1)}</text>
  <text x="80" y="420" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="82" fill="${er ? "#f87171" : ACC}">${x(l2)}</text>
  <rect x="80" y="520" width="1040" height="1.5" fill="${mute}" opacity=".5"/>
  <text x="80" y="566" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="${mute}">${x(foot)}</text>
  <text x="1120" y="566" text-anchor="end" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="${fg}">${x(BIZ.siteUrl.replace(/^https?:\/\/(www\.)?/, ""))}</text>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(`public/og/${type}.png`);
}
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="${PAPER}"/><g transform="translate(56 56) scale(1)">${mark(400)}</g></svg>`)).png().toFile("public/og/logo.png");
console.log("og images:", Object.keys(TYPES).length + " + logo");
