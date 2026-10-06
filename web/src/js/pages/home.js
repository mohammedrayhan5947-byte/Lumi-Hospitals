import { boot } from "../core.js";
import "../../css/home.css";
import { BIZ, DEPARTMENTS, DOCTORS, PACKAGES, POSTS, JOURNEY, TESTIMONIALS, FAQ } from "../../data/site.js";
import { $, $$, esc, tel, btn, icon, pad, deptCard, packageCard, postCard, secHead, accordion, media } from "../render.js";
import { logoMark } from "../layout.js";
import { pic, figure } from "../media.js";
import { lumenField } from "../shader.js";
import { gsap, ScrollTrigger } from "../motion.js";
import { motionAllowed } from "../theme.js";

const hero = () => `
<section class="hero" aria-label="Introduction">
  <canvas id="lumen" aria-hidden="true"></canvas>
  <div class="container hero-in">
    <div class="hero-copy">
      <div class="hero-kicker label"><span class="dot"></span>Open now · Emergency, ICU &amp; pharmacy 24/7</div>
      <h1 data-split data-instant>Medicine, in a better <em>light.</em></h1>
      <p class="hero-lead" data-reveal>${esc(BIZ.intro)}</p>
      <form class="hero-book" action="/appointment.html" method="get" data-reveal>
        <label class="sr-only" for="q-dept">Choose a speciality</label>
        <select class="select" id="q-dept" name="dept">
          <option value="">Which speciality do you need?</option>
          ${DEPARTMENTS.map(d => `<option value="${d.id}">${d.name}</option>`).join("")}
        </select>
        <button class="btn btn--accent" type="submit" data-magnetic><span>Book a visit</span><span class="btn-ic">${icon("arrow")}</span></button>
      </form>
      <div class="hero-links" data-reveal>
        <a class="link" href="/doctors.html">Find a doctor ${icon("arrowUpRight")}</a>
        <a class="link" href="/gallery.html">Tour the hospital ${icon("arrowUpRight")}</a>
      </div>
    </div>
    <div class="hero-visual" aria-label="Lumi Hospital">
      <div class="hero-photo hero-photo--main">${pic("exterior-tall", { eager: true, sizes: "(max-width: 1100px) 80vw, 32vw" })}</div>
      <div class="hero-photo hero-photo--sub">${pic("icu", { sizes: "(max-width: 1100px) 45vw, 18vw" })}</div>
      <a class="hero-chip" href="${tel(BIZ.emergency)}"><span class="em-ic">${icon("ambulance")}</span><span><small>24/7 emergency &amp; ambulance</small><b>${esc(BIZ.emergency)}</b></span></a>
    </div>
  </div>
  <div class="hero-foot"><div class="container">
    ${BIZ.stats.map(s => `<div class="hstat"><b><span data-count="${s.value}">${s.value}</span>${s.suffix}</b><span>${s.label}</span></div>`).join("")}
  </div></div>
</section>`;

const marquee = () => `
<div class="marquee" aria-hidden="true"><div class="marquee-track" data-speed="50">
  ${DEPARTMENTS.map((d, i) => `<span class="marquee-item">${i % 2 ? d.name.toLowerCase() : d.name}${icon("sparkle")}</span>`).join("")}
</div></div>`;

const manifesto = () => `
<section class="section manifesto"><div class="container manifesto-row">
  <div class="sec-index label"><span class="num">(01)</span><span>Who we are</span></div>
  <div>
    <p id="manifesto-text">We believe a hospital should feel like the <em>opposite</em> of a waiting room: clear answers, senior doctors who listen, and a team that treats your time as carefully as your health.</p>
    <div class="btn-row" style="margin-top:40px" data-reveal>${btn("/about.html", "Our story", "line")}</div>
  </div>
</div></section>`;

const FILM = [["opd", "reception", "ward", "nicu", "ot", "lab"], ["icu-ward", "ambulance", "ot-tall", "ward-bed", "exterior", "icu-sign"]];
const filmstrip = () => `
<section class="film" aria-label="Inside Lumi Hospital">
  <div class="container film-head">
    <div class="sec-index label"><span class="num">(↗)</span><span>Inside Lumi, photographed on site</span></div>
    ${btn("/gallery.html", "Take the tour", "line", { sm: true })}
  </div>
  ${FILM.map((row, r) => `<div class="film-row" data-film="${r ? 1 : -1}">${row.map(id => `<a class="film-item" href="/gallery.html#${id}">${figure(id, { sizes: "(max-width: 860px) 70vw, 30vw" })}</a>`).join("")}</div>`).join("")}
</section>`;

const specialities = () => `
<section class="section section--alt" id="specialities" style="padding-bottom:clamp(60px,8vw,110px)">
  <div class="container">${secHead("02", "Specialities", `Ten centres. <em>One</em> team.`, `<p>Every speciality shares records, labs and imaging, so your care is joined up from the first visit.</p>`)}</div>
  <div class="hscroll" id="hscroll"><div class="hscroll-track" id="hscroll-track">
    ${DEPARTMENTS.map(deptCard).join("")}
    <div class="hscroll-end"><h3>Not sure where to start?</h3><p class="muted">Tell us your symptoms and we'll guide you to the right specialist.</p>${btn("/contact.html", "Ask our care team", "accent")}</div>
  </div></div>
  <div class="container"><div class="hscroll-progress"><i id="hscroll-bar"></i></div></div>
</section>`;

