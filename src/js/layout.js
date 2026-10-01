/* Header, mobile menu, display (theme) panel, season bar, footer, floating actions. */
import { BIZ, NAV, DEPARTMENTS, SEASONS } from "../data/site.js";
import { $, $$, esc, tel, wa, btn, icon } from "./render.js";
import { ACCENTS, A11Y, getState, setTheme, toggleA11y, activeSeason, onThemeChange } from "./theme.js";

/* Lumi mark: stepped red cross with a four-point star (redrawn from the hospital's signage) */
export const logoMark = `<span class="logo-mark"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <path d="M14 3h12v11h11v12H26v11H14V26H3V14h11z" fill="#fff" stroke="var(--brand-red)" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M16.6 6.2h6.8v10.4h10.4v6.8H23.4v10.4h-6.8V23.4H6.2v-6.8h10.4z" fill="var(--brand-red)"/>
  <path class="star" d="M20 12.5c.7 4.6 2.9 6.8 7.5 7.5-4.6.7-6.8 2.9-7.5 7.5-.7-4.6-2.9-6.8-7.5-7.5 4.6-.7 6.8-2.9 7.5-7.5z" fill="#fff"/></svg></span>`;
const logo = `<a class="logo" href="/" aria-label="${esc(BIZ.name)}, home">${logoMark}<span class="logo-word">Lum<span class="i">ı</span><small>Hospital</small></span></a>`;

const current = () => {
  const p = location.pathname.replace(/\/$/, "/index.html");
  const map = { "/department.html": "/departments.html", "/doctor.html": "/doctors.html", "/post.html": "/blog.html" };
  if (p.startsWith("/specialities/")) return "/departments.html";
  if (p.startsWith("/doctors/")) return "/doctors.html";
  if (p.startsWith("/journal/")) return "/blog.html";
  return map[p] || p;
};

function seasonBar() {
  const s = activeSeason(), st = getState();
  if (!s || st.seasonDismissed === s.id) return "";
  return `<div class="season-bar" role="region" aria-label="${esc(s.name)}"><div class="container">
    ${icon("sparkle")}<span>${s.banner} <a href="${s.link}">Learn more</a></span>
    <button type="button" aria-label="Dismiss announcement" data-dismiss-season="${s.id}">${icon("close")}</button></div></div>`;
}

function header() {
  const cur = current();
  return `${seasonBar()}
  <header class="site-header" id="site-header">
    <div class="container header-in">
      ${logo}
      <nav class="nav" aria-label="Main">${NAV.map(n => `<a class="nav-link" href="${n.href}" ${n.href === cur ? 'aria-current="page"' : ""}>${n.label}</a>`).join("")}</nav>
      <div class="header-actions">
        <button class="icon-btn" type="button" id="dpanel-btn" aria-label="Display settings: theme, colours and accessibility" aria-expanded="false" aria-controls="dpanel">${icon("palette")}</button>
        <a class="icon-btn icon-btn--em" href="${tel(BIZ.emergency)}" aria-label="Call 24/7 emergency" data-em>${icon("phone")}</a>
        ${btn("/appointment.html", "Book appointment", "accent", { sm: true, ic: "calendar" })}
        <button class="icon-btn menu-btn" type="button" id="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="mnav">${icon("menu")}</button>
      </div>
    </div>
  </header>
  <div class="mnav" id="mnav" aria-hidden="true">
    <button class="icon-btn mnav-close" type="button" id="menu-close" aria-label="Close menu">${icon("close")}</button>
    <ol>${[{ href: "/", label: "Home" }, ...NAV].map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join("")}</ol>
    <div class="mnav-foot">
      ${btn("/appointment.html", "Book appointment", "accent", { ic: "calendar" })}
      <a class="btn btn--danger" href="${tel(BIZ.emergency)}"><span>Emergency · ${esc(BIZ.emergency)}</span><span class="btn-ic">${icon("phone")}</span></a>
    </div>
  </div>
  ${panel()}`;
}

function swatches() {
  const season = activeSeason();
  const sw = [...(season ? [{ id: "season", name: season.name, l: season.accent }] : []), ...ACCENTS];
  return sw.map(a => `<button type="button" class="swatch" style="--sw:${a.l}" data-accent-set="${a.id}" aria-label="${esc(a.name)}" title="${esc(a.name)}"></button>`).join("");
}

