/* SEO / AEO / GEO: routes, per-page head and JSON-LD, all built from src/data/site.js.
   Pure module (no DOM): used by scripts/pages.mjs, scripts/crawl.mjs and scripts/prerender.mjs.
   Placeholder values (TODO zeros, template address, empty strings, nulls) are skipped, never emitted. */
import { BIZ, DEPARTMENTS, DOCTORS, PACKAGES, POSTS, FAQ } from "../data/site.js";

const SITE = BIZ.siteUrl.replace(/\/$/, "");
export const abs = p => SITE + (p.startsWith("/") ? p : "/" + p);

/* Clean, crawlable URL per entity. */
export const url = {
  dept: id => `/specialities/${id}.html`,
  doctor: id => `/doctors/${id}.html`,
  post: id => `/journal/${id}.html`
};

/** True when a value is missing or is an obvious placeholder (all-zero phone, template address, TODO). */
export const isPlaceholder = v => {
  if (v == null) return true;
  if (Array.isArray(v)) return !v.length;
  const s = String(v).trim();
  if (!s || /TODO/i.test(s)) return true;
  if (/^[+\d\s()-]+$/.test(s) && (s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").match(/[1-9]/g) || []).length < 2) return true; // +91 00000 00001
  if (/address line|state pin/i.test(s)) return true;
  return false;
};
const real = v => (isPlaceholder(v) ? undefined : v);
/* Drop undefined/empty keys recursively so nothing fake or empty is emitted. */
const clean = o => {
  if (Array.isArray(o)) { const a = o.map(clean).filter(x => x !== undefined); return a.length ? a : undefined; }
  if (o && typeof o === "object") {
    const r = {}; for (const [k, v] of Object.entries(o)) { const c = clean(v); if (c !== undefined) r[k] = c; }
    return Object.keys(r).length ? r : undefined;
  }
  return o === "" || o === null ? undefined : o;
};

const cut = (s, n = 158) => { s = String(s).replace(/\s+/g, " ").trim(); return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,;:.\s]+$/, "") + "…"; };
const crumbName = t => t.split(" | ")[0];

