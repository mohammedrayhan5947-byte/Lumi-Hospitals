/* QA: log in to the CRM and screenshot pages. node scripts/crm-shot.mjs <email> <password> <path...> */
import puppeteer from "puppeteer-core";
const [, , email, password, ...paths] = process.argv;
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/login", { waitUntil: "networkidle0", timeout: 120000 });
await p.screenshot({ path: ".shots/crm-login.png" });
await p.type('input[name="email"], input[type="email"]', email); await p.type('input[type="password"]', password);
await Promise.all([p.waitForNavigation({ waitUntil: "networkidle0", timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')]);
for (const path of paths) { await p.goto("http://localhost:3000/" + path.replace(/^[/]+/, ""), { waitUntil: "networkidle0", timeout: 120000 }); await p.screenshot({ path: `.shots/crm-${path.replace(/\W+/g, "_")}.png` }); }
console.log(errs.length ? "ERRORS:\n" + errs.slice(0, 5).join("\n") : "no console errors", p.url());
await b.close();
