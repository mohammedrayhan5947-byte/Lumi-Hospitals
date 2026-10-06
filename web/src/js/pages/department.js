import { boot } from "../core.js";
import { pcpndtNotice } from "../consent.js";
import "../../css/pages/department.css";
import { BIZ, DEPARTMENTS, PACKAGES } from "../../data/site.js";
import { $, $$, esc, tel, btn, icon, pad, params, deptById, doctorsIn, doctorCard, packageCard, secHead } from "../render.js";
import { gsap } from "../motion.js";
import { motionAllowed } from "../theme.js";

const d = deptById(document.querySelector("main")?.dataset.id || params.get("id")) || DEPARTMENTS[0];
const idx = DEPARTMENTS.indexOf(d);
const prev = DEPARTMENTS[(idx - 1 + DEPARTMENTS.length) % DEPARTMENTS.length];
const next = DEPARTMENTS[(idx + 1) % DEPARTMENTS.length];
const team = doctorsIn(d.id);

/* Related health checks. Prefer `packages: [ids]` on the department in site.js;
   until the lead adds it, fall back to this editorial pairing. */
const PAIRING = { cardiology: ["heart", "executive"], obgyn: ["women"], "general-medicine": ["diabetes", "executive", "senior"], diagnostics: ["essential", "executive"], neurology: ["senior"], orthopaedics: ["senior"], "nephro-uro": ["diabetes"] };
const pkgs = (d.packages || PAIRING[d.id] || []).map(id => PACKAGES.find(p => p.id === id)).filter(Boolean);

/* "Obstetrics & Gynaecology" → the ampersand becomes the serif accent. */
const title = esc(d.name).replace(" &amp; ", " <em>&amp;</em> ");

const hero = () => `
<section class="page-hero dp-hero"><div class="page-hero-glow"></div><div class="container dp-hero-in">
  <div class="dp-hero-text">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/departments.html">Specialities</a><span>/</span><span aria-current="page">${esc(d.name)}</span></nav>
    <h1 data-split data-instant>${title}</h1>
    <p class="lead" data-reveal>${esc(d.about)}</p>
    <div class="btn-row" data-reveal>${btn(`/appointment.html?dept=${d.id}`, "Book an appointment", "accent", { ic: "calendar" })}${btn(tel(BIZ.phone), "Call reception", "line", { ic: "phone" })}</div>
  </div>
  <aside class="dp-emblem" data-reveal="scale" aria-label="At a glance">
    <div class="dp-emblem-media ph">${d.img ? `<img class="dp-photo" src="${d.img}" srcset="${d.img.replace(".webp", "-sm.webp")} 720w, ${d.img} 1800w" sizes="(max-width: 860px) 100vw, 40vw" alt="${d.name} at ${"Lumi Hospital"}" fetchpriority="high"><span class="dp-photo-ic">${icon(d.icon)}</span>` : `<div class="ph-mono">${icon(d.icon)}</div>`}<span class="dp-emblem-num label">${pad(idx + 1)} / ${pad(DEPARTMENTS.length)}</span></div>
    <dl class="dp-glance">
      <div><dt class="label">Specialists</dt><dd>${team.length ? pad(team.length) : "—"}</dd></div>
      <div><dt class="label">Services</dt><dd>${pad(d.services.length)}</dd></div>
      <div class="wide"><dt class="label">OPD hours</dt><dd class="sm">${esc(BIZ.hours.opd)}</dd></div>
    </dl>
  </aside>
</div></section>`;

const services = () => `
<section class="section dp-services"><div class="container dp-split">
  <div class="dp-split-head">
    <div class="sec-index label"><span class="num">(01)</span><span>Services</span></div>
    <h2 data-split>What we <em>do</em> here.</h2>
    <p class="muted" data-reveal>Every service is backed by the same 24/7 lab, imaging and pharmacy, and by colleagues across all ${DEPARTMENTS.length} specialities.</p>
  </div>
  <ol class="dp-svc">${d.services.map((s, i) => `<li data-reveal><span class="num">${pad(i + 1)}</span><span class="dp-svc-name">${esc(s)}</span><span class="dp-svc-dot" aria-hidden="true"></span></li>`).join("")}</ol>
</div></section>`;

const conditions = () => `
<section class="section section--alt dp-cond"><div class="container">
  ${secHead("02", "Conditions we treat", `Common reasons people <em>see</em> us.`, `<p>Not on the list? This is a starting point, not a limit. Ask us about your symptoms.</p>`)}
  <ul class="dp-chips" aria-label="Conditions treated">${d.conditions.map(c => `<li data-reveal>${esc(c)}</li>`).join("")}</ul>
</div></section>`;