const feature = () => `
<section class="section"><div class="container feature">
  <div class="feature-media ph" data-reveal="scale">
    <div class="inner" data-parallax="0.08">${pic("icu", { sizes: "(max-width: 860px) 100vw, 45vw" })}</div>
    <div class="float-card"><span class="ic-badge">${icon("shield")}</span><div><b>Our ICU, as it is</b><span>Monitored beds with bedside oxygen and ventilator support</span></div></div>
  </div>
  <div>
    <div class="sec-index label"><span class="num">(03)</span><span>Why ${esc(BIZ.short)}</span></div>
    <h2 data-split style="margin-top:14px">Hospital care, <em>without</em> the hospital feeling.</h2>
    <p class="lead" data-reveal>Modern medicine is complicated. Being a patient shouldn't be.</p>
    <div class="features">
      ${[["users", "Senior specialists, on time", "Consultants see you themselves, and booked slots run to the clock."],
         ["scan", "Diagnostics under one roof", "24/7 lab, CT, MRI and imaging, with reports on your phone."],
         ["ambulance", "An emergency team that's always up", "Emergency room, ICU and ambulance, staffed around the clock."],
         ["card", "Cashless, without the chase", "Our insurance desk handles approvals so you don't have to."]]
        .map(([ic, h, p]) => `<div class="feat" data-reveal><span class="ic-badge">${icon(ic)}</span><div><h3>${h}</h3><p>${p}</p></div></div>`).join("")}
    </div>
  </div>
</div></section>`;

const journey = () => `
<section class="section"><div class="container journey">
  <div class="journey-intro">
    <div class="sec-index label"><span class="num">(05)</span><span>Your visit</span></div>
    <h2 data-split style="margin-top:14px">Four steps. <em>No</em> runaround.</h2>
    <p class="lead" data-reveal>From booking to follow-up, every step is designed to save you time.</p>
    <div class="btn-row" data-reveal style="margin-top:28px">${btn("/patient-guide.html", "Patient guide", "line")}</div>
  </div>
  <div class="jcards">${JOURNEY.map((j, i) => `<article class="jcard"><span class="num">${pad(i + 1)}</span><div><h3>${j.title}</h3><p>${j.text}</p></div></article>`).join("")}</div>
</div></section>`;

const packages = () => `
<section class="section section--alt"><div class="container">
  ${secHead("06", "Health checks", `Catch it early. <em>Feel</em> it later.`, btn("/packages.html", "All packages", "line"))}
  <div class="grid g3">${PACKAGES.slice(0, 3).map(packageCard).join("")}</div>
</div></section>`;

const testimonials = () => !TESTIMONIALS.length ? "" : `
<section class="section"><div class="container">
  ${secHead("07", "Patients", `In their <em>own</em> words.`)}
  <div class="grid g3">${TESTIMONIALS.map(t => `<figure class="tile" data-reveal><blockquote class="lead" style="margin:0 0 18px">“${esc(t.quote)}”</blockquote><figcaption class="label">${esc(t.name)} · ${esc(t.context)}</figcaption></figure>`).join("")}</div>
</div></section>`;

const insurers = () => `
<section class="section--tight insurers" aria-label="Insurance partners">
  <div class="container" style="margin-bottom:22px"><span class="label">Cashless with leading insurers &amp; TPAs</span></div>
  <div class="marquee"><div class="marquee-track" data-speed="60" data-dir="right">
    ${BIZ.insurers.map(n => `<span class="marquee-item">${esc(n)}${icon("plus")}</span>`).join("")}
  </div></div>
</section>`;

const journal = () => `
<section class="section"><div class="container">
  ${secHead("08", "Journal", `Straight answers from <em>our</em> doctors.`, btn("/blog.html", "Read the journal", "line"))}
  <div class="grid g3">${POSTS.slice(0, 3).map(postCard).join("")}</div>
</div></section>`;

const faq = () => `
<section class="section section--alt"><div class="container feature" style="align-items:start">
  <div><div class="sec-index label"><span class="num">(09)</span><span>Questions</span></div>
    <h2 data-split style="margin-top:14px">Good to <em>know.</em></h2>
    <p class="lead" data-reveal>Can't find your answer? Message us on WhatsApp and a coordinator will reply.</p></div>
  ${accordion(FAQ)}
</div></section>`;

