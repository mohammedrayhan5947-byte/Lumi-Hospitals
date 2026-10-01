/* Theme engine: light/dark/auto · accent palettes · seasonal campaigns · accessibility modes.
   State persists in localStorage ("lumi-theme"). An inline <head> script applies mode/accent/a11y
   before first paint; this module owns everything after that. */
import { SEASONS } from "../data/site.js";

const KEY = "lumi-theme";
export const ACCENTS = [
  { id: "lumi", name: "Lumi Blue", l: "#2268b8", d: "#7db3ff" },
  { id: "aurora", name: "Aurora", l: "#0e8a70", d: "#3fd4a9" },
  { id: "ember", name: "Ember", l: "#c24a14", d: "#ff9259" },
  { id: "plum", name: "Plum", l: "#7638c2", d: "#bb94ff" }
];
export const A11Y = [
  { id: "large", name: "Larger text", hint: "Increase text size across the site" },
  { id: "contrast", name: "High contrast", hint: "Stronger text and borders" },
  { id: "calm", name: "Reduce motion", hint: "Turn off animations and smooth scroll" },
  { id: "links", name: "Underline links", hint: "Make every link easy to spot" }
];

const defaults = { mode: "auto", accent: "auto", season: "auto", a11y: [], seasonDismissed: "" };
let state = { ...defaults };
try { state = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { /* private mode */ }

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } };
const mq = matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();
export const onThemeChange = fn => listeners.add(fn);
export const getState = () => state;

function md(d) { return String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function inRange(today, from, to) { return from <= to ? today >= from && today <= to : today >= from || today <= to; }

/** The season currently in effect (date-based unless the visitor picked one / turned it off). */
export function activeSeason() {
  if (state.season === "off") return null;
  if (state.season !== "auto") return SEASONS.find(s => s.id === state.season) || null;
  const t = md(new Date());
  return SEASONS.find(s => inRange(t, s.from, s.to)) || null;
}
export const resolvedMode = () => state.mode === "auto" ? (mq.matches ? "dark" : "light") : state.mode;
export const motionAllowed = () => !state.a11y.includes("calm") && !matchMedia("(prefers-reduced-motion: reduce)").matches;

export function applyTheme() {
  const html = document.documentElement;
  const season = activeSeason();
  let accent = state.accent;
  // Brand colour by default; a season only recolours the site when picked explicitly (its banner shows either way)
  if (accent === "auto" || (accent === "season" && !season)) accent = "lumi";
  html.dataset.mode = resolvedMode();
  html.dataset.accent = accent;
  html.dataset.a11y = state.a11y.join(" ");
  if (season) {
    html.style.setProperty("--season-l", season.accent);
    html.style.setProperty("--season-d", `color-mix(in oklab, ${season.accent} 62%, #fff)`);
    html.dataset.season = season.id;
  } else delete html.dataset.season;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = html.dataset.mode === "dark" ? "#0b0e0d" : "#f3f1ec";
  listeners.forEach(fn => fn(state));
}

/** Update state; mode changes get a circular reveal from the clicked control. */
export function setTheme(patch, originEl) {
  const modeChanging = "mode" in patch && patch.mode !== state.mode;
  state = { ...state, ...patch };
  save();
  if (modeChanging && document.startViewTransition && motionAllowed() && originEl) {
    const r = originEl.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.classList.add("theme-vt");
    const vt = document.startViewTransition(applyTheme);
    vt.finished.finally(() => document.documentElement.classList.remove("theme-vt"));
    vt.ready.then(() => document.documentElement.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 700, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" }
    )).catch(() => {});
  } else applyTheme();
}

export function toggleA11y(id, on) {
  const set = new Set(state.a11y);
  on ? set.add(id) : set.delete(id);
  setTheme({ a11y: [...set] });
}

mq.addEventListener("change", () => state.mode === "auto" && applyTheme());
