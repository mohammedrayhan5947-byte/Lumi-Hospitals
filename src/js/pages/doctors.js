import { boot } from "../core.js";
import "../../css/pages/doctors.css";
import { BIZ, DEPARTMENTS, DOCTORS } from "../../data/site.js";
import { $, $$, esc, btn, icon, params, deptById, doctorCard, pageHero, wa } from "../render.js";
import { gsap, refreshMotion } from "../motion.js";
import { Flip } from "gsap/Flip";
import { motionAllowed } from "../theme.js";

gsap.registerPlugin(Flip);

const TODAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
const inToday = d => d.days.includes(TODAY);
const depts = DEPARTMENTS.filter(x => DOCTORS.some(d => d.dept === x.id));

const state = {
  q: params.get("q") || "",
  dept: deptById(params.get("dept")) ? params.get("dept") : "",
  today: params.get("today") === "1"
};

const haystack = d => [d.name, d.role, d.quals, deptById(d.dept)?.name, ...d.focus, ...d.langs].join(" ").toLowerCase();
const matches = d => {
  if (state.dept && d.dept !== state.dept) return false;
  if (state.today && !inToday(d)) return false;
  const q = state.q.trim().toLowerCase();
  return !q || q.split(/\s+/).every(t => haystack(d).includes(t));
};

const hero = () => pageHero("Doctors",
  `Find the <em>right</em> doctor.`,
  "Search by name, condition or language. Every consultant here sees you personally, and booked slots run to the clock.");

const card = d => {
  const html = doctorCard(d).replace(" data-reveal", "");
  const badge = inToday(d) ? `<span class="dr-today"><i></i>In today<span class="dr-today-t"> · ${esc(d.time)}</span></span>` : "";
  return html.replace("</a>", `${badge}</a>`);
};

const finder = () => `
<section class="section dr" aria-label="Doctor finder"><div class="container">
  <div class="dr-tools" data-reveal>
    <div class="dr-search">
      <label for="dr-q" class="sr-only">Search doctors</label>
      ${icon("search")}
      <input id="dr-q" class="input" type="search" placeholder="Name, condition or language, e.g. “knee”, “Tamil”" autocomplete="off" value="${esc(state.q)}">
    </div>
    <label class="dr-switch" for="dr-today">
      <span><b>Available today</b><small>${TODAY === "Sun" ? "Sunday · OPD closed" : "OPD on " + TODAY}</small></span>
      <input id="dr-today" class="switch" type="checkbox" ${state.today ? "checked" : ""}>
    </label>
  </div>
  <div class="dr-chips chips" role="group" aria-label="Filter by speciality" data-reveal>
    <button type="button" class="chip" data-dept="" aria-pressed="${!state.dept}">All specialities</button>
    ${depts.map(x => `<button type="button" class="chip" data-dept="${x.id}" aria-pressed="${state.dept === x.id}">${esc(x.name)}<span class="chip-n">${DOCTORS.filter(d => d.dept === x.id).length}</span></button>`).join("")}
  </div>
  <div class="dr-status">
    <p class="dr-count" id="dr-count" aria-live="polite"></p>
    <button type="button" class="dr-reset link" id="dr-reset">Clear filters</button>
  </div>
  <div class="grid g4 dr-grid" id="dr-grid">${DOCTORS.map(card).join("")}</div>
  <div class="dr-empty tile" id="dr-empty" hidden>
    <span class="dr-empty-ic">${icon("search")}</span>
    <h2>No one matches <em>that</em>, yet.</h2>
    <p class="muted">Try a broader search or another speciality. Or tell a coordinator what you need and they'll find the right person.</p>
    <div class="btn-row"><button type="button" class="btn btn--accent" id="dr-reset-2"><span>Show all doctors</span></button>${btn(wa("Hi, I'm looking for a doctor for: "), "Ask a coordinator", "line", { ic: "chat", attrs: 'target="_blank" rel="noopener"' })}</div>
  </div>
</div></section>`;

const note = () => `
<section class="section--tight dr-note"><div class="container dr-note-in">
  <span class="label">OPD hours</span>
  <p>${esc(BIZ.hours.opd)} <span aria-hidden="true">·</span> ${esc(BIZ.hours.sunday)}</p>
  ${btn("/departments.html", "Browse by speciality", "line", { sm: true })}
</div></section>`;

/* ---------- Filtering ---------- */
function syncURL() {
  const p = new URLSearchParams();
  if (state.q.trim()) p.set("q", state.q.trim());
  if (state.dept) p.set("dept", state.dept);
  if (state.today) p.set("today", "1");
  const qs = p.toString();
  history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
}

function apply(animate = true) {
  const grid = $("#dr-grid"), cards = $$(".doc-card", grid);
  const doFlip = animate && motionAllowed();
  const flipState = doFlip ? Flip.getState(cards) : null;
  let n = 0;
  cards.forEach(c => { const ok = matches(DOCTORS.find(d => d.id === c.dataset.id)); c.hidden = !ok; n += ok; });
  $("#dr-empty").hidden = n > 0;
  grid.classList.toggle("is-empty", !n);
  const dep = deptById(state.dept);
  $("#dr-count").innerHTML = `<b>${n}</b> ${n === 1 ? "doctor" : "doctors"}${dep ? ` in ${esc(dep.name)}` : ""}${state.today ? " available today" : ""}<span class="muted"> of ${DOCTORS.length}</span>`;
  $("#dr-reset").hidden = !(state.q || state.dept || state.today);
  $$(".dr-chips .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.dept === state.dept));
  syncURL();
  if (doFlip) {
    Flip.from(flipState, {
      duration: .8, ease: "expo.out", absolute: true, scale: true, nested: true, prune: true,
      onEnter: els => gsap.fromTo(els, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .7, ease: "expo.out", delay: .08 }),
      onLeave: els => gsap.to(els, { opacity: 0, scale: .85, duration: .35, ease: "power2.in" }),
      onComplete: () => refreshMotion(grid)
    });
    if (!n) gsap.fromTo("#dr-empty", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .8, ease: "expo.out" });
  } else refreshMotion(grid);
}

function bind() {
  let t;
  $("#dr-q").addEventListener("input", e => { state.q = e.target.value; clearTimeout(t); t = setTimeout(apply, 180); });
  $("#dr-today").addEventListener("change", e => { state.today = e.target.checked; apply(); });
  $(".dr-chips").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.dept = b.dataset.dept; apply();
  });
  const reset = () => { state.q = ""; state.dept = ""; state.today = false; $("#dr-q").value = ""; $("#dr-today").checked = false; apply(); };
  $("#dr-reset").addEventListener("click", reset);
  $("#dr-reset-2").addEventListener("click", reset);
}

function intro() {
  if (!motionAllowed()) return;
  gsap.from($$(".doc-card:not([hidden])", $("#dr-grid")), { opacity: 0, y: 40, duration: 1, ease: "expo.out", stagger: .06, delay: .25, clearProps: "opacity,transform" });
}

boot(() => {
  $("main").innerHTML = hero() + finder() + note();
  bind();
  apply(false);
  intro();
});
