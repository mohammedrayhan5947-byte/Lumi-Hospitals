/* Privacy choices + DPDP consent helpers.
     initConsent()            → small, non-blocking notice/choices banner (call once per page, after layout)
     openConsent()            → reopen it (also: any element with [data-consent-open])
     hasConsent("analytics")  → gate any future optional script on this
     consentCheckbox(purpose) → required, unticked consent box for forms that collect health data
     PCPNDT_NOTICE            → mandatory PC-PNDT notice text (English); PCPNDT_NOTICE_KN (Kannada, verify)
   Choice is stored in localStorage "lumi-consent" and fires a "lumi:consent" event on window. */
import "../css/consent.css";
import { LEGAL_VERSION } from "../data/legal.js";
import { BIZ } from "../data/site.js";
import { $, esc, icon } from "./render.js";

export const CONSENT_KEY = "lumi-consent";

/* Storage purposes. Only "necessary" is used today. When analytics is added, set active: true,
   list its cookies in PRIVACY > storage (src/data/legal.js), bump LEGAL_VERSION, and load the
   script only when hasConsent("analytics") is true (listen for "lumi:consent" to start it later). */
export const PURPOSES = [
  { id: "necessary", name: "Strictly necessary", desc: "Remembers your display, accessibility and privacy settings on this device. Nothing is sent to us.", required: true, active: true },
  { id: "analytics", name: "Analytics", desc: "Anonymous statistics about which pages are used, so we can improve the site.", active: false }
];
const optional = () => PURPOSES.filter(p => p.active && !p.required);

export function getConsent() {
  try { const c = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null"); return c && c.v === LEGAL_VERSION ? c : null; }
  catch { return null; }
}
export const hasConsent = id => {
  const p = PURPOSES.find(x => x.id === id);
  if (!p || !p.active) return false;
  if (p.required) return true;
  return !!getConsent()?.choices?.[id];
};

function save(choices) {
  const rec = { v: LEGAL_VERSION, ts: new Date().toISOString(), choices: { necessary: true, ...choices } };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(rec)); } catch { /* private mode: banner simply shows again */ }
  window.dispatchEvent(new CustomEvent("lumi:consent", { detail: rec }));
  return rec;
}

let root, returnFocus;

function markup() {
  const opt = optional(), cur = getConsent()?.choices || {};
  const rows = PURPOSES.filter(p => p.active).map(p => `
    <label class="cb-row">
      <span><b>${esc(p.name)}</b><small>${esc(p.desc)}</small></span>
      <input class="switch" type="checkbox" data-purpose="${p.id}" ${p.required || cur[p.id] ? "checked" : ""} ${p.required ? 'disabled aria-describedby="cb-req"' : ""}>
    </label>`).join("");
  const text = opt.length
    ? `We keep your display settings on this device. With your permission we'd also like to use ${opt.map(p => p.name.toLowerCase()).join(" and ")}. Saying no changes nothing about the site.`
    : `This site doesn't use tracking or advertising cookies. It only keeps your display settings on this device.`;
  return `
  <section class="cb" id="cb" role="region" aria-labelledby="cb-title" tabindex="-1">
    <div class="cb-head">
      <span class="cb-ic">${icon("shield")}</span>
      <h2 class="cb-title" id="cb-title">Your privacy</h2>
      <button type="button" class="cb-x" data-cb="close" aria-label="Close privacy choices">${icon("close")}</button>
    </div>
    <p class="cb-text">${text} <a href="/privacy.html#storage">How we use storage</a></p>
    <div class="cb-choices" id="cb-choices" hidden>
      ${rows}
      <p class="cb-req" id="cb-req">Strictly necessary storage is always on: the site can't remember your settings without it.</p>
    </div>
    <div class="cb-actions">
      ${opt.length
        ? `<button type="button" class="cb-btn" data-cb="reject">Necessary only</button><button type="button" class="cb-btn" data-cb="accept">Accept all</button>`
        : `<button type="button" class="cb-btn cb-btn--solid" data-cb="ok">OK</button>`}
      <button type="button" class="cb-btn cb-btn--ghost" data-cb="toggle" aria-expanded="false" aria-controls="cb-choices">Choices</button>
    </div>
  </section>`;
}

function close() {
  if (!root) return;
  const el = root; root = null;
  el.classList.remove("is-in");
  document.documentElement.style.removeProperty("--cb-h");
  const done = () => el.remove();
  document.documentElement.classList.contains("js-motion") ? setTimeout(done, 450) : done();
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus();
  returnFocus = null;
}

function readChoices() {
  const c = {};
  root.querySelectorAll("[data-purpose]").forEach(i => { c[i.dataset.purpose] = i.checked; });
  return c;
}

