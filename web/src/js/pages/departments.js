import { boot } from "../core.js";
import "../../css/pages/departments.css";
import { BIZ, DEPARTMENTS, DOCTORS } from "../../data/site.js";
import { $, $$, esc, btn, icon, pad, deptCard, doctorsIn, secHead, pageHero, wa } from "../render.js";
import { gsap, refreshMotion } from "../motion.js";
import { motionAllowed } from "../theme.js";

const VIEW_KEY = "lumi-dept-view";
const fine = matchMedia("(pointer: fine) and (hover: hover)").matches;
const svg = d => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${d}</svg>`;
const ICON_LIST = svg('<path d="M4 6h16M4 12h16M4 18h16"/>');
const ICON_GRID = svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>');
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

const hero = () => pageHero("Specialities",
  `Ten specialities. <em>One</em> record.`,
  "Every centre shares the same lab, imaging and patient file, so the specialist you see next already knows the story.",
  `<dl class="dx-facts" data-reveal>
    <div><dt class="label">Specialities</dt><dd>${pad(DEPARTMENTS.length)}</dd></div>
    <div><dt class="label">Specialists</dt><dd>${pad(DOCTORS.length)}</dd></div>
    <div><dt class="label">${esc(BIZ.stats[0].label)}</dt><dd>${BIZ.stats[0].value}${BIZ.stats[0].suffix}</dd></div>
  </dl>`);

const row = (d, i) => {
  const n = doctorsIn(d.id).length;
  return `<li><a class="dx-row" href="/specialities/${d.id}.html" data-i="${i}">
    <span class="dx-num num">${pad(i + 1)}</span>
    <span class="dx-title"><span class="dx-ic" aria-hidden="true">${icon(d.icon)}</span><span class="dx-name">${esc(d.name)}</span></span>
    <span class="dx-sum">${esc(d.summary)}</span>
    <span class="dx-count label">${n ? plural(n, "doctor") : "Care team"}</span>
    <span class="dx-go" aria-hidden="true">${icon("arrowUpRight")}</span>
  </a></li>`;
};

const index = () => `
<section class="section dx" aria-labelledby="dx-title">
  <div class="container">
    <div class="dx-bar">
      <h2 id="dx-title" class="label"><span class="num">(01)</span> Index · ${DEPARTMENTS.length} specialities</h2>
      <div class="dx-toggle" role="group" aria-label="Layout">
        <button type="button" data-view="list" aria-pressed="true">${ICON_LIST}<span>List</span></button>
        <button type="button" data-view="grid" aria-pressed="false">${ICON_GRID}<span>Grid</span></button>
      </div>
    </div>
    <div class="dx-head label" aria-hidden="true"><span>No.</span><span>Speciality</span><span>Focus</span><span>Team</span></div>
    <ol class="dx-list" id="dx-list">${DEPARTMENTS.map(row).join("")}</ol>
    <div class="grid g3 dx-grid" id="dx-grid" hidden>${DEPARTMENTS.map((d, i) => deptCard(d, i).replace(" data-reveal", "")).join("")}</div>
  </div>
  <div class="dx-preview" id="dx-preview" aria-hidden="true">
    <div class="dx-pv-media ph"><img class="dx-pv-img" alt="" decoding="async"><span class="dx-pv-ic"></span></div>
    <div class="dx-pv-body"><span class="label dx-pv-num"></span><ul class="dx-pv-list"></ul></div>
  </div>
</section>`;

/* Every condition, A to Z, pointing at the speciality that treats it. */
const symptoms = () => {
  const all = DEPARTMENTS.flatMap(d => d.conditions.map(c => ({ c, d })))
    .sort((a, b) => a.c.localeCompare(b.c));
  const groups = {};
  all.forEach(x => (groups[x.c[0].toUpperCase()] ||= []).push(x));
  return `
<section class="section section--alt"><div class="container">
  ${secHead("02", "Start from a symptom", `Not sure <em>where</em> to begin?`, `<p>Find what you're dealing with and we'll point you to the team that treats it.</p>`)}
  <div class="az" data-reveal>
    ${Object.entries(groups).map(([L, xs]) => `
      <div class="az-group"><span class="az-letter" aria-hidden="true">${L}</span>
        <ul>${xs.map(({ c, d }) => `<li><a href="/specialities/${d.id}.html"><span>${esc(c)}</span><small>${esc(d.name)}</small></a></li>`).join("")}</ul>
      </div>`).join("")}
  </div>
