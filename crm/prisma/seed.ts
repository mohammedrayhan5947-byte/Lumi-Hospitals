// Lumi Hospital: CRM seed.
// Reads prisma/lumi-data.json, which `npm run sync:site` exports from the website's
// src/data/site.js, so departments, doctors, packages and hospital details have ONE source.
// Idempotent: safe to re-run. Existing staff passwords are kept unless LUMI_RESET_PASSWORDS=1.
// Passwords come from env (LUMI_ADMIN_PASSWORD, LUMI_RECEPTION_PASSWORD, LUMI_BILLING_PASSWORD,
// LUMI_DOCTOR_PASSWORD); any that are unset are generated and printed ONCE below. Nothing is hard-coded.
import "dotenv/config"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { randomBytes, scryptSync } from "node:crypto"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const data = JSON.parse(readFileSync(resolve(__dirname, "lumi-data.json"), "utf8"))

const DOMAIN = (process.env.LUMI_EMAIL_DOMAIN || "lumihospital.in").trim()
const RESET = process.env.LUMI_RESET_PASSWORDS === "1"
const issued: { who: string; email: string; password: string }[] = []

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`
}
const pw = (envKey: string) => process.env[envKey]?.trim() || randomBytes(9).toString("base64url")

const DAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
function to24(t: string) {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  if (!m) return null
  let h = +m[1] % 12
  if (m[3].toUpperCase() === "PM") h += 12
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`
}
/** "10 AM – 4 PM" → ["10:00","16:00"] */
function range(s: string): [string, string] | null {
  const [a, b] = s.split(/[–-]/)
  const x = a && to24(a), y = b && to24(b)
  return x && y ? [x, y] : null
}

async function upsertStaff(name: string, email: string, role: "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "BILLING", password: string, extra: Record<string, unknown> = {}) {
  const existing = await prisma.user.findUnique({ where: { email } })
  const passwordHash = hashPassword(password)
  if (existing) {
    return prisma.user.update({ where: { email }, data: { name, role, active: true, ...extra, ...(RESET ? { passwordHash } : {}) } })
  }
  issued.push({ who: `${role.toLowerCase()}: ${name}`, email, password })
  return prisma.user.create({ data: { name, email, role, passwordHash, ...extra } })
}

async function main() {
  const biz = data.biz
  console.log(`Seeding ${biz.name} CRM from website data (${data.syncedAt})…`)

  // Staff: front-of-house roles
  await upsertStaff(`${biz.short} Administrator`, `admin@${DOMAIN}`, "ADMIN", pw("LUMI_ADMIN_PASSWORD"), { phone: biz.phone })
  await upsertStaff("Front Desk", `reception@${DOMAIN}`, "RECEPTIONIST", pw("LUMI_RECEPTION_PASSWORD"), { phone: biz.phone })
  await upsertStaff("Billing Desk", `billing@${DOMAIN}`, "BILLING", pw("LUMI_BILLING_PASSWORD"), { phone: biz.phone })

  // Services: one consultation per speciality + one bookable service per health package
  let order = 0
  for (const d of data.departments) {
    await prisma.service.upsert({
      where: { slug: d.id },
      create: { slug: d.id, name: `${d.name} consultation`, shortDescription: d.summary, description: d.about, durationMinutes: 30, displayOrder: order++, active: true },
      update: { name: `${d.name} consultation`, shortDescription: d.summary, description: d.about, displayOrder: order++, active: true },
    })
  }
  for (const p of data.packages) {
    await prisma.service.upsert({
      where: { slug: `pkg-${p.id}` },
      create: { slug: `pkg-${p.id}`, name: `${p.name} health check`, shortDescription: `${p.tests} tests · ${p.for}`, price: p.price, durationMinutes: 60, displayOrder: order++, active: true },
      update: { name: `${p.name} health check`, shortDescription: `${p.tests} tests · ${p.for}`, price: p.price, displayOrder: order++, active: true },
    })
  }
  console.log(`  Services: ${data.departments.length} specialities + ${data.packages.length} packages`)

  // Doctors + weekly OPD availability from the website roster
  const deptName = Object.fromEntries(data.departments.map((d: { id: string; name: string }) => [d.id, d.name]))
  const doctorPw = pw("LUMI_DOCTOR_PASSWORD")
  for (const d of data.doctors) {
    // The CRM adds "Dr." itself wherever it shows a doctor, so store the bare name
    const doc = await upsertStaff(String(d.name).replace(/^Dr\.?\s+/i, ""), `${d.id}@${DOMAIN}`, "DOCTOR", doctorPw, {
      slug: d.id,
      specialization: `${d.role} · ${deptName[d.dept] ?? d.dept}`,
    })
    const r = range(d.time)
    await prisma.doctorAvailability.deleteMany({ where: { doctorId: doc.id } })
    if (r) {
      for (const day of d.days) {
        if (day in DAY) await prisma.doctorAvailability.create({ data: { doctorId: doc.id, dayOfWeek: DAY[day], startTime: r[0], endTime: r[1], slotDurationMinutes: 30 } })
      }
    }
  }
  console.log(`  Doctors: ${data.doctors.length} with OPD availability`)

  // Hospital settings (shown on the CRM; the public site reads its own data file)
  const opd = range((biz.hours.opd as string).split("·")[1] ?? "") ?? ["08:00", "20:00"]
  await prisma.clinicSettings.upsert({
    where: { id: "clinic" },
    create: { id: "clinic", name: biz.name, addressLine: biz.address, landmark: "", phone: biz.phone, email: biz.email, mapQuery: biz.mapQuery, weekdayOpen: opd[0], weekdayClose: opd[1], sundayClosed: false, heroHeadline: biz.tagline, aboutText: biz.intro },
    update: { name: biz.name, addressLine: biz.address, phone: biz.phone, email: biz.email, mapQuery: biz.mapQuery, weekdayOpen: opd[0], weekdayClose: opd[1], sundayClosed: false, heroHeadline: biz.tagline, aboutText: biz.intro },
  })

  await prisma.fAQ.deleteMany()
  for (const [i, f] of (data.faq as { q: string; a: string }[]).entries()) {
    await prisma.fAQ.create({ data: { question: f.q, answer: f.a, displayOrder: i, active: true } })
  }
  console.log(`  Settings + ${data.faq.length} FAQs`)

  if (issued.length) {
    console.log("\n  NEW staff accounts. Passwords are shown ONCE. Save them now, then change them in the CRM:")
    for (const u of issued.filter(u => !u.who.startsWith("doctor"))) console.log(`    ${u.who.padEnd(32)} ${u.email.padEnd(34)} ${u.password}`)
    if (issued.some(u => u.who.startsWith("doctor"))) console.log(`    all doctors (${DOMAIN})            shared initial password: ${doctorPw}`)
  } else console.log("\n  No new accounts created (existing passwords kept).")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
