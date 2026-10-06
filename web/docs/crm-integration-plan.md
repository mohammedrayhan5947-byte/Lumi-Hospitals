# Lumi Hospital: CRM integration plan

## What exists
**Website** (this repo, static Vite site). It holds the hospital's data in `src/data/site.js`: BIZ, DEPARTMENTS (10), DOCTORS (12, with OPD days and times), PACKAGES (6), plus photos. Booking is a 4-step wizard that sends the request to WhatsApp or email. Nothing is stored.

**CRM** (cloned from `MUFEEDA/crm/crm`, the Zafoor Clinic CRM). Next.js 16 + Prisma 7 + Postgres. About 110 models: patients, appointments, queue, EMR, prescriptions, billing, inventory, finance, CRM notes, website content. It already exposes a public booking API:

| Endpoint | Purpose |
|---|---|
| `GET /api/public/services` | bookable services |
| `GET /api/public/doctors` | active doctors |
| `GET /api/public/availability?doctorId&date` | free slots (respects leave and bookings) |
| `POST /api/public/appointments` | creates patient + appointment, slot-conflict safe |

## Mapping: website data → CRM
| Website | CRM | How |
|---|---|---|
| DEPARTMENTS[i] (id, name, summary) | `Service` (slug = department id) | one consultation service per speciality |
| PACKAGES[i] (id, name, price) | `Service` (slug = `pkg-<id>`, price) | health checks bookable and billable |
| DOCTORS[i] (id, name, dept, quals, days, time) | `User` role DOCTOR (`slug` = doctor id) + `DoctorAvailability` rows | OPD days and times become slots |
| BIZ (name, phone, address, hours, mapQuery) | `ClinicSettings` | single source: seed reads `site.js` |
| (new) | ADMIN, RECEPTIONIST, BILLING users | created by seed, passwords from env |

The CRM seed **imports `../src/data/site.js` directly**, so editing the website data and re-seeding updates the CRM. There is one source of truth.

## Changes
1. **Clone** the CRM into `crm/` (no `node_modules`, `.next`, `.env`, uploads, generated client).
2. **Rebrand** Zafoor / Mufeeda to Lumi Hospital:
   - package, cookie (`lumi_session`), storage bucket (`lumi-documents`), DB and docker names, titles
   - login, sidebar and print header use the Lumi logo mark
   - palette from the website (Lumi blue and red)
   - `hospital-info`, `ClinicSettings` defaults, README, seed copy
3. **Slugs:** `Service.slug` = department / package ids. Add `User.slug` (doctor id) and return it from the public doctors API so the site can match doctors without guessing.
4. **Seed** from website data. Drop the dermatology inventory and demo patients; keep a small generic inventory, and no fake patients.
5. **Website → CRM:** `src/js/crm.js` client (`BIZ.crmUrl`, set through `VITE_CRM_URL`). The booking wizard loads real slots from `/availability` and submits to `/appointments`. It shows the confirmation (appointment code). **WhatsApp and email remain the fallback** if the CRM is offline or not configured. Doctors and departments map by slug.
6. **Config:** CORS allowed origins via `PUBLIC_SITE_ORIGIN`. `.env.example` only; the Zafoor `.env` (another clinic's live database) is **never copied**.

## Data and privacy
- Lumi needs its **own** database (new Supabase project, or local PGlite for development). The Zafoor database is a different clinic's patient data and is not touched.
- The booking API collects name, mobile and reason, which is personal health data under DPDP. The privacy page and the consent tick already cover the website form. The CRM needs access control (roles exist) and the hospital's data-retention rules.

## Deploy
Monorepo, two Vercel projects: root (static site, prebuilt `dist`) and `crm/` (Next.js, env: `DATABASE_URL`, `DIRECT_URL`, `PUBLIC_SITE_ORIGIN`, Supabase keys). The site then gets `VITE_CRM_URL=https://<crm-domain>` at build time.

## Out of scope for now
Online payment, SMS/WhatsApp notification providers (the CRM has stubs), patient login/portal.