</div></section>`;
};

const cta = () => `
<section class="section section--tight"><div class="container">
  <div class="dx-cta">
    <div>
      <span class="label">Still unsure?</span>
      <h2 data-split>Describe it. We'll <em>route</em> you.</h2>
      <p>A care coordinator reads every message and books you with the right specialist, usually the same day.</p>
    </div>
    <div class="btn-row">${btn(wa("Hi, I'm not sure which speciality I need. My symptoms are: "), "Message a coordinator", "accent", { ic: "chat", attrs: 'target="_blank" rel="noopener"' })}${btn("/doctors.html", "Browse doctors", "line")}</div>
  </div>
</div></section>`;

/* ---------- Layout toggle ---------- */
function bindToggle() {
  const list = $("#dx-list"), grid = $("#dx-grid"), head = $(".dx-head");
  const btns = $$(".dx-toggle button");
  const set = (view, animate) => {
    btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.view === view));
    const toGrid = view === "grid";
    list.hidden = toGrid; head.hidden = toGrid; grid.hidden = !toGrid;
    try { localStorage.setItem(VIEW_KEY, view); } catch {}
    if (animate && motionAllowed()) {
      const items = toGrid ? $$(".dept-card", grid) : $$(".dx-row", list);
      gsap.fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .9, ease: "expo.out", stagger: .04, clearProps: "transform,opacity" });
    }
    refreshMotion(grid);
  };
  btns.forEach(b => b.addEventListener("click", () => set(b.dataset.view, true)));
  let saved = "list";
  try { saved = localStorage.getItem(VIEW_KEY) || "list"; } catch {}
  if (saved === "grid") set("grid", false);
}

/* ---------- Signature: preview card that trails the cursor ---------- */
function bindPreview() {
  if (!fine || !motionAllowed()) return;
  const pv = $("#dx-preview"), list = $("#dx-list");
  const ic = $(".dx-pv-ic", pv), num = $(".dx-pv-num", pv), ul = $(".dx-pv-list", pv), img = $(".dx-pv-img", pv);
  // warm the cache so swaps are instant
  DEPARTMENTS.forEach(d => { if (d.img) new Image().src = d.img.replace(".webp", "-sm.webp"); });
  const xTo = gsap.quickTo(pv, "x", { duration: .7, ease: "expo.out" });
  const yTo = gsap.quickTo(pv, "y", { duration: .7, ease: "expo.out" });
  const rTo = gsap.quickTo(pv, "rotation", { duration: .9, ease: "expo.out" });
  let lastX = 0, current = -1;
  gsap.set(pv, { xPercent: -50, yPercent: -50, scale: .6, autoAlpha: 0 });

  let px = 0, py = 0, inside = false;
  const update = row => {
    if (!row) return;
    const i = +row.dataset.i;
    if (i === current) return;
    current = i;
    const d = DEPARTMENTS[i];
    ic.innerHTML = icon(d.icon);
    num.textContent = `${pad(i + 1)} / ${pad(DEPARTMENTS.length)} · ${d.name}`;
    ul.innerHTML = d.services.slice(0, 4).map(s => `<li>${esc(s)}</li>`).join("");
    if (d.img) { img.src = d.img.replace(".webp", "-sm.webp"); img.hidden = false; gsap.fromTo(img, { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: .7, ease: "expo.out", overwrite: true }); }
    else img.hidden = true;
    gsap.fromTo(ic, { scale: .6, rotate: -20, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: .7, ease: "expo.out", overwrite: true });
  };
  list.addEventListener("pointermove", e => {
    px = e.clientX; py = e.clientY;
    xTo(px + 170); yTo(py);
    rTo(gsap.utils.clamp(-8, 8, (px - lastX) * .6)); lastX = px;
    update(e.target.closest(".dx-row"));
  });
  // Scrolling moves rows under a still cursor: re-check which row is under it
  addEventListener("scroll", () => {
    if (!inside) return;
    const el = document.elementFromPoint(px, py);
    if (!el || !list.contains(el)) { inside = false; current = -1; gsap.to(pv, { scale: .6, autoAlpha: 0, duration: .4, overwrite: "auto" }); return; }
    update(el.closest(".dx-row"));
  }, { passive: true });
  list.addEventListener("pointerenter", e => {
    inside = true; px = e.clientX; py = e.clientY;
    gsap.set(pv, { x: e.clientX + 170, y: e.clientY });
    gsap.to(pv, { scale: 1, autoAlpha: 1, duration: .6, ease: "expo.out", overwrite: "auto" });
  });
  list.addEventListener("pointerleave", () => {
    current = -1; inside = false;
    gsap.to(pv, { scale: .6, autoAlpha: 0, duration: .4, ease: "power3.out", overwrite: "auto" });
  });
}

boot(() => {
  $("main").innerHTML = hero() + index() + symptoms() + cta();
  bindToggle();
  bindPreview();
});