/* ---------- Static pages (one shell each). `type` selects OG image and WebPage type. ---------- */
export const PAGES = [
  { file: "index", entry: "home", title: "Lumi Hospital | Multi-speciality hospital, 24/7 emergency", desc: "Senior specialists, modern diagnostics and 24/7 emergency care. Book an appointment with Lumi Hospital in under a minute.", header: "dark", type: "home" },
  { file: "about", entry: "about", title: "About us | Lumi Hospital", desc: "The people, values and facilities behind Lumi Hospital.", pageType: "AboutPage" },
  { file: "departments", entry: "departments", title: "Specialities | Lumi Hospital", desc: "Cardiology, neurology, orthopaedics, women's health, paediatrics and more, all under one roof.", type: "speciality", pageType: "CollectionPage" },
  { file: "doctors", entry: "doctors", title: "Find a doctor | Lumi Hospital", desc: "Search Lumi Hospital's specialists by name or speciality, see OPD days and book online.", type: "doctor", pageType: "CollectionPage" },
  { file: "packages", entry: "packages", title: "Health check-up packages | Lumi Hospital", desc: "Preventive health check-ups for every age, each with a doctor's consultation.", type: "packages" },
  { file: "appointment", entry: "appointment", title: "Book an appointment | Lumi Hospital", desc: "Book a consultation or health check-up at Lumi Hospital in under a minute." },
  { file: "emergency", entry: "emergency", title: "24/7 Emergency & ambulance | Lumi Hospital", desc: "Emergency room, ICU and ambulance, open 24 hours. What to do in an emergency and how to reach us fast.", header: "dark", type: "emergency", pageType: "MedicalWebPage" },
  { file: "patient-guide", entry: "patient-guide", title: "Patient & visitor guide | Lumi Hospital", desc: "Insurance, admissions, visiting hours, reports and everything you need for your visit." },
  { file: "blog", entry: "blog", title: "Health journal | Lumi Hospital", desc: "Clear, doctor-reviewed health advice from Lumi Hospital's specialists.", type: "journal", pageType: "CollectionPage" },
  { file: "contact", entry: "contact", title: "Contact & directions | Lumi Hospital", desc: "Address, phone numbers, OPD hours and directions to Lumi Hospital.", pageType: "ContactPage" },
  { file: "gallery", entry: "gallery", title: "Inside Lumi Hospital | Facilities & virtual tour", desc: "Walk through Lumi Hospital: emergency, ICU, NICU, operation theatres, wards, lab and pharmacy." },
  { file: "privacy", entry: "privacy", title: "Privacy policy | Lumi Hospital", desc: "How Lumi Hospital collects, uses and protects your personal and health data under the DPDP Act, 2023." },
  { file: "terms", entry: "terms", title: "Terms of use | Lumi Hospital", desc: "Terms governing the use of the Lumi Hospital website." },
  { file: "disclaimer", entry: "disclaimer", title: "Medical disclaimer | Lumi Hospital", desc: "Important information about the health content on this website." },
  { file: "patient-rights", entry: "patient-rights", title: "Patient rights & responsibilities | Lumi Hospital", desc: "The Charter of Patients' Rights and Responsibilities at Lumi Hospital." },
  { file: "grievance", entry: "grievance", title: "Grievance redressal | Lumi Hospital", desc: "Raise a concern or a data-protection request with Lumi Hospital's grievance officer." },
  { file: "404", entry: "notfound", title: "Page not found | Lumi Hospital", desc: "This page doesn't exist.", noindex: true, nosnap: false },
  /* Legacy ?id= shells: redirect to the clean URL; noindex, not prerendered, not in the sitemap. */
  { file: "department", entry: "department", title: "Speciality | Lumi Hospital", desc: "Services, conditions treated and specialists at Lumi Hospital.", legacy: "dept" },
  { file: "doctor", entry: "doctor", title: "Doctor profile | Lumi Hospital", desc: "Qualifications, experience, OPD timings and online booking.", legacy: "doctor" },
  { file: "post", entry: "post", title: "Health journal | Lumi Hospital", desc: "Doctor-reviewed health advice.", legacy: "post" }
];

const deptOf = id => DEPARTMENTS.find(d => d.id === id);
const listDays = days => days.length === 6 && !days.includes("Sun") ? "Mon–Sat" : days.join(", ");

/** Every page the site serves, static and per-entity. */
export function routes() {
  const city = real(BIZ.city);
  const at = city ? ` in ${city}` : "";
  const out = PAGES.map(p => ({ ...p, path: p.file === "index" ? "/" : `/${p.file}.html`, out: `${p.file}.html`, type: p.type || "default",
    crumbs: p.file === "index" ? [] : [[crumbName(p.title).replace(/^Inside Lumi Hospital$/, "Gallery"), `/${p.file}.html`]] }));
  for (const d of DEPARTMENTS) {
    const n = DOCTORS.filter(x => x.dept === d.id).length;
    out.push({ kind: "dept", id: d.id, entry: "department", path: url.dept(d.id), out: url.dept(d.id).slice(1), type: "speciality",
      title: `${d.name}${at} | ${BIZ.name}`,
      desc: cut(`${d.name} at ${BIZ.name}: ${d.services.slice(0, 3).join(", ")}. ${n ? n + " specialist" + (n > 1 ? "s" : "") + ", " : ""}24/7 emergency backup. Book online.`),
      crumbs: [["Specialities", "/departments.html"], [d.name, url.dept(d.id)]] });
  }
  for (const doc of DOCTORS) {
    const dep = deptOf(doc.dept);
    out.push({ kind: "doctor", id: doc.id, entry: "doctor", path: url.doctor(doc.id), out: url.doctor(doc.id).slice(1), type: "doctor", pageType: "ProfilePage",
      title: `${doc.name}, ${dep ? dep.name : "Doctor"} | ${BIZ.name}`,
      desc: cut(`${doc.name} (${doc.quals}), ${doc.role} at ${BIZ.name}${city ? ", " + city : ""}. ${doc.exp}+ years. OPD ${listDays(doc.days)}, ${doc.time}. Book online.`),
      crumbs: [["Doctors", "/doctors.html"], [doc.name, url.doctor(doc.id)]] });
  }
  for (const p of POSTS) {
    out.push({ kind: "post", id: p.id, entry: "post", path: url.post(p.id), out: url.post(p.id).slice(1), type: "journal", pageType: "MedicalWebPage", ogType: "article",
      title: `${p.title} | ${BIZ.name}`, desc: cut(p.excerpt),
      crumbs: [["Journal", "/blog.html"], [p.title, url.post(p.id)]] });
  }
  return out;
}