function panel() {
  const s = getState();
  const modes = [["light", "Light", "sun"], ["dark", "Dark", "moon"], ["auto", "Auto", "monitor"]];
  return `<div class="dpanel" id="dpanel" role="dialog" aria-label="Display settings" aria-modal="false">
    <div class="dpanel-head"><h3>Display</h3><button class="icon-btn" type="button" data-close-panel aria-label="Close">${icon("close")}</button></div>
    <div class="dgroup"><span class="label">Appearance</span>
      <div class="seg" role="group" aria-label="Colour mode">${modes.map(([id, n, ic]) => `<button type="button" data-mode-set="${id}" aria-pressed="${s.mode === id}">${icon(ic)}${n}</button>`).join("")}</div></div>
    <div class="dgroup"><span class="label">Colour theme</span>
      <div class="swatches" id="swatches" role="group" aria-label="Colour theme">${swatches()}</div>
      <div class="swatch-name" id="swatch-name"></div></div>
    <div class="dgroup"><span class="label">Seasonal theme</span>
      <select class="select season-select" id="season-select" aria-label="Seasonal theme">
        <option value="auto">Automatic (by date)</option><option value="off">Off</option>
        ${SEASONS.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join("")}
      </select></div>
    <div class="dgroup"><span class="label">Accessibility</span>
      ${A11Y.map(a => `<label class="toggle-row"><span>${a.name}<small>${a.hint}</small></span><input class="switch" type="checkbox" data-a11y-set="${a.id}" ${s.a11y.includes(a.id) ? "checked" : ""}></label>`).join("")}
    </div>
  </div>`;
}

function syncPanel() {
  const s = getState(), html = document.documentElement;
  const box = $("#swatches"); if (box) box.innerHTML = swatches();
  $$("[data-mode-set]").forEach(b => b.setAttribute("aria-pressed", b.dataset.modeSet === s.mode));
  $$("[data-accent-set]").forEach(b => b.setAttribute("aria-pressed", b.dataset.accentSet === html.dataset.accent));
  const on = $(`[data-accent-set="${html.dataset.accent}"]`);
  const nm = $("#swatch-name"); if (nm) nm.textContent = on ? on.title : "";
  const sel = $("#season-select"); if (sel) sel.value = s.season;
  $$("[data-a11y-set]").forEach(c => { c.checked = s.a11y.includes(c.dataset.a11ySet); });
}

