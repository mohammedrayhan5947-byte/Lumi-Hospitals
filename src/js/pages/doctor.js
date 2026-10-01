import { boot } from "../core.js";
import "../../css/pages/doctor.css";
import { BIZ, DOCTORS } from "../../data/site.js";
import { $, $$, esc, tel, wa, btn, icon, pad, params, deptById, doctorById, doctorsIn, doctorCard, initials, media, secHead } from "../render.js";
import { gsap } from "../motion.js";
import { motionAllowed } from "../theme.js";

const doc = doctorById(document.querySelector("main")?.dataset.id || params.get("id")) || DOCTORS[0];
const dep = deptById(doc.dept);
const peers = doctorsIn(doc.dept).filter(x => x.id !== doc.id);
const others = peers.length ? peers : DOCTORS.filter(x => x.id !== doc.id).slice(0, 4);
const short = "Dr. " + doc.name.split(" ").pop();
const bookHref = `/appointment.html?dept=${doc.dept}&doctor=${doc.id}`;

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const JS_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const now = new Date();
const todayKey = JS_DAYS[now.getDay()];

/* "10 AM – 4 PM" → [10, 16] (hours, 24h). */
const parseTime = s => {
  const m = [...String(s).matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)].map(([, h, mm, ap]) => (+h % 12) + (ap.toUpperCase() === "PM" ? 12 : 0) + (+mm || 0) / 60);
  return m.length === 2 ? m : null;
};
const span = parseTime(doc.time);
const DAY_START = 7, DAY_END = 21; // visual range of the strip

/* Date for each weekday of the current Mon–Sun week. */
const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
const dateOf = i => { const x = new Date(monday); x.setDate(monday.getDate() + i); return x; };

/* Next OPD day from today (today counts if it hasn't ended yet). */
const nextOpd = (() => {
  for (let k = 0; k < 7; k++) {
    const x = new Date(now); x.setDate(now.getDate() + k);
    const key = JS_DAYS[x.getDay()];
    if (!doc.days.includes(key)) continue;
    if (k === 0 && span && now.getHours() + now.getMinutes() / 60 >= span[1]) continue;
    return { date: x, label: k === 0 ? "Today" : k === 1 ? "Tomorrow" : x.toLocaleDateString("en-IN", { weekday: "long" }) };
  }
  return null;
})();

/* "Dr. Arjun Rao" → "Dr. Arjun <em>Rao</em>" */
const nameHTML = (() => { const p = esc(doc.name).split(" "); const last = p.pop(); return `${p.join(" ")} <em>${last}</em>`; })();

const hero = () => `
<section class="page-hero dc-hero"><div class="page-hero-glow"></div><div class="container dc-hero-in">
  <div class="dc-portrait ph" data-reveal="scale">
    <div class="dc-portrait-in" data-parallax="0.06">${media(doc.photo, doc.name, `<span class="initials">${initials(doc.name)}</span>`)}</div>
    ${dep ? `<a class="dc-dept" href="/specialities/${dep.id}.html"><span class="dc-dept-ic">${icon(dep.icon)}</span>${esc(dep.name)}</a>` : ""}
  </div>
  <div class="dc-intro">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/doctors.html">Doctors</a><span>/</span><span aria-current="page">${esc(doc.name)}</span></nav>
    <h1 data-split data-instant>${nameHTML}</h1>
    <p class="dc-role" data-reveal>${esc(doc.role)}</p>
    <dl class="dc-facts" data-reveal>
      <div><dt class="label">Experience</dt><dd><b>${doc.exp}+</b> years</dd></div>
      <div><dt class="label">Qualifications</dt><dd>${esc(doc.quals)}</dd></div>
      <div><dt class="label">Languages</dt><dd>${doc.langs.map(esc).join(", ")}</dd></div>
      <div><dt class="label">Next OPD</dt><dd>${nextOpd ? `<span class="dc-live"></span>${nextOpd.label} · ${esc(doc.time)}` : "On request"}</dd></div>
    </dl>
    <div class="btn-row" data-reveal>${btn(bookHref, `Book with ${esc(short)}`, "accent", { ic: "calendar" })}${btn(wa(`Hi, I'd like an appointment with ${doc.name}.`), "WhatsApp", "line", { ic: "chat", attrs: 'target="_blank" rel="noopener"' })}</div>
  </div>