/* ---------- JSON-LD ---------- */
const ID = { org: SITE + "/#hospital", site: SITE + "/#website", er: SITE + "/#emergency" };
const SPECIALTY = { cardiology: ["Cardiovascular"], neurology: ["Neurologic"], orthopaedics: ["Musculoskeletal"], obgyn: ["Obstetric", "Gynecologic"],
  paediatrics: ["Pediatric"], "general-medicine": ["PrimaryCare", "Endocrine"], pulmonology: ["Pulmonary"], "nephro-uro": ["Renal", "Urologic"],
  gastro: ["Gastroenterologic"], diagnostics: ["Radiography", "LaboratoryScience"] };
const spec = id => (SPECIALTY[id] || []).map(s => "https://schema.org/" + s);
const DAYS = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const ORDER = Object.keys(DAYS);
const to24 = (h, m, ap) => `${String((+h % 12) + (/p/i.test(ap) ? 12 : 0)).padStart(2, "0")}:${m || "00"}`;
const times = s => [...String(s).matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)].map(([, h, m, ap]) => to24(h, m, ap));
/* "Mon–Sat · 8:00 AM – 8:00 PM" → OpeningHoursSpecification */
const hoursSpec = s => {
  if (isPlaceholder(s)) return undefined;
  const t = times(s); if (t.length !== 2) return undefined;
  const m = String(s).match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b(?:\s*[–-]\s*\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b)?/);
  if (!m) return undefined;
  const a = ORDER.indexOf(m[1]), b = m[2] ? ORDER.indexOf(m[2]) : a;
  return { "@type": "OpeningHoursSpecification", dayOfWeek: ORDER.slice(a, b + 1).map(d => "https://schema.org/" + DAYS[d]), opens: t[0], closes: t[1] };
};
const ALL_DAY = { "@type": "OpeningHoursSpecification", dayOfWeek: ORDER.map(d => "https://schema.org/" + DAYS[d]), opens: "00:00", closes: "23:59" };
const isTest = s => /test|scan|ecg|echo|tmt|holter|monitor|mri|ct\b|x-ray|ultrasound|doppler|mammo|lab|eeg|emg|ncv|study|endoscopy|colonoscopy|bronchoscopy|angiography|function/i.test(s);
const service = s => ({ "@type": isTest(s) ? "MedicalTest" : "MedicalProcedure", name: s });

const address = () => clean({ "@type": "PostalAddress", streetAddress: real(BIZ.address), addressLocality: real(BIZ.city), addressRegion: real(BIZ.region), addressCountry: real(BIZ.country) });
const geo = () => (BIZ.geo?.lat != null && BIZ.geo?.lng != null ? { "@type": "GeoCoordinates", latitude: BIZ.geo.lat, longitude: BIZ.geo.lng } : undefined);
const sameAs = () => Object.values(BIZ.social || {}).filter(v => !isPlaceholder(v));
const ogImg = type => abs(`/og/${type}.png`);