function footer() {
  const soc = Object.entries(BIZ.social).filter(([, v]) => v);
  return `
  <section class="ecg-band" aria-label="Emergency">
    <svg class="ecg-svg" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true"><path id="ecg-path" d="M0 110 H300 l20 -10 20 10 H420 l14 0 10 -70 16 140 12 -90 10 20 H640 l20 -12 22 12 H900 l14 0 10 -70 16 140 12 -90 10 20 H1200"/></svg>
    <div class="container">
      <div><span class="label" style="color:#fff;opacity:.8">24 / 7 · 365</span><h3>Emergency? We're already up.</h3><p>Emergency room, ICU, ambulance and pharmacy, open day and night.</p></div>
      <a class="tel" href="${tel(BIZ.emergency)}"><span class="ring">${icon("phone")}</span>${esc(BIZ.emergency)}</a>
    </div>
  </section>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-cta">
          <h3>Care that <em>shows up</em> for you.</h3>
          ${btn("/appointment.html", "Book appointment", "accent")}
          ${soc.length ? `<div class="socials">${soc.map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener" aria-label="${k}">${icon(k)}</a>`).join("")}</div>` : ""}
        </div>
        <div><h4>Hospital</h4><ul>${NAV.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join("")}<li><a href="/emergency.html">Emergency</a></li></ul></div>
        <div><h4>Specialities</h4><ul>${DEPARTMENTS.slice(0, 7).map(d => `<li><a href="/specialities/${d.id}.html">${d.name}</a></li>`).join("")}</ul></div>
        <div><h4>Visit</h4><ul class="f-contact">
          <li>${icon("pin")}<span>${esc(BIZ.address)}</span></li>
          <li>${icon("phone")}<a href="${tel(BIZ.phone)}">${esc(BIZ.phone)}</a></li>
          <li>${icon("mail")}<a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></li>
          <li>${icon("clock")}<span>${esc(BIZ.hours.opd)}<br>${esc(BIZ.hours.sunday)}</span></li></ul></div>
      </div>
      <div class="footer-word" aria-hidden="true">${[...BIZ.short].map(c => `<span>${c}</span>`).join("")}</div>
    </div>
    <div class="footer-bottom container"><span>© ${new Date().getFullYear()} ${esc(BIZ.name)}</span>
      <nav class="legal-nav" aria-label="Legal"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/disclaimer.html">Disclaimer</a><a href="/patient-rights.html">Patient rights</a><a href="/grievance.html">Grievance</a><button type="button" class="consent-open" data-consent-open>Privacy choices</button></nav></div>
  </footer>
  <nav class="mbar" aria-label="Quick actions">
    <a href="${tel(BIZ.emergency)}" class="mbar-em">${icon("phone")}<span>Emergency</span></a>
    <a href="${wa("Hello " + BIZ.name + ", I'd like some help.")}" target="_blank" rel="noopener">${icon("chat")}<span>WhatsApp</span></a>
    <a href="/doctors.html">${icon("search")}<span>Doctors</span></a>
    <a href="/appointment.html" class="mbar-book">${icon("calendar")}<span>Book</span></a>
  </nav>
  <div class="fab">
    <a class="fab-wa" href="${wa("Hello " + BIZ.name + ", I'd like some help.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon("chat")}</a>
    <a class="fab-em" href="${tel(BIZ.emergency)}" aria-label="Call emergency">${icon("phone")}</a>
  </div>`;
}

export function renderLayout() {
  $("#header").outerHTML = "<!--lumi:header-->" + header() + "<!--/lumi:header-->";
  $("#footer").outerHTML = "<!--lumi:footer-->" + footer() + "<!--/lumi:footer-->";
  const bar = $(".season-bar");
  document.documentElement.style.setProperty("--season-h", (bar ? bar.offsetHeight : 0) + "px");
  const main = $("main");
  const head = $("#site-header");
  if (main?.dataset.header === "dark") head.classList.add("on-dark");

  // Mobile menu
  const mnav = $("#mnav"), mbtn = $("#menu-btn");
  const setMenu = open => {
    mnav.classList.toggle("is-open", open);
    mnav.setAttribute("aria-hidden", !open);
    mbtn.setAttribute("aria-expanded", open);
    document.documentElement.classList.toggle("menu-open", open);
    window.__lenis?.[open ? "stop" : "start"]();
    if (open) $("#menu-close").focus();
  };
  mbtn.addEventListener("click", () => setMenu(true));
  $("#menu-close").addEventListener("click", () => { setMenu(false); mbtn.focus(); });

  // Display panel
  const dp = $("#dpanel"), dbtn = $("#dpanel-btn");
  const setPanel = open => { dp.classList.toggle("is-open", open); dbtn.setAttribute("aria-expanded", open); };
  dbtn.addEventListener("click", e => { e.stopPropagation(); setPanel(!dp.classList.contains("is-open")); });
  document.addEventListener("click", e => { if (!dp.contains(e.target)) setPanel(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { setPanel(false); if (mnav.classList.contains("is-open")) setMenu(false); } });
  dp.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.modeSet) setTheme({ mode: t.dataset.modeSet }, t);
    if (t.dataset.accentSet) setTheme({ accent: t.dataset.accentSet });
    if ("closePanel" in t.dataset) setPanel(false);
  });
  dp.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.a11ySet) toggleA11y(t.dataset.a11ySet, t.checked);
    if (t.id === "season-select") {
      setTheme({ season: t.value, accent: getState().accent === "season" && t.value === "off" ? "auto" : getState().accent, seasonDismissed: "" });
      $(".season-bar")?.remove();
      head.insertAdjacentHTML("beforebegin", seasonBar());
      document.documentElement.style.setProperty("--season-h", ($(".season-bar")?.offsetHeight || 0) + "px");
    }
  });
  onThemeChange(syncPanel);
  syncPanel();

  // Season bar dismiss
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-dismiss-season]"); if (!b) return;
    setTheme({ seasonDismissed: b.dataset.dismissSeason });
    b.closest(".season-bar").remove();
    document.documentElement.style.setProperty("--season-h", "0px");
  });

  // Header: stuck + hide on scroll down
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    head.classList.toggle("is-stuck", y > 8);
    head.classList.toggle("is-hidden", y > 400 && y > last && !dp.classList.contains("is-open"));
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
