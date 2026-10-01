/* Prerender: after `vite build`, open every page of dist in headless Chrome and write the fully
   rendered body back into dist, so crawlers and AI engines that don't run JS see real content.
   Run: node scripts/prerender.mjs   (part of `npm run build`)
   - Snapshot is taken in "calm" mode (no motion), so no animation inline styles leak in.
   - <html data-prerendered>: boot() in src/js/core.js restores the placeholders and re-renders live.
   - Adds FAQPage JSON-LD (from the FAQs actually rendered), font preloads, image sizes and hero priority. */
import { preview } from "vite";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { routes, faqPage, ldScript } from "../src/js/seo.js";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DIST = "dist";
const t0 = Date.now();

const server = await preview({ preview: { port: 4317, strictPort: false, open: false }, logLevel: "warn" });
const base = (server.resolvedUrls.local[0] || "http://localhost:4317/").replace(/\/$/, "");

/* Critical fonts: display + body (latin subsets). Hashed names are discovered from the build. */
const fonts = readdirSync(`${DIST}/assets`).filter(f => /^(bricolage-grotesque-latin-opsz-normal|geist-latin-wght-normal)-.*\.woff2$/.test(f));
const preloads = fonts.map(f => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join("\n");

/* Intrinsic sizes of local images (cached). */
const dims = new Map();
const sizeOf = async src => {
  if (!src?.startsWith("/") || dims.has(src)) return dims.get(src);
  const f = `${DIST}${decodeURI(src.split("?")[0])}`;
  let v = null; if (existsSync(f)) { try { const m = await sharp(f).metadata(); v = m.width && m.height ? [m.width, m.height] : null; } catch { /* not an image sharp reads */ } }
  dims.set(src, v); return v;
};

const LEGACY = [[/\/department\.html\?id=([\w-]+)/g, "/specialities/$1.html"], [/\/doctor\.html\?id=([\w-]+)/g, "/doctors/$1.html"], [/\/post\.html\?id=([\w-]+)/g, "/journal/$1.html"]];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const list = routes().filter(r => !r.legacy);
let done = 0, failed = 0;
const skipped = [];

async function snap(r) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem("lumi-theme", JSON.stringify({ a11y: ["calm"] })); sessionStorage.setItem("lumi-pl", "1"); } catch { /* */ } });
  await page.goto(base + r.path, { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForFunction(() => document.querySelector(".site-footer"), { timeout: 15000 });
  try { await page.waitForFunction(() => document.querySelector("main")?.children.length, { timeout: 4000 }); }
  catch { await page.close(); skipped.push(r.path); return []; } // page renders nothing yet: leave it client-rendered
  await new Promise(res => setTimeout(res, 250));
  const out = await page.evaluate(() => {
    const body = document.body, keep = new Set([document.querySelector("main"), document.querySelector("a.skip"), document.querySelector("body > noscript")]);
    // Keep only the shell: skip link, header/footer ranges (between the layout markers), main, noscript.
    let inRange = false;
    for (const n of [...body.childNodes]) {
      if (n.nodeType === 8 && /^\/?lumi:/.test(n.data)) { inRange = !n.data.startsWith("/"); continue; }
      if (inRange || keep.has(n) || n.nodeType === 3) continue;
      n.remove();
    }
    body.querySelectorAll("script").forEach(s => s.remove());
    const faq = [...document.querySelectorAll("main .acc-item")].map(it => ({ q: it.querySelector(".acc-btn")?.textContent.trim(), a: it.querySelector(".acc-panel")?.textContent.trim() })).filter(f => f.q && f.a);
    return { body: body.innerHTML, faq, h1: document.querySelector("main h1")?.textContent.trim() };
  });
  await page.close();
  if (!out.h1) errors.push("no <h1> in main");

  let body = out.body;
  for (const [re, to] of LEGACY) body = body.replace(re, to);
  // Images: intrinsic width/height (no CLS before JS); the first eager image is the LCP candidate.
  const imgs = [...body.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  let hero = false;
  for (const tag of new Set(imgs)) {
    let t = tag;
    const src = tag.match(/\ssrc="([^"]+)"/)?.[1], d = await sizeOf(src);
    if (d && !/\swidth=/.test(t)) t = t.replace("<img", `<img width="${d[0]}" height="${d[1]}"`);
    if (!hero && !/loading="lazy"/.test(t)) { hero = true; if (!/fetchpriority/.test(t)) t = t.replace("<img", `<img fetchpriority="high"`); }
    body = body.split(tag).join(t);
  }

  const file = `${DIST}/${r.out}`;
  let html = readFileSync(file, "utf8");
  if (html.includes("data-prerendered")) throw new Error("already prerendered (rebuild first)");
  const faq = !r.noindex && faqPage(r, out.faq);
  html = html
    .replace(/<html([^>]*)>/, `<html$1 data-prerendered>`)
    .replace("<!--/seo-->", `${faq ? ldScript({ "@context": "https://schema.org", ...faq }) + "\n" : ""}${preloads}\n<!--/seo-->`)
    .replace(/<body>[\s\S]*<\/body>/, () => `<body>${body}</body>`);
  writeFileSync(file, html);
  done++;
  return errors;
}

/* A few tabs at a time. */
const queue = [...list];
await Promise.all(Array.from({ length: 4 }, async () => {
  for (let r; (r = queue.shift());) {
    try { const e = await snap(r); if (e.length) console.warn(`  ! ${r.path}: ${e.join("; ")}`); }
    catch (e) { failed++; console.error(`  x ${r.path}: ${e.message}`); }
  }
}));
await browser.close();
await new Promise(res => server.httpServer.close(res));
console.log(`prerendered ${done}/${list.length} pages in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (skipped.length) console.warn(`  skipped (main is empty, left client-rendered): ${skipped.join(", ")}`);
if (failed) process.exit(1);