function show(focus = false) {
  if (root) { if (focus) root.focus(); return; }
  document.body.insertAdjacentHTML("beforeend", markup());
  root = $("#cb");
  const setH = () => root && document.documentElement.style.setProperty("--cb-h", root.offsetHeight + "px");
  setH(); root.addEventListener("transitionend", setH); addEventListener("resize", setH, { passive: true });
  requestAnimationFrame(() => requestAnimationFrame(() => root?.classList.add("is-in")));
  if (focus) root.focus({ preventScroll: true });

  root.addEventListener("click", e => {
    const b = e.target.closest("[data-cb]"); if (!b) return;
    const act = b.dataset.cb, none = Object.fromEntries(optional().map(p => [p.id, false]));
    if (act === "toggle") {
      const box = $("#cb-choices", root), open = box.hidden;
      box.hidden = !open;
      b.setAttribute("aria-expanded", open);
      b.textContent = open ? "Save choices" : "Choices";
      document.documentElement.style.setProperty("--cb-h", root.offsetHeight + "px");
      if (!open) { save(readChoices()); close(); }
      return;
    }
    if (act === "accept") save(Object.fromEntries(optional().map(p => [p.id, true])));
    else if (act === "reject" || act === "close") save(none);   // closing = privacy-safe default
    else if (act === "ok") save(readChoices());
    close();
  });
  root.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.stopPropagation(); save(Object.fromEntries(optional().map(p => [p.id, false]))); close(); }
  });
}

/** Reopen the banner (e.g. from a footer "Privacy choices" link). */
export function openConsent(trigger) {
  returnFocus = trigger || document.activeElement;
  show(true);
}

let bound = false;
export function initConsent() {
  if (!bound) {
    bound = true;
    document.addEventListener("click", e => {
      const t = e.target.closest("[data-consent-open]"); if (!t) return;
      e.preventDefault(); openConsent(t);
    });
  }
  if (!getConsent()) show(false);   // never steals focus on first view
}

/* ---------- Form consent (DPDP s.6: free, specific, informed, unambiguous, affirmative) ---------- */
let n = 0;
/** Required, unticked checkbox. `purpose` completes "…only to <purpose>", e.g. "book and confirm my appointment".
    The ticked value is included in the WhatsApp/email message as a record of consent. */
export function consentCheckbox(purpose, { name = "consent", id = `consent-${++n}` } = {}) {
  const value = `Yes. I consent to ${BIZ.name} using these details, including health information, only to ${purpose} (privacy notice of ${LEGAL_VERSION})`;
  return `
  <div class="field full consent-field">
    <label class="consent-check" for="${id}">
      <input type="checkbox" id="${id}" name="${name}" value="${esc(value)}" data-label="Consent" required>
      <span>I consent to ${esc(BIZ.name)} using the details I've shared, including any health information, only to <b>${esc(purpose)}</b>. I have read the <a href="/privacy.html" target="_blank" rel="noopener">privacy notice</a> and can withdraw my consent at any time. <span class="req" aria-hidden="true">*</span></span>
    </label>
  </div>`;
}

/* ---------- PC-PNDT Act, 1994: s.22 and Rule 17(1) notice ---------- */
export const PCPNDT_NOTICE = `Disclosure of the sex of the foetus is prohibited under law. Sex determination and sex selection are not done at ${BIZ.name}. They are punishable offences under the Pre-Conception and Pre-Natal Diagnostic Techniques (Prohibition of Sex Selection) Act, 1994.`;
/* TODO: have the hospital verify this Kannada wording (Rule 17 requires English + the local language). */
export const PCPNDT_NOTICE_KN = "ಭ್ರೂಣದ ಲಿಂಗವನ್ನು ಬಹಿರಂಗಪಡಿಸುವುದು ಕಾನೂನಿನ ಪ್ರಕಾರ ನಿಷೇಧಿಸಲಾಗಿದೆ. ಇಲ್ಲಿ ಲಿಂಗ ಪತ್ತೆ ಅಥವಾ ಲಿಂಗ ಆಯ್ಕೆ ಮಾಡಲಾಗುವುದಿಲ್ಲ. ಇದು ಪಿಸಿ-ಪಿಎನ್‌ಡಿಟಿ ಕಾಯ್ದೆ, 1994ರ ಅಡಿಯಲ್ಲಿ ಶಿಕ್ಷಾರ್ಹ ಅಪರಾಧ.";
/** Ready-made block for pages that mention ultrasound / pregnancy scans. */
export const pcpndtNotice = () => `
  <aside class="pcpndt" role="note" aria-label="PC-PNDT Act notice">
    <span class="pcpndt-ic">${icon("alert")}</span>
    <p><b>${esc(PCPNDT_NOTICE)}</b><span lang="kn">${PCPNDT_NOTICE_KN}</span></p>
  </aside>`;
