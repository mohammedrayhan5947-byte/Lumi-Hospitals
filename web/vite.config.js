import { resolve, join } from "node:path";
import { readdirSync, existsSync } from "node:fs";
import { defineConfig } from "vite";

// Every .html file in the project root, plus the generated entity folders, becomes a page.
const html = dir => existsSync(resolve(import.meta.dirname, dir)) ? readdirSync(resolve(import.meta.dirname, dir)).filter(f => f.endsWith(".html")).map(f => join(dir, f)) : [];
const pages = Object.fromEntries(
  [".", "specialities", "doctors", "journal"].flatMap(html).map(f => [f.replace(/\\/g, "/").replace(/^\.\//, "").replace(".html", ""), resolve(import.meta.dirname, f)])
);

export default defineConfig({
  build: { rollupOptions: { input: pages } },
  server: { port: 5173, open: false },
  preview: { port: 4317 }
});
