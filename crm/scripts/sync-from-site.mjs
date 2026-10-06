/* Exports the website's hospital data (../web/src/data/site.js) into prisma/lumi-data.json,
   the single source the CRM seed, brand strings and print templates read.
   Run: npm run sync:site   (also runs before db:seed) */
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const site = await import(pathToFileURL(resolve(here, "../../web/src/data/site.js")).href);
const { BIZ, DEPARTMENTS, DOCTORS, PACKAGES, FAQ } = site;

const data = {
  syncedAt: new Date().toISOString(),
  biz: {
    name: BIZ.name, short: BIZ.short, tagline: BIZ.tagline, intro: BIZ.intro,
    phone: BIZ.phone, emergency: BIZ.emergency, email: BIZ.email,
    address: BIZ.address, mapQuery: BIZ.mapQuery, hours: BIZ.hours, siteUrl: BIZ.siteUrl,
  },
  departments: DEPARTMENTS.map(d => ({ id: d.id, name: d.name, summary: d.summary, about: d.about })),
  doctors: DOCTORS.map(d => ({ id: d.id, name: d.name, dept: d.dept, role: d.role, quals: d.quals, exp: d.exp, days: d.days, time: d.time })),
  packages: PACKAGES.map(p => ({ id: p.id, name: p.name, price: p.price, tests: p.tests, for: p.for })),
  faq: FAQ,
};
writeFileSync(resolve(here, "../prisma/lumi-data.json"), JSON.stringify(data, null, 2) + "\n");
console.log(`synced: ${data.departments.length} departments, ${data.doctors.length} doctors, ${data.packages.length} packages`);
