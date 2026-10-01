/* Crawl files from data: public/sitemap.xml, robots.txt, llms.txt, llms-full.txt.
   Run: node scripts/crawl.mjs  (runs automatically before `npm run build`). */
import { writeFileSync, statSync, existsSync } from "node:fs";
import { BIZ, DEPARTMENTS, DOCTORS, PACKAGES, POSTS, FAQ } from "../src/data/site.js";
import { routes, abs, url, isPlaceholder } from "../src/js/seo.js";

const day = f => existsSync(f) ? statSync(f).mtime.toISOString().slice(0, 10) : null;
const max = (...d) => d.filter(Boolean).sort().pop();
const dataDay = day("src/data/site.js");
const live = routes().filter(r => !r.legacy && !r.noindex);

/* sitemap.xml: lastmod = newest of the data file and the page's own renderer (posts: their date). */
const lastmod = r => r.kind === "post" ? (POSTS.find(p => p.id === r.id).updated || POSTS.find(p => p.id === r.id).date) : max(dataDay, day(`src/js/pages/${r.entry}.js`));
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${live.map(r => `  <url><loc>${abs(r.path)}</loc><lastmod>${lastmod(r)}</lastmod><xhtml:link rel="alternate" hreflang="en-IN" href="${abs(r.path)}"/></url>`).join("\n")}
</urlset>
`);

/* robots.txt: everyone welcome, including AI search and assistant crawlers (named so intent is explicit). */
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai", "Applebot-Extended", "Bingbot", "CCBot", "meta-externalagent"];
writeFileSync("public/robots.txt", `# ${BIZ.name}: all crawlers welcome, including AI search and assistants.
User-agent: *
Allow: /

${AI.map(a => `User-agent: ${a}`).join("\n")}
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`);

/* llms.txt (llmstxt.org) + llms-full.txt. Only verified fields; placeholders are left out. */
const ok = v => !isPlaceholder(v);
const contact = [
  ok(BIZ.address) && `- Address: ${BIZ.address}`,
  !ok(BIZ.address) && ok(BIZ.city) && `- Location: ${BIZ.city}, ${BIZ.region}, India`,
  ok(BIZ.phone) && `- Reception: ${BIZ.phone}`,
  ok(BIZ.emergency) && `- 24/7 emergency & ambulance: ${BIZ.emergency}`,
  ok(BIZ.email) && `- Email: ${BIZ.email}`,
  ok(BIZ.hours.opd) && `- OPD hours: ${BIZ.hours.opd}; ${BIZ.hours.sunday}`,
  `- Emergency, ICU, pharmacy and laboratory: open 24 hours`,
  ok(BIZ.hours.visiting) && `- Ward visiting hours: ${BIZ.hours.visiting}`,
  ok(BIZ.mapsLink) && `- Map: ${BIZ.mapsLink}`,
  `- Book an appointment: ${abs("/appointment.html")}`
].filter(Boolean).join("\n");
const sched = d => `${d.days.length === 6 && !d.days.includes("Sun") ? "Mon–Sat" : d.days.join(", ")}, ${d.time}`;
const deptLine = d => `- [${d.name}](${abs(url.dept(d.id))}): ${d.summary}`;
const docLine = d => `- [${d.name}](${abs(url.doctor(d.id))}): ${d.role} (${d.quals}), ${d.exp}+ years. OPD ${sched(d)}.`;
const head = `# ${BIZ.name}

> ${BIZ.name} is a multi-speciality hospital in ${BIZ.city}, ${BIZ.region}, India, with ${DEPARTMENTS.length} specialities, ${DOCTORS.length} listed consultants, a 24/7 emergency room, ICU, NICU, laboratory and pharmacy. Patients can book consultations and preventive health check-ups online or on WhatsApp.

${BIZ.intro}${BIZ.insurers?.length ? ` Cashless insurance is accepted with insurers and TPAs including ${BIZ.insurers.join(", ")}.` : ""}

## Contact
${contact}
`;
writeFileSync("public/llms.txt", `${head}
## Specialities
${DEPARTMENTS.map(deptLine).join("\n")}

## Doctors
${DOCTORS.map(docLine).join("\n")}

## Health check-up packages
${PACKAGES.map(p => `- [${p.name}](${abs("/packages.html#" + p.id)}): ₹${p.price} (${p.tests} tests). ${p.for}.`).join("\n")}

## Health journal
${POSTS.map(p => `- [${p.title}](${abs(url.post(p.id))}): ${p.excerpt}`).join("\n")}

## Visiting
- [Emergency & ambulance](${abs("/emergency.html")}): what to do in an emergency and how to reach the hospital fast
- [Patient & visitor guide](${abs("/patient-guide.html")}): insurance, admissions, visiting hours, reports
- [Contact & directions](${abs("/contact.html")})

## Optional
- [Full text for language models](${abs("/llms-full.txt")})
- [About](${abs("/about.html")})
- [Patient rights](${abs("/patient-rights.html")})
- [Privacy policy](${abs("/privacy.html")})
- [Medical disclaimer](${abs("/disclaimer.html")})
`);

const pkgOf = id => PACKAGES.find(p => p.id === id);
writeFileSync("public/llms-full.txt", `${head}
## Specialities
${DEPARTMENTS.map(d => {
  const team = DOCTORS.filter(x => x.dept === d.id), pk = (d.packages || []).map(pkgOf).filter(Boolean);
  return `### ${d.name}
URL: ${abs(url.dept(d.id))}
${d.about}
Services: ${d.services.join("; ")}.
Conditions treated: ${d.conditions.join("; ")}.
${team.length ? `Specialists: ${team.map(x => `${x.name} (${x.role})`).join("; ")}.` : "Specialists: call reception to book the consultant on duty."}${pk.length ? `\nRecommended health checks: ${pk.map(p => p.name).join(", ")}.` : ""}`;
}).join("\n\n")}

## Doctors
${DOCTORS.map(d => `### ${d.name}
URL: ${abs(url.doctor(d.id))}
${d.role}, ${DEPARTMENTS.find(x => x.id === d.dept)?.name}. Qualifications: ${d.quals}. Experience: ${d.exp}+ years. Languages: ${d.langs.join(", ")}.
OPD: ${sched(d)}. Focus: ${d.focus.join(", ")}.
${d.bio}
Book: ${abs(`/appointment.html?dept=${d.dept}&doctor=${d.id}`)}`).join("\n\n")}

## Health check-up packages
${PACKAGES.map(p => `### ${p.name}: ₹${p.price} (MRP ₹${p.mrp}), ${p.tests} tests
For: ${p.for}. Includes: ${p.includes.join("; ")}.
Book: ${abs("/appointment.html?package=" + p.id)}`).join("\n\n")}

## Frequently asked questions
${FAQ.map(f => `### ${f.q}\n${f.a}`).join("\n\n")}

## Health journal
${POSTS.map(p => `### ${p.title}
URL: ${abs(url.post(p.id))} · Published ${p.date}
${p.body.map(l => l.startsWith("## ") ? `#${l}` : l).join("\n")}`).join("\n\n")}

---
Health information from ${BIZ.name} is general guidance, not a substitute for medical advice. In an emergency, call the hospital's emergency line or 112.
`);
console.log("crawl files:", live.length, "urls in sitemap");
