/* Shared renderer for the legal pages (privacy, terms, disclaimer, patient-rights, grievance).
   Content lives in src/data/legal.js; facts come from BIZ / BIZ.legal. Unknown facts render as a visible TODO. */
import { BIZ } from "../data/site.js";
import { $, $$, esc, pad, icon, fmtDate, pageHero } from "./render.js";
import { PCPNDT_NOTICE } from "./consent.js";

export const TODO = `<span class="todo">[to be provided by the hospital]</span>`;
const L = BIZ.legal || {};
const real = v => (v && !/^(Address line|\+91 0{5} 0{5})/.test(v) ? v : "");

/* {{token}} → value. Empty / placeholder values become TODO. */
const TOKENS = {
  name: BIZ.name, entity: L.entity, address: real(BIZ.address), email: BIZ.email, emergency: BIZ.emergency,
  kpmeReg: L.kpmeReg, pcpndtReg: L.pcpndtReg, gstin: L.gstin,
  "go.name": L.grievanceOfficer?.name, "go.email": L.grievanceOfficer?.email, "go.phone": real(L.grievanceOfficer?.phone),
  "dpo.name": L.dpo?.name, "dpo.email": L.dpo?.email,
  jurisdiction: BIZ.city ? `${BIZ.city}, ${BIZ.region}` : "",
  pcpndt: PCPNDT_NOTICE,
  // Not yet in BIZ: always shown as TODO until the hospital supplies them
  hosting: "", retention: "", cctv: "", processors: "", rates: "", telemedicine: "", kannada: ""
};
export const fill = s => String(s).replace(/\{\{([\w.]+)\}\}/g, (_, k) => (TOKENS[k] ? esc(TOKENS[k]) : TODO));

const block = b => {
  if (typeof b === "string") return `<p>${fill(b)}</p>`;
  const [t, a, tone] = b;
  if (t === "h3") return `<h3>${fill(a)}</h3>`;
  if (t === "ul" || t === "ol") return `<${t} class="lg-list">${a.map(i => `<li>${fill(i)}</li>`).join("")}</${t}>`;
  if (t === "dl") return `<dl class="lg-dl">${a.map(([k, v]) => `<div><dt>${fill(k)}</dt><dd>${fill(v)}</dd></div>`).join("")}</dl>`;
  if (t === "note") return `<div class="lg-note ${tone ? "lg-note--" + tone : ""}" role="note">${icon(tone === "danger" ? "alert" : "info")}<p>${fill(a)}</p></div>`;
  if (t === "table") return `<div class="lg-table" role="region" aria-label="${esc(a.head.join(", "))}" tabindex="0"><table>
    <thead><tr>${a.head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${a.rows.map(r => `<tr>${r.map((c, i) => i ? `<td data-th="${esc(a.head[i])}">${fill(c)}</td>` : `<th scope="row">${fill(c)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  return "";
};
export const blocks = arr => arr.map(block).join("");

const minutes = doc => Math.max(2, Math.round(JSON.stringify(doc.sections.map(s => typeof s.body === "function" ? "" : s.body)).split(/\s+/).length / 220) + (doc.extraMin || 0));

/**
 * Full legal page: hero + meta, sticky TOC (desktop) / collapsible TOC (mobile), numbered sections.
 * doc: { crumb, title, lead, updated, sections: [{ id, label, body: blocks[] | () => html }] }
 */
export function legalPage(doc, { heroExtra = "", after = "" } = {}) {
  const S = doc.sections;
  const toc = cls => `<ol class="${cls}">${S.map((s, i) => `<li><a href="#${s.id}" data-spy="${s.id}"><span class="num">${pad(i + 1)}</span><span>${esc(s.label)}</span></a></li>`).join("")}</ol>`;
  const meta = `<div class="lg-meta" data-reveal>
      <span class="label">Last updated · <time datetime="${doc.updated}">${fmtDate(doc.updated)}</time></span>
      <span class="label">${minutes(doc)} min read</span>
      <button type="button" class="lg-print" data-print>${icon("file")}<span>Print or save as PDF</span></button>
    </div>${heroExtra}`;
  return pageHero(doc.crumb, doc.title, fill(doc.lead), meta) + `
  <section class="lg-body"><div class="container lg-layout">
    <aside class="lg-aside">
      <nav class="lg-nav" aria-label="On this page">
        <span class="label">On this page</span>
        <div class="lg-track" aria-hidden="true"><span class="lg-fill"></span></div>
        ${toc("lg-toc")}
      </nav>
    </aside>
    <details class="lg-mtoc"><summary><span class="label">On this page</span><span class="lg-mtoc-n">${S.length} sections</span>${icon("plus")}</summary>${toc("lg-toc lg-toc--m")}</details>
    <article class="lg-doc">
      ${S.map((s, i) => `
      <section class="lg-sec" id="${s.id}" aria-labelledby="${s.id}-h">
        <h2 id="${s.id}-h"><span class="num">${pad(i + 1)}</span><span>${esc(s.label)}</span><a class="lg-anchor" href="#${s.id}" aria-label="Link to ${esc(s.label)}">#</a></h2>
        ${typeof s.body === "function" ? s.body() : blocks(s.body)}
      </section>`).join("")}
      <p class="lg-end label">End of document · ${esc(BIZ.name)} · <time datetime="${doc.updated}">${fmtDate(doc.updated)}</time></p>
    </article>
  </div></section>${after}`;
}

/* Scroll-spy + reading progress (signature interaction). IntersectionObserver + rAF, no GSAP, so it works with motion off. */
export function bindLegal(doc) {
  const ids = doc.sections.map(s => s.id);
  const links = $$(".lg-nav a[data-spy]"), fillEl = $(".lg-fill"), art = $(".lg-doc");
  let current = "";
  const activate = id => {
    if (id === current) return; current = id;
    links.forEach(a => { const on = a.dataset.spy === id; a.classList.toggle("is-active", on); on ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current"); });
  };
  const visible = new Map();
  const io = new IntersectionObserver(es => {
    es.forEach(e => visible.set(e.target.id, e.isIntersecting));
    const first = ids.find(id => visible.get(id)); if (first) activate(first);
  }, { rootMargin: "-25% 0px -65% 0px" });
  ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  activate(ids[0]);

  let ticking = false;
  const progress = () => {
    ticking = false; if (!fillEl || !art) return;
    const r = art.getBoundingClientRect(), total = r.height - innerHeight * .5;
    const p = Math.min(1, Math.max(0, (innerHeight * .3 - r.top) / Math.max(1, total)));
    fillEl.style.transform = `scaleY(${p})`;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  // Mobile TOC closes after choosing a section
  $$(".lg-toc--m a").forEach(a => a.addEventListener("click", () => { $(".lg-mtoc").open = false; }));
  $("[data-print]")?.addEventListener("click", () => window.print());
}
