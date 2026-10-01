/* Page bootstrap. Every page entry does:
     import { boot } from "../core.js";
     boot(() => { ...render page content into <main>... });
   Order: theme → header/footer → page content → forms/accordions → motion. */
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "../css/tokens.css";
import "../css/base.css";
import "../css/components.css";

import { applyTheme } from "./theme.js";
import { renderLayout } from "./layout.js";
import { initMotion } from "./motion.js";
import { bindForms } from "./forms.js";
import { bindAccordions } from "./render.js";
import { initConsent } from "./consent.js";

export async function boot(init) {
  const html = document.documentElement;
  // Build-time head (scripts/pages.mjs) is the source of truth for title/description/OG: keep it after pages render.
  const head = html.hasAttribute("data-seo") ? [document.title, [...document.head.querySelectorAll('meta[name="description"],meta[property^="og:"],meta[name^="twitter:"]')].map(m => [m, m.content])] : null;
  // Prerendered page (scripts/prerender.mjs): put the empty placeholders back and re-render live in the
  // same task, so nothing paints in between: no duplicate header, no flash, motion starts from a clean DOM.
  if (html.hasAttribute("data-prerendered")) {
    for (const k of ["header", "footer"]) {
      const nodes = [...document.body.childNodes], a = nodes.findIndex(n => n.nodeType === 8 && n.data === "lumi:" + k), b = nodes.findIndex(n => n.nodeType === 8 && n.data === "/lumi:" + k);
      if (a < 0 || b < a) continue;
      const ph = document.createElement("div"); ph.id = k;
      nodes[a].before(ph); nodes.slice(a, b + 1).forEach(n => n.remove());
    }
    document.querySelector("main")?.replaceChildren();
  }
  applyTheme();
  renderLayout();
  try { await init?.(); } catch (err) { console.error("[page init]", err); }
  if (head) { document.title = head[0]; head[1].forEach(([m, c]) => m.setAttribute("content", c)); }
  bindForms();
  bindAccordions();
  initMotion();
  initConsent();
}
