/* Tiny mock of the CRM public booking API for local testing: node scripts/mock-crm.mjs  (port 3999)
   Test hooks: GET /__set?conflict=1 (next POST -> 409), ?down=1 (everything -> 503), ?down=0 resets. */
import http from "node:http";
import { DEPARTMENTS, DOCTORS, PACKAGES } from "../src/data/site.js";

const ORIGIN = "http://localhost:5173";
const hook = { conflict: false, down: false };
const services = [
  ...DEPARTMENTS.map(d => ({ id: "svc-" + d.id, slug: d.id, name: d.name + " consultation", description: d.summary, price: 800, durationMinutes: 30 })),
  ...PACKAGES.map(p => ({ id: "svc-pkg-" + p.id, slug: "pkg-" + p.id, name: p.name + " health package", description: "", price: p.price, durationMinutes: 60 }))
];
const doctors = DOCTORS.map(d => ({ id: "doc-" + d.id, slug: d.id, name: d.name, specialization: d.role }));
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; return h >>> 0; };

function slotsFor(docId, date) {
  const doc = DOCTORS.find(d => "doc-" + d.id === docId);
  if (!doc) return null;
  const dt = new Date(date + "T00:00:00+05:30"), dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(date + "T12:00:00Z").getUTCDay()];
  if (!doc.days.includes(dow)) return { onLeave: false, reason: null, slots: [] };
  if (docId === "doc-arjun-rao" && hash(date) % 5 === 0) return { onLeave: true, reason: "Conference", slots: [] };
  const slots = [];
  for (let m = 9 * 60; m < 19 * 60; m += 30) {
    if (hash(docId + date + m) % 3 === 0) continue;
    const iso = `${date}T${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00+05:30`;
    if (new Date(iso) > new Date()) slots.push(new Date(iso).toISOString());
  }
  return { onLeave: false, reason: null, slots };
}

let n = 1;
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  res.setHeader("Access-Control-Allow-Origin", /^http:\/\/localhost:\d+$/.test(req.headers.origin || "") ? req.headers.origin : ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  const send = (c, o) => { res.writeHead(c, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (u.pathname === "/__set") { if (u.searchParams.has("conflict")) hook.conflict = u.searchParams.get("conflict") === "1"; if (u.searchParams.has("down")) hook.down = u.searchParams.get("down") === "1"; return send(200, hook); }
  if (hook.down) return send(503, { error: "down" });
  if (req.method === "GET" && u.pathname === "/api/public/services") return send(200, services);
  if (req.method === "GET" && u.pathname === "/api/public/doctors") return send(200, doctors);
  if (req.method === "GET" && u.pathname === "/api/public/availability") {
    const r = slotsFor(u.searchParams.get("doctorId"), u.searchParams.get("date"));
    return r ? send(200, r) : send(400, { error: "unknown doctor" });
  }
  if (req.method === "POST" && u.pathname === "/api/public/appointments") {
    let b = ""; req.on("data", c => b += c); req.on("end", () => {
      let j; try { j = JSON.parse(b); } catch { return send(400, { error: "bad json", fields: {} }); }
      if (hook.conflict) { hook.conflict = false; return send(409, { error: "Slot just taken" }); }
      const fields = {};
      if (!/^(\+91)?[6-9]\d{9}$/.test(String(j.phone || ""))) fields.phone = "Enter a valid 10-digit Indian mobile number.";
      if (!j.firstName) fields.firstName = "First name is required.";
      if (Object.keys(fields).length) return send(400, { error: "Invalid", fields });
      const doc = doctors.find(d => d.id === j.doctorId), svc = services.find(s => s.id === j.serviceId);
      send(201, { appointmentCode: "APT-" + String(1000 + n++), patientUhid: "UH" + n, service: svc?.name, doctor: doc?.name, scheduledAt: j.scheduledAt });
    });
    return;
  }
  send(404, { error: "not found" });
}).listen(3999, () => console.log("mock CRM on :3999"));
