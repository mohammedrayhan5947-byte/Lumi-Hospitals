// Lumi Hospital CRM: DEMO data seed (local/dev ONLY).
// Fills every CRM section with clearly synthetic records so screens look alive.
//   npm run db:seed:demo            -> remove previous demo rows, then insert fresh ones
//   npm run db:seed:demo -- --reset -> remove demo rows only
// Run `npm run db:seed` first (staff, doctors and services must exist).
//
// How demo rows are marked (and found again for removal):
//   patients : phone 9000000001..9000000099, email *@demo.invalid, tag "DEMO"
//   inventory: sku starts with "DEMO-"
//   expenses / cash sessions / announcements / templates / leave: text starts with "[DEMO]"
//   audit log: metadata.demo = true
// The Review (testimonial) model is intentionally NOT seeded: it is for real patient reviews only.
//
// SAFETY: refuses to run in production or against a non-local database unless LUMI_ALLOW_DEMO=1.
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { generateAppointmentCode, generateBillNumber, generateReceiptNumber, generateUHID } from "../src/lib/sequence"

// ---------------------------------------------------------------- safety guard
const RESET_ONLY = process.argv.includes("--reset")
function guard() {
  const url = process.env.DATABASE_URL || ""
  let host = ""
  try { host = new URL(url).hostname } catch { /* invalid url */ }
  const local = host === "127.0.0.1" || host === "localhost" || host === "::1" || host === "[::1]"
  const allowed = process.env.LUMI_ALLOW_DEMO === "1"
  if ((process.env.NODE_ENV === "production" || !local) && !allowed) {
    console.error(`REFUSING to seed demo data: NODE_ENV=${process.env.NODE_ENV ?? "(unset)"}, database host=${host || "(unparseable)"}.`)
    console.error("Demo patients must never reach a production database. Set LUMI_ALLOW_DEMO=1 only if you are sure.")
    process.exit(1)
  }
  console.log(`Target database host: ${host} (local=${local}${allowed ? ", LUMI_ALLOW_DEMO=1" : ""})`)
  console.log(RESET_ONLY ? "Action: remove demo rows only (--reset)." : "Action: remove previous demo rows, then insert fresh synthetic demo data.")
}
guard()

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

// ---------------------------------------------------------------- helpers
const IST = 330 * 60000
/** Date at hh:mm IST, `day` days from today (negative = past). */
function at(day: number, h: number, m = 0) {
  const n = new Date(Date.now() + IST)
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + day, h, m) - IST)
}
const addMin = (d: Date, m: number) => new Date(d.getTime() + m * 60000)
const r2 = (n: number) => Math.round(n * 100) / 100
const DEMO_TAG = "DEMO"
const EXTRA_TAGS: [string, string][] = [["Senior citizen", "#b45309"], ["Diabetic", "#be123c"], ["Hypertensive", "#1d4ed8"], ["Follow-up needed", "#0f766e"]]
const phone = (i: number) => String(9000000001 + i)

async function cleanup() {
  const demo = await prisma.patient.findMany({
    where: { OR: [{ phone: { gte: "9000000001", lte: "9000000099" }, email: { endsWith: "@demo.invalid" } }, { tags: { some: { tag: { name: DEMO_TAG } } } }] },
    select: { id: true },
  })
  const ids = demo.map((p) => p.id)
  const out: Record<string, number> = {}
  out.inventoryTxn = (await prisma.inventoryTransaction.deleteMany({ where: { OR: [{ patientId: { in: ids } }, { item: { sku: { startsWith: "DEMO-" } } }] } })).count
  out.inventoryItems = (await prisma.inventoryItem.deleteMany({ where: { sku: { startsWith: "DEMO-" } } })).count
  out.patients = (await prisma.patient.deleteMany({ where: { id: { in: ids } } })).count
  out.cashSessions = (await prisma.cashSession.deleteMany({ where: { notes: { startsWith: "[DEMO]" } } })).count
  out.expenses = (await prisma.expense.deleteMany({ where: { description: { startsWith: "[DEMO]" } } })).count
  out.announcements = (await prisma.announcement.deleteMany({ where: { title: { startsWith: "[DEMO]" } } })).count
  out.templates = (await prisma.doctorTemplate.deleteMany({ where: { name: { startsWith: "[DEMO]" } } })).count
  out.leave = (await prisma.doctorLeave.deleteMany({ where: { reason: { startsWith: "[DEMO]" } } })).count
  out.audit = (await prisma.auditLog.deleteMany({ where: { metadata: { path: ["demo"], equals: true } } })).count
  await prisma.tag.deleteMany({ where: { name: DEMO_TAG } })
  await prisma.tag.deleteMany({ where: { name: { in: EXTRA_TAGS.map((t) => t[0]) }, patients: { none: {} } } })
  console.log("Removed demo rows:", JSON.stringify(out))
}

// ---------------------------------------------------------------- static demo content
type Bg = "A_POS" | "A_NEG" | "B_POS" | "B_NEG" | "AB_POS" | "AB_NEG" | "O_POS" | "O_NEG"
const PEOPLE: { f: string; l: string; g: "MALE" | "FEMALE"; age: number; bg: Bg; city: string; job: string }[] = [
  { f: "Aarav", l: "Nairetti", g: "MALE", age: 34, bg: "O_POS", city: "Bengaluru", job: "Software engineer" },
  { f: "Diya", l: "Venkatan", g: "FEMALE", age: 28, bg: "A_POS", city: "Bengaluru", job: "Designer" },
  { f: "Kabir", l: "Sandhuri", g: "MALE", age: 45, bg: "B_POS", city: "Mysuru", job: "Shop owner" },
  { f: "Meera", l: "Kolhari", g: "FEMALE", age: 7, bg: "AB_POS", city: "Bengaluru", job: "Student" },
  { f: "Rohan", l: "Parekhan", g: "MALE", age: 62, bg: "O_NEG", city: "Bengaluru", job: "Retired teacher" },
  { f: "Ananya", l: "Rajeswar", g: "FEMALE", age: 31, bg: "B_NEG", city: "Tumakuru", job: "Accountant" },
  { f: "Vihaan", l: "Menonan", g: "MALE", age: 3, bg: "A_POS", city: "Bengaluru", job: "" },
  { f: "Ishita", l: "Bhandaran", g: "FEMALE", age: 52, bg: "O_POS", city: "Bengaluru", job: "Homemaker" },
  { f: "Arjun", l: "Talwari", g: "MALE", age: 39, bg: "A_NEG", city: "Hosur", job: "Driver" },
  { f: "Saanvi", l: "Chakrabon", g: "FEMALE", age: 24, bg: "AB_NEG", city: "Bengaluru", job: "Nurse" },
  { f: "Rahul", l: "Iyengaran", g: "MALE", age: 58, bg: "B_POS", city: "Bengaluru", job: "Bank manager" },
  { f: "Priya", l: "Deshpandan", g: "FEMALE", age: 41, bg: "O_POS", city: "Bengaluru", job: "Teacher" },
  { f: "Suresh", l: "Gowdan", g: "MALE", age: 67, bg: "A_POS", city: "Ramanagara", job: "Farmer" },
  { f: "Lakshmi", l: "Narayanan", g: "FEMALE", age: 72, bg: "B_POS", city: "Bengaluru", job: "Retired" },
  { f: "Imran", l: "Sheikhar", g: "MALE", age: 36, bg: "O_POS", city: "Bengaluru", job: "Electrician" },
  { f: "Neha", l: "Kulkarnan", g: "FEMALE", age: 29, bg: "A_POS", city: "Bengaluru", job: "HR executive" },
  { f: "Manoj", l: "Pillaran", g: "MALE", age: 49, bg: "AB_POS", city: "Hosur", job: "Contractor" },
  { f: "Sunita", l: "Rathoran", g: "FEMALE", age: 55, bg: "B_POS", city: "Bengaluru", job: "Tailor" },
  { f: "Karthik", l: "Subramanyan", g: "MALE", age: 44, bg: "O_NEG", city: "Bengaluru", job: "Chartered accountant" },
  { f: "Farah", l: "Qureshan", g: "FEMALE", age: 33, bg: "A_POS", city: "Bengaluru", job: "Pharmacist" },
]

