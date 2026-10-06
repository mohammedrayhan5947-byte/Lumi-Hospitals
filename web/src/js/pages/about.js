import { boot } from "../core.js";
import { pic } from "../media.js";
import "../../css/pages/about.css";
import { BIZ, DEPARTMENTS } from "../../data/site.js";
import { $, $$, esc, tel, btn, icon, pad, media, secHead } from "../render.js";
import { gsap, ScrollTrigger } from "../motion.js";
import { motionAllowed } from "../theme.js";

/* Copy here is philosophy, not fact. Every number and hour comes from site.js. */
const VALUES = [
  { title: "Listen before we treat", short: "Listen",
    text: "The answer is usually in the story. Consultants take the history themselves and give you the time to tell it properly.",
    practice: ["Senior doctors see you in person", "Room for questions in every consult", "Family welcome in the conversation"] },
  { title: "Say it plainly", short: "Clarity",
    text: "A diagnosis you don't understand is only half a diagnosis. We explain what we found, what it means and what happens next, in your language.",
    practice: ["Plain-language explanations", "Written plans you can take home", "Costs discussed before treatment"] },
  { title: "Treat time as care", short: "Time",
    text: "Waiting is not neutral. Booked slots run to the clock, reports come to your phone, and records follow you between specialists.",
    practice: ["Booked patients seen first", "Shared records across specialities", "Digital reports and reminders"] },
  { title: "Never cut a corner", short: "Safety",
    text: "Safety is a habit, not a poster. Checks at every handover, strict infection control and the humility to ask a colleague.",
    practice: ["Checklists at every handover", "Infection control on every floor", "Second opinions encouraged"] }
];

/* Only facilities confirmed by the hospital's own photos. Add cath lab / imaging / dialysis here once confirmed. */
const FACILITIES = [
  { name: "Intensive care unit", ic: "bed", meta: "24/7", img: "icu",
    text: "Monitored beds with ventilator support and a critical-care team on duty around the clock." },
  { name: "Neonatal ICU", ic: "baby", img: "nicu", link: "/specialities/paediatrics.html",
    text: "Close monitoring and specialist care for premature and unwell newborns." },
  { name: "Operation theatres", ic: "shield", img: "ot",
    text: "Modular theatres with twin surgical lights and anaesthesia workstations, for planned and emergency surgery." },
  { name: "Wards", ic: "bed", img: "ward",
    text: "Curtained bays with bedside oxygen and monitoring, and room for a family member to stay close." },
  { name: "Laboratory", ic: "flask", meta: BIZ.hours.lab, img: "lab", link: "/specialities/diagnostics.html",
    text: "An in-house lab for routine and urgent tests, so results arrive while decisions are being made." },
  { name: "OPD & reception", ic: "users", img: "opd", link: "/doctors.html",
    text: "Bright, glass-fronted consultation rooms and a reception that keeps your file ready before you arrive." },
  { name: "Emergency & ambulance", ic: "ambulance", meta: "24/7", img: "emergency-entrance", link: "/emergency.html",
    text: "A separate emergency entrance with ramp access, and an ambulance on standby day and night." },
  { name: "Pharmacy", ic: "pill", meta: BIZ.hours.pharmacy, img: "exterior-2",
    text: "An in-house pharmacy at the entrance, so you leave with your medicines in hand." }
];

const hero = () => `
<section class="ab-hero" data-instant>
  <div class="page-hero-glow"></div>
  <div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>About</span></nav>
    <div class="ab-hero-grid">
      <h1 data-split>A hospital that feels like <em>someone</em> is looking out for you.</h1>
      <div class="ab-hero-aside">
        ${BIZ.founded ? `<span class="label label--accent">Caring since ${esc(BIZ.founded)}</span>` : `<span class="label">About ${esc(BIZ.name)}</span>`}
        <p class="lead" data-reveal>${esc(BIZ.intro)}</p>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="ab-hero-media ph" data-reveal="scale">
      <div class="inner" data-parallax="0.08">${pic("exterior", { sizes: "100vw", eager: true })}</div>
      <span class="ab-hero-cap label">${esc(BIZ.tagline)}</span>
    </div>
  </div>
</section>`;

const story = () => `
<section class="section ab-story"><div class="container ab-story-row">
  <div class="sec-index label"><span class="num">(01)</span><span>Our story</span></div>
  <div>
    <p class="ab-story-big" data-reveal>We started from one question: what would a hospital feel like if it were designed around the person in the waiting chair, <em>not</em> the queue?</p>
    <div class="ab-story-cols">
      <p data-reveal>The answer shaped everything. ${DEPARTMENTS.length} specialities that share one record, so you never repeat your story. Diagnostics in the same building, so a scan doesn't become a second trip. An emergency team, ICU and pharmacy that never close.</p>
      <p data-reveal>And people who remember that a hospital visit is rarely a good day. Our specialists are senior, but they are also patient. They explain, they listen, and they treat your time as carefully as your health.</p>
    </div>
  </div>
</div></section>`;

const ring = (i, r) => `<circle class="ab-ring" data-ring="${i}" cx="120" cy="120" r="${r}" pathLength="1"/>`;

