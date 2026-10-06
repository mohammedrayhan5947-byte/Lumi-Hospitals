import { boot } from "../core.js";
import { pcpndtNotice } from "../consent.js";
import "../../css/pages/packages.css";
import { BIZ, PACKAGES, FAQ } from "../../data/site.js";
import { $, $$, esc, tel, wa, inr, icon, btn, pad, packageCard, secHead, accordion } from "../render.js";
import { gsap, refreshMotion } from "../motion.js";
import { Flip } from "gsap/Flip";
import { motionAllowed } from "../theme.js";

gsap.registerPlugin(Flip);

/* ---------- Derived views of PACKAGES ---------- */
/* Audience tags are derived from each package's id, name and "for" line. */
const FILTERS = [
  { id: "all", label: "All packages" },
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "seniors", label: "Seniors 60+" },
  { id: "heart", label: "Heart" },
  { id: "diabetes", label: "Diabetes" }
];
function audiences(p) {
  const t = `${p.id} ${p.name} ${p.for}`.toLowerCase();
  const tags = new Set(["all"]);
  if (/women|her health/.test(t)) tags.add("women"); else tags.add("men");
  if (/60\+|senior|silver/.test(t)) tags.add("seniors");
  if (/heart|cardiac/.test(t)) tags.add("heart");
  if (/diabet|sugar/.test(t)) tags.add("diabetes");
  return [...tags];
}

/* Comparison rows: matched against each package's listed inclusions ("Everything in X" expands X). */
const ROWS = [
  ["Complete blood count", /complete blood count|cbc|full blood panel/i],
  ["Blood sugar", /sugar/i],
  ["HbA1c (3-month sugar)", /hba1c/i],
  ["Lipid profile", /lipid/i],
  ["Liver function", /liver/i],
  ["Kidney function", /kidney/i],
  ["Thyroid profile", /thyroid/i],
  ["Urine routine", /urine/i],
  ["Cardiac risk markers", /cardiac risk/i],
  ["ECG", /ecg/i],
  ["2D Echo", /echo/i],
  ["TMT stress test", /tmt/i],
  ["Chest X-ray", /x-ray/i],
  ["Ultrasound", /ultrasound/i],
  ["Vitamins & iron", /vitamin|iron/i],
  ["Bone density scan", /bone density/i],
  ["Pap smear / mammogram", /pap|mammo/i],
  ["Eye, hearing or foot screening", /eye|hearing|foot/i]
];
const listed = (p, seen = new Set()) => {
  if (seen.has(p.id)) return [];
  seen.add(p.id);
  return p.includes.flatMap(i => {
    const m = i.match(/^everything in (.+)$/i);
    const base = m && PACKAGES.find(x => x.name.toLowerCase() === m[1].trim().toLowerCase());
    return base ? listed(base, seen) : [i];
  });
};
const has = (p, re) => listed(p).some(i => re.test(i));
const consult = p => listed(p).filter(i => /consult/i.test(i)).pop()?.replace(/\s*consult(ation)?$/i, "") || "";

/* Preparation guidance (general; confirm wording with the hospital's lab team). */
const PREP = [
  ["Fast for 10–12 hours", "Nothing to eat after dinner the night before. Plain water is fine and helps the blood draw."],
  ["Take your usual medicines", "Blood pressure and thyroid tablets as normal, with water. Bring diabetes medicines or insulin and take them after the fasting sample."],
  ["Bring what you have", "Photo ID, previous reports, prescriptions and a list of the medicines you take."],
  ["Dress for the tests", "Loose, two-piece clothing makes ECG, ultrasound and X-ray quicker. Leave jewellery at home."],
  ["Tell us first", "If you are pregnant, could be, or are on your period, let us know when booking. Some tests are rescheduled."]
];

const PKG_FAQ = [
  { q: "Do I need to fast before a health check?", a: "For most packages, yes: 10–12 hours without food. Plain water is fine. We confirm the instructions for your package when we call to book." },
  { q: "Can I take my regular medicines?", a: "Usually yes, with water. If you take medicine or insulin for diabetes, bring it along and take it after the fasting blood sample. When unsure, ask your doctor or call us." },
  { q: "How long does a check-up take?", a: "Plan for most of a morning. Fasting blood samples come first, then imaging and other tests, then the consultation included in your package." },
  ...FAQ.filter(f => /report/i.test(f.q)),
  { q: "Can I book a check-up for a parent or partner?", a: "Yes. Book on their behalf and enter their name, age and mobile number in the booking form, so we can share instructions with them directly." }
];