/* Few items read better as an editorial split than as a sparse grid. */
const splitHead = (n, label, h, p, action) => `
  <div class="dp-split-head">
    <div class="sec-index label"><span class="num">(${n})</span><span>${label}</span></div>
    <h2 data-split>${h}</h2>
    ${p ? `<p class="muted" data-reveal>${p}</p>` : ""}
    <div class="btn-row" data-reveal>${action}</div>
  </div>`;

const doctors = () => {
  const action = btn(`/doctors.html?dept=${d.id}`, "Find a doctor", "line");
  const body = team.length
    ? `<div class="grid dp-team">${team.map(doctorCard).join("")}</div>`
    : `<div class="tile dp-none" data-reveal><span class="ic-badge">${icon("users")}</span><div><h3>Consultant profiles coming soon</h3><p class="muted">Call reception and we'll book you with the specialist on duty.</p></div>${btn(tel(BIZ.phone), esc(BIZ.phone), "accent", { ic: "phone" })}</div>`;
  if (team.length > 2) return `<section class="section"><div class="container">${secHead("03", "Specialists", `The <em>team</em> you'll meet.`, action)}${body}</div></section>`;
  return `<section class="section"><div class="container dp-split">${splitHead("03", "Specialists", `The <em>team</em> you'll meet.`, "Senior consultants who see you themselves, with records shared across every speciality.", action)}${body}</div></section>`;
};

const packages = () => !pkgs.length ? "" : `
<section class="section section--alt"><div class="container dp-split">
  ${splitHead("04", "Health checks", `Prevention, <em>packaged.</em>`, `Screening packages our ${esc(d.name.toLowerCase())} team recommends, with results reviewed by a doctor.`, btn("/packages.html", "All packages", "line"))}
  <div class="grid dp-pkgs">${pkgs.map(packageCard).join("")}</div>
</div></section>`;

const cta = () => `
<section class="section section--tight"><div class="container">
  <div class="dp-cta">
    <div class="dp-cta-glow" aria-hidden="true"></div>
    <span class="dp-cta-ic" aria-hidden="true">${icon(d.icon)}</span>
    <span class="label">${esc(d.name)} · ${esc(BIZ.hours.opd)}</span>
    <h2 data-split>Ready when <em>you</em> are.</h2>
    <p data-reveal>Pick a time online, or call and we'll find the earliest slot with the right specialist.</p>
    <div class="btn-row" data-reveal>${btn(`/appointment.html?dept=${d.id}`, "Book appointment", "accent", { ic: "calendar" })}${btn(tel(BIZ.emergency), "Emergency " + esc(BIZ.emergency), "glass", { ic: "ambulance" })}</div>
  </div>
</div></section>`;

const pager = () => `
<nav class="dp-pager" aria-label="More specialities"><div class="container dp-pager-in">
  ${[["prev", prev, "Previous"], ["next", next, "Next"]].map(([k, x, l]) => `
    <a class="dp-pg dp-pg--${k}" href="/specialities/${x.id}.html" rel="${k}">
      <span class="label">${k === "prev" ? icon("arrowLeft") : ""}${l} speciality${k === "next" ? icon("arrow") : ""}</span>
      <span class="dp-pg-name">${esc(x.name)}</span>
      <span class="dp-pg-ic" aria-hidden="true">${icon(x.icon)}</span>
    </a>`).join("")}
</div></nav>`;

/* Signature: the emblem icon draws itself in, then breathes with scroll. */
function emblem() {
  if (!motionAllowed()) return;
  const paths = $$(".dp-emblem .ph-mono .ic > *");
  paths.forEach(p => {
    const len = p.getTotalLength?.() || 0; if (!len) return;
    gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", delay: .4 });
  });
  gsap.to(".dp-emblem .ph-mono .ic", { scale: 1.15, rotate: -6, ease: "none", scrollTrigger: { trigger: ".dp-hero", start: "top top", end: "bottom top", scrub: true } });
}

boot(() => {
  document.title = `${d.name} | ${BIZ.name}`;
  $('meta[name="description"]')?.setAttribute("content", d.summary);
  $("main").innerHTML = hero() + services() + conditions() + doctors() + packages() + (["obgyn", "diagnostics"].includes(d.id) ? `<div class="container" style="padding-block:0 40px">${pcpndtNotice()}</div>` : "") + cta() + pager();
  emblem();
});
