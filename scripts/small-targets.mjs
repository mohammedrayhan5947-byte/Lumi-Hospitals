import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const p = await b.newPage(); await p.setViewport({ width: 360, height: 780, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { sessionStorage.setItem("lumi-pl", "1"); localStorage.setItem("lumi-consent", JSON.stringify({ v: 1, necessary: true })); });
const tally = {};
for (const s of ["index", "doctors", "appointment", "contact"]) {
  await p.goto(`http://localhost:5173/${s}.html`, { waitUntil: "networkidle0", timeout: 90000 }); await new Promise(r => setTimeout(r, 1000));
  const r = await p.evaluate(() => [...document.querySelectorAll("a,button,input,select,summary")].filter(e => { const r = e.getBoundingClientRect(); return e.offsetParent && r.width && r.height && (r.height < 40 || r.width < 40) && !e.closest(".sr-only") && !e.classList.contains("sr-only"); }).map(e => { const k = (e.closest("footer,.site-footer,.ecg-band,nav,.crumbs,header,.chips,.acc,form,.hscroll,.film") || e); return (k.className || k.tagName).toString().split(" ")[0] + " > " + e.tagName.toLowerCase() + "." + e.className.toString().split(" ")[0]; }));
  for (const k of r) tally[k] = (tally[k] || 0) + 1;
}
console.log(Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => v + "  " + k).join("\n")); await b.close();