/* ---------- Markup ---------- */
const hero = () => `
<section class="page-hero pk-hero"><div class="page-hero-glow"></div><div class="container">
  <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Health checks</span></nav>
  <div class="pk-hero-in">
    <h1 data-split data-instant>Health checks, <em>clearly</em> priced.</h1>
    <div>
      <p class="lead" data-reveal>Six packages, each with a consultation to explain your results. No add-ons sprung on you at the counter.</p>
      <ul class="pk-jump" data-reveal aria-label="Jump to a package">
        ${PACKAGES.map(p => `<li><a href="#${p.id}"><span>${esc(p.name)}</span><b>${inr(p.price)}</b></a></li>`).join("")}
      </ul>
    </div>
  </div>
</div></section>`;

const list = () => `
<section class="section section--tight pk-list" aria-labelledby="pk-list-h"><div class="container">
  <div class="pk-bar">
    <h2 id="pk-list-h" class="sr-only">All packages</h2>
    <div class="chips" role="group" aria-label="Filter packages by who they are for">
      ${FILTERS.map(f => `<button type="button" class="chip" data-f="${f.id}" aria-pressed="${f.id === "all"}">${f.label}<span class="cnt num">${PACKAGES.filter(p => audiences(p).includes(f.id)).length}</span></button>`).join("")}
    </div>
    <p class="label" aria-live="polite" id="pk-count">Showing ${PACKAGES.length} packages</p>
  </div>
  <div class="grid g3 pk-grid" id="pk-grid">${PACKAGES.map(p => packageCard(p).replace('class="tile pkg', `data-aud="${audiences(p).join(" ")}" class="tile pkg`)).join("")}</div>
  <p class="form-note pk-note">Prices include the listed tests and consultation. ${BIZ.name} confirms the full test list when you book.</p>
</div></section>`;

const cell = (p, [label, re]) => has(p, re)
  ? `<span class="yes">${icon("check")}<span class="sr-only">Included</span></span>`
  : `<span class="no" aria-hidden="true"></span><span class="sr-only">Not listed</span>`;

const compare = () => `
<section class="section section--alt" id="compare"><div class="container">
  ${secHead("01", "Compare", `What's <em>inside</em> each check.`, `<p>Every row is taken from each package's list of inclusions. A dash means the test isn't listed for that package.</p>`)}
  <div class="cmp-wrap" data-reveal>
    <table class="cmp">
      <caption class="sr-only">Comparison of tests included in each health check package</caption>
      <thead><tr><th scope="col" class="cmp-corner"><span class="label">Test</span></th>
        ${PACKAGES.map(p => `<th scope="col" class="${p.featured ? "is-featured" : ""}"><a href="#${p.id}"><span class="label">${p.tests} tests</span><b>${esc(p.name)}</b><span class="cmp-price">${inr(p.price)}</span></a></th>`).join("")}</tr></thead>
      <tbody>
        ${ROWS.map(r => `<tr><th scope="row">${r[0]}</th>${PACKAGES.map(p => `<td class="${p.featured ? "is-featured" : ""}">${cell(p, r)}</td>`).join("")}</tr>`).join("")}
        <tr class="cmp-consult"><th scope="row">Consultation</th>${PACKAGES.map(p => `<td class="${p.featured ? "is-featured" : ""}">${esc(consult(p)) || "—"}</td>`).join("")}</tr>
      </tbody>
      <tfoot><tr><th scope="row"><span class="sr-only">Book</span></th>${PACKAGES.map(p => `<td class="${p.featured ? "is-featured" : ""}">${btn(`/appointment.html?package=${p.id}`, "Book", p.featured ? "accent" : "line", { sm: true, ic: "" , attrs: `aria-label="Book ${esc(p.name)}"` })}</td>`).join("")}</tr></tfoot>
    </table>
  </div>
  <div class="cmp-cards">
    ${PACKAGES.map(p => {
      const inc = ROWS.filter(r => has(p, r[1]));
      return `<article class="tile cmp-card ${p.featured ? "is-featured" : ""}" data-reveal>
        <header><div><span class="label">${p.tests} tests</span><h3>${esc(p.name)}</h3><p class="muted cmp-for">${esc(p.for)}</p></div><b class="cmp-price">${inr(p.price)}</b></header>
        <p class="label cmp-of">${inc.length} of ${ROWS.length} compared tests</p>
        <ul class="cmp-list">${inc.map(r => `<li>${icon("check")}<span>${r[0]}</span></li>`).join("")}</ul>
        <p class="cmp-miss"><span class="label">Not listed</span>${ROWS.filter(r => !has(p, r[1])).map(r => r[0]).join(" · ")}</p>
        <p class="cmp-c"><span class="label">Consultation</span>${esc(consult(p))}</p>
        ${btn(`/appointment.html?package=${p.id}`, `Book ${esc(p.name)}`, p.featured ? "accent" : "line", { sm: true })}
      </article>`;
    }).join("")}
  </div>
