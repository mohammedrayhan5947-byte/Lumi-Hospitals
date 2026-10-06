import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const p = await b.newPage(); await p.setViewport({ width: 360, height: 780, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem("lumi-theme", JSON.stringify({ a11y: ["calm"] })); localStorage.setItem("lumi-consent", JSON.stringify({ v: 1, necessary: true })); sessionStorage.setItem("lumi-pl", "1"); } catch {} });
const check = async (url) => {
  await p.goto(url, { waitUntil: "networkidle0", timeout: 90000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1200));
  return p.evaluate(() => {
    const W = innerWidth, over = [];
    for (const el of document.querySelectorAll("body *")) { const r = el.getBoundingClientRect(); if (r.width && r.right > W + 2 && getComputedStyle(el).position !== "fixed" && !el.closest(".hscroll,.marquee,.film,.mnav,.dpanel,[data-film]")) over.push(el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0] + ":" + Math.round(r.right)); }
    const small = [...document.querySelectorAll("a,button,input,select")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && (r.height < 36 || r.width < 36) && getComputedStyle(e).visibility !== "hidden" && !e.closest(".sr-only") && e.offsetParent; }).length;
    return { scrollW: document.documentElement.scrollWidth, W, over: [...new Set(over)].slice(0, 5), smallTargets: small };
  });
};
const site = ["index", "about", "departments", "doctors", "packages", "appointment", "emergency", "patient-guide", "blog", "contact", "gallery", "privacy", "grievance", "specialities/cardiology", "doctors/arjun-rao", "journal/knee-pain"];
console.log("== WEBSITE @360");
for (const s of site) { const r = await check(`http://localhost:5173/${s}.html`); console.log((r.scrollW > r.W ? "OVERFLOW " : "ok       ") + s.padEnd(26) + `scrollW=${r.scrollW} small=${r.smallTargets}` + (r.over.length ? " " + r.over.join(",") : "")); }
// CRM: login first
await p.goto("http://localhost:3000/login", { waitUntil: "networkidle0", timeout: 90000 });
await p.type('input[type="email"],input[name="email"]', "admin@lumihospital.in"); await p.type('input[type="password"]', "v8FDyZ5OxYXE");
await Promise.all([p.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}), p.click('button[type="submit"]')]);
console.log("== CRM @360");
for (const s of ["dashboard", "patients", "appointments", "queue", "services", "billing", "inventory", "website/content"]) { const r = await check(`http://localhost:3000/${s}`); await p.screenshot({ path: `.shots/m-crm-${s.replace(/\W/g, "_")}.png` }); console.log((r.scrollW > r.W ? "OVERFLOW " : "ok       ") + s.padEnd(18) + `scrollW=${r.scrollW} small=${r.smallTargets}` + (r.over.length ? " " + r.over.join(",") : "")); }
await b.close();
