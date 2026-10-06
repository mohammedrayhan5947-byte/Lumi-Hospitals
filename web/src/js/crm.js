/* Booking CRM client. Active only when VITE_CRM_URL is set; otherwise the site is WhatsApp/email only.
   Every call has a 6s timeout and throws CrmError. Personal data is never logged. */
import { BIZ } from "../data/site.js";

const base = String(BIZ.crmUrl || "").replace(/\/+$/, "");
export const crmEnabled = !!base;
const TIMEOUT = 6000;

/** kind: "timeout" | "network" | "server" | "invalid" (400, .fields) | "conflict" (409) | "unavailable" */
export class CrmError extends Error {
  constructor(kind, status = 0, fields = {}, message = "") { super(message || kind); this.name = "CrmError"; this.kind = kind; this.status = status; this.fields = fields; }
}

async function call(path, opts = {}) {
  if (!crmEnabled) throw new CrmError("unavailable");
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  let res;
  try {
    res = await fetch(base + path, { ...opts, signal: ctl.signal, credentials: "omit", headers: opts.body ? { "Content-Type": "application/json" } : undefined });
  } catch (e) {
    throw new CrmError(e?.name === "AbortError" ? "timeout" : "network");
  } finally { clearTimeout(timer); }
  let data = null;
  try { data = await res.json(); } catch { /* empty or non-JSON body */ }
  if (res.ok) return data;
  if (res.status === 400) throw new CrmError("invalid", 400, data?.fields || {}, data?.error);
  if (res.status === 409) throw new CrmError("conflict", 409, {}, data?.error);
  throw new CrmError("server", res.status, {}, data?.error);
}

let catalog = null;
/** Resolves {ok, svc(slug)->crm service, doc(slug)->crm doctor}. Never rejects; ok=false when unreachable. */
export function loadCatalog() {
  if (catalog) return catalog;
  catalog = (async () => {
    const out = { ok: false, svc: new Map(), doc: new Map() };
    if (!crmEnabled) return out;
    try {
      const [s, d] = await Promise.all([call("/api/public/services"), call("/api/public/doctors")]);
      (Array.isArray(s) ? s : []).forEach(x => x?.slug && out.svc.set(x.slug, x));
      (Array.isArray(d) ? d : []).forEach(x => x?.slug && out.doc.set(x.slug, x));
      out.ok = out.svc.size > 0 && out.doc.size > 0;
    } catch { /* stay in WhatsApp/email mode */ }
    return out;
  })();
  return catalog;
}

export async function getSlots(doctorSlug, dateISO) {
  const c = await loadCatalog();
  const doc = c.doc.get(doctorSlug);
  if (!doc) throw new CrmError("unavailable");
  const r = await call(`/api/public/availability?doctorId=${encodeURIComponent(doc.id)}&date=${encodeURIComponent(dateISO)}`);
  return { onLeave: !!r?.onLeave, reason: r?.reason || null, slots: Array.isArray(r?.slots) ? r.slots : [] };
}

/** payload: {serviceSlug, doctorSlug, firstName, lastName?, phone, email?, gender?, scheduledAt, reason?} */
export async function book({ serviceSlug, doctorSlug, ...rest }) {
  const c = await loadCatalog();
  const svc = c.svc.get(serviceSlug), doc = c.doc.get(doctorSlug);
  if (!svc || !doc) throw new CrmError("unavailable");
  const body = { ...rest, serviceId: svc.id, doctorId: doc.id };
  Object.keys(body).forEach(k => (body[k] === "" || body[k] == null) && delete body[k]);
  return call("/api/public/appointments", { method: "POST", body: JSON.stringify(body) });
}
