import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem("lumi-theme", JSON.stringify({ mode: "dark" })); sessionStorage.setItem("lumi-pl", "1"); } catch {} });
await p.goto("http://localhost:5173/departments.html", { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => window.__lenis?.scrollTo(700, { immediate: true }));
await new Promise(r => setTimeout(r, 800));
await p.mouse.move(600, 300); await p.mouse.move(640, 320);
await new Promise(r => setTimeout(r, 1200));
await p.screenshot({ path: ".shots/hover1.png" });
// scroll without moving the mouse
await p.evaluate(() => window.__lenis?.scrollTo(1000, { immediate: true }));
await new Promise(r => setTimeout(r, 1200));
await p.screenshot({ path: ".shots/hover2.png" });
await b.close();