</div></section>`;

const prep = () => `
<section class="section"><div class="container prep">
  <div class="prep-intro">
    <div class="sec-index label"><span class="num">(02)</span><span>Before you come</span></div>
    <h2 data-split style="margin-top:14px">Five things that make the <em>morning</em> easy.</h2>
    <p class="lead" data-reveal>Good preparation means accurate results and no repeat visits.</p>
  </div>
  <ol class="prep-list">${PREP.map(([h, p], i) => `<li data-reveal><span class="num">${pad(i + 1)}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join("")}</ol>
</div></section>`;

const faq = () => `
<section class="section section--alt"><div class="container prep" style="align-items:start">
  <div class="prep-intro">
    <div class="sec-index label"><span class="num">(03)</span><span>Questions</span></div>
    <h2 data-split style="margin-top:14px">Asked <em>often.</em></h2>
  </div>
  ${accordion(PKG_FAQ)}
</div></section>`;

const cta = () => `
<section class="section"><div class="container">
  <div class="pk-cta">
    <div class="pk-cta-glow" aria-hidden="true"></div>
    <div>
      <span class="label">Not sure which one?</span>
      <h2 data-split>Tell us your age and history. We'll <em>suggest</em> the right check.</h2>
    </div>
    <div class="btn-row">
      <a class="btn btn--accent" href="${wa("Hi, I need help choosing a health check-up package.")}" target="_blank" rel="noopener" data-magnetic><span>Ask on WhatsApp</span><span class="btn-ic">${icon("chat")}</span></a>
      <a class="btn btn--glass" href="${tel(BIZ.phone)}" data-magnetic><span>${esc(BIZ.phone)}</span><span class="btn-ic">${icon("phone")}</span></a>
    </div>
  </div>
</div></section>`;

/* ---------- Behaviour ---------- */
function setFilter(id, { animate = true } = {}) {
  const grid = $("#pk-grid"), cards = $$(".pkg", grid);
  const state = animate && motionAllowed() ? Flip.getState(cards) : null;
  let n = 0;
  cards.forEach(c => { const on = c.dataset.aud.split(" ").includes(id); c.hidden = !on; if (on) n++; });
  $$(".pk-bar .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.f === id));
  $("#pk-count").textContent = `Showing ${n} ${n === 1 ? "package" : "packages"}`;
  if (state) {
    cards.forEach(c => { if (!c.hidden) { c.dataset.revealed = "1"; gsap.set(c, { opacity: 1, y: 0 }); } });
    Flip.from(state, { duration: .8, ease: "expo.out", absolute: true, scale: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .7, ease: "expo.out" }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: .94, duration: .35 }),
      onComplete: () => refreshMotion(grid) });
  }
}

function toHash(smooth) {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id && document.getElementById(id);
  if (!el) return;
  if (el.classList.contains("pkg") && el.hidden) setFilter("all", { animate: false });
  if (el.dataset.reveal !== undefined) { el.dataset.revealed = "1"; el.style.opacity = 1; el.style.transform = "none"; }
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -110, immediate: !smooth });
  else el.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
  if (el.classList.contains("pkg")) {
    el.classList.remove("is-target"); void el.offsetWidth; el.classList.add("is-target");
    setTimeout(() => el.classList.remove("is-target"), 2600);
  }
}

boot(() => {
  $("main").innerHTML = hero() + list() + compare() + `<div class="container" style="padding-bottom:40px">${pcpndtNotice()}</div>` + prep() + faq() + cta();
  $(".pk-bar").addEventListener("click", e => { const b = e.target.closest(".chip"); if (b) setFilter(b.dataset.f); });
  $$(".pkg").forEach(c => { c.style.scrollMarginTop = "110px"; });
  // Deep links (#women from the season banner) once layout and fonts have settled.
  if (location.hash) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const go = () => setTimeout(() => toHash(false), 60);
    document.readyState === "complete" ? requestAnimationFrame(go) : addEventListener("load", go, { once: true });
  }
  addEventListener("hashchange", () => toHash(true));
});