</div></section>`;

const schedule = () => `
<section class="section section--alt dc-sched"><div class="container">
  ${secHead("01", "OPD schedule", `When to <em>find</em> ${esc(short)}.`, `<p>${esc(doc.time)} on ${doc.days.length === 6 && !doc.days.includes("Sun") ? "Monday to Saturday" : doc.days.map(esc).join(", ")}. Times can shift for surgery or emergencies, so we confirm every booking.</p>`)}
  <ol class="week" aria-label="Weekly OPD schedule">
    ${WEEK.map((k, i) => {
      const on = doc.days.includes(k), today = k === todayKey, dt = dateOf(i);
      const top = span ? ((span[0] - DAY_START) / (DAY_END - DAY_START)) * 100 : 0;
      const h = span ? ((span[1] - span[0]) / (DAY_END - DAY_START)) * 100 : 100;
      return `<li class="day ${on ? "is-on" : ""} ${today ? "is-today" : ""}" aria-label="${dt.toLocaleDateString("en-IN", { weekday: "long" })}: ${on ? esc(doc.time) : "no OPD"}${today ? " (today)" : ""}">
        <div class="day-head"><span class="label">${k}</span><b>${dt.getDate()}</b>${today ? `<span class="day-now">Today</span>` : ""}</div>
        <div class="day-track" aria-hidden="true">${on ? `<i class="day-bar" style="top:${top}%;height:${h}%">${doc.time.split(/\s*[–-]\s*/).map(t => `<span>${esc(t)}</span>`).join("")}</i>` : `<span class="day-off">—</span>`}</div>
        <div class="day-foot">${on ? (span ? `${+(span[1] - span[0]).toFixed(1)} hrs OPD` : esc(doc.time)) : "No OPD"}</div>
      </li>`;
    }).join("")}
  </ol>
</div></section>`;

const about = () => `
<section class="section"><div class="container dc-about">
  <div>
    <div class="sec-index label"><span class="num">(02)</span><span>About</span></div>
    <p class="dc-bio" data-reveal>${esc(doc.bio)}</p>
    ${dep ? `<a class="dc-deptcard tile" href="/specialities/${dep.id}.html" data-reveal>
      <span class="ic-badge">${icon(dep.icon)}</span>
      <span><span class="label">Part of</span><b>${esc(dep.name)}</b><small>${esc(dep.summary)}</small></span>
      <span class="dc-deptcard-go">${icon("arrowUpRight")}</span></a>` : ""}
  </div>
  <div>
    <div class="sec-index label"><span class="num">(03)</span><span>Focus areas</span></div>
    <ol class="dc-focus">${doc.focus.map((f, i) => `<li data-reveal><span class="num">${pad(i + 1)}</span>${esc(f)}</li>`).join("")}</ol>
  </div>
</div></section>`;

const book = () => `
<section class="section section--tight"><div class="container">
  <div class="dc-book">
    <div class="dc-book-glow" aria-hidden="true"></div>
    <div>
      <span class="label">${nextOpd ? `Next available · ${nextOpd.label}` : "Appointments"}</span>
      <h2 data-split>See ${esc(short)}, <em>on</em> time.</h2>
      <p>Booked patients go straight to the doctor's floor. Bring previous reports and a list of current medicines.</p>
    </div>
    <div class="btn-row">${btn(bookHref, "Book appointment", "accent", { ic: "calendar" })}${btn(tel(BIZ.phone), esc(BIZ.phone), "glass", { ic: "phone" })}</div>
  </div>
</div></section>`;

const more = () => !others.length ? "" : `
<section class="section section--alt"><div class="container">
  ${secHead("04", peers.length ? "Same speciality" : "More specialists", peers.length ? `Others in <em>${esc(dep?.name || "this team")}</em>.` : `Other doctors <em>you</em> can see.`, btn(peers.length ? `/doctors.html?dept=${doc.dept}` : "/doctors.html", "All doctors", "line"))}
  <div class="grid g4 dc-more">${others.map(doctorCard).join("")}</div>
</div></section>`;

/* Signature: OPD bars grow into place, day by day. */
function weekMotion() {
  if (!motionAllowed()) return;
  gsap.from(".day-bar", { scaleY: 0, transformOrigin: "top", duration: 1.1, ease: "expo.out", stagger: .07,
    scrollTrigger: { trigger: ".week", start: "top 80%", once: true } });
  gsap.from(".day", { y: 24, opacity: 0, duration: .9, ease: "expo.out", stagger: .05,
    scrollTrigger: { trigger: ".week", start: "top 85%", once: true }, clearProps: "transform,opacity" });
}

boot(() => {
  document.title = `${doc.name}, ${dep ? dep.name : "Doctor"} | ${BIZ.name}`;
  $('meta[name="description"]')?.setAttribute("content", `${doc.name}, ${doc.role}. ${doc.bio}`);
  $("main").innerHTML = hero() + schedule() + about() + book() + more();
  weekMotion();
});
