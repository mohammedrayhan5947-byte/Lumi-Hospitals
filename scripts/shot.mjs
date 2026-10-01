/* QA screenshots: node scripts/shot.mjs <path> [width] [mode] [scrollY...]
   Saves to .shots/<name>-<width>-<mode>-<y>.png and prints console errors. */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const [, , path = "index.html", w = "1440", mode = "light", ...ys] = process.argv;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
mkdirSync(".shots", { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
const page = await browser.newPage();
const errors = [];
page.on("console", m => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", e => errors.push(e.message));
await page.setViewport({ width: +w, height: +w < 700 ? 844 : 900, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(m => { try { localStorage.setItem("lumi-theme", JSON.stringify({ mode: m })); sessionStorage.setItem("lumi-pl", "1"); } catch {} }, mode);
await page.goto("http://localhost:5173/" + path.replace(/^[/]+/, ""), { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 1800));
const name = path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home";
for (const y of (ys.length ? ys : ["0"])) {
  if (y === "full") {
    // step through the page so scroll-triggered reveals fire, then capture full height
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let s = 0; s < h; s += 500) { await page.evaluate(v => window.__lenis ? window.__lenis.scrollTo(v, { immediate: true }) : scrollTo(0, v), s); await new Promise(r => setTimeout(r, 120)); }
    await page.evaluate(() => window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)); await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: `.shots/${name}-${w}-${mode}-full.png`, fullPage: true });
  } else {
    await page.evaluate(v => window.__lenis ? window.__lenis.scrollTo(+v, { immediate: true }) : scrollTo(0, +v), y);
    await new Promise(r => setTimeout(r, 1400));
    await page.screenshot({ path: `.shots/${name}-${w}-${mode}-${y}.png` });
  }
}
console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
