# Lumi Hospital CRM

Staff-facing hospital management app for Lumi Hospital: patients (UHID `LH-YYYY-NNNNNN`), appointments and queue,
EMR / consultations, prescriptions, billing and refunds, inventory, finance, CRM follow-ups, and the public booking API
used by the website. Next.js (App Router) + Prisma 7 + Postgres, shadcn/ui.

## One source of truth: the website
Departments, doctors (with OPD days/times), health packages, FAQs and hospital details live in the website's
`../web/src/data/site.js`. `npm run sync:site` exports them to `prisma/lumi-data.json`; `npm run db:seed` loads them
(specialities and packages become bookable **services**, doctors become **staff + weekly availability**).
Edit the website data, re-run `db:seed`, done. Existing staff passwords are kept.

## Run locally
```bash
npm install
cp .env.example .env            # fill DATABASE_URL (see below)
npm run db:local                # embedded Postgres on :5432 (own terminal) - dev only
npx prisma db push              # create tables
npm run db:seed                 # seed from website data; prints initial staff passwords ONCE
npm run dev                     # http://localhost:3000
```
Production uses a **new Supabase project for Lumi** (never another clinic's database).

## Public booking API (used by the website)
`GET /api/public/services` · `GET /api/public/doctors` · `GET /api/public/availability?doctorId&date` · `POST /api/public/appointments`
CORS: set `PUBLIC_SITE_ORIGIN` (comma-separated site origins). Server timezone is pinned to `Asia/Kolkata` (`src/instrumentation.ts`).

## Roles
ADMIN, DOCTOR, RECEPTIONIST, BILLING (see `requireRole()` in `src/actions/*`). Doctor accounts are `<doctor-id>@lumihospital.in`.

## Deploy (Vercel)
Second Vercel project with **Root Directory = `crm`**. Env: `DATABASE_URL`, `DIRECT_URL`, `PUBLIC_SITE_ORIGIN`, Supabase keys.
For migrations/db push use the direct (non-pooled) URL. The seed needs `../web/src/data/site.js`, so run it from the repo root checkout (locally), not on Vercel.
