import { boot } from "../core.js";
import { consentCheckbox } from "../consent.js";
import "../../css/pages/appointment.css";
import { BIZ, DEPARTMENTS, PACKAGES } from "../../data/site.js";
import { $, $$, esc, tel, wa, params, deptById, doctorById, doctorsIn, initials, inr, icon, btn, media } from "../render.js";
import { gsap } from "../motion.js";
import { motionAllowed } from "../theme.js";

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

const state = { step: 1, max: 1, dept: "", doctor: "any", date: "", time: "" };

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
  <fieldset class="wz-set"><legend class="wz-legend">Time of day</legend><div class="slots" id="slots"></div></fieldset>
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
  <div class="send-row">
    <button class="btn btn--accent" type="submit"><span>Send on WhatsApp</span><span class="btn-ic">${icon("chat")}</span></button>
    <button class="btn btn--line" type="button" data-send="email"><span>Send by email</span><span class="btn-ic">${icon("mail")}</span></button>
  </div>
  <p class="form-note">Nothing is stored on this website. Your request opens in your own WhatsApp or email app, addressed to ${esc(BIZ.name)}.</p>
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
  const { days } = availability();
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
  const offCount = list.filter(d => !days.has(WEEK[d.getDay()])).length;
  const who = state.dept === CHECKUP.id ? "Check-ups run" : state.doctor === "any" ? "This speciality runs" : (doctorById(state.doctor)?.name || "This doctor") + " sees patients";
  const order = WEEK.slice(1).concat("Sun").filter(x => days.has(x));
  $("#days-note").textContent = offCount ? `${who} on ${order.length === 6 && !days.has("Sun") ? "Mon–Sat" : order.join(", ")}. Other days are greyed out.` : "";
  renderSlots();
}

function renderSlots() {
  const { ranges } = availability();
  const now = new Date(), isToday = state.date === iso(now);
  const ok = s => ranges.some(([a, b]) => a < s.to && b > s.from) && !(isToday && now.getHours() >= s.to - 1);
  if (state.time && !ok(SLOTS.find(s => s.id === state.time))) state.time = "";
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
    doctor: checked("doctor")?.value,
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
    ["Doctor", checked("doctor")?.value, 2],
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
    const miss = [!checked("doctor") && "a doctor", !checked("date") && "a day", !checked("time") && "a time of day"].filter(Boolean);
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
  if (to === 4) renderReview();
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
    if (t.name === "dept") { state.dept = t.dataset.id; renderDoctors(); }
    else if (t.name === "doctor") { state.doctor = t.dataset.id; renderDays(); }
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
  }, true);
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

boot(() => {
  $("main").innerHTML = page();
  bind();
  prefill();
  syncChrome();
  syncSummary();
});