const CLINICAL = [
  { cc: ["Fever", "Body ache"], dx: "Viral fever", icd: "B34.9", S: "Fever for 3 days with body ache, no cough.", O: "Temp 100.4 F, throat mildly congested, chest clear.", A: "Viral fever.", P: "Symptomatic care, fluids, review if fever persists beyond 3 days.", rx: [["Paracetamol 650 mg", "1 tablet", "Thrice daily", "3 days", "After food"], ["ORS sachet", "1 sachet", "As needed", "3 days", "In 1 litre water"]] },
  { cc: ["Chest discomfort"], dx: "Stable angina, to be evaluated", icd: "I20.9", S: "Exertional chest tightness for 2 weeks.", O: "BP 142/90, HR 82, heart sounds normal.", A: "Possible stable angina.", P: "ECG, lipid profile, stress test. Start low-dose aspirin.", rx: [["Aspirin 75 mg", "1 tablet", "Once daily", "30 days", "After lunch"], ["Atorvastatin 10 mg", "1 tablet", "Once daily", "30 days", "At night"]] },
  { cc: ["Knee pain"], dx: "Osteoarthritis of knee", icd: "M17.9", S: "Right knee pain on climbing stairs for 6 months.", O: "Crepitus on movement, mild swelling, no warmth.", A: "Early osteoarthritis.", P: "Physiotherapy, weight reduction, topical analgesic.", rx: [["Diclofenac gel", "Apply locally", "Twice daily", "10 days", "Do not apply on broken skin"]] },
  { cc: ["Cough", "Breathlessness"], dx: "Mild persistent asthma", icd: "J45.30", S: "Night cough and wheeze for 1 month.", O: "Bilateral expiratory wheeze, SpO2 97%.", A: "Mild persistent asthma.", P: "Inhaled controller, avoid triggers, peak-flow diary.", rx: [["Budesonide inhaler 200 mcg", "1 puff", "Twice daily", "30 days", "Rinse mouth after use"], ["Montelukast 10 mg", "1 tablet", "Once daily", "30 days", "At bedtime"]] },
  { cc: ["Fatigue", "Increased thirst"], dx: "Type 2 diabetes mellitus", icd: "E11.9", S: "Fatigue and frequent urination for 2 months.", O: "BMI 29, random sugar 248 mg/dL.", A: "Type 2 diabetes, newly detected.", P: "HbA1c, diet counselling, start metformin, review in 2 weeks.", rx: [["Metformin 500 mg", "1 tablet", "Twice daily", "30 days", "With meals"]] },
  { cc: ["Headache"], dx: "Tension-type headache", icd: "G44.2", S: "Frontal headache in evenings for 2 weeks.", O: "Neurologically normal, BP 118/76.", A: "Tension headache.", P: "Sleep hygiene, screen breaks, analgesic as needed.", rx: [["Paracetamol 500 mg", "1 tablet", "As needed", "5 days", "Max 3 per day"]] },
  { cc: ["Skin rash"], dx: "Allergic dermatitis", icd: "L23.9", S: "Itchy rash on forearms for 4 days.", O: "Erythematous patches, no vesicles.", A: "Contact allergic dermatitis.", P: "Avoid trigger, emollient, antihistamine.", rx: [["Cetirizine 10 mg", "1 tablet", "Once daily", "5 days", "At night"], ["Calamine lotion", "Apply locally", "Twice daily", "7 days", ""]] },
  { cc: ["Abdominal pain", "Acidity"], dx: "Gastritis", icd: "K29.70", S: "Burning epigastric pain after meals for 10 days.", O: "Mild epigastric tenderness.", A: "Gastritis.", P: "Dietary advice, PPI for 2 weeks.", rx: [["Pantoprazole 40 mg", "1 tablet", "Once daily", "14 days", "Before breakfast"]] },
  { cc: ["Back pain"], dx: "Lumbar strain", icd: "S39.012A", S: "Low back pain after lifting, 5 days.", O: "Paraspinal spasm, SLR negative.", A: "Mechanical lumbar strain.", P: "Rest, hot compress, gradual stretching.", rx: [["Thiocolchicoside 4 mg", "1 capsule", "Twice daily", "5 days", "After food"]] },
  { cc: ["Annual health check"], dx: "Hypertension, controlled", icd: "I10", S: "Routine review, no complaints.", O: "BP 126/82, weight stable.", A: "Hypertension, controlled on treatment.", P: "Continue medication, repeat labs in 6 months.", rx: [["Amlodipine 5 mg", "1 tablet", "Once daily", "60 days", "Morning"]] },
] as const

const LAB_PANELS: { title: string; items: [string, string, string, string, "NORMAL" | "LOW" | "HIGH" | "CRITICAL"][] }[] = [
  { title: "Complete blood count", items: [["Haemoglobin", "12.1", "g/dL", "12.0 - 15.5", "NORMAL"], ["WBC", "11.8", "x10^3/uL", "4.0 - 11.0", "HIGH"], ["Platelets", "231", "x10^3/uL", "150 - 410", "NORMAL"]] },
  { title: "Lipid profile", items: [["Total cholesterol", "238", "mg/dL", "< 200", "HIGH"], ["LDL", "158", "mg/dL", "< 100", "HIGH"], ["HDL", "41", "mg/dL", "> 40", "NORMAL"], ["Triglycerides", "198", "mg/dL", "< 150", "HIGH"]] },
  { title: "HbA1c and fasting glucose", items: [["HbA1c", "8.4", "%", "< 5.7", "HIGH"], ["Fasting glucose", "162", "mg/dL", "70 - 99", "HIGH"]] },
  { title: "Thyroid profile", items: [["TSH", "0.2", "uIU/mL", "0.4 - 4.0", "LOW"], ["Free T4", "2.1", "ng/dL", "0.8 - 1.8", "HIGH"]] },
  { title: "Serum potassium", items: [["Potassium", "6.6", "mmol/L", "3.5 - 5.1", "CRITICAL"]] },
]

const EXTRAS = [{ d: "Complete blood count (lab)", p: 350, t: 5 }, { d: "ECG", p: 400, t: 0 }, { d: "Minor dressing / procedure", p: 250, t: 5 }, { d: "Ultrasound abdomen", p: 900, t: 5 }, { d: "Lipid profile (lab)", p: 550, t: 5 }]

const INVENTORY: { name: string; cat: string; mfr: string; unit: string; ref: number; price: number; outs: number[]; adj?: number; note?: string }[] = [
  { name: "Paracetamol 650 mg tablets", cat: "Medicine", mfr: "Demo Pharma Ltd", unit: "Strip", ref: 200, price: 28, outs: [20, 15, 12] },
  { name: "Amoxicillin 500 mg capsules", cat: "Medicine", mfr: "Demo Pharma Ltd", unit: "Strip", ref: 120, price: 96, outs: [18, 10] },
  { name: "Metformin 500 mg tablets", cat: "Medicine", mfr: "Sample Remedies", unit: "Strip", ref: 100, price: 34, outs: [60, 30] },
  { name: "Pantoprazole 40 mg tablets", cat: "Medicine", mfr: "Sample Remedies", unit: "Strip", ref: 80, price: 72, outs: [30, 25, 20] },
  { name: "Insulin glargine pen", cat: "Medicine", mfr: "Demo Biologics", unit: "Pen", ref: 40, price: 640, outs: [30, 6], note: "Batch DM-2210, expires in 24 days" },
  { name: "Disposable syringe 5 ml", cat: "Consumable", mfr: "Sample MedSupplies", unit: "Box", ref: 60, price: 180, outs: [10, 8] },
  { name: "Surgical gloves (medium)", cat: "Consumable", mfr: "Sample MedSupplies", unit: "Box", ref: 50, price: 320, outs: [20, 18, 9] },
  { name: "Povidone iodine 5% solution", cat: "Medicine", mfr: "Demo Pharma Ltd", unit: "Bottle", ref: 30, price: 85, outs: [12, 7], note: "Batch DM-1987, expires in 12 days" },
  { name: "ECG electrodes", cat: "Consumable", mfr: "Sample MedSupplies", unit: "Pack", ref: 25, price: 210, outs: [25], adj: 0 },
  { name: "Digital thermometer", cat: "Equipment", mfr: "Sample MedSupplies", unit: "Unit", ref: 15, price: 260, outs: [3] },
]

