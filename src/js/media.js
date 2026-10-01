/* Responsive photo helpers for the hospital's own photos and licensed stock.
   pic(photoOrId, { cls, sizes, eager, ratio, pos }) → <img> with srcset (sm/full), dimensions, lazy/eager loading. */
import { photo } from "../data/site.js";

export function pic(p, { cls = "", sizes = "(max-width: 860px) 100vw, 50vw", eager = false, pos = "", alt } = {}) {
  if (typeof p === "string") p = photo(p);
  if (!p) return "";
  const w = p.w || 1600, h = p.h || 1067;
  return `<img class="${cls}" src="${p.src}" srcset="${p.sm} 760w, ${p.src} 1800w" sizes="${sizes}" width="${w}" height="${h}"
    alt="${(alt ?? p.alt).replace(/"/g, "&quot;")}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async"${pos || p.focal ? ` style="object-position:${pos || p.focal}"` : ""}>`;
}

/** Figure with caption, used in galleries and editorial blocks. */
export const figure = (p, opts = {}) => {
  if (typeof p === "string") p = photo(p);
  return `<figure class="photo ${opts.figCls || ""}">${pic(p, opts)}${opts.caption === false ? "" : `<figcaption class="label">${opts.caption || p.caption}</figcaption>`}</figure>`;
};
