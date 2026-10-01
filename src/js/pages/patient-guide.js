import { boot } from "../core.js";
import { pic } from "../media.js";
import "../../css/pages/patient-guide.css";
import { BIZ, JOURNEY, FAQ } from "../../data/site.js";
import { $, $$, esc, tel, wa, btn, icon, pad, pageHero, accordion } from "../render.js";

const list = (items, ic = "check") => `<ul class="pg-list">${items.map(t => `<li>${icon(ic)}<span>${t}</span></li>`).join("")}</ul>`;
const steps = items => `<ol class="pg-steps">${items.map(([h, p], i) => `<li><span class="num">${pad(i + 1)}</span><div><h4>${h}</h4><p>${p}</p></div></li>`).join("")}</ol>`;

const SECTIONS = [
  { id: "before", label: "Before your visit", title: "Before your <em>visit</em>", body: () => `
    <p class="pg-intro">A little preparation makes the first consultation faster and far more useful. Bring the story of your health with you.</p>
    <div class="pg-split">
      <div class="pg-card"><span class="label">What to bring</span>
        ${list(["A photo ID (Aadhaar, passport, driving licence)", "Previous prescriptions, discharge summaries and reports", "A list of every medicine you take, with doses", "Your insurance card or policy number, if you have one"])}</div>
      <div class="pg-card"><span class="label">Good to do</span>
        ${list(["Write down your symptoms and when they started", "Note the questions you want to ask", "Arrive 15 minutes early for a first visit", "Bring someone along if you'd like support"], "info")}</div>
    </div>
    <div class="pg-journey">${JOURNEY.map((j, i) => `<div class="pg-jstep"><span class="num">${pad(i + 1)}</span><h4>${j.title}</h4><p>${j.text}</p></div>`).join("")}</div>` },

  { id: "opd", label: "OPD & appointments", title: "OPD &amp; <em>appointments</em>", body: () => `
    <p class="pg-intro">Walk-ins are welcome, but booked patients are seen first. Booking takes under a minute, with no login.</p>
    <dl class="pg-hours">
      <div><dt class="label">Outpatient clinics</dt><dd>${esc(BIZ.hours.opd)}</dd></div>
      <div><dt class="label">Sunday</dt><dd>${esc(BIZ.hours.sunday)}</dd></div>
    </dl>
    <div class="pg-ways">
      <a class="pg-way" href="/appointment.html"><span class="ic-badge">${icon("calendar")}</span><span><b>Book online</b><small>Pick a speciality, doctor and slot</small></span>${icon("arrowUpRight")}</a>
      <a class="pg-way" href="${wa("Hello, I'd like to book an appointment.")}" target="_blank" rel="noopener"><span class="ic-badge">${icon("chat")}</span><span><b>WhatsApp</b><small>A coordinator replies and confirms</small></span>${icon("arrowUpRight")}</a>
      <a class="pg-way" href="${tel(BIZ.phone)}"><span class="ic-badge">${icon("phone")}</span><span><b>Call reception</b><small>${esc(BIZ.phone)}</small></span>${icon("arrowUpRight")}</a>
    </div>` },

  { id: "admission", label: "Admission & discharge", title: "Admission &amp; <em>discharge</em>", body: () => `
    <p class="pg-intro">Whether your stay is planned or follows an emergency, one admissions team guides you from the desk to the ward, and back home again.</p>
    <div class="pg-split">
      <div><span class="label">Admission</span>${steps([
        ["Admission desk", "Bring your doctor's admission advice, photo ID and insurance details. We'll explain the estimate before anything else."],
        ["Insurance or deposit", "For cashless stays the insurance desk starts pre-authorisation. Otherwise an advance deposit is collected."],
        ["To your room", "A nurse settles you in, checks your medicines and explains the plan for the day."]])}</div>
      <div><span class="label">Discharge</span>${steps([
        ["Doctor's clearance", "Your consultant confirms you're ready and reviews your results with you."],
        ["Summary & medicines", "You receive a discharge summary, prescriptions and a follow-up date, explained in plain language."],
        ["Billing & home", "The billing desk settles the final bill or insurance claim. Ask us about anything you're unsure of."]])}</div>
    </div>` },

  { id: "insurance", label: "Insurance & cashless", title: "Insurance &amp; <em>cashless</em>", body: () => `
    <p class="pg-intro">We work with leading insurers, TPAs and government schemes. Our insurance desk handles pre-authorisation so you can focus on getting better.</p>
    <ul class="pg-insurers" aria-label="Insurance partners">${BIZ.insurers.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
    ${steps([
      ["Show your card", "Share your policy card and photo ID at the insurance desk on arrival, or as soon as you can after an emergency."],
      ["Pre-authorisation", "We send your doctor's plan to the insurer and keep you updated on approval."],
      ["Settlement", "Approved amounts are settled directly. You pay only what the policy doesn't cover."]])}
    <p class="pg-note">${icon("info")}<span>Don't see your insurer? Tie-ups change, so <a class="link" href="${wa("Hello, is my health insurance accepted for cashless treatment?")}" target="_blank" rel="noopener">ask us on WhatsApp</a> before your visit.</span></p>` },

  { id: "visiting", label: "Visiting hours", title: "Visiting <em>hours</em>", body: () => `
    <p class="pg-intro">Visitors help patients heal. A few simple rules keep wards calm and protect those who are most vulnerable.</p>
    <dl class="pg-hours pg-hours--big">
      <div><dt class="label">General wards</dt><dd>${esc(BIZ.hours.visiting)}</dd></div>
      <div><dt class="label">ICU &amp; NICU</dt><dd>One attendant at set times. Please ask the nursing station.</dd></div>
      <div><dt class="label">Pharmacy</dt><dd>${esc(BIZ.hours.pharmacy)}</dd></div>
      <div><dt class="label">Emergency</dt><dd>Always open</dd></div>
    </dl>
    ${list(["Please keep to two visitors per patient at a time", "Wash or sanitise your hands as you enter and leave", "Postpone your visit if you have a cough, cold or fever", "Children under 12 visit only with the nurse's approval"])}` },

  { id: "reports", label: "Reports", title: "Your <em>reports</em>", body: () => `
    <p class="pg-intro">No more coming back just to collect a piece of paper. Reports travel to you, and to every doctor who treats you here.</p>
    <div class="pg-split">
      <div class="pg-card"><span class="ic-badge">${icon("file")}</span><h4>Lab reports</h4><p>Sent to your registered mobile number as soon as they're verified, and available at the lab counter. The lab runs ${esc(BIZ.hours.lab.toLowerCase())}.</p></div>
      <div class="pg-card"><span class="ic-badge">${icon("scan")}</span><h4>Imaging</h4><p>CT, MRI, X-ray and ultrasound reports are shared digitally, with films or images on request at the imaging desk.</p></div>
    </div>
    <p class="pg-note">${icon("shield")}<span>Reports are only shared with you or someone you authorise. Bring photo ID when collecting on someone's behalf.</span></p>` },

  { id: "facilities", label: "Facilities", title: "On-site <em>facilities</em>", body: () => `
    <div class="pg-photos">${pic("reception", { sizes: "(max-width: 960px) 50vw, 30vw" })}${pic("ward-care", { sizes: "(max-width: 960px) 50vw, 30vw" })}</div>
    <div class="pg-facs">
      ${[["car", "Parking", "On-site parking for patients and visitors, with drop-off right at the emergency entrance."],
         ["coffee", "Cafeteria", "Fresh, simple meals and hot drinks for patients' families and visitors."],
         ["wifi", "Wi-Fi", "Free Wi-Fi in waiting areas and rooms. Ask at the front desk for access."],
         ["pill", "Pharmacy", `In-house pharmacy, open ${esc(BIZ.hours.pharmacy.toLowerCase())}, stocked for what our doctors prescribe.`]]
        .map(([ic, h, p]) => `<div class="pg-fac"><span class="ic-badge">${icon(ic)}</span><h4>${h}</h4><p>${p}</p></div>`).join("")}
    </div>` },

  { id: "rights", label: "Rights & responsibilities", title: "Rights &amp; <em>responsibilities</em>", body: () => `
    <p class="pg-intro">Good care is a partnership. Here is what you can always expect from us, and how you can help us care for you.</p>
    <div class="pg-split pg-rights">
      <div><h4>${icon("shield")}You have the right to</h4>${list([
        "Respectful, dignified care regardless of background or ability to pay",
        "Clear information about your condition, treatment options and their costs",
        "Give or refuse informed consent before any procedure",
        "Privacy and confidentiality of your medical records",
        "Access copies of your records and reports",
        "Seek a second opinion and raise a concern without fear"])}</div>
      <div><h4>${icon("users")}We ask that you</h4>${list([
        "Share complete, honest information about your health and medicines",
        "Follow the treatment plan you've agreed, or tell us if you can't",
        "Respect staff, other patients and hospital property",
        "Keep to visiting hours and infection-control guidance",
        "Settle bills or insurance formalities on time",
        "Tell us when something isn't right, so we can fix it"], "arrow")}</div>
    </div>` },

  { id: "faq", label: "FAQ", title: "Frequently <em>asked</em>", body: () => accordion(FAQ) }
];

