# Lumi Hospital

| Folder | What it is | Run locally |
|---|---|---|
| [`web/`](web) | Public website (Vite, prerendered) | `cd web && npm install && npm run dev` (http://localhost:5173) |
| [`crm/`](crm) | Staff CRM (Next.js + Prisma + Supabase) | `cd crm && npm install && npm run dev` (http://localhost:3000) |

The website's `web/src/data/site.js` is the single source of truth for departments, doctors and packages; `cd crm && npm run db:seed` syncs it into the CRM.

Deploy as two Vercel projects: Root Directory `web` and Root Directory `crm`.
