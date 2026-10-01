import { boot } from "../core.js";
import { consentCheckbox } from "../consent.js";
import "../../css/pages/appointment.css";
import { BIZ, DEPARTMENTS, PACKAGES, DOCTORS } from "../../data/site.js";
import { $, $$, esc, tel, wa, params, deptById, doctorById, doctorsIn, initials, inr, icon, btn, media } from "../render.js";
import { gsap } from "../motion.js";
import { motionAllowed } from "../theme.js";
import { crmEnabled, loadCatalog, getSlots, book } from "../crm.js";
import { formMessage } from "../forms.js";

/* ---------- Booking model ---------- */
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SLOTS = [
  { id: "morning", label: "Morning", range: "8 AM – 12 PM", from: 8, to: 12 },
  { id: "afternoon", label: "Afternoon", range: "12 PM – 4 PM", from: 12, to: 16 },
  { id: "evening", label: "Evening", range: "4 PM – 8 PM", from: 16, to: 20 }
];
/* Not a department: a booking route for preventive health packages. */
const CHECKUP = { id: "checkup", name: "Health check-up", icon: "flask", summary: "A preventive package. Pick the package in step 3." };
const STEPS = ["Speciality", "Doctor & time", "Your details", "Review"];

const state = { step: 1, max: 1, dept: "", doctor: "any", date: "", time: "", cat: null, forceWa: false, assigned: null, fell: false, notice: "" };
const dayCache = new Map();   // "doctor|date" -> Promise<{onLeave, reason, slots}> (live CRM availability)
let tok = 0, stok = 0;    // invalidate stale day-prefetch / slot loads
const IST = "Asia/Kolkata";
const fmtTime = s => new Date(s).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }).toUpperCase();
const fmtWhen = s => new Date(s).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: IST }).replace(/,/g, "") + " at " + fmtTime(s);
const hourIST = s => +new Date(s).toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: IST }) % 24;

/** "10 AM – 4 PM" → [10, 16] (null if unparseable). */
function hoursOf(str) {
  const m = String(str).match(/(\d{1,2})(?::\d{2})?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::\d{2})?\s*(AM|PM)/i);
  if (!m) return null;
  const h = (n, ap) => (+n % 12) + (/pm/i.test(ap) ? 12 : 0);
  return [h(m[1], m[2]), h(m[3], m[4])];
}

/** Days and hours available for the current speciality + doctor choice. */
function availability() {
  if (state.dept === CHECKUP.id) return { days: new Set(WEEK.slice(1)), ranges: [[8, 12]] };
  const docs = state.doctor === "any" ? doctorsIn(state.dept) : [doctorById(state.doctor)].filter(Boolean);
  const days = new Set(), ranges = [];
  docs.forEach(d => { d.days.forEach(x => days.add(x)); const r = hoursOf(d.time); ranges.push(r || [8, 20]); });
  return { days, ranges };
}

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const nextDays = () => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
const dayName = (d, i) => i === 0 ? "Today" : i === 1 ? "Tomorrow" : WEEK[d.getDay()];

/* ---------- Markup ---------- */
const hero = () => `
<section class="page-hero ap-hero"><div class="page-hero-glow"></div><div class="container ap-hero-in">
  <div>
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Book an appointment</span></nav>
    <h1 data-split data-instant>Book a visit in <em>four</em> short steps.</h1>
  </div>
  <p class="lead" data-reveal>Choose a speciality, a doctor and a day, then send the request on WhatsApp or email. Our team confirms the exact time with you.</p>
</div></section>`;

const optDept = d => `
  <label class="opt opt--dept">
    <input class="opt-in" type="radio" name="dept" value="${esc(d.name)}" data-id="${d.id}" data-label="Speciality" required>
    <span class="opt-ic">${icon(d.icon)}</span>
    <span class="opt-t"><b>${esc(d.name)}</b><small>${esc(d.summary)}</small></span>
    <span class="opt-tick" aria-hidden="true">${icon("check")}</span>
  </label>`;

const stepOne = () => `
<section class="wz-step" data-step="1" aria-labelledby="wz-h1">
  <header class="wz-head"><span class="label">Step 01 of 04</span><h2 id="wz-h1" tabindex="-1">What do you need help with?</h2>
    <p class="muted">Not sure? Choose Internal Medicine and the physician will guide you.</p></header>
  <fieldset class="wz-set"><legend class="sr-only">Speciality</legend>
    <div class="opt-grid">${DEPARTMENTS.map(optDept).join("")}${optDept(CHECKUP)}</div>
  </fieldset>
  <p class="wz-err" role="alert" hidden></p>
</section>`;