const nav = () => `
<nav class="pg-nav" aria-label="Guide sections">
  <span class="label pg-nav-title">In this guide</span>
  <ol>${SECTIONS.map((s, i) => `<li><a href="#${s.id}" data-spy="${s.id}"><span class="num">${pad(i + 1)}</span>${esc(s.label)}</a></li>`).join("")}</ol>
  <div class="pg-nav-help"><span class="label">Need help now?</span>
    <a href="${wa("Hello, I have a question about my visit.")}" target="_blank" rel="noopener">${icon("chat")}WhatsApp us</a>
    <a href="${tel(BIZ.emergency)}" class="is-em">${icon("ambulance")}Emergency</a>
  </div>
</nav>`;

const content = () => `
<section class="pg-body"><div class="container pg-layout">
  ${nav()}
  <div class="pg-sections">
    ${SECTIONS.map((s, i) => `
    <section class="pg-sec" id="${s.id}" aria-labelledby="${s.id}-h">
      <div class="sec-index label"><span class="num">(${pad(i + 1)})</span><span>${esc(s.label)}</span></div>
      <h2 id="${s.id}-h">${s.title}</h2>
      ${s.body()}
    </section>`).join("")}
  </div>
</div></section>`;

const help = () => `
<section class="section--tight"><div class="container">
  <div class="pg-help">
    <div><span class="label">Still have a question?</span><h2>A real person, <em>not</em> a phone tree.</h2></div>
    <div class="btn-row">${btn(wa("Hello, I have a question."), "Message on WhatsApp", "accent", { ic: "chat", attrs: 'target="_blank" rel="noopener"' })}${btn("/contact.html", "Contact & directions", "line", { ic: "pin" })}</div>
  </div>
</div></section>`;

