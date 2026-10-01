/* Motion system: Lenis smooth scroll + GSAP (ScrollTrigger, SplitText).
   Declarative hooks, usable on any page:
     [data-reveal]            fade/rise on enter (="fade" | "scale" variants), staggered per parent
     [data-split]             headline line-by-line mask reveal
     [data-count="120"]       count-up number (data-suffix optional)
     [data-parallax="0.15"]   vertical parallax (fraction of travel)
     [data-magnetic]          magnetic hover (pointer devices)
     .tile                    cursor spotlight (--mx/--my)
     .marquee-track           infinite marquee, speeds up with scroll velocity
     #ecg-path                draws the ECG line in the emergency band
     .footer-word span        letter rise in footer
   Everything is skipped when motion is disabled (OS setting or "Reduce motion"). */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { motionAllowed, onThemeChange } from "./theme.js";
import { $, $$ } from "./render.js";

gsap.registerPlugin(ScrollTrigger, SplitText);
export { gsap, ScrollTrigger };

let lenis = null;
const fine = matchMedia("(pointer: fine)").matches;

function smoothScroll() {
  lenis = new Lenis({ duration: 1.1, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  window.__lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // in-page anchors
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -90 }); }
  });
}

export function splitReveal(root = document) {
  $$("[data-split]:not([data-split-done])", root).forEach(el => {
    el.dataset.splitDone = "1";
    const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line-inner", autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: "visible" });
        return gsap.from(self.lines, { yPercent: 110, rotate: 2, duration: 1.1, ease: "expo.out", stagger: .09,
          scrollTrigger: el.closest("[data-instant]") ? null : { trigger: el, start: "top 88%", once: true } });
      } });
    el._split = split;
  });
}

export function reveals(root = document) {
  const els = $$("[data-reveal]:not([data-revealed])", root);
  ScrollTrigger.batch(els, {
    start: "top 90%", once: true,
    onEnter: batch => {
      batch.forEach(el => (el.dataset.revealed = "1"));
      gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out", stagger: .08, overwrite: true, clearProps: "transform" });
    }
  });
}

function counters(root = document) {
  $$("[data-count]", root).forEach(el => {
    const end = +el.dataset.count, obj = { v: 0 };
    el.textContent = "0";
    gsap.to(obj, { v: end, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top bottom", once: true },
      onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-IN")) });
  });
}

function parallax(root = document) {
  $$("[data-parallax]", root).forEach(el => {
    const amt = parseFloat(el.dataset.parallax) || .15;
    gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
  });
}

function magnetic(root = document) {
  if (!fine) return;
  $$("[data-magnetic]", root).forEach(el => {
    const xTo = gsap.quickTo(el, "x", { duration: .6, ease: "elastic.out(1, .4)" });
    const yTo = gsap.quickTo(el, "y", { duration: .6, ease: "elastic.out(1, .4)" });
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .22); yTo((e.clientY - r.top - r.height / 2) * .3);
    });
    el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
  });
}

function spotlight() {
  if (!fine) return;
  document.addEventListener("pointermove", e => {
    const t = e.target.closest?.(".tile"); if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px");
    t.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });
}

export function marquees(root = document) {
  $$(".marquee-track", root).forEach(track => {
    if (track.dataset.mq) return; track.dataset.mq = "1";
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    const right = track.dataset.dir === "right";
    const tl = gsap.fromTo(track, { xPercent: right ? -50 : 0 }, { xPercent: right ? 0 : -50, duration: +track.dataset.speed || 40, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: track, start: "top bottom", end: "bottom top",
      onUpdate: self => { const v = Math.min(Math.abs(self.getVelocity()) / 300, 4); gsap.to(tl, { timeScale: 1 + v, duration: .3, overwrite: true, onComplete: () => gsap.to(tl, { timeScale: 1, duration: 1.2 }) }); } });
  });
}

function ecg() {
  const p = $("#ecg-path"); if (!p) return;
  const len = p.getTotalLength();
  gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(p, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut", scrollTrigger: { trigger: p, start: "top 95%", once: true } });
}

function footerWord() {
  const letters = $$(".footer-word span"); if (!letters.length) return;
  gsap.from(letters, { yPercent: 100, opacity: 0, duration: 1.4, ease: "expo.out", stagger: .07,
    scrollTrigger: { trigger: ".footer-word", start: "top 95%", once: true } });
}

/** Run once per page after content has been rendered. */
export function initMotion() {
  const html = document.documentElement;
  if (!motionAllowed()) { html.classList.remove("js-motion"); return; }
  html.classList.add("js-motion");
  smoothScroll();
  splitReveal(); reveals(); counters(); parallax(); magnetic(); spotlight(); marquees(); ecg(); footerWord();
  // Toggling "Reduce motion" live: simplest robust behaviour is a reload.
  onThemeChange(() => { if (!motionAllowed() && lenis) location.reload(); });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
}

/** For content rendered after initMotion (filters, etc.). */
export function refreshMotion(root) {
  if (!document.documentElement.classList.contains("js-motion")) return;
  splitReveal(root); reveals(root); magnetic(root);
  ScrollTrigger.refresh();
}
