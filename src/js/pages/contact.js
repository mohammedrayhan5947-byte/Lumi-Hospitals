import { boot } from "../core.js";
import { consentCheckbox } from "../consent.js";
import { pic } from "../media.js";
import "../../css/pages/contact.css";
import { BIZ, DEPARTMENTS } from "../../data/site.js";
import { $, esc, tel, wa, icon, btn } from "../render.js";

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const q = encodeURIComponent(BIZ.mapQuery);
const mapSrc = `https://www.google.com/maps?q=${q}&output=embed`;
const dirHref = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
const openHref = BIZ.mapsLink || `https://www.google.com/maps/search/?api=1&query=${q}`;

/** "Mon–Sat · 8:00 AM – 8:00 PM" → { days:Set, from, to } in minutes, or null if the text doesn't follow that shape. */
function parseHours(str) {
  const m = String(str).match(/^([A-Za-z]{3})(?:\s*[–-]\s*([A-Za-z]{3}))?\s*·\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!m) return null;
  const a = WEEK.indexOf(m[1]), b = m[2] ? WEEK.indexOf(m[2]) : a;
  if (a < 0 || b < 0) return null;
  const days = new Set(); for (let i = a; ; i = (i + 1) % 7) { days.add(i); if (i === b) break; }
  const t = (h, mm, ap) => ((+h % 12) + (/pm/i.test(ap) ? 12 : 0)) * 60 + (+mm || 0);
  return { days, from: t(m[3], m[4], m[5]), to: t(m[6], m[7], m[8]), close: `${m[6]}${m[7] ? ":" + m[7] : ""} ${m[8].toUpperCase()}` };
}
function opdStatus() {
  const slots = [BIZ.hours.opd, BIZ.hours.sunday].map(parseHours);
  if (slots.some(s => !s)) return null;
  const now = new Date(), d = now.getDay(), min = now.getHours() * 60 + now.getMinutes();
  const today = slots.find(s => s.days.has(d) && min >= s.from && min < s.to);
  return today ? { open: true, text: `OPD open now · until ${today.close}` } : { open: false, text: "OPD closed now · emergency is open" };
}

const hero = () => `
<section class="page-hero ct-hero"><div class="page-hero-glow"></div><div class="container ct-hero-in">
  <div>
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Contact</span></nav>
    <h1 data-split data-instant>Here for you, <em>day</em> and night.</h1>
  </div>
  <p class="lead" data-reveal>Call, message or visit. Anything urgent goes to the emergency line, which is answered around the clock.</p>
</div>
<div class="container"><figure class="ct-find" data-reveal="scale">${pic("exterior", { sizes: "100vw", eager: true })}
  <figcaption><span class="ct-pin ct-pin--main"><b>Main entrance</b> OPD, reception &amp; pharmacy</span><span class="ct-pin ct-pin--er"><b>24/7 Emergency</b> separate entrance, ramp access</span></figcaption></figure></div>
</section>`;

const cards = () => {
  const st = opdStatus();
  return `
<section class="section section--tight ct-cards-sec" aria-label="Ways to reach us"><div class="container ct-bento">
  <a class="ct-em" href="${tel(BIZ.emergency)}" data-reveal>
    <span class="ct-em-glow" aria-hidden="true"></span>
    <span class="ct-em-top"><span class="label"><span class="dot" aria-hidden="true"></span>Emergency &amp; ambulance · 24/7</span><span class="ct-em-ic" aria-hidden="true">${icon("ambulance")}</span></span>
    <span class="ct-em-num">${esc(BIZ.emergency)}</span>
    <span class="ct-em-cta">Tap to call now ${icon("arrowUpRight")}</span>
  </a>
  <a class="tile is-link ct-card" href="${tel(BIZ.phone)}" data-reveal>
    <span class="ic-badge">${icon("phone")}</span>
    <span class="label">Reception &amp; appointments</span>
    <b>${esc(BIZ.phone)}</b><span class="corner" aria-hidden="true">${icon("arrowUpRight")}</span>
  </a>
  <a class="tile is-link ct-card" href="${wa("Hi, I have a question for " + BIZ.name + ".")}" target="_blank" rel="noopener" data-reveal>
    <span class="ic-badge">${icon("chat")}</span>
    <span class="label">WhatsApp</span>
    <b>Message our care team</b><span class="corner" aria-hidden="true">${icon("arrowUpRight")}</span>
  </a>
  <a class="tile is-link ct-card" href="mailto:${BIZ.email}" data-reveal>
    <span class="ic-badge">${icon("mail")}</span>
    <span class="label">Email</span>
    <b>${esc(BIZ.email)}</b><span class="corner" aria-hidden="true">${icon("arrowUpRight")}</span>
  </a>
  <div class="tile ct-hours" data-reveal>
    <div class="ct-hours-h"><span class="label">Hours</span>${st ? `<span class="ct-status ${st.open ? "is-open" : ""}"><i aria-hidden="true"></i>${st.text}</span>` : ""}</div>
    <dl>
      <div><dt>Emergency &amp; ICU</dt><dd>24 hours, every day</dd></div>
      <div><dt>OPD</dt><dd>${esc(BIZ.hours.opd)}<br>${esc(BIZ.hours.sunday)}</dd></div>
      <div><dt>Visiting</dt><dd>${esc(BIZ.hours.visiting)}</dd></div>
      <div><dt>Pharmacy</dt><dd>${esc(BIZ.hours.pharmacy)}</dd></div>
      <div><dt>Laboratory</dt><dd>${esc(BIZ.hours.lab)}</dd></div>
    </dl>
  </div>
</div></section>`;
};