/** The hospital. `full` adds services, specialities and departments (home, about, contact, specialities). */
export function hospital(full = false) {
  const base = {
    "@type": ["Hospital", "MedicalOrganization"], "@id": ID.org,
    name: BIZ.name, alternateName: BIZ.short + " Hospital" === BIZ.name ? undefined : BIZ.short, url: SITE + "/",
    description: BIZ.intro, slogan: real(BIZ.tagline),
    logo: { "@type": "ImageObject", url: abs("/og/logo.png"), width: 512, height: 512 },
    image: ogImg("home"),
    telephone: real(BIZ.phone), email: real(BIZ.email),
    address: address(), geo: geo(), hasMap: real(BIZ.mapsLink),
    areaServed: real(BIZ.city) && { "@type": "City", name: BIZ.city },
    foundingDate: real(BIZ.founded), legalName: real(BIZ.legal?.entity), taxID: real(BIZ.legal?.gstin),
    openingHoursSpecification: [hoursSpec(BIZ.hours?.opd), hoursSpec(BIZ.hours?.sunday)],
    sameAs: sameAs(),
    contactPoint: [
      real(BIZ.emergency) && { "@type": "ContactPoint", contactType: "emergency", telephone: BIZ.emergency, hoursAvailable: ALL_DAY, areaServed: "IN", availableLanguage: ["English", "Kannada", "Hindi"] },
      (real(BIZ.phone) || real(BIZ.email)) && { "@type": "ContactPoint", contactType: "customer service", telephone: real(BIZ.phone), email: real(BIZ.email), areaServed: "IN" }
    ].filter(Boolean),
    isAccessibleForFree: false,
    paymentAccepted: BIZ.insurers?.length ? `Cashless health insurance and TPAs: ${BIZ.insurers.join(", ")}` : undefined,
    medicalSpecialty: [...new Set(DEPARTMENTS.flatMap(d => spec(d.id))), "https://schema.org/Emergency"]
  };
  if (full) Object.assign(base, {
    availableService: [
      { "@type": "MedicalTherapy", name: "24/7 emergency care" }, { "@type": "MedicalTherapy", name: "Intensive care (ICU & NICU)" },
      ...DEPARTMENTS.flatMap(d => d.services.map(service))
    ],
    department: DEPARTMENTS.map(d => ({ "@type": "MedicalClinic", name: `${d.name}, ${BIZ.name}`, url: abs(url.dept(d.id)), medicalSpecialty: spec(d.id), description: d.summary }))
  });
  return clean(base);
}

const website = () => ({ "@type": "WebSite", "@id": ID.site, url: SITE + "/", name: BIZ.name, inLanguage: "en-IN", publisher: { "@id": ID.org },
  potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: abs("/doctors.html") + "?q={search_term_string}" }, "query-input": "required name=search_term_string" } });

const emergency = () => clean({ "@type": "EmergencyService", "@id": ID.er, name: `${BIZ.name} 24/7 Emergency & Ambulance`, url: abs("/emergency.html"),
  telephone: real(BIZ.emergency), address: address(), geo: geo(), openingHoursSpecification: ALL_DAY, parentOrganization: { "@id": ID.org }, image: ogImg("emergency") });

const breadcrumbs = r => ({ "@type": "BreadcrumbList", "@id": abs(r.path) + "#breadcrumb",
  itemListElement: [["Home", "/"], ...r.crumbs].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(p) })) });

