/* Converts the hospital's own photos (raw/) into web-ready WebP (public/img/lumi/). Run: node scripts/photos.mjs */
import sharp from "sharp";
export const PICK = {
  "exterior": 34, "exterior-2": 24, "exterior-tall": 25, "emergency-entrance": 33, "ambulance": 26,
  "reception": 1, "opd": 6, "ward": 2, "ward-bed": 8, "ward-care": 9,
  "icu": 17, "icu-ward": 23, "icu-sign": 20, "nicu": 12,
  "ot": 14, "ot-2": 18, "ot-tall": 13, "lab": 30
};
const SOFT = new Set([23, 30, 9]); // slightly soft originals get more sharpening
for (const [name, n] of Object.entries(PICK)) {
  const base = sharp(`raw/${n}.jpg`).rotate().normalise({ lower: 1, upper: 99.5 }).modulate({ saturation: 1.06 })
    .sharpen(SOFT.has(n) ? { sigma: 1.4, m1: 1.2, m2: 3 } : { sigma: .8 });
  await base.clone().resize({ width: 1800, height: 1800, fit: "inside" }).webp({ quality: 80 }).toFile(`public/img/lumi/${name}.webp`);
  await base.clone().resize({ width: 760, height: 760, fit: "inside" }).webp({ quality: 74 }).toFile(`public/img/lumi/${name}-sm.webp`);
}
console.log("done", Object.keys(PICK).length);
