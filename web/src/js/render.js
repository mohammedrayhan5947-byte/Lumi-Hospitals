/* Shared helpers + card templates. All markup comes from data in src/data/site.js. */
import { BIZ, DEPARTMENTS, DOCTORS } from "../data/site.js";
import { icon } from "./icons.js";

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const inr = n => "₹" + Number(n).toLocaleString("en-IN");
export const tel = n => "tel:" + String(n).replace(/[^\d+]/g, "");
export const wa = (text = "") => `https://wa.me/${BIZ.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
export const params = new URLSearchParams(location.search);
export const deptById = id => DEPARTMENTS.find(d => d.id === id);
export const doctorById = id => DOCTORS.find(d => d.id === id);
export const doctorsIn = deptId => DOCTORS.filter(d => d.dept === deptId);
export const initials = n => n.replace(/^Dr\.?\s*/, "").split(/\s+/).map(w => w[0]).slice(0, 2).join("");
export const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const pad = n => String(n).padStart(2, "0");
export { icon };

/** Button with the looping arrow. variant: "" | "accent" | "line" | "glass" | "danger" */
export const btn = (href, label, variant = "", { ic = "arrowUpRight", sm = false, attrs = "" } = {}) =>
  `<a class="btn ${variant ? "btn--" + variant : ""} ${sm ? "btn--sm" : ""}" href="${href}" data-magnetic ${attrs}><span>${label}</span>${ic ? `<span class="btn-ic">${icon(ic)}</span>` : ""}</a>`;

/** Media: real image if set, otherwise branded placeholder (initials or icon). */
export const media = (src, alt, fallback) => src
  ? `<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async">`
  : `<div class="ph-mono" role="img" aria-label="${esc(alt)}">${fallback}</div>`;

export const deptCard = (d, i = 0) => `
  <a class="tile dept-card ${d.img ? "has-photo" : ""}" href="/specialities/${d.id}.html" data-reveal>
    ${d.img ? `<img class="dept-bg" src="${d.img.replace(".webp", "-sm.webp")}" alt="" loading="lazy" decoding="async" width="720" height="960">` : ""}
    <span class="label num dept-no">${pad(i + 1)}</span>
    <div class="dept-text"><h3>${d.name}</h3><p>${d.summary}</p><span class="dept-more">Explore</span></div>
  </a>`;

export const doctorCard = d => {
  const dep = deptById(d.dept);
  return `<article class="tile doc-card" data-reveal data-id="${d.id}" data-dept="${d.dept}">
    <a class="doc-media ph" href="/doctors/${d.id}.html" aria-label="${esc(d.name)} profile">
      ${media(d.photo, d.name, `<span class="initials">${initials(d.name)}</span>`)}
      <span class="tag">${dep ? dep.name : ""}</span>
    </a>
    <div class="doc-body">
      <h3><a href="/doctors/${d.id}.html">${d.name}</a></h3>
      <p class="doc-role">${d.role}</p>
      <div class="doc-meta"><span>${icon("award")}${d.exp}+ yrs</span><span>${icon("calendar")}${d.days.length === 6 ? "Mon–Sat" : d.days.join(", ")}</span></div>
      <div class="doc-actions">${btn(`/appointment.html?dept=${d.dept}&doctor=${d.id}`, "Book", "accent", { sm: true, ic: "" })}${btn(`/doctors/${d.id}.html`, "Profile", "line", { sm: true, ic: "" })}</div>
    </div>
  </article>`;
};

export const packageCard = p => `
  <article class="tile pkg ${p.featured ? "is-featured" : ""}" id="${p.id}" data-reveal>
    <div class="pkg-top"><div><span class="label">${p.tests} tests</span><h3>${p.name}</h3></div>${p.featured ? '<span class="tag">Most chosen</span>' : ""}</div>
    <p class="muted" style="margin:0">${p.for}</p>
    <div class="pkg-price"><b>${inr(p.price)}</b><s>${inr(p.mrp)}</s><span class="save">Save ${Math.round((1 - p.price / p.mrp) * 100)}%</span></div>
    <ul class="ticks">${p.includes.map(i => `<li>${icon("check")}${i}</li>`).join("")}</ul>
    ${btn(`/appointment.html?package=${p.id}`, "Book this check", p.featured ? "accent" : "line")}
  </article>`;

export const postCard = p => {
  const dep = deptById(p.dept);
  return `<a class="tile post-card is-link" href="/journal/${p.id}.html" data-reveal>
    <div class="post-media ph">${media(p.img, p.title, icon(dep ? dep.icon : "heart"))}</div>
    <div class="post-body">
      <span class="tag" style="align-self:flex-start">${dep ? dep.name : "Health"}</span>
      <h3>${p.title}</h3><p>${p.excerpt}</p>
      <div class="post-meta label"><span>${fmtDate(p.date)}</span><span>${p.read} min read</span></div>
    </div></a>`;
};

/** Section heading block used across pages. */
export const secHead = (index, label, title, aside = "") => `
  <div class="sec-head">
    <div><div class="sec-index label"><span class="num">(${index})</span><span>${label}</span></div><h2 data-split>${title}</h2></div>
    ${aside ? `<div>${aside}</div>` : ""}
  </div>`;

/** Inner-page hero. */
export const pageHero = (crumb, title, lead, extra = "") => `
  <section class="page-hero"><div class="page-hero-glow"></div><div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${crumb}</span></nav>
    <h1 data-split>${title}</h1>
    ${lead ? `<p class="lead" data-reveal>${lead}</p>` : ""}
    ${extra}
  </div></section>`;

/** Accessible accordion (FAQ etc). */
export const accordion = items => `<div class="acc">${items.map((it, i) => `
  <div class="acc-item" data-reveal>
    <button class="acc-btn" aria-expanded="false" aria-controls="acc-${i}" id="accb-${i}">${it.q}<span class="pm">${icon("plus")}</span></button>
    <div class="acc-panel" id="acc-${i}" role="region" aria-labelledby="accb-${i}"><div><p>${it.a}</p></div></div>
  </div>`).join("")}</div>`;

export function bindAccordions(root = document) {
  $$(".acc-btn", root).forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    b.closest(".acc-item").classList.toggle("is-open", open);
  }));
}