export function physician(doc, full = true) {
  const dep = deptOf(doc.dept);
  const o = { "@type": ["Physician", "Person"], "@id": abs(url.doctor(doc.id)) + "#physician", name: doc.name, url: abs(url.doctor(doc.id)) };
  if (!full) return { ...o, jobTitle: doc.role, medicalSpecialty: spec(doc.dept), hospitalAffiliation: { "@id": ID.org } };
  return clean({ ...o,
    honorificPrefix: /^Dr\.?/.test(doc.name) ? "Dr." : undefined,
    jobTitle: doc.role, description: doc.bio, image: real(doc.photo) ? abs(doc.photo) : undefined,
    medicalSpecialty: spec(doc.dept), knowsAbout: doc.focus, knowsLanguage: doc.langs,
    hasCredential: doc.quals.split(/,\s*/).map(q => ({ "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: q })),
    hospitalAffiliation: { "@id": ID.org }, worksFor: { "@id": ID.org }, memberOf: dep && { "@type": "MedicalClinic", name: `${dep.name}, ${BIZ.name}`, url: abs(url.dept(dep.id)) },
    address: address(),
    openingHoursSpecification: (() => { const t = times(doc.time); return t.length === 2 ? { "@type": "OpeningHoursSpecification", dayOfWeek: doc.days.map(d => "https://schema.org/" + DAYS[d]), opens: t[0], closes: t[1] } : undefined; })(),
    potentialAction: { "@type": "ReserveAction", target: abs(`/appointment.html?dept=${doc.dept}&doctor=${doc.id}`), name: `Book with ${doc.name}` }
  });
}

const pkgOffer = p => clean({ "@type": "Offer", "@id": abs("/packages.html#" + p.id), url: abs("/packages.html#" + p.id), name: `${p.name} health check-up`,
  price: p.price, priceCurrency: "INR", availability: "https://schema.org/InStock", seller: { "@id": ID.org },
  itemOffered: { "@type": "MedicalTest", name: `${p.name} health check-up (${p.tests} tests)`, description: `${p.for}. Includes: ${p.includes.join(", ")}.`,
    usedToDiagnose: undefined, affectedBy: undefined } });

/** FAQPage from {q,a} items (the prerender passes the FAQs actually rendered on the page). */
export const faqPage = (r, items) => !items?.length ? null : { "@type": "FAQPage", "@id": abs(r.path) + "#faq", url: abs(r.path), inLanguage: "en-IN",
  mainEntity: items.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

/** Full @graph for a route. */
export function jsonLd(r, extra = []) {
  const page = { "@type": r.pageType || "WebPage", "@id": abs(r.path) + "#webpage", url: abs(r.path), name: r.title, description: r.desc, inLanguage: "en-IN",
    isPartOf: { "@id": ID.site }, publisher: { "@id": ID.org }, breadcrumb: { "@id": abs(r.path) + "#breadcrumb" },
    primaryImageOfPage: { "@type": "ImageObject", url: ogImg(r.type), width: 1200, height: 630 } };
  const full = ["home", "about", "contact", "departments"].includes(r.entry);
  const g = [hospital(full), website(), page, breadcrumbs(r)];

  if (r.entry === "home" || r.entry === "emergency" || r.entry === "contact") g.push(emergency());
  if (r.entry === "home") page.about = { "@id": ID.org };
  if (r.entry === "contact") page.mainEntity = { "@id": ID.org };

  if (r.kind === "dept") {
    const d = deptOf(r.id), team = DOCTORS.filter(x => x.dept === d.id);
    Object.assign(page, { "@type": "MedicalWebPage", specialty: spec(d.id), audience: "https://schema.org/Patient",
      about: [{ "@type": "MedicalSpecialty", name: d.name }, ...d.conditions.map(c => ({ "@type": "MedicalCondition", name: c }))],
      mainEntity: { "@id": abs(r.path) + "#clinic" } });
    g.push(clean({ "@type": "MedicalClinic", "@id": abs(r.path) + "#clinic", name: `${d.name}, ${BIZ.name}`, url: abs(r.path), description: d.about,
      medicalSpecialty: spec(d.id), parentOrganization: { "@id": ID.org }, address: address(), telephone: real(BIZ.phone),
      openingHoursSpecification: [hoursSpec(BIZ.hours?.opd), hoursSpec(BIZ.hours?.sunday)],
      availableService: d.services.map(service), employee: team.map(x => physician(x, false)) }));
    const pk = (d.packages || []).map(id => PACKAGES.find(p => p.id === id)).filter(Boolean);
    if (pk.length) g.push({ "@type": "OfferCatalog", "@id": abs(r.path) + "#packages", name: `Health checks recommended by ${d.name}`, itemListElement: pk.map(pkgOffer) });
  }
  if (r.kind === "doctor") {
    const doc = DOCTORS.find(x => x.id === r.id);
    page.mainEntity = { "@id": abs(r.path) + "#physician" };
    g.push(physician(doc));
  }
  if (r.kind === "post") {
    const p = POSTS.find(x => x.id === r.id), dep = deptOf(p.dept);
    const reviewer = p.reviewedBy && DOCTORS.find(x => x.id === p.reviewedBy);
    const author = p.author && DOCTORS.find(x => x.id === p.author);
    Object.assign(page, { specialty: dep && spec(dep.id), mainEntity: { "@id": abs(r.path) + "#article" },
      lastReviewed: real(p.reviewed), reviewedBy: reviewer ? physician(reviewer, false) : undefined,
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".ps-lede"] } });
    g.push(clean({ "@type": "Article", "@id": abs(r.path) + "#article", headline: p.title, description: p.excerpt, url: abs(r.path), mainEntityOfPage: { "@id": abs(r.path) + "#webpage" },
      datePublished: p.date, dateModified: p.updated || p.date, inLanguage: "en-IN", wordCount: p.body.join(" ").split(/\s+/).length, timeRequired: `PT${p.read}M`,
      image: real(p.img) ? abs(p.img) : ogImg("journal"), articleSection: dep?.name,
      author: author ? physician(author, false) : { "@id": ID.org }, reviewedBy: reviewer ? physician(reviewer, false) : undefined, publisher: { "@id": ID.org },
      about: dep && { "@type": "MedicalSpecialty", name: dep.name } }));
  }
  if (r.entry === "packages") g.push({ "@type": "OfferCatalog", "@id": abs("/packages.html#catalog"), name: `${BIZ.name} health check-up packages`, itemListElement: PACKAGES.map(pkgOffer) });
  if (r.entry === "doctors") page.mainEntity = { "@type": "ItemList", itemListElement: DOCTORS.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: abs(url.doctor(d.id)), name: d.name })) };
  if (r.entry === "departments") page.mainEntity = { "@type": "ItemList", itemListElement: DEPARTMENTS.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: abs(url.dept(d.id)), name: d.name })) };
  if (r.entry === "blog") page.mainEntity = { "@type": "ItemList", itemListElement: POSTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(url.post(p.id)), name: p.title })) };
  for (const x of extra) if (x) g.push(x);
  return { "@context": "https://schema.org", "@graph": g.map(clean) };
}

