# Lumi Hospital website

Vite + GSAP + Lenis. All content lives in `src/data/site.js`. Conventions: `CONVENTIONS.md`. Legal notes: `docs/legal-compliance.md`.

## Develop
    npm install
    npm run dev          # http://localhost:5173

## Build & deploy
    npm run build        # vite build + prerender (needs local Chrome) + sitemap/robots/llms.txt
    git add -A && git commit -m "build" && git push

`dist/` is committed on purpose: Vercel serves it as-is (see `vercel.json`), because the prerender step needs Chrome.
Always run `npm run build` before pushing content changes.

## Before launch
Replace every TODO in `src/data/site.js` (phones, address, hours, doctors, prices, `siteUrl`, `BIZ.legal`), then rebuild.
