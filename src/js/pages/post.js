import { boot } from "../core.js";
import "../../css/pages/post.css";
import { BIZ, POSTS } from "../../data/site.js";
import { $, esc, tel, icon, btn, media, params, deptById, doctorsIn, fmtDate, postCard, secHead } from "../render.js";

const pid = document.querySelector("main")?.dataset.id || params.get("id");
const post = POSTS.find(p => p.id === pid) || POSTS[0];
const dep = deptById(post.dept);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const heads = post.body.filter(l => l.startsWith("## ")).map(l => l.slice(3));

const body = () => post.body.map((line, i) => line.startsWith("## ")
  ? `<h2 id="${slug(line.slice(3))}">${esc(line.slice(3))}</h2>`
  : `<p${i === 0 ? ' class="ps-lede"' : ""}>${esc(line)}</p>`).join("");

const hero = () => `
<header class="ps-hero" data-instant>
  <div class="page-hero-glow"></div>
  <div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog.html">Journal</a><span>/</span><span>${dep ? esc(dep.name) : "Article"}</span></nav>
    <div class="ps-meta">
      ${dep ? `<a class="tag" href="/blog.html?dept=${dep.id}">${esc(dep.name)}</a>` : ""}
      <span class="label"><time datetime="${post.date}">${fmtDate(post.date)}</time></span>
      <span class="label">${post.read} min read</span>
    </div>
    <h1 data-split>${esc(post.title)}</h1>
    <p class="lead" data-reveal>${esc(post.excerpt)}</p>
  </div>
  <div class="container"><div class="ps-media ph" data-reveal="scale">
    <div class="inner" data-parallax="0.06">${media(post.img, post.title, icon(dep ? dep.icon : "heart"))}</div>
  </div></div>
</header>`;

const share = () => {
  const text = `${post.title} | ${BIZ.name}`;
  return `<div class="ps-share">
    <span class="label">Share</span>
    <div class="ps-share-btns">
      <a class="ps-sh" href="https://wa.me/?text=${encodeURIComponent(text + " " + location.href)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${icon("chat")}<span>WhatsApp</span></a>
      <button class="ps-sh" type="button" id="ps-copy" aria-label="Copy link to this article">${icon("globe")}<span>Copy link</span></button>
    </div>
    <span class="ps-copied label" id="ps-copied" role="status" aria-live="polite"></span>
  </div>`;
};

const article = () => `
<section class="ps-article"><div class="container ps-grid">
  <aside class="ps-rail" aria-label="Article tools">
    ${heads.length ? `<nav class="ps-toc" aria-label="In this article"><span class="label">In this article</span><ol>${heads.map(h => `<li><a href="#${slug(h)}">${esc(h)}</a></li>`).join("")}</ol></nav>` : ""}
    ${share()}
  </aside>
  <article class="ps-body">
    ${body()}
    <p class="ps-note">${icon("info")}<span>This article is general information from ${esc(BIZ.name)} and isn't a substitute for a consultation. If symptoms are severe or sudden, call <a href="${tel(BIZ.emergency)}">${esc(BIZ.emergency)}</a>.</span></p>
  </article>
</div></section>`;

const cta = () => {
  if (!dep) return "";
  const docs = doctorsIn(dep.id);
  return `<section class="section--tight"><div class="container">
    <div class="ps-cta">
      <div class="ps-cta-glow"></div>
      <div>
        <span class="label">${esc(dep.name)} at ${esc(BIZ.short)}</span>
        <h2 data-split>Questions about this? Talk to <em>a specialist.</em></h2>
        <p>${esc(dep.summary)}</p>
        <div class="btn-row">${btn(`/appointment.html?dept=${dep.id}`, `Book ${esc(dep.name)}`, "accent", { ic: "calendar" })}${btn(`/specialities/${dep.id}.html`, "About the department", "glass")}</div>
      </div>
      ${docs.length ? `<ul class="ps-docs" aria-label="${esc(dep.name)} specialists">${docs.map(d => `<li><a href="/doctors/${d.id}.html"><b>${esc(d.name)}</b><span>${esc(d.role)}</span>${icon("arrowUpRight")}</a></li>`).join("")}</ul>` : ""}
    </div>
  </div></section>`;
};

const related = () => {
  const others = POSTS.filter(p => p.id !== post.id);
  const list = [...others.filter(p => p.dept === post.dept), ...others.filter(p => p.dept !== post.dept).sort((a, b) => b.date.localeCompare(a.date))].slice(0, 3);
  if (!list.length) return "";
  return `<section class="section section--alt"><div class="container">
    ${secHead("+", "Keep reading", `More from the <em>journal.</em>`, btn("/blog.html", "All articles", "line"))}
    <div class="grid g3">${list.map(postCard).join("")}</div>
  </div></section>`;
};

/* Reading progress: scaleX of a fixed bar, measured across the article body. */
function progress() {
  const bar = document.createElement("div");
  bar.className = "ps-progress"; bar.setAttribute("aria-hidden", "true"); bar.innerHTML = "<i></i>";
  document.body.append(bar);
  const fill = bar.firstChild, el = $(".ps-body");
  let raf = 0;
  const update = () => {
    raf = 0;
    // 0 when the body's top reaches 75% of the viewport, 1 when its bottom does
    const r = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * .75 - r.top) / Math.max(1, r.height)));
    fill.style.transform = `scaleX(${p})`;
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", req);
  update();
}

function copyLink() {
  const b = $("#ps-copy"), out = $("#ps-copied");
  b.addEventListener("click", async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(location.href); ok = true; }
    catch {
      const t = document.createElement("textarea"); t.value = location.href; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.append(t); t.select(); try { ok = document.execCommand("copy"); } catch { ok = false; } t.remove();
    }
    out.textContent = ok ? "Link copied" : "Couldn't copy. Use your browser's share menu.";
    b.classList.toggle("is-done", ok);
    clearTimeout(b._t); b._t = setTimeout(() => { out.textContent = ""; b.classList.remove("is-done"); }, 2600);
  });
}

boot(() => {
  document.title = `${post.title} | ${BIZ.name}`;
  $('meta[name="description"]')?.setAttribute("content", post.excerpt);
  $('meta[property="og:title"]')?.setAttribute("content", document.title);
  $('meta[property="og:description"]')?.setAttribute("content", post.excerpt);
  $("main").innerHTML = hero() + article() + cta() + related();
  progress();
  copyLink();
});