// ---------------------------------------------------------------- main
async function main() {
  await cleanup()
  if (RESET_ONLY) return

  const admin0 = await prisma.user.findFirst({ where: { role: "ADMIN", active: true }, orderBy: { createdAt: "asc" } })
  const reception0 = await prisma.user.findFirst({ where: { role: "RECEPTIONIST", active: true } })
  const billing0 = await prisma.user.findFirst({ where: { role: "BILLING", active: true } })
  const doctors = await prisma.user.findMany({ where: { role: "DOCTOR", active: true }, orderBy: { createdAt: "asc" } })
  const allServices = await prisma.service.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } })
  if (!admin0 || !reception0 || !billing0 || !doctors.length || !allServices.length) throw new Error("Run `npm run db:seed` first (staff, doctors and services are missing).")
  const admin = admin0, reception = reception0, billing = billing0
  const consults = allServices.filter((s) => !s.slug.startsWith("pkg-"))
  const packages = allServices.filter((s) => s.slug.startsWith("pkg-"))
  const doc = (i: number) => doctors[i % doctors.length]
  const svc = (i: number) => (i % 7 === 6 && packages.length ? packages[i % packages.length] : consults[i % consults.length])
  const feeFor = (s: { price: unknown }, d: { consultationFee: unknown }, i: number) => Number(s.price ?? d.consultationFee ?? 500 + (i % 4) * 100)

  // ---- tags
  const demoTag = await prisma.tag.create({ data: { name: DEMO_TAG, color: "#94a3b8" } })
  const extraTags: Record<string, string> = {}
  for (const [name, color] of EXTRA_TAGS) {
    const t = await prisma.tag.upsert({ where: { name }, create: { name, color }, update: {} })
    extraTags[name] = t.id
  }

  // ---- patients (0-9 new this month, 10-19 returning)
  const pid: string[] = []
  for (const [i, p] of PEOPLE.entries()) {
    const isNew = i < 10
    const created = isNew ? at(-(i * 2 + (i === 0 ? 0 : 1)), 9 + (i % 6)) : at(-(45 + i * 9), 11)
    const uhid = await generateUHID(prisma)
    const patient = await prisma.patient.create({
      data: {
        uhid, firstName: p.f, lastName: p.l, gender: p.g, bloodGroup: p.bg, occupation: p.job || null,
        dob: at(-Math.round(p.age * 365.25 + 40), 0), phone: phone(i), alternatePhone: i % 4 === 0 ? phone(50 + i) : null,
        email: `${p.f.toLowerCase()}.${p.l.toLowerCase()}@demo.invalid`,
        addressLine1: `${10 + i * 3}, Demo Street, Sample Layout`, city: p.city, state: "Karnataka", postalCode: `5600${String(10 + i).padStart(2, "0")}`,
        status: i === 17 ? "INACTIVE" : "ACTIVE", notesSummary: "Synthetic demo record. Safe to delete.",
        source: i % 3 === 1 ? "WEBSITE" : "CRM", registeredById: i % 3 === 1 ? null : reception.id, createdAt: created,
        registrationStatus: i === 9 ? "SUBMITTED" : "CONFIRMED",
        tags: { create: [{ tagId: demoTag.id }, ...(p.age >= 60 ? [{ tagId: extraTags["Senior citizen"] }] : []), ...(i % 5 === 4 ? [{ tagId: extraTags["Diabetic"] }] : []), ...(i % 5 === 0 && p.age > 40 ? [{ tagId: extraTags["Hypertensive"] }] : []), ...(i % 6 === 2 ? [{ tagId: extraTags["Follow-up needed"] }] : [])] },
        communicationPreference: { create: { preferredChannel: (["SMS", "WHATSAPP", "EMAIL", "CALL"] as const)[i % 4], allowEmail: i % 5 !== 3, allowMarketing: i % 4 === 0, preferredLanguage: (["English", "Kannada", "Hindi", "Tamil"])[i % 4] } },
        emergencyContacts: i % 3 !== 2 ? { create: [{ name: `${p.f === "Aarav" ? "Nisha" : "Demo"} ${p.l}`, relation: p.age < 18 ? "Parent" : "Spouse", phone: phone(60 + i), address: `${p.city}, Karnataka` }] } : undefined,
      },
    })
    pid.push(patient.id)
  }

  // family links, insurance, alerts, allergies, chronic diseases, documents
  await prisma.familyMember.createMany({ data: [
    { patientId: pid[1], relatedPatientId: pid[0], name: "Aarav Nairetti", relation: "Spouse", phone: phone(0), isEmergencyContact: true },
    { patientId: pid[0], relatedPatientId: pid[1], name: "Diya Venkatan", relation: "Spouse", phone: phone(1), isEmergencyContact: true },
    { patientId: pid[3], relatedPatientId: pid[2], name: "Kabir Sandhuri", relation: "Father", phone: phone(2), isEmergencyContact: true },
    { patientId: pid[2], relatedPatientId: pid[3], name: "Meera Kolhari", relation: "Daughter", dob: at(-2700, 0) },
    { patientId: pid[6], relatedPatientId: pid[5], name: "Ananya Rajeswar", relation: "Mother", phone: phone(5), isEmergencyContact: true },
    { patientId: pid[12], name: "Gowdan family member", relation: "Son", phone: phone(70), isEmergencyContact: true },
    { patientId: pid[13], relatedPatientId: pid[12], name: "Suresh Gowdan", relation: "Brother", phone: phone(12) },
  ] })
  const ins = await Promise.all([0, 2, 4, 7, 10, 11, 13, 18].map((pi, k) => prisma.insurance.create({ data: {
    patientId: pid[pi], provider: (["Demo Health Assurance", "Sample Mediclaim Co", "Placeholder General Insurance"])[k % 3], policyNumber: `DEMO-POL-${1000 + k}`,
    planName: (["Family Floater 5L", "Individual Gold 3L", "Senior Care 10L"])[k % 3], coverageAmount: [500000, 300000, 1000000][k % 3],
    validFrom: at(-200, 0), validTo: at(165 + k * 20, 0), isPrimary: true, status: k === 5 ? "EXPIRED" : "ACTIVE" } })))
  await prisma.medicalAlert.createMany({ data: [
    { patientId: pid[4], type: "CONDITION", severity: "HIGH", description: "Cardiac patient: avoid NSAIDs without physician review." },
    { patientId: pid[12], type: "DEVICE", severity: "MEDIUM", description: "Pacemaker fitted (demo)." },
    { patientId: pid[7], type: "ALLERGY", severity: "CRITICAL", description: "Anaphylaxis to penicillin." },
    { patientId: pid[3], type: "OTHER", severity: "LOW", description: "Needs a guardian present for consultations." },
    { patientId: pid[13], type: "BEHAVIORAL", severity: "LOW", description: "Hard of hearing: speak clearly, face the patient." },
    { patientId: pid[10], type: "CONDITION", severity: "MEDIUM", description: "Type 2 diabetes on insulin: check sugar before procedures." },
  ] })
  await prisma.allergy.createMany({ data: [
    { patientId: pid[7], allergen: "Penicillin", reaction: "Anaphylaxis", severity: "CRITICAL" },
    { patientId: pid[0], allergen: "Peanuts", reaction: "Hives", severity: "MEDIUM" },
    { patientId: pid[2], allergen: "Dust mites", reaction: "Sneezing, watery eyes", severity: "LOW" },
    { patientId: pid[11], allergen: "Sulfa drugs", reaction: "Skin rash", severity: "HIGH" },
    { patientId: pid[14], allergen: "Latex", reaction: "Contact dermatitis", severity: "MEDIUM" },
    { patientId: pid[16], allergen: "Shellfish", reaction: "Swelling of lips", severity: "HIGH" },
    { patientId: pid[19], allergen: "Ibuprofen", reaction: "Wheezing", severity: "HIGH" },
    { patientId: pid[5], allergen: "Pollen", reaction: "Seasonal rhinitis", severity: "LOW" },
  ] })
  await prisma.chronicDisease.createMany({ data: [
    { patientId: pid[10], name: "Type 2 diabetes mellitus", diagnosedOn: at(-2200, 0), status: "ACTIVE", notes: "On insulin glargine and metformin." },
    { patientId: pid[12], name: "Coronary artery disease", diagnosedOn: at(-1500, 0), status: "MANAGED" },
    { patientId: pid[13], name: "Hypertension", diagnosedOn: at(-3000, 0), status: "MANAGED" },
    { patientId: pid[4], name: "Chronic kidney disease stage 2", diagnosedOn: at(-900, 0), status: "ACTIVE" },
    { patientId: pid[11], name: "Hypothyroidism", diagnosedOn: at(-1200, 0), status: "MANAGED" },
    { patientId: pid[3], name: "Childhood asthma", diagnosedOn: at(-1100, 0), status: "ACTIVE" },
    { patientId: pid[16], name: "Gout", diagnosedOn: at(-700, 0), status: "ACTIVE" },
    { patientId: pid[18], name: "Gestational diabetes", diagnosedOn: at(-3000, 0), status: "RESOLVED" },
  ] })
  await prisma.document.createMany({ data: ([
    { patientId: pid[0], title: "Aadhaar copy (sample)", category: "ID_PROOF", fileType: "pdf" },
    { patientId: pid[2], title: "Insurance card (sample)", category: "INSURANCE", fileType: "jpg" },
    { patientId: pid[10], title: "HbA1c report (sample)", category: "LAB_REPORT", fileType: "pdf" },
    { patientId: pid[10], title: "Previous prescription (sample)", category: "PRESCRIPTION", fileType: "pdf" },
    { patientId: pid[12], title: "Consent for procedure (sample)", category: "CONSENT_FORM", fileType: "pdf" },
    { patientId: pid[13], title: "Lipid profile (sample)", category: "LAB_REPORT", fileType: "pdf" },
    { patientId: pid[4], title: "Discharge summary (sample)", category: "OTHER", fileType: "pdf" },
    { patientId: pid[7], title: "Allergy card (sample)", category: "OTHER", fileType: "png" },
    { patientId: pid[11], title: "Voter ID (sample)", category: "ID_PROOF", fileType: "jpg" },
    { patientId: pid[18], title: "ECG tracing (sample)", category: "LAB_REPORT", fileType: "pdf" },
  ] as { patientId: string; title: string; category: "ID_PROOF" | "INSURANCE" | "LAB_REPORT" | "PRESCRIPTION" | "CONSENT_FORM" | "OTHER"; fileType: string }[]).map((d, i) => ({ ...d, fileUrl: `https://demo.invalid/documents/sample-${i + 1}.${d.fileType}`, uploadedById: reception.id })) })

  // ---- appointments
  type Appt = { id: string; patient: number; doctor: number; svc: number; at: Date; status: string }
  const appts: Appt[] = []
  async function appt(patient: number, doctor: number, s: number, when: Date, status: "PENDING" | "CONFIRMED" | "ARRIVED" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "RESCHEDULED", opts: { source?: "WEBSITE" | "CRM" | "PHONE"; type?: "IN_PERSON" | "WALK_IN"; reason?: string; cancelReason?: string } = {}) {
    const now = new Date()
    const code = await generateAppointmentCode(prisma)
    const sv = svc(s)
    const dur = sv.durationMinutes || 30
    const a = await prisma.appointment.create({ data: {
      appointmentCode: code, patientId: pid[patient], doctorId: doc(doctor).id, serviceId: sv.id, scheduledAt: when, durationMinutes: dur,
      type: opts.type ?? "IN_PERSON", status, source: opts.source ?? "CRM", reason: opts.reason ?? CLINICAL[patient % 10].cc.join(", "),
      createdById: opts.source === "WEBSITE" ? null : reception.id, createdAt: addMin(when, -60 * 24 * 2),
      cancelReason: status === "CANCELLED" ? opts.cancelReason ?? "Patient unavailable" : null, cancelledAt: status === "CANCELLED" ? addMin(when, -180) : null,
      checkedInAt: ["ARRIVED", "IN_CONSULTATION", "COMPLETED"].includes(status) ? new Date(Math.min(addMin(when, -10).getTime(), now.getTime() - 300000)) : null,
      startedAt: ["IN_CONSULTATION", "COMPLETED"].includes(status) ? new Date(Math.min(addMin(when, 5).getTime(), now.getTime() - 120000)) : null,
      completedAt: status === "COMPLETED" ? new Date(Math.min(addMin(when, dur).getTime(), now.getTime() - 60000)) : null,
    } })
    appts.push({ id: a.id, patient, doctor, svc: s, at: when, status })
    return a
  }
  // today's schedule
  const T = {
    pend1: await appt(0, 0, 0, at(0, 16, 30), "PENDING"),
    pend2: await appt(1, 1, 1, at(0, 17, 0), "PENDING", { source: "WEBSITE" }),
    conf1: await appt(2, 2, 2, at(0, 15, 0), "CONFIRMED"),
    conf2: await appt(3, 3, 3, at(0, 15, 30), "CONFIRMED", { source: "PHONE" }),
    arr1: await appt(10, 0, 4, at(0, 10, 0), "ARRIVED"),
    arr2: await appt(11, 1, 5, at(0, 10, 30), "ARRIVED", { type: "WALK_IN" }),
    arr3: await appt(4, 2, 6, at(0, 11, 0), "ARRIVED", { type: "WALK_IN", source: "CRM" }),
    inc: await appt(12, 0, 0, at(0, 9, 30), "IN_CONSULTATION"),
    done1: await appt(13, 1, 1, at(0, 9, 0), "COMPLETED"),
    done2: await appt(14, 2, 2, at(0, 9, 15), "COMPLETED"),
    canc: await appt(15, 3, 3, at(0, 14, 0), "CANCELLED", { cancelReason: "Patient called to cancel" }),
    nosh: await appt(16, 0, 4, at(0, 8, 30), "NO_SHOW"),
  }
  // past completed (index k -> patient 10+k) used for encounters and bills
  const past: Awaited<ReturnType<typeof appt>>[] = []
  const pastDays = [-1, -3, -5, -8, -11, -14, -17, -21, -25, -28]
  for (let k = 0; k < 10; k++) past.push(await appt(10 + k, k, k + 2, at(pastDays[k], 10 + (k % 5)), "COMPLETED", { source: k % 3 === 0 ? "WEBSITE" : "CRM" }))
  await appt(5, 1, 1, at(-6, 12), "CANCELLED", { cancelReason: "Travelling" })
  await appt(6, 2, 2, at(-9, 11), "NO_SHOW")
  await appt(7, 3, 3, at(-4, 15), "RESCHEDULED")
  // upcoming: 5 website requests (pending) + 5 confirmed
  for (const [k, pi] of [5, 6, 7, 8, 9].entries()) await appt(pi, k, k + 1, at(k + 1, 10 + k), "PENDING", { source: "WEBSITE", reason: ["Skin allergy", "Child vaccination review", "Joint pain", "Blood pressure check", "Back pain"][k] })
  for (const [k, pi] of [17, 18, 19, 0, 1].entries()) await appt(pi, k + 2, k, at(k + 2, 11 + k), "CONFIRMED", { source: k % 2 ? "PHONE" : "CRM" })
  const ap = (a: { id: string }) => a.id

  // ---- queue sanity: today's active ones are ARRIVED/IN_CONSULTATION above

  // ---- EMR: encounters for past completed, today's completed, today's in-consultation (draft)
  const encSpecs: { a: { id: string; scheduledAt: Date }; patient: number; doctor: number; clin: number; draft?: boolean }[] = [
    ...past.map((a, k) => ({ a, patient: 10 + k, doctor: k, clin: k })),
    { a: T.done1, patient: 13, doctor: 1, clin: 9 },
    { a: T.done2, patient: 14, doctor: 2, clin: 7 },
    { a: T.inc, patient: 12, doctor: 0, clin: 1, draft: true },
  ]
  const encIds: string[] = []
  for (const [k, e] of encSpecs.entries()) {
    const c = CLINICAL[e.clin]
    const h = 150 + ((k * 7) % 35), w = 52 + ((k * 9) % 35)
    const status = e.draft ? "DRAFT" : "FINALIZED"
    const enc = await prisma.encounter.create({ data: {
      patientId: pid[e.patient], doctorId: doc(e.doctor).id, appointmentId: e.a.id, encounterDate: e.a.scheduledAt, chiefComplaints: [...c.cc], status,
      signedAt: e.draft ? null : addMin(e.a.scheduledAt, 35), createdAt: e.a.scheduledAt,
      vitals: { create: { patientId: pid[e.patient], heightCm: h, weightKg: w, bmi: r2(w / ((h / 100) ** 2)), temperatureC: c.cc[0] === "Fever" ? 38.1 : 36.8, pulseBpm: 68 + ((k * 5) % 25), bpSystolic: 112 + ((k * 6) % 32), bpDiastolic: 72 + ((k * 3) % 18), spo2: 96 + (k % 4), recordedAt: addMin(e.a.scheduledAt, 2) } },
      diagnoses: e.draft ? undefined : { create: [{ patientId: pid[e.patient], description: c.dx, icdCode: c.icd, type: "PRIMARY" }, ...(k % 3 === 0 ? [{ patientId: pid[e.patient], description: "Vitamin D deficiency", icdCode: "E55.9", type: "SECONDARY" as const }] : [])] },
    } })
    encIds.push(enc.id)
    if (e.draft) continue
    const note = await prisma.clinicalNote.create({ data: {
      encounterId: enc.id, patientId: pid[e.patient], doctorId: doc(e.doctor).id, subjective: c.S, objective: c.O, assessment: c.A, plan: c.P,
      status: "SIGNED", version: 2, signedAt: addMin(e.a.scheduledAt, 35), createdAt: e.a.scheduledAt } })
    await prisma.clinicalNoteVersion.create({ data: { clinicalNoteId: note.id, versionNumber: 1, subjective: c.S, objective: c.O, assessment: c.A, plan: "Plan to be finalised after tests.", savedAt: addMin(e.a.scheduledAt, 20) } })
    await prisma.prescription.create({ data: {
      patientId: pid[e.patient], doctorId: doc(e.doctor).id, appointmentId: e.a.id, encounterId: enc.id, diagnosis: c.dx, notes: "Review after the course or earlier if symptoms worsen.", issuedAt: addMin(e.a.scheduledAt, 35),
      items: { create: c.rx.map(([medicineName, dosage, frequency, duration, instructions]) => ({ medicineName, dosage, frequency, duration, instructions: instructions || null })) } } })
  }
  // lab + radiology reports
  for (const [k, panel] of LAB_PANELS.entries()) {
    await prisma.clinicalReport.create({ data: {
      patientId: pid[10 + k], doctorId: doc(k).id, encounterId: encIds[k], type: "LAB", title: panel.title, modality: "Laboratory", status: "COMPLETED", reportDate: addMin(encSpecs[k].a.scheduledAt, 300),
      impression: panel.items.some((i) => i[4] !== "NORMAL") ? "Abnormal values flagged, clinical correlation advised." : "Within normal limits.",
      labResults: { create: panel.items.map(([testName, value, unit, referenceRange, flag]) => ({ testName, value, unit, referenceRange, flag })) } } })
  }
  await prisma.clinicalReport.createMany({ data: [
    { patientId: pid[12], doctorId: doc(0).id, type: "RADIOLOGY", title: "Chest X-ray PA view", modality: "X-ray", status: "COMPLETED", findings: "Lung fields clear. Cardiac silhouette within normal limits.", impression: "No acute abnormality.", reportDate: at(-2, 16) },
    { patientId: pid[15], doctorId: doc(3).id, type: "RADIOLOGY", title: "Ultrasound abdomen", modality: "Ultrasound", status: "PENDING", reportDate: at(0, 8) },
    { patientId: pid[17], doctorId: doc(1).id, type: "LAB", title: "Urine routine", modality: "Laboratory", status: "PENDING", reportDate: at(0, 9) },
  ] })
  await prisma.referralNote.createMany({ data: [
    { patientId: pid[12], fromDoctorId: doc(0).id, toDoctor: "Demo Cardiac Centre", toSpecialty: "Cardiology", reason: "Evaluation for stress test", urgency: "URGENT", signedAt: at(-2, 12), notes: "ECG shows ST changes." },
    { patientId: pid[13], fromDoctorId: doc(1).id, toDoctor: "Sample Eye Clinic", toSpecialty: "Ophthalmology", reason: "Diabetic eye screening", urgency: "ROUTINE", signedAt: at(-5, 12) },
    { patientId: pid[16], fromDoctorId: doc(2).id, toDoctor: "Placeholder Orthopaedics", toSpecialty: "Orthopaedics", reason: "Persistent knee pain", urgency: "ROUTINE" },
    { patientId: pid[18], fromDoctorId: doc(3).id, toDoctor: "Demo Nephrology Unit", toSpecialty: "Nephrology", reason: "Raised creatinine on screening", urgency: "URGENT", signedAt: at(-1, 14) },
  ] })
  await prisma.certificate.createMany({ data: [
    { patientId: pid[10], doctorId: doc(0).id, type: "SICK_LEAVE", title: "Sick leave certificate", content: "The patient was examined and advised rest for 3 days.", validFrom: at(-1, 0), validTo: at(2, 0), signedAt: at(-1, 11) },
    { patientId: pid[14], doctorId: doc(2).id, type: "FITNESS", title: "Fitness certificate", content: "The patient is medically fit to resume normal work.", validFrom: at(-3, 0), validTo: at(27, 0), signedAt: at(-3, 12) },
    { patientId: pid[15], doctorId: doc(3).id, type: "MEDICAL", title: "Medical certificate", content: "The patient is under treatment at this hospital (demo text).", validFrom: at(-5, 0), signedAt: at(-5, 13) },
    { patientId: pid[19], doctorId: doc(1).id, type: "OTHER", title: "Travel advisory letter", content: "Patient advised to carry medication in hand baggage (demo text).", validFrom: at(0, 0) },
  ] })
  await prisma.medicalHistory.createMany({ data: [
    { patientId: pid[10], description: "Dengue fever", occurredOn: at(-1400, 0), notes: "Recovered without complications." },
    { patientId: pid[12], description: "Myocardial infarction", occurredOn: at(-1500, 0) },
    { patientId: pid[13], description: "Typhoid", occurredOn: at(-2800, 0) },
    { patientId: pid[14], description: "Jaundice", occurredOn: at(-1900, 0) },
    { patientId: pid[11], description: "Thyroidectomy workup", occurredOn: at(-1300, 0) },
    { patientId: pid[4], description: "Kidney stone", occurredOn: at(-800, 0) },
  ] })
  await prisma.familyHistoryEntry.createMany({ data: [
    { patientId: pid[10], relation: "Father", condition: "Type 2 diabetes" },
    { patientId: pid[10], relation: "Mother", condition: "Hypertension" },
    { patientId: pid[12], relation: "Father", condition: "Heart disease", notes: "Died at 68." },
    { patientId: pid[11], relation: "Sister", condition: "Hypothyroidism" },
    { patientId: pid[16], relation: "Brother", condition: "Gout" },
    { patientId: pid[0], relation: "Mother", condition: "Asthma" },
  ] })
  await prisma.surgicalHistory.createMany({ data: [
    { patientId: pid[12], procedure: "Coronary angioplasty with stent", surgeryDate: at(-1490, 0), surgeon: "Dr. Sample Surgeon", hospital: "Demo Heart Institute" },
    { patientId: pid[13], procedure: "Cataract surgery (left eye)", surgeryDate: at(-600, 0), surgeon: "Dr. Placeholder", hospital: "Sample Eye Clinic" },
    { patientId: pid[18], procedure: "Appendicectomy", surgeryDate: at(-3650, 0), hospital: "Demo General Hospital" },
    { patientId: pid[4], procedure: "Lithotripsy", surgeryDate: at(-780, 0), hospital: "Demo Urology Centre" },
  ] })
  await prisma.currentMedication.createMany({ data: [
    { patientId: pid[10], medicineName: "Metformin 500 mg", dosage: "1 tablet", frequency: "Twice daily", startDate: at(-2100, 0), prescribedBy: doc(0).name },
    { patientId: pid[10], medicineName: "Insulin glargine", dosage: "20 units", frequency: "At bedtime", startDate: at(-600, 0), prescribedBy: doc(0).name },
    { patientId: pid[12], medicineName: "Aspirin 75 mg", dosage: "1 tablet", frequency: "Once daily", startDate: at(-1490, 0), prescribedBy: doc(1).name },
    { patientId: pid[13], medicineName: "Amlodipine 5 mg", dosage: "1 tablet", frequency: "Once daily", startDate: at(-2900, 0), prescribedBy: doc(1).name },
    { patientId: pid[11], medicineName: "Levothyroxine 50 mcg", dosage: "1 tablet", frequency: "Morning, empty stomach", startDate: at(-1200, 0), prescribedBy: doc(2).name },
    { patientId: pid[16], medicineName: "Allopurinol 100 mg", dosage: "1 tablet", frequency: "Once daily", startDate: at(-400, 0), endDate: at(-30, 0), status: "STOPPED", prescribedBy: doc(2).name },
  ] })
  const kinds = ["SOAP", "PRESCRIPTION", "CERTIFICATE"] as const
  for (const [k, d] of doctors.slice(0, 6).entries()) {
    await prisma.doctorTemplate.create({ data: { doctorId: d.id, name: "[DEMO] Routine review (SOAP)", type: "SOAP", subjective: "Patient reports ...", objective: "Vitals stable. Examination ...", assessment: "Stable.", plan: "Continue current plan. Review in 4 weeks." } })
    if (k < 3) await prisma.doctorTemplate.create({ data: { doctorId: d.id, name: `[DEMO] Standard ${kinds[1 + (k % 2)].toLowerCase()} template`, type: kinds[1 + (k % 2)], content: "Demo template content: edit before use." } })
  }
  for (const [k, d] of doctors.slice(0, 4).entries()) await prisma.doctorLeave.create({ data: { doctorId: d.id, date: at(3 + k * 4, 0), reason: ["[DEMO] Conference", "[DEMO] Personal leave", "[DEMO] Training", "[DEMO] Family event"][k] } })
  await prisma.announcement.createMany({ data: [
    { title: "[DEMO] OPD timings extended on Saturdays", body: "Demo announcement: OPD runs until 8 PM this Saturday." },
    { title: "[DEMO] Free BP check camp", body: "Demo announcement: free blood pressure screening next week." },
    { title: "[DEMO] Pharmacy maintenance notice", body: "Demo announcement: stock audit on Sunday.", active: false },
  ] })

  // ---- billing
  type BillSpec = { k: string; patient: number; doctor: number; svc: number; appt?: { id: string; scheduledAt?: Date }; when: Date; extras: number[]; discount?: number; pay: { method: "CASH" | "CARD" | "UPI" | "NET_BANKING" | "INSURANCE" | "ADVANCE"; frac: number }[]; status?: "CANCELLED"; insurance?: boolean }
  const specs: BillSpec[] = [
    { k: "p0", patient: 10, doctor: 0, svc: 2, appt: past[0], when: at(pastDays[0], 11), extras: [0], pay: [{ method: "CASH", frac: 1 }] },
    { k: "p1", patient: 11, doctor: 1, svc: 3, appt: past[1], when: at(pastDays[1], 12), extras: [1], pay: [{ method: "UPI", frac: 1 }] },
    { k: "p2", patient: 12, doctor: 2, svc: 4, appt: past[2], when: at(pastDays[2], 13), extras: [3], pay: [{ method: "CARD", frac: 1 }] },
    { k: "p3", patient: 13, doctor: 3, svc: 5, appt: past[3], when: at(pastDays[3], 12), extras: [], pay: [{ method: "INSURANCE", frac: 1 }], insurance: true },
    { k: "p4", patient: 14, doctor: 4, svc: 6, appt: past[4], when: at(pastDays[4], 13), extras: [2, 4], discount: 100, pay: [{ method: "NET_BANKING", frac: 1 }] },
    { k: "p5", patient: 15, doctor: 5, svc: 7, appt: past[5], when: at(pastDays[5], 14), extras: [0, 1], pay: [{ method: "ADVANCE", frac: 0.25 }, { method: "UPI", frac: 0.35 }] },
    { k: "p6", patient: 16, doctor: 6, svc: 8, appt: past[6], when: at(pastDays[6], 15), extras: [3], pay: [] },
    { k: "p7", patient: 17, doctor: 7, svc: 9, appt: past[7], when: at(pastDays[7], 12), extras: [0], pay: [{ method: "CASH", frac: 1 }] },
    { k: "p8", patient: 18, doctor: 8, svc: 10, appt: past[8], when: at(pastDays[8], 11), extras: [1], pay: [{ method: "UPI", frac: 1 }] },
    { k: "p9", patient: 19, doctor: 9, svc: 11, appt: past[9], when: at(pastDays[9], 11), extras: [], pay: [], status: "CANCELLED" },
    { k: "t7", patient: 13, doctor: 1, svc: 1, appt: T.done1, when: at(0, 9, 45), extras: [1], pay: [{ method: "CASH", frac: 1 }] },
    { k: "t8", patient: 14, doctor: 2, svc: 2, appt: T.done2, when: at(0, 9, 50), extras: [0], pay: [{ method: "UPI", frac: 1 }] },
    { k: "t6", patient: 12, doctor: 0, svc: 0, appt: T.inc, when: at(0, 10, 15), extras: [], pay: [] },
    { k: "x1", patient: 2, doctor: 2, svc: 1, when: at(-2, 15), extras: [4], pay: [{ method: "CARD", frac: 1 }] },
    { k: "x2", patient: 8, doctor: 3, svc: 3, when: at(-7, 16), extras: [2], pay: [{ method: "CASH", frac: 1 }] },
    { k: "x3", patient: 4, doctor: 1, svc: 6, when: at(-19, 10), extras: [1, 3], pay: [{ method: "UPI", frac: 0.5 }] },
  ]
  // cash sessions: closed for days -3..-1 and an open one today (cash payments are linked by paid date)
  const cashDays = [-3, -2, -1, 0]
  const sessions: { day: number; id: string }[] = []
  for (const d of cashDays) {
    const s = await prisma.cashSession.create({ data: {
      openedById: d === 0 ? billing.id : reception.id, openingBalance: 2000, status: "OPEN", openedAt: at(d, 8, 30), notes: "[DEMO] Counter session" } })
    sessions.push({ day: d, id: s.id })
  }
  const sessionFor = (paid: Date) => sessions.find((s) => s.day === Math.floor((paid.getTime() - at(0, 0).getTime()) / 86400000))?.id
  const bills: Record<string, { id: string; net: number; paid: number; patient: number; payId?: string; payMethod?: string; when: Date }> = {}
  const payRows: { id: string; amount: number; method: string; patient: number }[] = []
  for (const s of specs) {
    const sv = svc(s.svc)
    const main = feeFor(sv, doc(s.doctor), s.svc)
    const lines = [{ description: sv.name, quantity: 1, unitPrice: main, taxRatePercent: 0 }, ...s.extras.map((x) => ({ description: EXTRAS[x].d, quantity: 1, unitPrice: EXTRAS[x].p, taxRatePercent: EXTRAS[x].t }))]
    const items = lines.map((l) => { const amount = r2(l.quantity * l.unitPrice); return { ...l, amount, taxAmount: r2(amount * l.taxRatePercent / 100) } })
    const total = r2(items.reduce((a, i) => a + i.amount, 0))
    const tax = r2(items.reduce((a, i) => a + i.taxAmount, 0))
    const discount = s.discount ?? 0
    const net = r2(total + tax - discount)
    const cancelled = s.status === "CANCELLED"
    const payPlan = s.pay.map((p) => ({ ...p, amount: r2(Math.min(net * p.frac, net)) }))
    const paid = r2(payPlan.reduce((a, p) => a + p.amount, 0))
    const status = cancelled ? "CANCELLED" : paid <= 0 ? "PENDING" : paid >= net - 0.01 ? "PAID" : "PARTIALLY_PAID"
    const bill = await prisma.bill.create({ data: {
      billNumber: await generateBillNumber(prisma), patientId: pid[s.patient], appointmentId: s.appt?.id, serviceId: sv.id,
      insuranceId: s.insurance ? (await prisma.insurance.findFirst({ where: { patientId: pid[s.patient] } }))?.id : undefined,
      totalAmount: total, discountAmount: discount, taxAmount: tax, netAmount: net, amountPaid: paid, balanceDue: cancelled ? 0 : r2(net - paid), status,
      issuedAt: s.when, cancelledAt: cancelled ? addMin(s.when, 45) : null, items: { create: items } } })
    bills[s.k] = { id: bill.id, net, paid, patient: s.patient, when: s.when }
    for (const [pi, p] of payPlan.entries()) {
      const paidAt = addMin(s.when, 20 + pi * 15)
      const pay = await prisma.payment.create({ data: {
        receiptNumber: await generateReceiptNumber(prisma), patientId: pid[s.patient], billId: bill.id, amount: p.amount, method: p.method,
        referenceNumber: p.method === "UPI" ? `UPI${String(900000 + payRows.length * 37)}` : p.method === "CARD" ? `CARD-${4000 + payRows.length}` : p.method === "NET_BANKING" ? `NB${700000 + payRows.length}` : p.method === "INSURANCE" ? `CLAIM-${2000 + payRows.length}` : null,
        cashSessionId: p.method === "CASH" ? sessionFor(paidAt) : null, receivedById: (payRows.length % 2 ? billing : reception).id, paidAt } })
      payRows.push({ id: pay.id, amount: p.amount, method: p.method, patient: s.patient })
      if (pi === 0) { bills[s.k].payId = pay.id; bills[s.k].payMethod = p.method }
    }
  }
  // refunds: p7 partial (completed), p8 full (completed -> REFUNDED), p0 pending request
  async function refund(key: string, amount: number, reason: string, status: "COMPLETED" | "PENDING") {
    const b = bills[key]
    if (amount > b.paid) throw new Error("refund exceeds paid")
    const first = await prisma.payment.findFirst({ where: { billId: b.id }, orderBy: { paidAt: "asc" } })
    await prisma.refund.create({ data: {
      billId: b.id, paymentId: first?.id, patientId: pid[b.patient], amount, reason, method: (first?.method ?? "CASH") as "CASH", status,
      requestedAt: addMin(b.when, 600), processedAt: status === "COMPLETED" ? addMin(b.when, 700) : null, processedById: status === "COMPLETED" ? billing.id : null } })
    if (status === "COMPLETED") {
      const newPaid = r2(b.paid - amount)
      await prisma.bill.update({ where: { id: b.id }, data: { amountPaid: newPaid, balanceDue: r2(Math.max(b.net - newPaid, 0)), status: newPaid <= 0 ? "REFUNDED" : newPaid >= b.net - 0.01 ? "PAID" : "PARTIALLY_PAID" } })
      b.paid = newPaid
    }
  }
  await refund("p7", 300, "Wrong test billed, partial refund", "COMPLETED")
  await refund("p8", bills.p8.paid, "Consultation cancelled by the hospital", "COMPLETED")
  await refund("p0", 200, "Patient requested refund of ECG charge", "PENDING")
  // advances + adjustment (p5 patient uses an advance on their bill)
  const adv1 = await prisma.patientAdvance.create({ data: { patientId: pid[15], amount: 3000, balance: 3000, method: "CASH", receivedById: reception.id, paidAt: at(-20, 10), notes: "Demo advance deposit" } })
  const advPay = payRows.find((p) => p.method === "ADVANCE")!
  await prisma.advanceAdjustment.create({ data: { advanceId: adv1.id, billId: bills.p5.id, amount: advPay.amount, adjustedAt: at(pastDays[5], 14, 20) } })
  await prisma.patientAdvance.update({ where: { id: adv1.id }, data: { balance: r2(3000 - advPay.amount) } })
  await prisma.patientAdvance.create({ data: { patientId: pid[2], amount: 2000, balance: 2000, method: "UPI", referenceNumber: "UPI884411", receivedById: billing.id, paidAt: at(-4, 12), notes: "Demo advance for planned procedure" } })
  await prisma.patientAdvance.create({ data: { patientId: pid[4], amount: 5000, balance: 5000, method: "CARD", referenceNumber: "CARD-7788", receivedById: billing.id, paidAt: at(-1, 16), notes: "Demo advance" } })
  // close past cash sessions (cash collected from linked payments)
  for (const s of sessions.filter((x) => x.day < 0)) {
    const cash = await prisma.payment.aggregate({ where: { cashSessionId: s.id, status: "SUCCESS" }, _sum: { amount: true } })
    const expected = r2(2000 + Number(cash._sum.amount ?? 0))
    const shortfall = s.day === -2 ? 50 : 0
    await prisma.cashSession.update({ where: { id: s.id }, data: { status: "CLOSED", closedAt: at(s.day, 20, 15), closedById: billing.id, expectedClosing: expected, closingBalance: expected - shortfall, notes: shortfall ? "[DEMO] Counter session, Rs 50 short" : "[DEMO] Counter session, balanced" } })
  }
  // expenses
  const exp: [("UTILITIES" | "SUPPLIES" | "MAINTENANCE" | "MARKETING" | "RENT" | "EQUIPMENT" | "OTHER"), string, number, string, ("CASH" | "CARD" | "UPI" | "NET_BANKING"), number][] = [
    ["RENT", "Clinic building rent", 45000, "Demo Properties", "NET_BANKING", -27],
    ["UTILITIES", "Electricity bill", 8200, "Sample Power Board", "UPI", -22],
    ["UTILITIES", "Internet and phone", 2400, "Demo Telecom", "CARD", -20],
    ["SUPPLIES", "Printer paper and stationery", 1850, "Sample Stationers", "CASH", -16],
    ["SUPPLIES", "Cleaning consumables", 3100, "Demo Hygiene Supplies", "UPI", -13],
    ["MAINTENANCE", "AC servicing", 4500, "Sample Cooling Works", "CASH", -10],
    ["EQUIPMENT", "BP monitor replacement", 6800, "Demo MedEquip", "CARD", -8],
    ["MARKETING", "Local newspaper notice", 5000, "Sample Media", "NET_BANKING", -6],
    ["OTHER", "Staff tea and refreshments", 950, "Local vendor", "CASH", -2],
    ["MAINTENANCE", "Plumbing repair", 2700, "Sample Plumbing", "UPI", -1],
  ]
  for (const [k, [category, description, amount, paidTo, method, day]] of exp.entries()) {
    await prisma.expense.create({ data: { category, description: `[DEMO] ${description}`, amount, paidTo, method, expenseDate: at(day, 12), referenceNumber: method === "CASH" ? null : `EXP-DEMO-${100 + k}`, recordedById: billing.id } })
  }

  // ---- CRM: waiting list, follow-ups, messages, notes, feedback
  const wl: [number, number | null, number, string, "WAITING" | "NOTIFIED" | "CONVERTED" | "EXPIRED", number][] = [
    [5, 0, 2, "Earlier slot for skin allergy", "WAITING", 1], [6, 1, 1, "Child fever review", "WAITING", 2], [7, null, 0, "Any doctor, joint pain", "WAITING", 0],
    [8, 2, 3, "Follow-up consultation", "NOTIFIED", 1], [9, 3, 5, "Prefers evening slot", "WAITING", 0], [16, 0, -2, "Missed appointment, rebook", "WAITING", 2],
    [17, 1, 1, "BP check", "CONVERTED", 0], [18, 2, 4, "Cardiac review", "NOTIFIED", 2], [19, null, -6, "Slot no longer needed", "EXPIRED", 0], [1, 3, 6, "Preventive health check", "WAITING", 1],
  ]
  for (const [pi, di, day, reason, status, priority] of wl) {
    await prisma.waitingListEntry.create({ data: { patientId: pid[pi], doctorId: di === null ? null : doc(di).id, requestedDate: at(day, 0), reason, status, priority, createdAt: at(-Math.abs(day) - 2, 10) } })
  }
  const fu: [number, number, number, string, "PENDING" | "DONE" | "MISSED" | "CANCELLED", string | null][] = [
    [10, 0, 0, "Review blood sugar after dose change", "PENDING", null], [12, 1, 0, "Share chest X-ray report", "PENDING", null],
    [13, 2, -2, "Call to check BP readings", "PENDING", null], [14, 0, -5, "Reminder: pending lipid profile", "PENDING", null], [11, 3, -9, "Post-visit wellness check", "MISSED", "Patient did not pick up, retry"],
    [15, 1, 3, "Remind about outstanding balance", "PENDING", null], [16, 2, 5, "Book review with orthopaedics", "PENDING", null], [17, 0, 8, "Annual health check invite", "PENDING", null],
    [18, 3, -3, "Confirmed medicines received", "DONE", "Patient is recovering well"], [19, 1, -1, "Collected lab report", "DONE", "Report handed over at the desk"],
  ]
  for (const [pi, ai, day, reason, status, notes] of fu) {
    await prisma.followUp.create({ data: { patientId: pid[pi], assignedToId: [reception.id, billing.id, admin.id, reception.id][ai], dueDate: at(day, 12), reason, status, notes, completedAt: status === "DONE" ? at(day, 15) : null, appointmentId: pi >= 10 ? [past[pi - 10]].map(ap)[0] : null, createdAt: at(day - 3, 10) } })
  }
  const msgs: ["SMS" | "EMAIL" | "WHATSAPP" | "CALL" | "SYSTEM", "INBOUND" | "OUTBOUND", number, string | null, string, "SENT" | "DELIVERED" | "READ" | "FAILED", number][] = [
    ["SMS", "OUTBOUND", 0, null, "Reminder: your appointment today is at 4:30 PM. Reply C to confirm.", "DELIVERED", 0],
    ["WHATSAPP", "OUTBOUND", 1, null, "Hello Diya, your booking request has been received. We will confirm shortly.", "READ", 0],
    ["WHATSAPP", "INBOUND", 1, null, "Thank you. Can I come 30 minutes earlier?", "READ", 0],
    ["EMAIL", "OUTBOUND", 10, "Your visit summary", "Dear patient, your visit summary and prescription are attached (demo message).", "SENT", -1],
    ["CALL", "OUTBOUND", 13, null, "Called to check blood pressure readings. No answer, will retry.", "SENT", -2],
    ["SMS", "OUTBOUND", 14, null, "Your lipid profile report is ready for collection.", "DELIVERED", -3],
    ["EMAIL", "INBOUND", 18, "Insurance claim query", "Please confirm the documents needed for the cashless claim.", "READ", -4],
    ["SMS", "OUTBOUND", 15, null, "Outstanding balance reminder for invoice (demo).", "FAILED", -2],
    ["WHATSAPP", "OUTBOUND", 7, null, "Please carry your allergy card on your next visit.", "DELIVERED", -5],
    ["SYSTEM", "OUTBOUND", 2, "Appointment confirmed", "Your appointment has been confirmed. Reference sent by SMS.", "DELIVERED", 0],
    ["CALL", "INBOUND", 5, null, "Patient called to ask about doctor availability on Saturday.", "READ", -1],
  ]
  for (const [k, [channel, direction, pi, subject, body, status, day]] of msgs.entries()) {
    await prisma.message.create({ data: { patientId: pid[pi], channel, direction, subject, body, status, sentById: direction === "OUTBOUND" ? [reception.id, admin.id][k % 2] : null, sentAt: at(day, 9 + (k % 8), k * 5 % 60) } })
  }
  const notes: [number, string, "GENERAL" | "CLINICAL" | "BILLING" | "FRONT_DESK", boolean][] = [
    [10, "Prefers morning slots; diabetic, avoid long waits without food.", "FRONT_DESK", true], [12, "Needs wheelchair assistance at entrance.", "FRONT_DESK", true],
    [13, "Family often calls on behalf of patient; speak to son if no answer.", "GENERAL", false], [15, "Advance deposit available, adjust against next bill.", "BILLING", true],
    [4, "Review kidney function before prescribing NSAIDs.", "CLINICAL", true], [7, "Penicillin allergy confirmed with patient and family.", "CLINICAL", true],
    [2, "Regular customer; interested in executive health check.", "GENERAL", false], [18, "Insurance pre-authorisation pending.", "BILLING", false],
    [3, "Child anxious about injections; allow a parent in the room.", "FRONT_DESK", false], [16, "Missed the last appointment, offer an earlier slot.", "FRONT_DESK", false],
  ]
  for (const [k, [pi, body, category, pinned]] of notes.entries()) {
    await prisma.patientNote.create({ data: { patientId: pid[pi], authorId: [reception.id, admin.id, billing.id][k % 3], body, category, pinned, createdAt: at(-k, 11) } })
  }
  const fb: [number, number, number, string | null, string][] = [
    [10, 0, 5, "Doctor explained everything clearly.", "Doctor"], [11, 1, 4, "Short wait, polite staff.", "Staff"], [12, 2, 3, "Waited longer than expected.", "Waiting time"],
    [13, 3, 5, "Smooth billing process.", "Billing"], [14, 4, 4, null, "Overall"], [15, 5, 2, "Billing counter was crowded.", "Billing"],
    [16, 6, 5, "Clean facility, good care.", "Facility"], [17, 7, 4, "Easy online booking.", "Booking"], [18, 8, 5, "Very satisfied.", "Overall"], [19, 9, 3, "Parking is difficult.", "Facility"],
  ]
  for (const [pi, ai, rating, comment, category] of fb) {
    await prisma.feedback.create({ data: { patientId: pid[pi], appointmentId: past[ai].id, rating, comment, category, createdAt: addMin(past[ai].scheduledAt, 240) } })
  }

  // ---- inventory
  const invIds: string[] = []
  const invUser = reception
  for (const [k, it] of INVENTORY.entries()) {
    const sold = it.outs.reduce((a, b) => a + b, 0)
    const current = it.ref - sold
    const thresholdQty = Math.ceil(it.ref * 0.2)
    const item = await prisma.inventoryItem.create({ data: {
      name: it.name, category: it.cat, manufacturer: it.mfr, sku: `DEMO-${String(k + 1).padStart(3, "0")}`, unit: it.unit, description: it.note ? `Demo item. ${it.note}` : "Demo item (synthetic).",
      currentStock: current, referenceStock: it.ref, lowStockThresholdPercent: 20, lowStockThresholdQty: thresholdQty, unitPrice: it.price } })
    invIds.push(item.id)
    let stock = 0
    let day = -29
    await prisma.inventoryTransaction.create({ data: { itemId: item.id, type: "STOCK_IN", quantity: it.ref, previousStock: 0, newStock: it.ref, reason: "Opening stock (demo)", performedById: admin.id, timestamp: at(day, 9) } })
    stock = it.ref
    for (const [j, q] of it.outs.entries()) {
      day += 8 + j
      await prisma.inventoryTransaction.create({ data: { itemId: item.id, type: "STOCK_OUT", quantity: q, previousStock: stock, newStock: stock - q, reason: "Dispensed to patient (demo)", patientId: pid[10 + ((k + j) % 10)], performedById: invUser.id, timestamp: at(Math.min(day, -1), 12 + j) } })
      stock -= q
    }
    if (current <= thresholdQty) {
      const status = k === 8 ? "RESOLVED" : k === 6 ? "ACKNOWLEDGED" : "ACTIVE"
      await prisma.inventoryAlert.create({ data: { itemId: item.id, alertType: "LOW_STOCK", severity: current === 0 ? "CRITICAL" : "HIGH", currentQuantity: current, thresholdQuantity: thresholdQty, status,
        acknowledgedAt: status !== "ACTIVE" ? at(-1, 10) : null, acknowledgedById: status !== "ACTIVE" ? admin.id : null, resolvedAt: status === "RESOLVED" ? at(-1, 15) : null, resolvedById: status === "RESOLVED" ? admin.id : null, notes: current === 0 ? "Out of stock (demo)" : null } })
    }
    if (it.note) await prisma.inventoryAlert.create({ data: { itemId: item.id, alertType: "EXPIRY", severity: "MEDIUM", currentQuantity: current, thresholdQuantity: thresholdQty, status: "ACTIVE", notes: it.note } })
  }

  // ---- audit log
  const auditRows: { action: string; entityType: string; entityId?: string; user: typeof admin; day: number }[] = [
    ...pid.slice(0, 6).map((id, i) => ({ action: "PATIENT_CREATED", entityType: "Patient", entityId: id, user: reception, day: -i * 2 })),
    { action: "PATIENT_UPDATED", entityType: "Patient", entityId: pid[10], user: reception, day: -1 },
    { action: "APPOINTMENT_BOOKED", entityType: "Appointment", entityId: T.pend1.id, user: reception, day: 0 },
    { action: "APPOINTMENT_STATUS_CHANGED", entityType: "Appointment", entityId: T.arr1.id, user: reception, day: 0 },
    { action: "APPOINTMENT_STATUS_CHANGED", entityType: "Appointment", entityId: T.inc.id, user: doc(0), day: 0 },
    { action: "APPOINTMENT_CANCELLED", entityType: "Appointment", entityId: T.canc.id, user: reception, day: 0 },
    ...["p0", "p1", "p2", "t7"].map((k, i) => ({ action: "BILL_CREATED", entityType: "Bill", entityId: bills[k].id, user: billing, day: -i })),
    ...["p0", "p1", "t8"].map((k, i) => ({ action: "PAYMENT_RECORDED", entityType: "Bill", entityId: bills[k].id, user: billing, day: -i })),
    { action: "BILL_CANCELLED", entityType: "Bill", entityId: bills.p9.id, user: billing, day: -28 },
    { action: "REFUND_CREATED", entityType: "Bill", entityId: bills.p7.id, user: billing, day: -25 },
    { action: "STOCK_IN", entityType: "InventoryItem", entityId: invIds[0], user: admin, day: -29 },
    { action: "STOCK_OUT", entityType: "InventoryItem", entityId: invIds[2], user: reception, day: -5 },
    { action: "ALERT_CREATED", entityType: "InventoryItem", entityId: invIds[4], user: admin, day: -2 },
    { action: "USER_LOGIN", entityType: "User", entityId: admin.id, user: admin, day: 0 },
    { action: "USER_LOGIN", entityType: "User", entityId: reception.id, user: reception, day: 0 },
  ]
  for (const [k, a] of auditRows.entries()) {
    await prisma.auditLog.create({ data: { userId: a.user.id, userName: a.user.name, userRole: a.user.role, action: a.action, entityType: a.entityType, entityId: a.entityId ?? null, metadata: { demo: true }, ipAddress: "127.0.0.1", timestamp: at(a.day, 9 + (k % 9), (k * 11) % 60) } })
  }
  console.log("Demo data inserted. Remove it with: npm run db:seed:demo -- --reset")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