/* Scroll-spy: works with or without motion (IntersectionObserver, not GSAP). */
function scrollSpy() {
  const links = $$(".pg-nav a[data-spy]"), list = $(".pg-nav ol");
  const byId = Object.fromEntries(links.map(a => [a.dataset.spy, a]));
  let current = "";
  const activate = id => {
    if (id === current || !byId[id]) return;
    current = id;
    links.forEach(a => { const on = a === byId[id]; a.classList.toggle("is-active", on); on ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current"); });
    // keep the active chip in view on the mobile chip bar, without moving the page
    if (list.scrollWidth > list.clientWidth + 4) {
      const a = byId[id], left = a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2;
      list.scrollTo({ left, behavior: document.documentElement.classList.contains("js-motion") ? "smooth" : "auto" });
    }
  };
  const visible = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => visible.set(e.target.id, e.isIntersecting));
    const first = SECTIONS.find(s => visible.get(s.id));
    if (first) activate(first.id);
  }, { rootMargin: "-30% 0px -60% 0px" });
  SECTIONS.forEach(s => io.observe(document.getElementById(s.id)));
  activate(SECTIONS[0].id);
}

boot(() => {
  $("main").innerHTML = pageHero("Patients &amp; visitors", "Everything you need for <em>your</em> visit.",
    "Appointments, admissions, insurance, visiting hours and reports, in one calm place. If anything's unclear, a coordinator is a message away.",
    `<div class="btn-row pg-hero-cta" data-reveal>${btn("/appointment.html", "Book appointment", "accent", { ic: "calendar" })}${btn("#insurance", "Insurance & cashless", "line", { ic: "card" })}</div>`)
    + content() + help();
  scrollSpy();
});