const ea = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
/** JSON safe inside <script>. */
export const ldScript = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

/** <head> SEO block for a route (between <!--seo--> markers so the prerender can extend it). */
export function headTags(r) {
  const canon = abs(r.path), img = ogImg(r.type);
  const robots = r.legacy || r.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1";
  const tags = [
    `<title>${ea(r.title)}</title>`,
    `<meta name="description" content="${ea(r.desc)}">`,
    `<meta name="robots" content="${robots}">`,
    !r.legacy && !r.noindex && `<link rel="canonical" href="${canon}">`,
    !r.legacy && !r.noindex && `<link rel="alternate" hreflang="en-IN" href="${canon}">`,
    !r.legacy && !r.noindex && `<link rel="alternate" hreflang="x-default" href="${canon}">`,
    `<meta name="theme-color" content="#f3f1ec" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#0b0e0d" media="(prefers-color-scheme: dark)">`,
    `<meta property="og:type" content="${r.ogType || "website"}">`,
    `<meta property="og:site_name" content="${ea(BIZ.name)}">`,
    `<meta property="og:locale" content="en_IN">`,
    `<meta property="og:title" content="${ea(r.title)}">`,
    `<meta property="og:description" content="${ea(r.desc)}">`,
    !r.legacy && `<meta property="og:url" content="${canon}">`,
    `<meta property="og:image" content="${img}">`,
    `<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${ea(crumbName(r.title))}, ${ea(BIZ.name)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${ea(r.title)}">`,
    `<meta name="twitter:description" content="${ea(r.desc)}">`,
    `<meta name="twitter:image" content="${img}">`,
    r.kind === "post" && `<meta property="article:published_time" content="${POSTS.find(p => p.id === r.id).date}">`,
    !r.legacy && !r.noindex && ldScript(jsonLd(r))
  ].filter(Boolean);
  return `<!--seo-->\n${tags.join("\n")}\n<!--/seo-->`;
}
