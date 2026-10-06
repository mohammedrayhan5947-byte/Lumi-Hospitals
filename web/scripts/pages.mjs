/* Generates every .html shell from one template so <head> stays identical everywhere.
   Run: node scripts/pages.mjs   (runs automatically before `npm run build`)
   Static pages are listed in PAGES in src/js/seo.js; per-entity pages (specialities/, doctors/, journal/)
   come from src/data/site.js. Page content is rendered by src/js/pages/<entry>.js, which reads the id from <main data-id>. */
import { writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { routes, headTags, url } from "../src/js/seo.js";
import { DEPARTMENTS, DOCTORS, POSTS } from "../src/data/site.js";

/* Applies saved theme before first paint (no flash). Mirrors src/js/theme.js. */
const EARLY = `(function(){try{var s=JSON.parse(localStorage.getItem("lumi-theme")||"{}"),h=document.documentElement,m=s.mode||"auto";
if(m==="auto")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";h.dataset.mode=m;
if(s.accent&&s.accent!=="auto"&&s.accent!=="season")h.dataset.accent=s.accent;h.dataset.a11y=(s.a11y||[]).join(" ");
if((s.a11y||[]).indexOf("calm")<0&&!matchMedia("(prefers-reduced-motion: reduce)").matches)h.classList.add("js-motion");}catch(e){}})();`;

/* Old /department.html?id=x links → clean URL (before anything renders). */
const LEGACY = {
  dept: [DEPARTMENTS.map(d => d.id), url.dept("ID")],
  doctor: [DOCTORS.map(d => d.id), url.doctor("ID")],
  post: [POSTS.map(p => p.id), url.post("ID")]
};
const redirect = kind => { const [ids, to] = LEGACY[kind];
  return `<script>(function(){var i=new URLSearchParams(location.search).get("id");if(i&&${JSON.stringify(ids)}.indexOf(i)>-1)location.replace(${JSON.stringify(to)}.replace("ID",i)+location.hash)})();</script>\n`; };

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 34 34'%3E%3Ccircle cx='17' cy='17' r='16' fill='%230e8a70'/%3E%3Cpath d='M17 10v14M10 17h14' stroke='white' stroke-width='3.2' stroke-linecap='round'/%3E%3C/svg%3E";

// Entity folders are fully generated: clear them so removed entities don't linger.
for (const d of ["specialities", "doctors", "journal"]) if (existsSync(d)) rmSync(d, { recursive: true });

const all = routes();
for (const r of all) {
  mkdirSync(dirname(r.out), { recursive: true });
  writeFileSync(r.out, `<!doctype html>
<html lang="en-IN"${r.legacy ? "" : " data-seo"}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${r.legacy ? redirect(r.legacy) : ""}${headTags(r)}
<link rel="icon" href="${FAVICON}">
<link rel="apple-touch-icon" href="/og/logo.png">
<script>${EARLY}</script>
<script type="module" src="/src/js/pages/${r.entry}.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div id="header"></div>
<main id="main" data-page="${r.entry}"${r.id ? ` data-id="${r.id}"` : ""}${r.header ? ` data-header="${r.header}"` : ""}></main>
<div id="footer"></div>
<noscript><p style="padding:24px;font-family:system-ui">Please enable JavaScript to use this site, or call us directly.</p></noscript>
</body>
</html>
`);
}
console.log("wrote", all.length, "pages");