const map = () => `
<section class="section section--alt" aria-labelledby="ct-map-h"><div class="container ct-map">
  <div class="ct-map-frame" data-reveal="fade">
    <iframe src="${mapSrc}" title="Map showing the location of ${esc(BIZ.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
  </div>
  <div class="ct-map-info">
    <div class="sec-index label"><span class="num">(01)</span><span>Visit us</span></div>
    <h2 id="ct-map-h" data-split>Finding <em>your</em> way here.</h2>
    <address class="ct-addr">${icon("pin")}<span>${esc(BIZ.address)}</span></address>
    <ul class="ct-tips">
      <li>${icon("car")}<span>On-site parking for patients and visitors, with drop-off at the emergency entrance.</span></li>
      <li>${icon("ambulance")}<span>Ambulances use the emergency entrance, open 24/7.</span></li>
    </ul>
    <div class="btn-row">${btn(dirHref, "Get directions", "accent", { ic: "pin", attrs: 'target="_blank" rel="noopener"' })}${btn(openHref, "Open in Google Maps", "line", { attrs: 'target="_blank" rel="noopener"' })}</div>
  </div>
</div></section>`;

const enquiry = () => `
<section class="section" aria-labelledby="ct-form-h"><div class="container ct-form-wrap">
  <div class="ct-form-intro">
    <div class="sec-index label"><span class="num">(02)</span><span>Write to us</span></div>
    <h2 id="ct-form-h" data-split>Ask us <em>anything.</em></h2>
    <p class="lead" data-reveal>Questions about a treatment, a bill or a report. Your message opens in WhatsApp or email, ready to send to our team.</p>
    <p class="ct-warn" data-reveal>${icon("alert")}<span>Please don't use this form for emergencies. Call <a href="${tel(BIZ.emergency)}">${esc(BIZ.emergency)}</a>.</span></p>
  </div>
  <form class="tile ct-form" data-wa="Website enquiry" data-reveal>
    <div class="form-grid">
      <div class="field"><label for="ct-name">Your name <span class="req">*</span></label><input class="input" id="ct-name" name="name" data-label="Name" autocomplete="name" required minlength="2"></div>
      <div class="field"><label for="ct-mobile">Mobile <span class="req">*</span></label><input class="input" id="ct-mobile" name="mobile" data-label="Mobile" type="tel" inputmode="tel" autocomplete="tel" required pattern="[+]?[0-9\\s\\-]{10,16}" placeholder="10-digit mobile"></div>
      <div class="field"><label for="ct-email">Email <span class="muted">(optional)</span></label><input class="input" id="ct-email" name="email" data-label="Email" type="email" autocomplete="email"></div>
      <div class="field"><label for="ct-topic">Topic</label>
        <select class="select" id="ct-topic" name="topic" data-label="Topic">
          ${["General enquiry", "Appointments", "Health check-ups", "Insurance & billing", "Reports & records", "Feedback"].map(t => `<option>${t}</option>`).join("")}
        </select></div>
      <div class="field full"><label for="ct-dept">Speciality <span class="muted">(optional)</span></label>
        <select class="select" id="ct-dept" name="dept" data-label="Speciality"><option value="">Not specific</option>${DEPARTMENTS.map(d => `<option>${esc(d.name)}</option>`).join("")}</select></div>
      <div class="field full"><label for="ct-msg">Message <span class="req">*</span></label><textarea class="textarea" id="ct-msg" name="message" data-label="Message" rows="5" required minlength="5"></textarea></div>
      <div class="field full">${consentCheckbox("reply to my enquiry")}</div>
    </div>
    <div class="send-row">
      <button class="btn btn--accent" type="submit"><span>Send on WhatsApp</span><span class="btn-ic">${icon("chat")}</span></button>
      <button class="btn btn--line" type="button" data-send="email"><span>Send by email</span><span class="btn-ic">${icon("mail")}</span></button>
    </div>
    <p class="form-note">Nothing is stored on this website. Your message opens in your own app, addressed to ${esc(BIZ.name)}.</p>
    <div class="form-done" hidden role="status">
      <span class="done-ic">${icon("check")}</span>
      <div><b>Message ready to send.</b><p>Send it from WhatsApp or your email app and our team will reply during working hours.</p></div>
    </div>
  </form>
</div></section>`;

boot(() => {
  $("main").innerHTML = hero() + cards() + map() + enquiry();
});
