import { boot } from "../core.js";
import "../../css/pages/notfound.css";
import { BIZ, NAV } from "../../data/site.js";
import { $, esc, tel, btn, icon } from "../render.js";
import { gsap } from "../motion.js";
import { motionAllowed } from "../theme.js";

const rays = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6, r1 = 62, r2 = i % 2 ? 78 : 92;
  return `<line x1="${100 + r1 * Math.cos(a)}" y1="${100 + r1 * Math.sin(a)}" x2="${100 + r2 * Math.cos(a)}" y2="${100 + r2 * Math.sin(a)}"/>`;
}).join("");

const page = () => `
<section class="nf" aria-labelledby="nf-h">
  <div class="nf-glow" aria-hidden="true"></div>
  <div class="container nf-in">
    <div class="nf-code" aria-hidden="true">
      <span>4</span>
      <span class="nf-orb"><span class="nf-halo"></span><svg viewBox="0 0 200 200"><g class="nf-rays">${rays}</g></svg><span class="nf-core"></span></span>
      <span>4</span>
    </div>
    <div class="nf-copy">
      <span class="label">Error 404 · Page not found</span>
      <h1 id="nf-h" data-split data-instant>This page has drifted <em>out</em> of the light.</h1>
      <p class="lead" data-reveal>The link may be old, or the page may have moved. Everything else is right where you left it, and our team is still here.</p>
      <div class="btn-row" data-reveal>
        ${btn("/", "Back to home", "accent", { ic: "arrowLeft" })}
        ${btn("/emergency.html", "Emergency care", "danger", { ic: "ambulance" })}
      </div>
      <p class="nf-em" data-reveal>Need urgent help? Call <a href="${tel(BIZ.emergency)}">${esc(BIZ.emergency)}</a>, open 24/7.</p>
    </div>
  </div>
  <div class="container"><nav class="nf-links" aria-label="Popular pages" data-reveal>
    <span class="label">Or try</span>
    <ul>${NAV.map(n => `<li><a href="${n.href}">${esc(n.label)}${icon("arrowUpRight")}</a></li>`).join("")}</ul>
  </nav></div>
</section>`;

/* The light leans gently toward the cursor. */
function lean() {
  if (!motionAllowed() || !matchMedia("(pointer: fine)").matches) return;
  const orb = $(".nf-orb"), glow = $(".nf-glow");
  const ox = gsap.quickTo(orb, "x", { duration: 1.4, ease: "expo.out" }), oy = gsap.quickTo(orb, "y", { duration: 1.4, ease: "expo.out" });
  const gx = gsap.quickTo(glow, "x", { duration: 2, ease: "expo.out" }), gy = gsap.quickTo(glow, "y", { duration: 2, ease: "expo.out" });
  addEventListener("pointermove", e => {
    const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
    ox(dx * 24); oy(dy * 18); gx(dx * 120); gy(dy * 80);
  }, { passive: true });
  gsap.from(".nf-orb", { scale: .4, opacity: 0, duration: 1.6, ease: "expo.out", delay: .1 });
  gsap.from(".nf-code > span:not(.nf-orb)", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .12, delay: .2 });
}

boot(() => {
  $("main").innerHTML = page();
  lean();
});