const values = () => `
<section class="section section--alt ab-values" aria-labelledby="ab-values-h">
  <div class="container">
    ${secHead("02", "What we stand for", `Four principles, <em>every</em> shift.`, `<p>These aren't slogans on a wall. They're the questions we ask at handover, in reviews and when something goes wrong.</p>`).replace("<h2 ", '<h2 id="ab-values-h" ')}
    <div class="ab-values-grid">
      <div class="ab-lumen" aria-hidden="true">
        <div class="ab-lumen-in">
          <svg viewBox="0 0 240 240">
            <circle class="ab-ring-bg" cx="120" cy="120" r="110"/><circle class="ab-ring-bg" cx="120" cy="120" r="90"/>
            <circle class="ab-ring-bg" cx="120" cy="120" r="70"/><circle class="ab-ring-bg" cx="120" cy="120" r="50"/>
            ${ring(0, 50)}${ring(1, 70)}${ring(2, 90)}${ring(3, 110)}
          </svg>
          <div class="ab-core"></div>
          <div class="ab-count"><span class="num" id="ab-count">01</span><span class="label">/ ${pad(VALUES.length)}</span></div>
        </div>
        <ol class="ab-lumen-keys label">${VALUES.map((v, i) => `<li data-key="${i}"><span class="num">${pad(i + 1)}</span>${v.short}</li>`).join("")}</ol>
      </div>
      <ol class="ab-value-list">
        ${VALUES.map((v, i) => `
        <li class="ab-value" data-value="${i}">
          <span class="ab-value-num">${pad(i + 1)}</span>
          <h3>${v.title}</h3>
          <p>${v.text}</p>
          <ul class="ab-practice">${v.practice.map(x => `<li>${icon("check")}${x}</li>`).join("")}</ul>
        </li>`).join("")}
      </ol>
    </div>
  </div>
</section>`;

const facilities = () => `
<section class="section ab-fac"><div class="container">
  ${secHead("03", "Facilities", `Everything you need, <em>under</em> one roof.`, `<p>Critical care, surgery and diagnostics sit a corridor apart, so the right equipment and the right people reach you quickly.</p>`)}
  <div class="ab-fac-grid">
    ${FACILITIES.map((f, i) => {
      const tag = f.link ? "a" : "div";
      return `<${tag} class="ab-fac-cell${f.link ? " is-link" : ""}"${f.link ? ` href="${f.link}"` : ""} data-reveal>
        ${f.img ? `<div class="ab-fac-img">${pic(f.img, { sizes: "(max-width: 860px) 100vw, 33vw" })}</div>` : ""}
        <div class="ab-fac-top"><span class="ic-badge">${icon(f.ic)}</span><span class="label num">${pad(i + 1)}</span></div>
        <h3>${f.name}</h3>
        <p>${f.text}</p>
        ${f.meta || f.link ? `<div class="ab-fac-foot">${f.meta ? `<span class="tag">${icon("clock")}${esc(f.meta)}</span>` : "<span></span>"}${f.link ? `<span class="ab-fac-go">${icon("arrowUpRight")}</span>` : ""}</div>` : ""}
      </${tag}>`;
    }).join("")}
  </div>
</div></section>`;

const stats = () => `
<section class="section--tight section--alt ab-stats" aria-label="${esc(BIZ.name)} in numbers"><div class="container">
  <div class="ab-stats-grid">
    ${BIZ.stats.map(s => `<div class="ab-stat" data-reveal><b><span data-count="${s.value}">${s.value}</span><i>${esc(s.suffix)}</i></b><span>${esc(s.label)}</span></div>`).join("")}
  </div>
</div></section>`;

const cta = () => `
<section class="section"><div class="container">
  <div class="ab-cta"><div class="ab-cta-glow"></div>
    <span class="label">Visit us</span>
    <h2 data-split>Come and see us in <em>person.</em></h2>
    <p data-reveal>Meet a specialist, walk the floors, ask us anything. Book a consultation, or call and we'll help you find the right doctor.</p>
    <div class="btn-row" data-reveal>${btn("/appointment.html", "Book appointment", "accent", { ic: "calendar" })}${btn("/contact.html", "Directions & contact", "glass", { ic: "pin" })}<a class="btn btn--glass" href="${tel(BIZ.phone)}" data-magnetic><span>${esc(BIZ.phone)}</span><span class="btn-ic">${icon("phone")}</span></a></div>
  </div>
</div></section>`;

/* Signature interaction: each principle lights another ring of the lumen as you scroll. */
function valuesScroll() {
  const items = $$(".ab-value"), rings = $$(".ab-ring"), keys = $$(".ab-lumen-keys li"), count = $("#ab-count"), core = $(".ab-core");
  const setActive = i => {
    items.forEach((el, j) => el.classList.toggle("is-active", j === i));
    keys.forEach((el, j) => el.classList.toggle("is-on", j <= i));
    count.textContent = pad(i + 1);
  };
  if (!motionAllowed()) { $(".ab-values").classList.add("is-static"); setActive(items.length - 1); return; }
  ScrollTrigger.matchMedia({
    "(min-width: 861px)": () => {
      gsap.set(rings, { strokeDashoffset: 1 });
      const tws = items.map((el, i) => {
        const tw = gsap.to(rings[i], { strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: el, start: "top 75%", end: "center 50%", scrub: .6,
            onToggle: s => s.isActive && setActive(i), onEnterBack: () => setActive(i) } });
        return tw;
      });
      const coreTw = gsap.fromTo(core, { scale: .55, opacity: .5 }, { scale: 1.05, opacity: 1, ease: "none",
        scrollTrigger: { trigger: ".ab-value-list", start: "top 70%", end: "bottom 60%", scrub: .6 } });
      const svgTw = gsap.fromTo(".ab-lumen svg", { rotate: -90 }, { rotate: 30, ease: "none",
        scrollTrigger: { trigger: ".ab-value-list", start: "top bottom", end: "bottom top", scrub: 1 } });
      setActive(0);
      return () => { tws.forEach(t => t.kill()); coreTw.kill(); svgTw.kill(); gsap.set(rings, { clearProps: "all" }); };
    },
    "(max-width: 860px)": () => { items.forEach(el => el.classList.add("is-active")); }
  });
}

boot(() => {
  $("main").innerHTML = hero() + story() + values() + facilities() + stats() + cta();
  requestAnimationFrame(valuesScroll);
});