const stepTwo = () => `
<section class="wz-step" data-step="2" aria-labelledby="wz-h2" hidden>
  <header class="wz-head"><span class="label">Step 02 of 04</span><h2 id="wz-h2" tabindex="-1">Choose a doctor and a day.</h2>
    <p class="muted" id="wz-docnote"></p></header>
  <fieldset class="wz-set"><legend class="wz-legend">Doctor</legend><div class="doc-opts" id="doc-opts"></div></fieldset>
  <fieldset class="wz-set"><legend class="wz-legend">Date <span class="muted" id="wz-month"></span></legend>
    <div class="days" id="days"></div>
    <p class="form-note" id="days-note"></p></fieldset>
  <input type="hidden" name="assigned" data-label="Doctor (matched)">
  <fieldset class="wz-set" id="slots-set"><legend class="wz-legend" id="slots-lg">Time of day</legend>
    <div id="pkg-pick" class="field pkg-pick" hidden><label for="ap-pkg2">Which health package?</label>
      <select class="select" id="ap-pkg2"><option value="">Choose a package</option>${PACKAGES.map(p => `<option value="${p.id}">${esc(p.name)} · ${inr(p.price)}</option>`).join("")}</select></div>
    <div class="slots" id="slots"></div><p class="sr-only" role="status" aria-live="polite" id="slots-live"></p></fieldset>
  <p class="wz-err" role="alert" hidden></p>
</section>`;

const stepThree = () => `
<section class="wz-step" data-step="3" aria-labelledby="wz-h3" hidden>
  <header class="wz-head"><span class="label">Step 03 of 04</span><h2 id="wz-h3" tabindex="-1">Who is the appointment for?</h2>
    <p class="muted">We only use these details to confirm your visit.</p></header>
  <div class="form-grid">
    <div class="field full"><label for="ap-name">Patient's full name <span class="req">*</span></label>
      <input class="input" id="ap-name" name="name" data-label="Patient" autocomplete="name" required minlength="2"></div>
    <div class="field"><label for="ap-mobile">Mobile number <span class="req">*</span></label>
      <input class="input" id="ap-mobile" name="mobile" data-label="Mobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile" required pattern="[+]?[0-9\\s\\-]{10,16}"></div>
    ${crmEnabled ? `<div class="field full"><label for="ap-email">Email <span class="muted">(optional, for your confirmation)</span></label>
      <input class="input" id="ap-email" name="email" data-label="Email" type="email" autocomplete="email"></div>` : ""}
    <div class="field"><label for="ap-age">Age</label>
      <input class="input" id="ap-age" name="age" data-label="Age" type="number" inputmode="numeric" min="0" max="120"></div>
    <div class="field full"><label for="ap-gender">Gender</label>
      <select class="select" id="ap-gender" name="gender" data-label="Gender">
        <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
      </select></div>
    <fieldset class="field full wz-set"><legend class="wz-legend wz-legend--sm">Visit type</legend>
      <div class="seg-opts">${["First visit", "Follow-up", "Second opinion"].map((v, i) => `
        <label class="seg-opt"><input class="opt-in" type="radio" name="visit" value="${v}" data-label="Visit type" ${i ? "" : "checked"}><span>${v}</span></label>`).join("")}</div>
    </fieldset>
    <div class="field full"><label for="ap-pkg">Health package <span class="muted">(optional)</span></label>
      <select class="select" id="ap-pkg" name="package" data-label="Health package">
        <option value="">No package</option>
        ${PACKAGES.map(p => `<option value="${p.id}">${esc(p.name)} · ${inr(p.price)} · ${p.tests} tests</option>`).join("")}
      </select></div>
    <div class="field full"><label for="ap-notes">Symptoms or reason for visit <span class="muted">(optional)</span></label>
      <textarea class="textarea" id="ap-notes" name="notes" data-label="Notes" rows="3" placeholder="For example: knee pain for two weeks, worse on stairs"></textarea></div>
  </div>
  <p class="wz-err" role="alert" hidden></p>
</section>`;

const stepFour = () => `
<section class="wz-step" data-step="4" aria-labelledby="wz-h4" hidden>
  <header class="wz-head"><span class="label">Step 04 of 04</span><h2 id="wz-h4" tabindex="-1">Check and send.</h2>
    <p class="muted">Send the request on WhatsApp or by email. A coordinator will confirm the exact time.</p></header>
  <dl class="review" id="review"></dl>
  <div class="field full">${consentCheckbox("book and confirm my appointment")}</div>
  <p class="crm-note" id="crm-note" role="alert" hidden></p>
  <div class="send-row">
    <button class="btn btn--accent" type="submit" id="wz-submit"><span>${crmEnabled ? "Confirm appointment" : "Send on WhatsApp"}</span>${crmEnabled ? "" : `<span class="btn-ic">${icon("chat")}</span>`}</button>
    <button class="btn btn--line" type="button" id="crm-retry" hidden><span>Try again</span></button>
    <button class="btn btn--line" type="button" data-send="email" ${crmEnabled ? "hidden" : ""}><span>Send by email</span><span class="btn-ic">${icon("mail")}</span></button>
  </div>
  <p class="form-note" id="wz-foot">${crmEnabled ? `Your details go to ${esc(BIZ.name)}'s booking system to reserve this slot, and are used only for your visit.` : `Nothing is stored on this website. Your request opens in your own WhatsApp or email app, addressed to ${esc(BIZ.name)}.`}</p>
</section>`;

const done = () => `
<div class="form-done" hidden>
  <span class="done-ic">${icon("check")}</span>
  <h2>Request ready to send.</h2>
  <p class="lead">We've opened your WhatsApp or email app with the booking details. Once it's sent, our team will call or message you to confirm the time.</p>
  <div class="btn-row">${btn("/appointment.html", "Book another visit", "accent", { ic: "calendar" })}${btn("/patient-guide.html", "Prepare for your visit", "line")}</div>