const cta = () => `
<section class="section"><div class="container">
  <div class="big-cta"><div class="big-cta-photo" aria-hidden="true">${pic("exterior", { sizes: "100vw", alt: "" })}</div><div class="big-cta-glow"></div>
    <span class="label" style="color:rgba(255,255,255,.6)">Book in under a minute</span>
    <h2 data-split style="margin-top:16px">Your health can't wait. <em>Neither</em> should you.</h2>
    <p data-reveal>Choose a doctor and a time online, or call us and we'll find the right specialist for you.</p>
    <div class="btn-row" data-reveal style="margin-top:32px">${btn("/appointment.html", "Book appointment", "accent", { ic: "calendar" })}<a class="btn btn--glass" href="${tel(BIZ.phone)}" data-magnetic><span>${esc(BIZ.phone)}</span><span class="btn-ic">${icon("phone")}</span></a></div>
  </div>
</div></section>`;

/* ---------- Motion specific to home ---------- */
function manifestoWords() {
  const p = $("#manifesto-text"); if (!p) return;
  // wrap words, keeping <em>
  const wrap = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const s = document.createElement("span"); s.className = "w"; s.textContent = t; frag.append(s); } });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) wrap(n);
  });
  wrap(p);
  if (!motionAllowed()) return;
  gsap.to($$(".w", p), { opacity: 1, stagger: .05, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
}

function horizontal() {
  const wrap = $("#hscroll"), track = $("#hscroll-track"), bar = $("#hscroll-bar");
  if (!motionAllowed()) return;
  ScrollTrigger.matchMedia({
    "(min-width: 861px)": () => {
      const dist = () => track.scrollWidth - innerWidth;
      const tw = gsap.to(track, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: wrap, start: "center center", end: () => "+=" + dist(), pin: wrap.parentElement, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => gsap.set(bar, { scaleX: s.progress }) } });
      return () => tw.kill();
    }
  });
}

function journeyStack() {
  if (!motionAllowed() || innerWidth < 861) return;
  const cards = $$(".jcard");
  cards.forEach((c, i) => {
    if (i === cards.length - 1) return;
    gsap.to(c, { scale: .92 + i * .015, opacity: .55, ease: "none",
      scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top " + (parseInt(getComputedStyle(cards[i + 1]).top) + 10) + "px", scrub: true } });
  });
}

function heroIntro() {
  if (!motionAllowed()) return;
  const tl = gsap.timeline({ delay: .35 });
  tl.fromTo(".hero-photo--main", { clipPath: "inset(100% 0 0 0 round 28px)" }, { clipPath: "inset(0% 0 0 0 round 28px)", duration: 1.5, ease: "expo.inOut" })
    .from(".hero-photo--main img", { scale: 1.35, duration: 2, ease: "expo.out" }, "<.2")
    .fromTo(".hero-photo--sub", { clipPath: "inset(0 100% 0 0 round 20px)" }, { clipPath: "inset(0 0% 0 0 round 20px)", duration: 1.2, ease: "expo.inOut" }, "-=1.4")
    .from(".hero-chip", { y: 30, opacity: 0, duration: 1, ease: "expo.out" }, "-=.8")
    .from(".hstat", { y: 20, opacity: 0, duration: 1, ease: "expo.out", stagger: .08 }, "-=.9");
  // depth on scroll: photos drift at different speeds
  gsap.to(".hero-photo--main", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-photo--sub", { yPercent: -35, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-copy", { yPercent: -8, opacity: .25, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
}

function film() {
  if (!motionAllowed()) return;
  $$("[data-film]").forEach(row => {
    const dir = +row.dataset.film;
    gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -18 }, { xPercent: dir < 0 ? -18 : 0, ease: "none",
      scrollTrigger: { trigger: ".film", start: "top bottom", end: "bottom top", scrub: .5 } });
  });
}

function preloader() {
  if (!motionAllowed()) return Promise.resolve();
  try { if (sessionStorage.getItem("lumi-pl")) return Promise.resolve(); sessionStorage.setItem("lumi-pl", "1"); } catch { return Promise.resolve(); }
  const el = document.createElement("div");
  el.className = "preloader";
  el.innerHTML = `<div class="pl-mark">${logoMark.replace('class="logo-mark"', "")}</div><span class="pl-word label" style="color:rgba(255,255,255,.6)">${esc(BIZ.name)} · ${esc(BIZ.tagline)}</span><span class="pl-count">0</span>`;
  document.body.append(el);
  const c = { v: 0 };
  return new Promise(res => {
    gsap.timeline({ onComplete: () => { el.remove(); res(); } })
      .from(el.querySelector(".pl-mark"), { scale: .4, rotate: -90, opacity: 0, duration: .8, ease: "expo.out" })
      .to(c, { v: 100, duration: 1.1, ease: "power2.inOut", onUpdate: () => (el.querySelector(".pl-count").textContent = Math.round(c.v)) }, 0)
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "expo.inOut" }, "+=.1");
  });
}

boot(async () => {
  $("main").innerHTML = hero() + marquee() + manifesto() + filmstrip() + specialities() + feature() + journey() + packages() + testimonials() + insurers() + journal() + faq() + cta();
  // WebGL after first paint; skipped on weak/software GPUs by shader.js
  (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => lumenField($("#lumen")), { timeout: 800 });
  manifestoWords();
  const pl = preloader();
  requestAnimationFrame(() => { horizontal(); journeyStack(); heroIntro(); film(); });
  await pl;
});
