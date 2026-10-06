import { boot } from "../core.js";
import "../../css/pages/gallery.css";
import { BIZ, PHOTOS } from "../../data/site.js";
import { STOCK } from "../../data/credits.js";
import { $, $$, esc, btn, icon, pageHero, tel } from "../render.js";
import { pic } from "../media.js";
import { gsap, refreshMotion } from "../motion.js";
import { motionAllowed } from "../theme.js";

const CATS = ["All", ...new Set(PHOTOS.map(p => p.cat))];
// Short notes per area, shown in the lightbox. Facility descriptions only, no clinical claims.
const NOTES = {
  "Building": "Lumi Hospital's main entrance and separate 24/7 emergency entrance, with parking and an ambulance bay.",
  "Emergency": "A dedicated emergency entrance with ramp access and an ambulance on standby, around the clock.",
  "Patient areas": "Reception and glass-fronted OPD consultation rooms.",
  "Wards": "Curtained bays with bedside oxygen, monitoring and space for an attendant.",
  "Critical care": "ICU and Neonatal ICU with monitored beds, ventilator support and restricted access.",
  "Surgery": "Modular operation theatres with ceiling-mounted surgical lights and anaesthesia workstations.",
  "Diagnostics": "An in-house laboratory for routine and urgent tests."
};

const tile = (p, i) => `
  <button class="g-item" type="button" data-i="${i}" data-cat="${esc(p.cat)}" id="${p.id}" data-reveal aria-label="Open photo: ${esc(p.caption)}">
    <span class="g-frame" style="aspect-ratio:${p.w}/${p.h}">${pic(p, { sizes: "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" })}</span>
    <span class="g-meta"><span class="label">${esc(p.cat)}</span><span class="g-cap">${esc(p.caption)}</span></span>
  </button>`;

boot(() => {
  $("main").innerHTML = pageHero("Inside Lumi", `Walk <em>through</em> the hospital.`,
    "Every photo on this page was taken at Lumi Hospital. No stock imagery, no staged sets. This is what you'll see when you visit.",
    `<div class="g-stats" data-reveal>${CATS.slice(1).map(c => `<span><b>${PHOTOS.filter(p => p.cat === c).length}</b> ${esc(c)}</span>`).join("")}</div>`) + `
  <section class="section--tight"><div class="container">
    <div class="chips g-filter" role="group" aria-label="Filter photos">${CATS.map(c => `<button class="chip" type="button" aria-pressed="${c === "All"}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>
    <div class="g-grid" id="g-grid">${PHOTOS.map(tile).join("")}</div>
  </div></section>
  <section class="section"><div class="container g-visit tile">
    <div><span class="label">Plan a visit</span><h2 data-split>See it for <em>yourself.</em></h2>
      <p class="muted">Walk in for the OPD, or book a slot to skip the queue. Our emergency entrance is open 24/7.</p></div>
    <div class="btn-row">${btn("/appointment.html", "Book a visit", "accent", { ic: "calendar" })}${btn("/contact.html", "Directions", "line", { ic: "pin" })}<a class="btn btn--danger" href="${tel(BIZ.emergency)}"><span>Emergency</span><span class="btn-ic">${icon("phone")}</span></a></div>
  </div></section>
  <section class="section--tight" id="credits"><div class="container g-credits">
    <h2 class="label">Photo credits</h2>
    <p class="muted">Photos of the hospital on this site were taken at ${esc(BIZ.name)}. Illustrative photos of people and health topics are used under the Pexels and Unsplash licences. They show models, not our patients or doctors.</p>
    <ul>${Object.values(STOCK).map(c => `<li><a href="${c.url}" target="_blank" rel="noopener nofollow">${esc(c.credit)}</a></li>`).join("")}</ul>
  </div></section>
  <dialog class="lightbox" id="lightbox" aria-label="Photo viewer">
    <div class="lb-stage"><img id="lb-img" alt=""></div>
    <div class="lb-bar">
      <div class="lb-text"><span class="label" id="lb-count"></span><h3 id="lb-cap"></h3><p id="lb-note"></p></div>
      <div class="lb-nav">
        <button class="icon-btn" type="button" data-lb="prev" aria-label="Previous photo">${icon("arrowLeft")}</button>
        <button class="icon-btn" type="button" data-lb="next" aria-label="Next photo">${icon("arrow")}</button>
        <button class="icon-btn" type="button" data-lb="close" aria-label="Close viewer">${icon("close")}</button>
      </div>
    </div>
  </dialog>`;

  // Filter
  const grid = $("#g-grid");
  $(".g-filter").addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    $$(".g-filter .chip").forEach(x => x.setAttribute("aria-pressed", x === c));
    const cat = c.dataset.cat;
    $$(".g-item", grid).forEach(it => {
      const show = cat === "All" || it.dataset.cat === cat;
      it.hidden = !show;
      if (show && motionAllowed()) gsap.fromTo(it, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: "expo.out" });
    });
    refreshMotion(grid);
  });

  // Lightbox
  const lb = $("#lightbox"), img = $("#lb-img");
  let cur = 0;
  const visible = () => $$(".g-item:not([hidden])", grid).map(b => +b.dataset.i);
  const show = i => {
    const list = visible(); cur = i;
    const p = PHOTOS[i];
    img.src = p.src; img.alt = p.alt;
    $("#lb-cap").textContent = p.caption;
    $("#lb-note").textContent = NOTES[p.cat] || "";
    $("#lb-count").textContent = `${String(list.indexOf(i) + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")} · ${p.cat}`;
    history.replaceState(null, "", "#" + p.id);
    if (motionAllowed()) gsap.fromTo(img, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: .6, ease: "expo.out" });
  };
  const step = d => { const l = visible(); show(l[(l.indexOf(cur) + d + l.length) % l.length]); };
  const open = i => { show(i); lb.showModal(); window.__lenis?.stop(); };
  lb.addEventListener("close", () => { window.__lenis?.start(); history.replaceState(null, "", location.pathname); grid.querySelector(`[data-i="${cur}"]`)?.focus(); });
  grid.addEventListener("click", e => { const b = e.target.closest(".g-item"); if (b) open(+b.dataset.i); });
  lb.addEventListener("click", e => {
    const a = e.target.closest("[data-lb]")?.dataset.lb;
    if (a === "prev") step(-1); else if (a === "next") step(1); else if (a === "close" || e.target === lb) lb.close();
  });
  lb.addEventListener("keydown", e => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
  let sx = 0;
  lb.addEventListener("touchstart", e => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });

  // Deep link: /gallery.html#icu opens that photo
  const hi = PHOTOS.findIndex(p => p.id === location.hash.slice(1));
  if (hi > -1) setTimeout(() => open(hi), 300);
});