</div>`;

const wizard = () => `
<form class="wz" id="wz" data-wa="Appointment request" novalidate>
  <div class="wz-body">
    <nav class="wz-prog" aria-label="Booking progress">
      <ol>${STEPS.map((s, i) => `<li><button type="button" data-goto="${i + 1}" ${i ? "disabled" : 'aria-current="step"'}><span class="num">0${i + 1}</span><span class="t">${s}</span></button></li>`).join("")}</ol>
      <div class="wz-bar" aria-hidden="true"><i id="wz-bar"></i></div>
      <p class="sr-only" aria-live="polite" id="wz-live"></p>
    </nav>
    <div class="wz-steps">${stepOne()}${stepTwo()}${stepThree()}${stepFour()}</div>
    <div class="wz-nav">
      <button class="btn btn--line" type="button" id="wz-back" hidden><span class="btn-ic btn-ic--l">${icon("arrowLeft")}</span><span>Back</span></button>
      <span class="wz-count label" id="wz-count">Step 1 of 4</span>
      <button class="btn btn--accent" type="button" id="wz-next"><span>Continue</span><span class="btn-ic">${icon("arrow")}</span></button>
    </div>
  </div>
  ${done()}
</form>`;

const aside = () => `
<aside class="ap-side" aria-label="Booking help">
  <div class="tile sum" aria-live="polite">
    <span class="label">Your visit</span>
    <dl class="sum-list">
      <div data-k="dept"><dt>Speciality</dt><dd>Not chosen yet</dd></div>
      <div data-k="doctor"><dt>Doctor</dt><dd>Not chosen yet</dd></div>
      <div data-k="date"><dt>Day</dt><dd>Not chosen yet</dd></div>
      <div data-k="time"><dt>Time</dt><dd>Not chosen yet</dd></div>
    </dl>
  </div>
  <div class="em-card">
    <span class="em-pulse" aria-hidden="true">${icon("ambulance")}</span>
    <div>
      <b>Is this an emergency?</b>
      <p>Don't book online. Call our 24/7 emergency line now, or come straight to the emergency room.</p>
      <a class="em-tel" href="${tel(BIZ.emergency)}">${icon("phone")}<span>${esc(BIZ.emergency)}</span></a>
    </div>
  </div>
  <div class="tile talk">
    <span class="label">Prefer to talk?</span>
    <a href="${tel(BIZ.phone)}" class="talk-row">${icon("phone")}<span><small>Reception</small>${esc(BIZ.phone)}</span></a>
    <a href="${wa("Hi, I'd like to book an appointment.")}" target="_blank" rel="noopener" class="talk-row">${icon("chat")}<span><small>WhatsApp</small>Message our care team</span></a>
    <div class="talk-row">${icon("clock")}<span><small>OPD hours</small>${esc(BIZ.hours.opd)}<br>${esc(BIZ.hours.sunday)}</span></div>
  </div>
</aside>`;

const page = () => `${hero()}
<section class="section section--tight ap-sec"><div class="container">
  <a class="em-strip" href="${tel(BIZ.emergency)}">${icon("alert")}<span>Emergency? Call <b>${esc(BIZ.emergency)}</b> now</span></a>
  <div class="ap-grid">${wizard()}${aside()}</div>
