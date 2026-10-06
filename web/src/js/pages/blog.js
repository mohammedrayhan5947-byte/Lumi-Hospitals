import { boot } from "../core.js";
import "../../css/pages/blog.css";
import { POSTS } from "../../data/site.js";
import { $, $$, esc, icon, media, params, deptById, fmtDate, postCard, pageHero } from "../render.js";
import { gsap, refreshMotion } from "../motion.js";
import { motionAllowed } from "../theme.js";

const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
const depts = [...new Set(posts.map(p => p.dept))].map(deptById).filter(Boolean);
let active = depts.some(d => d.id === params.get("dept")) ? params.get("dept") : "all";

const featured = p => {
  const dep = deptById(p.dept);
  return `<a class="bl-feature" href="/journal/${p.id}.html" data-reveal>
    <div class="bl-feature-media ph">${media(p.img, p.title, icon(dep ? dep.icon : "heart"))}<span class="bl-flag label">Latest</span></div>
    <div class="bl-feature-body">
      <div class="bl-meta"><span class="tag">${dep ? dep.name : "Health"}</span><span class="label">${fmtDate(p.date)} · ${p.read} min read</span></div>
      <h2>${esc(p.title)}</h2>
      <p>${esc(p.excerpt)}</p>
      <span class="bl-read">Read the article<span class="bl-read-ic">${icon("arrow")}</span></span>
    </div>
  </a>`;
};

const filters = () => `
<div class="bl-filters" role="group" aria-label="Filter articles by speciality">
  <button class="chip" type="button" data-f="all" aria-pressed="${active === "all"}">All <span class="num">${posts.length}</span></button>
  ${depts.map(d => `<button class="chip" type="button" data-f="${d.id}" aria-pressed="${active === d.id}">${d.name} <span class="num">${posts.filter(p => p.dept === d.id).length}</span></button>`).join("")}
</div>`;

function renderList() {
  const list = posts.filter(p => active === "all" || p.dept === active);
  const [first, ...rest] = list;
  const out = $("#bl-list");
  out.innerHTML = `${first ? featured(first) : ""}
    ${rest.length ? `<div class="bl-grid-head"><span class="label">${active === "all" ? "More from the journal" : "More in " + esc(deptById(active).name)}</span><span class="label num">${String(rest.length).padStart(2, "0")}</span></div>
    <div class="grid g3 bl-grid">${rest.map(postCard).join("")}</div>` : ""}`;
  $("#bl-status").textContent = `${list.length} article${list.length === 1 ? "" : "s"}${active === "all" ? "" : " in " + deptById(active).name}`;
  return out;
}

function bindFilters() {
  $$(".bl-filters .chip").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.f === active) return;
    active = b.dataset.f;
    $$(".bl-filters .chip").forEach(c => c.setAttribute("aria-pressed", c === b));
    const url = new URL(location.href);
    active === "all" ? url.searchParams.delete("dept") : url.searchParams.set("dept", active);
    history.replaceState(null, "", url);
    const out = $("#bl-list");
    if (!motionAllowed()) { renderList(); return; }
    gsap.to(out, { opacity: 0, y: 12, duration: .25, ease: "power2.in", onComplete: () => {
      renderList();
      gsap.fromTo(out, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .7, ease: "expo.out", clearProps: "transform" });
      refreshMotion(out);
    } });
  }));
}

boot(() => {
  $("main").innerHTML = pageHero("Journal", "Straight answers from <em>our</em> doctors.",
    "Clear, practical health writing from the specialists who see these questions every day. No scare stories, no jargon.")
    + `<section class="bl-body"><div class="container">
        <div class="bl-bar">${filters()}<p class="label bl-status" id="bl-status" aria-live="polite"></p></div>
        <div id="bl-list"></div>
        <p class="bl-disclaimer">${icon("info")}<span>Articles are general information, not a diagnosis. If you're worried about symptoms, <a class="link" href="/appointment.html">book a consultation</a> or, in an emergency, <a class="link" href="/emergency.html">get help now</a>.</span></p>
      </div></section>`;
  renderList();
  bindFilters();
});