</div></section>`;

/* ---------- Behaviour ---------- */
const form = () => $("#wz");
const checked = name => $(`input[name="${name}"]:checked`, form());

function renderDoctors() {
  const wrap = $("#doc-opts");
  const isCheck = state.dept === CHECKUP.id;
  const docs = isCheck ? [] : doctorsIn(state.dept);
  const dep = deptById(state.dept);
  $("#wz-docnote").textContent = isCheck
    ? "Check-ups are run by our preventive health team. Most need 10–12 hours of fasting, so they start in the morning."
    : `${docs.length} ${docs.length === 1 ? "specialist" : "specialists"} in ${dep ? dep.name : "this speciality"}. Choose one, or let us find the first available.`;
  if (!docs.some(d => d.id === state.doctor)) state.doctor = "any";
  wrap.innerHTML = `
    <label class="opt opt--doc">
      <input class="opt-in" type="radio" name="doctor" value="${isCheck ? "Preventive health team" : "Any available doctor"}" data-id="any" data-label="Doctor" required ${state.doctor === "any" ? "checked" : ""}>
      <span class="opt-av opt-av--any">${icon(isCheck ? "flask" : "users")}</span>
      <span class="opt-t"><b>${isCheck ? "Preventive health team" : "Any available doctor"}</b><small>${isCheck ? "Mon–Sat mornings" : "Fastest option. We match you to the next free slot."}</small></span>
      <span class="opt-tick" aria-hidden="true">${icon("check")}</span>
    </label>
    ${docs.map(d => `
    <label class="opt opt--doc">
      <input class="opt-in" type="radio" name="doctor" value="${esc(d.name)}" data-id="${d.id}" data-label="Doctor" required ${state.doctor === d.id ? "checked" : ""}>
      <span class="opt-av ph">${media(d.photo, d.name, `<span class="initials">${initials(d.name)}</span>`)}</span>
      <span class="opt-t"><b>${esc(d.name)}</b><small>${esc(d.role)}</small><small class="opt-when">${d.days.length === 6 ? "Mon–Sat" : d.days.join(", ")} · ${esc(d.time)}</small></span>
      <span class="opt-tick" aria-hidden="true">${icon("check")}</span>
    </label>`).join("")}`;
  renderDays();
}

function renderDays() {
  const plan = crmPlan();
  const days = plan ? new Set(WEEK) : availability().days;
  const list = nextDays();
  if (state.date && !days.has(WEEK[new Date(state.date + "T00:00:00").getDay()])) state.date = "";
  const months = [...new Set(list.map(d => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`))];
  $("#wz-month").textContent = "· " + months.join(" – ");
  $("#days").innerHTML = list.map((d, i) => {
    const off = !days.has(WEEK[d.getDay()]);
    const full = `${WEEK[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    return `<label class="day ${off ? "is-off" : ""}" title="${off ? "Not available on " + WEEK[d.getDay()] : full}">
      <input class="opt-in" type="radio" name="date" value="${full}" data-iso="${iso(d)}" data-label="Date" required ${off ? "disabled" : ""} ${state.date === iso(d) ? "checked" : ""}
        aria-label="${full}${i < 2 ? " (" + dayName(d, i) + ")" : ""}${off ? ", not available" : ""}">
      <span class="day-w">${dayName(d, i)}</span><span class="day-d">${d.getDate()}</span><span class="day-m">${d.getDate() === 1 || i === 0 ? MONTHS[d.getMonth()] : "&nbsp;"}</span>
    </label>`;
  }).join("");
  if (plan) {
    $("#days-note").textContent = plan.needPkg ? "" : "Free times are checked live. Days with nothing available are greyed out as we check them.";
    if (!plan.needPkg) prefetch(plan);
    return renderSlots();
  }
  const offCount = list.filter(d => !days.has(WEEK[d.getDay()])).length;
  const who = state.dept === CHECKUP.id ? "Check-ups run" : state.doctor === "any" ? "This speciality runs" : (doctorById(state.doctor)?.name || "This doctor") + " sees patients";
  const order = WEEK.slice(1).concat("Sun").filter(x => days.has(x));
  $("#days-note").textContent = state.notice || (offCount ? `${who} on ${order.length === 6 && !days.has("Sun") ? "Mon–Sat" : order.join(", ")}. Other days are greyed out.` : "");
  renderSlots();
}

/* ---------- Live CRM availability ---------- */
const pkgId = () => $("#ap-pkg")?.value || "";
const dkey = (slug, date) => slug + "|" + date;

/** null -> static (WhatsApp/email) flow. Otherwise {service, cands, needPkg}. */
function crmPlan() {
  const c = state.cat;
  if (!crmEnabled || !c?.ok || state.forceWa || !state.dept) return null;
  const check = state.dept === CHECKUP.id;
  const service = check ? (pkgId() ? "pkg-" + pkgId() : "") : state.dept;
  if (service && !c.svc.has(service)) return null;
  const pool = check ? DOCTORS : state.doctor === "any" ? doctorsIn(state.dept) : [doctorById(state.doctor)].filter(Boolean);
  const cands = pool.filter(d => c.doc.has(d.id));
  if (!cands.length) return null;
  return { service, cands, needPkg: !service };
}
const liveBooking = () => !state.fell && !!crmPlan() && !!state.assigned && /^\d{4}-/.test(state.time);
const docName = id => doctorById(id)?.name || "";

function slotsFor(slug, date) {
  const k = dkey(slug, date);
  if (!dayCache.has(k)) { const p = getSlots(slug, date); p.catch(() => dayCache.delete(k)); dayCache.set(k, p); }
  return dayCache.get(k);
}
/** First candidate doctor with free slots on that date. */
async function resolveDay(plan, date) {
  const rs = await Promise.all(plan.cands.map(d => slotsFor(d.id, date).then(r => ({ d, r: { ...r, slots: r.slots.filter(x => new Date(x) > new Date()) } }))));
  const hit = rs.find(x => x.r.slots.length);
  if (hit) return { doc: hit.d, slots: hit.r.slots };
  return { doc: null, slots: [], onLeave: rs.every(x => x.r.onLeave), reason: rs.length === 1 ? rs[0].r.reason : null };
}

function markDay(date, r) {
  const input = $(`#days input[data-iso="${date}"]`);
  if (!input || r.slots.length) return;
  const lab = input.closest(".day"), why = r.onLeave ? "on leave" : "no free times";
  lab.classList.add("is-off"); input.disabled = true; lab.title = r.onLeave ? "Doctor on leave" : "No free times";
  input.setAttribute("aria-label", input.getAttribute("aria-label") + ", " + why);
  if (input.checked) { input.checked = false; state.date = ""; state.time = ""; syncSummary(); }
}

async function prefetch(plan) {
  if (plan.cands.length > 3) return;       // keep request volume low for wide pools
  const t = ++tok, list = nextDays().map(iso);
  let i = 0;
  const worker = async () => {
    while (i < list.length && t === tok) {
      const d = list[i++];
      try { const r = await resolveDay(plan, d); if (t === tok) markDay(d, r); } catch { /* stays unknown */ }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}

function renderLive(plan) {
  const box = $("#slots"), live = $("#slots-live");
  box.className = "slots slots--crm"; box.removeAttribute("aria-busy");
  $("#slots-lg").textContent = "Available times";
  const pick = $("#pkg-pick"); pick.hidden = state.dept !== CHECKUP.id;
  if (!pick.hidden) $("#ap-pkg2").value = pkgId();
  state.assigned = null; $('input[name="assigned"]').value = "";
  const msg = t => { box.innerHTML = `<p class="slot-empty">${t}</p>`; syncSummary(); };
  if (plan.needPkg) return msg("Choose a health package to see free times.");
  if (!state.date) return msg("Choose a day to see free times.");
  const t = ++stok, date = state.date;
  box.setAttribute("aria-busy", "true");
  box.innerHTML = `<div class="chips" aria-hidden="true">${Array.from({ length: 9 }, () => `<span class="chip sk">&nbsp;</span>`).join("")}</div>`;
  live.textContent = "Loading available times.";
  resolveDay(plan, date).then(r => {
    if (t !== stok) return;
    box.removeAttribute("aria-busy");
    if (!r.slots.length) {
      markDay(date, r);
      const who = plan.cands.length === 1 ? docName(plan.cands[0].id) : "Our doctors";
      const text = r.onLeave ? `${who} ${plan.cands.length === 1 ? "is" : "are"} on leave this day${r.reason ? " (" + r.reason + ")" : ""}. Please choose another day.` : "No free times on this day. Please choose another day.";
      box.innerHTML = `<p class="slot-empty">${esc(text)}</p><p class="slot-alt"><button type="button" class="link" id="slot-alt">Prefer to send a request instead?</button></p>`;
      live.textContent = text;
      return syncSummary();
    }
    state.assigned = r.doc.id; $('input[name="assigned"]').value = r.doc.name;
    if (!r.slots.includes(state.time)) state.time = "";
    const groups = [["Morning", h => h < 12], ["Afternoon", h => h >= 12 && h < 16], ["Evening", h => h >= 16]];
    const note = plan.cands.length > 1 ? `<p class="slot-note">With <b>${esc(r.doc.name)}</b>, the first doctor with free times this day.</p>` : "";
    box.innerHTML = note + groups.map(([name, fn]) => {
      const list = r.slots.filter(x => fn(hourIST(x)));
      return list.length ? `<div class="slot-group" role="group" aria-label="${name}"><span class="label">${name}</span><div class="chips">${list.map(x => `
        <label class="chip"><input class="opt-in" type="radio" name="time" value="${fmtTime(x)}" data-id="${x}" data-label="Preferred time" required ${state.time === x ? "checked" : ""}><span>${fmtTime(x)}</span></label>`).join("")}</div></div>` : "";
    }).join("");
    live.textContent = `${r.slots.length} free ${r.slots.length === 1 ? "time" : "times"} loaded.`;
    syncSummary();
  }).catch(() => {
    if (t !== stok) return;
    state.forceWa = true; state.notice = "We couldn't load live times just now. Choose a time of day and we'll confirm by WhatsApp or email.";
    live.textContent = state.notice; renderDays();
  });
}

function renderSlots() {
  if (crmEnabled && !state.cat) {   // catalog still loading
    $("#slots").className = "slots slots--crm";
    $("#slots").innerHTML = `<div class="chips" aria-hidden="true">${Array.from({ length: 6 }, () => `<span class="chip sk">&nbsp;</span>`).join("")}</div>`;
    return syncSummary();
  }
  const plan = crmPlan();
  if (plan) return renderLive(plan);
  state.assigned = null; $('input[name="assigned"]').value = "";
  $("#slots").className = "slots"; $("#slots-lg").textContent = "Time of day"; $("#pkg-pick").hidden = true;
  const { ranges } = availability();
  const now = new Date(), isToday = state.date === iso(now);
  const ok = s => ranges.some(([a, b]) => a < s.to && b > s.from) && !(isToday && now.getHours() >= s.to - 1);
  const cur = SLOTS.find(s => s.id === state.time);
  if (state.time && (!cur || !ok(cur))) state.time = "";
  $("#slots").innerHTML = SLOTS.map(s => {
    const off = !ok(s);
    return `<label class="slot ${off ? "is-off" : ""}">
      <input class="opt-in" type="radio" name="time" value="${s.label} (${s.range})" data-id="${s.id}" data-label="Preferred time" required ${off ? "disabled" : ""} ${state.time === s.id ? "checked" : ""}>
      <b>${s.label}</b><span>${s.range}</span>${off ? `<small>${isToday && ranges.some(([a, b]) => a < s.to && b > s.from) ? "Passed for today" : "Not available"}</small>` : ""}
    </label>`;
  }).join("");
  syncSummary();
}

function syncSummary() {
  const vals = {
    dept: checked("dept")?.value,
    doctor: state.assigned ? docName(state.assigned) : checked("doctor")?.value,
    date: checked("date")?.value,
    time: checked("time")?.value
  };
  $$(".sum-list > div").forEach(row => {
    const v = vals[row.dataset.k], dd = $("dd", row);
    const next = v || "Not chosen yet";
    if (dd.textContent === next) return;
    dd.textContent = next;
    row.classList.toggle("is-set", !!v);
    if (v && motionAllowed()) gsap.fromTo(dd, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "expo.out" });
  });
}

function renderReview() {
  const f = form();
  const get = n => f.elements.namedItem(n)?.value?.trim?.() ?? "";
  const pkg = PACKAGES.find(p => p.id === get("package"));
  const rows = [
    ["Speciality", checked("dept")?.value, 1],
    ["Doctor", state.assigned ? docName(state.assigned) : checked("doctor")?.value, 2],
    ["Day", checked("date")?.value, 2],
    ["Time", checked("time")?.value, 2],
    ["Patient", [get("name"), get("age") && get("age") + " yrs", f.elements.namedItem("gender").value].filter(Boolean).join(" · "), 3],
    ["Mobile", get("mobile"), 3],
    ["Visit type", checked("visit")?.value, 3],
    ["Health package", pkg ? `${pkg.name} · ${inr(pkg.price)}` : "", 3],
    ["Notes", get("notes"), 3]
  ].filter(r => r[1]);
  $("#review").innerHTML = rows.map(([k, v, s]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd><dd class="rv-edit"><button type="button" class="link" data-goto="${s}">Change<span class="sr-only"> ${k.toLowerCase()}</span></button></dd></div>`).join("");
}

function validate(step) {
  const sec = $(`.wz-step[data-step="${step}"]`);
  const err = $(".wz-err", sec);
  const f = form();
  let msg = "", focusEl = null;
  $$("[aria-invalid]", sec).forEach(el => el.removeAttribute("aria-invalid"));
  if (step === 1 && !checked("dept")) { msg = "Please choose a speciality to continue."; focusEl = $('input[name="dept"]', sec); }
  if (step === 2) {
    const miss = [!checked("doctor") && "a doctor", !checked("date") && "a day", !checked("time") && (crmPlan() ? "a time" : "a time of day")].filter(Boolean);
    if (miss.length) {
      msg = `Please choose ${miss.join(", ").replace(/, ([^,]*)$/, " and $1")}.`;
      focusEl = !checked("doctor") ? $('input[name="doctor"]', sec) : !checked("date") ? $('input[name="date"]:not(:disabled)', sec) : $('input[name="time"]:not(:disabled)', sec);
      if (!focusEl) msg = "There are no open slots for this choice in the next two weeks. Choose \"Any available doctor\" or call us.";
    }
  }
  if (step === 3) {
    const bad = [];
    const el = n => f.elements.namedItem(n);
    const name = el("name"), mob = el("mobile"), age = el("age");
    if (name.value.trim().length < 2) bad.push([name, "the patient's name"]);
    const digits = mob.value.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13 || !mob.checkValidity()) bad.push([mob, "a valid mobile number"]);
    if (age.value && !age.checkValidity()) bad.push([age, "an age between 0 and 120"]);
    bad.forEach(([el]) => el.setAttribute("aria-invalid", "true"));
    if (bad.length) { msg = `Please enter ${bad.map(b => b[1]).join(" and ")}.`; focusEl = bad[0][0]; }
  }
  err.hidden = !msg; err.textContent = msg;
  if (msg) { focusEl?.focus(); if (motionAllowed()) gsap.fromTo(err, { x: -6 }, { x: 0, duration: .5, ease: "elastic.out(1, .3)" }); }
  return !msg;
}

function go(to, { focus = true } = {}) {
  const from = state.step;
  if (to === from) return;
  if (to > from) { for (let s = from; s < to; s++) if (!validate(s)) { if (s !== from) go(s); return; } }
  state.step = to; state.max = Math.max(state.max, to);
  if (to === 4) { renderReview(); syncSend(); }
  const out = $(`.wz-step[data-step="${from}"]`), inn = $(`.wz-step[data-step="${to}"]`);
  const dir = to > from ? 1 : -1;
  const show = () => {
    out.hidden = true; inn.hidden = false;
    if (motionAllowed()) gsap.fromTo(inn, { x: 28 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .8, ease: "expo.out", clearProps: "transform,opacity" });
    if (focus) $("h2", inn).focus({ preventScroll: true });
    const top = form().getBoundingClientRect().top;
    if (top < 0) window.__lenis ? window.__lenis.scrollTo(form(), { offset: -110 }) : form().scrollIntoView({ block: "start" });
  };
  if (motionAllowed() && from) gsap.to(out, { x: -20 * dir, opacity: 0, duration: .22, ease: "power2.in", onComplete: show });
  else show();
  syncChrome();
}

function syncChrome() {
  const s = state.step;
  $("#wz-bar").style.transform = `scaleX(${s / STEPS.length})`;
  $$(".wz-prog button").forEach(b => {
    const n = +b.dataset.goto;
    b.disabled = n > state.max;
    b.classList.toggle("is-done", n < s || (n <= state.max && n !== s));
    n === s ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current");
  });
  $("#wz-back").hidden = s === 1;
  $("#wz-next").hidden = s === STEPS.length;
  $("#wz-count").textContent = `Step ${s} of ${STEPS.length}`;
  $("#wz-live").textContent = `Step ${s} of ${STEPS.length}: ${STEPS[s - 1]}`;
}

function bind() {
  const f = form();
  f.addEventListener("change", e => {
    const t = e.target;
    if (t.name === "dept") { state.dept = t.dataset.id; state.forceWa = false; state.notice = ""; state.time = ""; renderDoctors(); }
    else if (t.name === "doctor") { state.doctor = t.dataset.id; state.forceWa = false; state.notice = ""; state.time = ""; renderDays(); }
    else if (t.id === "ap-pkg2") { f.elements.namedItem("package").value = t.value; state.time = ""; renderDays(); }
    else if (t.name === "package") { if (state.dept === CHECKUP.id) { state.time = ""; renderDays(); } }
    else if (t.name === "date") { state.date = t.dataset.iso; renderSlots(); }
    else if (t.name === "time") { state.time = t.dataset.id; syncSummary(); }
    const err = $(".wz-err", t.closest(".wz-step") || f);
    if (err && !err.hidden && ["dept", "doctor", "date", "time"].includes(t.name)) err.hidden = true;
  });
  f.addEventListener("input", e => e.target.removeAttribute("aria-invalid"));
  $("#wz-next").addEventListener("click", () => go(state.step + 1));
  $("#wz-back").addEventListener("click", () => go(state.step - 1));
  f.addEventListener("click", e => { const b = e.target.closest("[data-goto]"); if (b && !b.disabled) go(+b.dataset.goto); });
  // Enter before the last step means "continue", never "send" (runs before forms.js' submit handler).
  f.addEventListener("submit", e => {
    if (state.step < STEPS.length) { e.preventDefault(); e.stopImmediatePropagation(); go(state.step + 1); }
    else if (liveBooking()) { e.preventDefault(); e.stopImmediatePropagation(); confirmBooking(); }
  }, true);
  f.addEventListener("click", e => {
    if (e.target.closest("#slot-alt")) { state.forceWa = true; state.notice = "Choose a time of day and we'll confirm by WhatsApp or email."; renderDays(); }
    if (e.target.closest("#crm-retry")) { state.fell = false; syncSend(); f.requestSubmit($("#wz-submit")); }
  });
}

function prefill() {
  const f = form();
  const doc = doctorById(params.get("doctor"));
  const pkg = PACKAGES.find(p => p.id === params.get("package"));
  let dept = doc ? doc.dept : deptById(params.get("dept"))?.id || "";
  if (!dept && pkg) dept = CHECKUP.id;
  if (pkg) f.elements.namedItem("package").value = pkg.id;
  if (!dept) return;
  const r = $(`input[name="dept"][data-id="${dept}"]`, f);
  if (!r) return;
  r.checked = true; state.dept = dept;
  if (doc) state.doctor = doc.id;
  renderDoctors();
  state.max = 2;
  $('.wz-step[data-step="1"]').hidden = true; $('.wz-step[data-step="2"]').hidden = false; state.step = 2;
}

/* ---------- Booking via CRM ---------- */
const FOOT_LIVE = `Your details go to ${BIZ.name}'s booking system to reserve this slot, and are used only for your visit.`;
const FOOT_WA = `Nothing is stored on this website. Your request opens in your own WhatsApp or email app, addressed to ${BIZ.name}.`;
function syncSend() {
  if (!crmEnabled) return;
  const live = liveBooking();
  $("#wz-submit span").textContent = live ? "Confirm appointment" : "Send on WhatsApp";
  $('[data-send="email"]').hidden = live;
  $("#crm-retry").hidden = !(state.fell && crmPlan() && state.assigned && /^\d{4}-/.test(state.time));
  $("#wz-foot").textContent = live ? FOOT_LIVE : FOOT_WA;
  $("#wz-h4 + p").textContent = live ? "Confirm to reserve this time. We'll show your appointment code straight away." : "Send the request on WhatsApp or by email. A coordinator will confirm the exact time.";
}

const nm = v => (typeof v === "string" ? v : v?.name) || "";
function ics(code, doc, svc, when, mins) {
  const st = d => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = x => String(x).replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  const end = new Date(new Date(when).getTime() + (mins || 30) * 60000);
  return ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${BIZ.name}//Booking//EN`, "BEGIN:VEVENT", `UID:${code}@lumi-booking`, `DTSTAMP:${st(new Date())}`,
    `DTSTART:${st(when)}`, `DTEND:${st(end)}`, `SUMMARY:${esc(`${doc || "Appointment"} · ${BIZ.name}`)}`, `LOCATION:${esc(BIZ.address)}`,
    `DESCRIPTION:${esc(`Booking code ${code}${svc ? ". " + svc : ""}`)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}

function showConfirmed(res, ctx) {
  const f = form(), d = $(".form-done", f);
  const code = res.appointmentCode || "", when = res.scheduledAt || ctx.scheduledAt;
  const doc = nm(res.doctor) || ctx.doc, svc = nm(res.service) || ctx.svc;
  const fast = ctx.service.startsWith("pkg-");
  d.innerHTML = `<span class="done-ic">${icon("check")}</span>
    <h2 id="cf-h" tabindex="-1">Appointment confirmed.</h2>
    <p class="lead">Your visit is booked. Keep this code handy, you'll need it at reception.</p>
    <span class="cf-code" aria-label="Appointment code ${esc(code)}">${esc(code)}</span>
    <dl class="cf-list">
      <div><dt>Doctor</dt><dd>${esc(doc)}</dd></div>
      <div><dt>For</dt><dd>${esc(svc)}</dd></div>
      <div><dt>When</dt><dd>${esc(fmtWhen(when))}</dd></div>
    </dl>
    <span class="label">What to bring</span>
    <ul class="cf-bring"><li>A photo ID</li><li>Past reports, scans and prescriptions</li><li>A list of the medicines you take</li>${fast ? "<li>Fasting for 10–12 hours, if your package needs it</li>" : ""}</ul>
    <div class="btn-row">
      <button class="btn btn--accent" type="button" id="cf-ics"><span>Add to calendar</span></button>
      <button class="btn btn--line" type="button" id="cf-wa"><span>Also send details on WhatsApp</span></button>
      ${btn("/appointment.html", "Book another visit", "line")}
    </div>`;
  $("#cf-ics").addEventListener("click", () => {
    const a = document.createElement("a"), url = URL.createObjectURL(new Blob([ics(code, doc, svc, when, ctx.mins)], { type: "text/calendar" }));
    a.href = url; a.download = `appointment-${code || "lumi"}.ics`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("#cf-wa").addEventListener("click", () => window.open(wa(`${formMessage(f)}\n\nBooking code: ${code}\nWhen: ${fmtWhen(when)}`), "_blank", "noopener"));
  d.hidden = false;
  $("#cf-h").focus({ preventScroll: true });
  const top = f.getBoundingClientRect().top;
  if (top < 0) window.__lenis ? window.__lenis.scrollTo(f, { offset: -110 }) : f.scrollIntoView({ block: "start" });
}

async function confirmBooking() {
  const f = form();
  if (!f.reportValidity()) return;
  const plan = crmPlan(), b = $("#wz-submit"), lbl = $("span", b), note = $("#crm-note");
  if (!plan) return;
  const get = n => f.elements.namedItem(n)?.value?.trim() || "";
  const full = get("name").replace(/\s+/g, " "), i = full.indexOf(" ");
  const pkg = PACKAGES.find(p => p.id === get("package"));
  const reason = [checked("visit")?.value, get("age") && "Age " + get("age"), pkg && "Package: " + pkg.name, get("notes")].filter(Boolean).join(". ");
  const ctx = { service: plan.service, doc: docName(state.assigned), scheduledAt: state.time,
    svc: pkg && plan.service.startsWith("pkg-") ? pkg.name : deptById(state.dept)?.name || state.cat.svc.get(plan.service)?.name || "",
    mins: state.cat.svc.get(plan.service)?.durationMinutes };
  const date = state.date, doctor = state.assigned;
  note.hidden = true; b.disabled = true; b.setAttribute("aria-busy", "true"); lbl.textContent = "Confirming…";
  try {
    const res = await book({ serviceSlug: plan.service, doctorSlug: doctor, firstName: i < 0 ? full : full.slice(0, i), lastName: i < 0 ? "" : full.slice(i + 1),
      phone: get("mobile").replace(/[\s-]/g, ""), email: get("email"), gender: { Female: "FEMALE", Male: "MALE", Other: "OTHER" }[get("gender")], scheduledAt: state.time, reason });
    showConfirmed(res || {}, ctx);
  } catch (e) {
    const back = (step, text, els = []) => {
      const err = $(`.wz-step[data-step="${step}"] .wz-err`); err.textContent = text; err.hidden = false;
      els.forEach(el => el?.setAttribute("aria-invalid", "true"));
      go(step);
    };
    if (e.kind === "conflict") {
      dayCache.delete(dkey(doctor, date)); state.time = "";
      renderDays();
      back(2, "Sorry, that time was just taken by someone else. We've refreshed the free times, please choose another.");
    } else if (e.kind === "invalid") {
      const fl = e.fields || {}, m = { firstName: "name", lastName: "name", phone: "mobile", email: "email", gender: "gender" };
      const hit = Object.keys(fl).filter(k => m[k]);
      if (hit.length) back(3, hit.map(k => fl[k]).join(" "), hit.map(k => f.elements.namedItem(m[k])));
      else back(2, "Please check the doctor, day and time, then try again.");
    } else {
      state.fell = true;
      note.textContent = "We couldn't reach our booking system, so nothing has been booked yet. Your details are still here. You can try again, or send the request on WhatsApp or by email and our team will confirm.";
      note.hidden = false;
    }
  } finally { b.disabled = false; b.removeAttribute("aria-busy"); syncSend(); }
}

boot(() => {
  $("main").innerHTML = page();
  bind();
  prefill();
  syncChrome();
  syncSummary();
  if (crmEnabled) loadCatalog().then(c => {
    state.cat = c;
    if (c.ok) $(".ap-hero .lead").textContent = "Choose a speciality, a doctor and a free time, then confirm. You'll get your appointment code straight away.";
    if (state.dept) renderDays();
  });
});
