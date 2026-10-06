/* =====================================================================
   LUMI HOSPITAL: ALL CONTENT LIVES HERE
   Every page renders from this file. Items marked TODO are placeholders
   that must be replaced with verified facts from the hospital.
   Images: drop files into /public/img/... and set the path; empty = styled placeholder.
   ===================================================================== */

export const BIZ = {
  name: "Lumi Hospital",
  crmUrl: import.meta.env?.VITE_CRM_URL || "",
  short: "Lumi",
  tagline: "Towards Healthy Life",
  intro: "A multi-speciality hospital where senior specialists, modern diagnostics and genuinely kind people work as one team, around the clock.",
  phone: "+91 00000 00000",        // TODO reception
  emergency: "+91 00000 00001",    // TODO 24/7 emergency & ambulance
  whatsapp: "910000000000",        // TODO digits only, with country code
  email: "care@lumihospital.in",   // TODO
  address: "Address line, Area, City, State PIN", // TODO
  mapQuery: "Lumi Hospital",       // TODO exact Google Maps query or place name
  mapsLink: "",                    // TODO Google Maps share link
  hours: {
    opd: "Mon–Sat · 8:00 AM – 8:00 PM",   // TODO
    sunday: "Sun · 9:00 AM – 1:00 PM",    // TODO
    visiting: "11:00 AM – 1:00 PM · 5:00 PM – 7:00 PM", // TODO
    pharmacy: "24 hours",
    lab: "24 hours"
  },
  social: { instagram: "", facebook: "", youtube: "", linkedin: "", x: "" }, // TODO
  founded: "",                     // TODO e.g. "2012"
  siteUrl: "https://www.lumihospital.in", // TODO final domain (used for canonical, sitemap, JSON-LD)
  city: "Bengaluru", region: "Karnataka", country: "IN", // TODO confirm city
  geo: { lat: null, lng: null },   // TODO from Google Maps
  legal: {                         // TODO all values from the hospital's registrations
    entity: "",                    // registered legal entity name
    kpmeReg: "",                   // Karnataka Private Medical Establishments (KPME) registration no.
    pcpndtReg: "",                 // PC-PNDT registration no. (if ultrasound/imaging)
    gstin: "",
    grievanceOfficer: { name: "", email: "grievance@lumihospital.in", phone: "" },
    dpo: { name: "", email: "privacy@lumihospital.in" }
  },
  // TODO: confirm every figure with the hospital before launch
  stats: [
    { value: 24, suffix: "/7", label: "Emergency, ICU & pharmacy" },
    { value: 40, suffix: "+", label: "Specialist doctors" },
    { value: 150, suffix: "", label: "Beds incl. ICU & NICU" },
    { value: 10, suffix: "", label: "Specialities" }
  ],
  accreditations: [],              // e.g. ["NABH", "NABL"] — only real ones
  insurers: ["Star Health", "HDFC ERGO", "ICICI Lombard", "Niva Bupa", "Care Health", "Aditya Birla", "Bajaj Allianz", "Tata AIG", "Medi Assist (TPA)", "CGHS", "ECHS"] // TODO confirm tie-ups
};

export const NAV = [
  { href: "/about.html", label: "About" },
  { href: "/gallery.html", label: "Tour" },
  { href: "/departments.html", label: "Specialities" },
  { href: "/doctors.html", label: "Doctors" },
  { href: "/packages.html", label: "Health checks" },
  { href: "/patient-guide.html", label: "Patients" },
  { href: "/blog.html", label: "Journal" },
  { href: "/contact.html", label: "Contact" }
];

/* icon: key in src/js/icons.js · img: /img/site/... (optional) */
export const DEPARTMENTS = [
  { id: "cardiology", packages: ["heart", "executive"], name: "Cardiology", icon: "heart", img: "/img/stock/dept-cardiology.webp",
    summary: "Heart checks, cardiac imaging, interventions and rehab.",
    about: "From a first ECG to complex angioplasty, our cardiac team covers prevention, diagnosis, intervention and long-term heart care, with an ICU and emergency team on call day and night.",
    services: ["ECG, 2D Echo & TMT", "Holter & BP monitoring", "Coronary angiography", "Angioplasty & stenting", "Pacemaker implantation", "Cardiac rehabilitation"],
    conditions: ["Chest pain", "Heart attack", "High blood pressure", "Heart failure", "Arrhythmia", "Valve disease"] },
  { id: "neurology", packages: ["senior"], name: "Neurology", icon: "brain", img: "/img/stock/dept-neurology.webp",
    summary: "Stroke, epilepsy, headache and nerve disorders.",
    about: "Rapid emergency assessment, an epilepsy clinic and neuro-diagnostics help us find the cause quickly and start treatment while it matters most.",
    services: ["Acute stroke care", "EEG, EMG & NCV", "Epilepsy clinic", "Headache & migraine clinic", "Movement disorders", "Neuro-rehabilitation"],
    conditions: ["Stroke", "Seizures", "Migraine", "Parkinson's disease", "Neuropathy", "Vertigo"] },
  { id: "orthopaedics", packages: ["senior"], name: "Orthopaedics", icon: "bone", img: "/img/stock/dept-orthopaedics.webp",
    summary: "Joint replacement, sports injuries, spine and trauma.",
    about: "Joint replacement, arthroscopy and spine surgery, supported by in-house physiotherapy so recovery starts the day after surgery.",
    services: ["Knee & hip replacement", "Arthroscopy", "Spine surgery", "Fracture & trauma care", "Sports medicine", "Physiotherapy"],
    conditions: ["Arthritis", "Ligament tears", "Back & neck pain", "Fractures", "Frozen shoulder", "Osteoporosis"] },
  { id: "obgyn", packages: ["women"], name: "Obstetrics & Gynaecology", icon: "female", img: "/img/stock/dept-gastro.webp",
    summary: "Pregnancy, safe birth and lifelong women's health.",
    about: "A Neonatal ICU in the same building and a team that stays with you from the first scan to the first vaccination.",
    services: ["Antenatal care", "Normal & caesarean birth", "High-risk pregnancy", "Laparoscopic surgery", "Fertility consultation", "Menopause clinic"],
    conditions: ["Pregnancy", "PCOS", "Fibroids", "Endometriosis", "Irregular periods", "Infertility"] },
  { id: "paediatrics", packages: [], name: "Paediatrics & NICU", icon: "baby", img: "/img/stock/dept-paediatrics.webp",
    summary: "Newborn intensive care, child health and vaccinations.",
    about: "Child-friendly consultation rooms, a well-baby clinic and a fully equipped NICU for the smallest patients.",
    services: ["Neonatal ICU", "Well-baby clinic", "Vaccinations", "Child nutrition", "Developmental assessment", "Paediatric emergency"],
    conditions: ["Fever & infections", "Asthma", "Jaundice", "Growth concerns", "Allergies", "Premature birth"] },
  { id: "general-medicine", packages: ["diabetes", "essential"], name: "Internal Medicine", icon: "stethoscope", img: "/img/stock/dept-general-medicine.webp",
    summary: "Adult medicine, diabetes, BP and preventive care.",
    about: "Your first stop for undiagnosed symptoms, long-term conditions and coordinated care across specialities.",
    services: ["Fever & infection clinic", "Diabetes clinic", "Hypertension clinic", "Thyroid care", "Geriatric care", "Preventive health"],
    conditions: ["Diabetes", "Hypertension", "Thyroid disorders", "Dengue & malaria", "Anaemia", "Fatigue"] },
  { id: "pulmonology", packages: ["executive"], name: "Pulmonology", icon: "lungs", img: "/img/stock/dept-pulmonology.webp",
    summary: "Asthma, COPD, sleep and lung function.",
    about: "Lung function testing and respiratory care, with ICU support when breathing gets serious.",
    services: ["Pulmonary function test", "Bronchoscopy", "Sleep study", "Asthma & COPD clinic", "TB care", "Respiratory ICU"],
    conditions: ["Asthma", "COPD", "Sleep apnoea", "Pneumonia", "Tuberculosis", "Chronic cough"] },
  { id: "nephro-uro", packages: ["diabetes"], name: "Nephrology & Urology", icon: "drop", img: "/img/stock/dept-nephro-uro.webp",
    summary: "Kidney care, dialysis, stones and prostate.",
    about: "Kidney care and minimally invasive urology for kidney stones and prostate conditions.",
    services: ["Haemodialysis", "Laser stone surgery", "Prostate (TURP / HoLEP)", "CKD management", "Transplant work-up", "Uro-oncology"],
    conditions: ["Kidney stones", "Chronic kidney disease", "Enlarged prostate", "UTI", "Blood in urine", "Incontinence"] },
  { id: "gastro", packages: ["executive"], name: "Gastroenterology", icon: "stomach", img: "/img/stock/people-doctor-portrait.webp",
    summary: "Digestive, liver and endoscopy services.",
    about: "Diagnostic and therapeutic endoscopy, liver clinics and day-care procedures, so you're usually home the same day.",
    services: ["Endoscopy & colonoscopy", "ERCP", "Liver clinic", "Acid reflux & IBS clinic", "GI bleeding care", "Nutrition support"],
    conditions: ["Acidity & GERD", "Fatty liver", "Hepatitis", "Gallstones", "IBS", "Ulcers"] },
  { id: "diagnostics", packages: ["executive", "essential"], name: "Diagnostics & Imaging", icon: "scan", img: "/img/stock/dept-diagnostics.webp",
    summary: "24/7 lab, CT, MRI, X-ray and ultrasound.",
    about: "An in-house laboratory and imaging with digital reports, often on your phone within hours.",
    services: ["24/7 pathology lab", "CT scan", "MRI", "Digital X-ray", "Ultrasound & Doppler", "Mammography"],
    conditions: ["Health screening", "Pre-surgery work-up", "Injury imaging", "Cancer screening", "Pregnancy scans", "Follow-up tests"] }
];

/* TODO: replace with the real roster. photo: "/img/doctors/<file>.jpg" */
export const DOCTORS = [
  { id: "arjun-rao", name: "Dr. Arjun Rao", dept: "cardiology", role: "Senior Consultant, Interventional Cardiology", quals: "MBBS, MD, DM (Cardiology)", exp: 18, langs: ["English", "Kannada", "Hindi"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "10 AM – 4 PM", photo: "",
    bio: "Dr. Rao leads the cardiac cath lab and has a special interest in complex angioplasty and preventive cardiology.", focus: ["Complex angioplasty", "Preventive cardiology", "Heart failure"] },
  { id: "meera-iyer", name: "Dr. Meera Iyer", dept: "neurology", role: "Consultant Neurologist", quals: "MBBS, MD, DM (Neurology)", exp: 12, langs: ["English", "Tamil", "Hindi"], days: ["Mon", "Wed", "Fri"], time: "9 AM – 2 PM", photo: "",
    bio: "Dr. Iyer runs the stroke response team and the epilepsy clinic.", focus: ["Stroke", "Epilepsy", "Headache disorders"] },
  { id: "faisal-khan", name: "Dr. Faisal Khan", dept: "orthopaedics", role: "Head, Orthopaedics & Joint Replacement", quals: "MBBS, MS (Ortho), Fellowship in Arthroplasty", exp: 20, langs: ["English", "Hindi", "Urdu"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "10 AM – 5 PM", photo: "",
    bio: "Dr. Khan specialises in knee and hip replacement and minimally invasive joint surgery.", focus: ["Knee replacement", "Hip replacement", "Revision surgery"] },
  { id: "kavitha-reddy", name: "Dr. Kavitha Reddy", dept: "obgyn", role: "Senior Consultant, Obstetrics & Gynaecology", quals: "MBBS, MS (OBG), DNB", exp: 16, langs: ["English", "Telugu", "Kannada"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "9 AM – 1 PM", photo: "",
    bio: "Dr. Reddy focuses on high-risk pregnancy and laparoscopic gynaecological surgery.", focus: ["High-risk pregnancy", "Laparoscopy", "PCOS"] },
  { id: "priya-shetty", name: "Dr. Priya Shetty", dept: "paediatrics", role: "Consultant Paediatrician & Neonatologist", quals: "MBBS, MD (Paediatrics), Fellowship in Neonatology", exp: 10, langs: ["English", "Kannada", "Tulu"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "10 AM – 6 PM", photo: "",
    bio: "Dr. Shetty leads the NICU and the well-baby clinic.", focus: ["Newborn care", "Vaccination", "Child development"] },
  { id: "sanjay-menon", name: "Dr. Sanjay Menon", dept: "general-medicine", role: "Consultant, Internal Medicine & Diabetology", quals: "MBBS, MD (Medicine)", exp: 14, langs: ["English", "Malayalam", "Hindi"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "9 AM – 5 PM", photo: "",
    bio: "Dr. Menon manages complex diabetes and long-term multi-condition care.", focus: ["Diabetes", "Hypertension", "Infections"] },
  { id: "ayesha-siddiqui", name: "Dr. Ayesha Siddiqui", dept: "pulmonology", role: "Consultant Pulmonologist", quals: "MBBS, MD (Pulmonary Medicine)", exp: 9, langs: ["English", "Hindi", "Urdu"], days: ["Tue", "Thu", "Sat"], time: "10 AM – 3 PM", photo: "",
    bio: "Dr. Siddiqui runs the sleep lab and the asthma & COPD clinic.", focus: ["Asthma", "Sleep apnoea", "Interventional pulmonology"] },
  { id: "rahul-deshpande", name: "Dr. Rahul Deshpande", dept: "nephro-uro", role: "Consultant Nephrologist", quals: "MBBS, MD, DM (Nephrology)", exp: 11, langs: ["English", "Marathi", "Hindi"], days: ["Mon", "Tue", "Wed", "Thu", "Fri"], time: "11 AM – 5 PM", photo: "",
    bio: "Dr. Deshpande oversees the dialysis unit and kidney transplant work-ups.", focus: ["Dialysis", "CKD", "Transplant evaluation"] },
  { id: "nikhil-varma", name: "Dr. Nikhil Varma", dept: "gastro", role: "Consultant Gastroenterologist", quals: "MBBS, MD, DM (Gastroenterology)", exp: 13, langs: ["English", "Hindi", "Telugu"], days: ["Mon", "Wed", "Thu", "Sat"], time: "10 AM – 4 PM", photo: "",
    bio: "Dr. Varma performs advanced therapeutic endoscopy including ERCP.", focus: ["Endoscopy", "Liver disease", "ERCP"] },
  { id: "lakshmi-narayan", name: "Dr. Lakshmi Narayan", dept: "diagnostics", role: "Head, Radiology", quals: "MBBS, MD (Radiodiagnosis)", exp: 15, langs: ["English", "Kannada", "Tamil"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "8 AM – 4 PM", photo: "",
    bio: "Dr. Narayan leads CT, MRI and interventional radiology.", focus: ["MRI", "CT", "Interventional radiology"] },
  { id: "vikram-joshi", name: "Dr. Vikram Joshi", dept: "cardiology", role: "Consultant Cardiologist", quals: "MBBS, MD, DNB (Cardiology)", exp: 8, langs: ["English", "Hindi"], days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], time: "4 PM – 8 PM", photo: "",
    bio: "Dr. Joshi runs the evening cardiac OPD and the heart-failure clinic.", focus: ["Echocardiography", "Heart failure", "Hypertension"] },
  { id: "imran-pasha", name: "Dr. Imran Pasha", dept: "orthopaedics", role: "Consultant, Spine & Sports Medicine", quals: "MBBS, MS (Ortho), Fellowship in Spine Surgery", exp: 9, langs: ["English", "Kannada", "Urdu"], days: ["Mon", "Tue", "Thu", "Fri", "Sat"], time: "11 AM – 6 PM", photo: "",
    bio: "Dr. Pasha treats sports injuries and performs minimally invasive spine surgery.", focus: ["Spine surgery", "ACL reconstruction", "Sports injuries"] }
];

/* TODO: confirm prices & inclusions */
export const PACKAGES = [
  { id: "essential", name: "Essential", price: 1499, mrp: 2400, tests: 34, for: "Adults under 35 · yearly baseline",
    includes: ["Complete blood count", "Fasting blood sugar", "Lipid profile", "Liver & kidney function", "Urine routine", "Physician consultation"] },
  { id: "executive", name: "Executive", price: 3999, mrp: 6500, tests: 70, featured: true, for: "Working professionals 35+",
    includes: ["Everything in Essential", "HbA1c & thyroid profile", "ECG & chest X-ray", "Ultrasound abdomen", "Vitamin D & B12", "Physician + dietitian consult"] },
  { id: "heart", name: "Heart Plus", price: 5999, mrp: 9200, tests: 56, for: "Family history or heart-risk factors",
    includes: ["Cardiac risk markers", "ECG & 2D Echo", "TMT stress test", "HbA1c & lipid profile", "Chest X-ray", "Cardiologist consultation"] },
  { id: "women", name: "Her Health", price: 4499, mrp: 7000, tests: 62, for: "Women 25+",
    includes: ["CBC, thyroid & sugar", "Pap smear", "Pelvic ultrasound", "Breast exam / mammogram (40+)", "Vitamin D & iron studies", "Gynaecologist consultation"] },
  { id: "senior", name: "Silver Years", price: 4999, mrp: 8200, tests: 74, for: "Adults 60+",
    includes: ["Full blood panel", "ECG & 2D Echo", "Bone density scan", "Kidney & liver panel", "Eye & hearing check", "Geriatric consultation"] },
  { id: "diabetes", name: "Sugar Smart", price: 1999, mrp: 3200, tests: 28, for: "Diabetic or pre-diabetic",
    includes: ["Fasting & post-meal sugar", "HbA1c", "Kidney function & microalbumin", "Lipid profile", "Foot & eye screening", "Diabetologist consultation"] }
];

/* Patient journey (home + patient guide) */
export const JOURNEY = [
  { title: "Book in a minute", text: "Pick a speciality or doctor online, on WhatsApp or by phone. No login needed." },
  { title: "Arrive, skip the queue", text: "Your file is ready at the front desk. Pre-booked patients go straight to the doctor's floor." },
  { title: "One team, one plan", text: "Specialists, lab and imaging share your records, so you're never repeating your story." },
  { title: "Home, not alone", text: "Digital reports, follow-up reminders and a care coordinator you can reach on WhatsApp." }
];

/* Only real, consented reviews. Section hides itself while empty. */
export const TESTIMONIALS = [
  // { quote: "...", name: "First name L.", context: "Knee replacement, 2026" }
];

export const FAQ = [
  { q: "Do I need an appointment for the OPD?", a: "Walk-ins are welcome, but booked patients are seen first. Booking takes under a minute online or on WhatsApp." },
  { q: "Is cashless insurance available?", a: "Yes. We work with major insurers and TPAs. Bring your policy card and photo ID; our insurance desk handles pre-authorisation." },
  { q: "What should I bring for my first visit?", a: "A photo ID, previous prescriptions and reports, a list of current medicines and your insurance card if you have one." },
  { q: "How do I get my lab reports?", a: "Reports are sent to your registered mobile number and can be collected from the lab counter." },
  { q: "What are the visiting hours?", a: "General wards: 11 AM – 1 PM and 5 PM – 7 PM. ICU visits are limited to one attendant at set times; please ask the nursing station." },
  { q: "Is there parking?", a: "Yes, on-site parking is available for patients and visitors, with drop-off right at the emergency entrance." }
];

/* Seasonal campaigns. Auto-activate by date (MM-DD, inclusive) unless the visitor picks another. */
export const SEASONS = [
  { id: "pink", name: "Pink October", from: "10-01", to: "10-31", accent: "#d6336c",
    banner: "October is Breast Cancer Awareness Month. Book a screening mammogram at a special price.", link: "/packages.html#women" },
  { id: "diwali", name: "Festival of Lights", from: "11-05", to: "11-12", accent: "#d97706",
    banner: "Have a safe Diwali. Our burns & eye emergency team is on call 24/7.", link: "/emergency.html" },
  { id: "heart", name: "World Heart Day", from: "09-22", to: "09-30", accent: "#dc2626",
    banner: "World Heart Day: get a Heart Plus check-up at a special price this week.", link: "/packages.html#heart" },
  { id: "winter", name: "Winter Wellness", from: "12-15", to: "01-15", accent: "#2563eb",
    banner: "Flu season is here. Walk-in flu vaccination, Mon–Sat.", link: "/appointment.html?dept=general-medicine" }
];

export const POSTS = [
  { id: "heart-attack-signs", title: "Heart attack signs that don't look like heart attacks", dept: "cardiology", date: "2026-09-24", read: 4, img: "/img/stock/post-heart-attack-signs.webp",
    excerpt: "Chest pain isn't always the first sign. What women, diabetics and older adults should watch for, and what to do in the first hour.",
    body: ["A heart attack happens when blood flow to part of the heart muscle is blocked. The sooner treatment starts, the more muscle can be saved.",
      "## The classic signs", "Pressure or squeezing in the centre of the chest for more than a few minutes; pain spreading to the arm, jaw, neck or back; breathlessness, cold sweat or nausea.",
      "## The quiet signs", "Women, older adults and people with diabetes often feel only unusual tiredness, indigestion-like discomfort or breathlessness without pain.",
      "## What to do", "Call emergency services immediately and don't drive yourself. Reaching a hospital with a cath lab quickly makes the biggest difference."] },
  { id: "monsoon-fevers", title: "Dengue, malaria or viral? Reading a monsoon fever", dept: "general-medicine", date: "2026-09-08", read: 5, img: "/img/stock/post-monsoon-fevers.webp",
    excerpt: "Monsoon fevers start the same way. When to get tested, which painkillers to avoid and the danger signs that need emergency care.",
    body: ["Rainy months bring a spike in mosquito-borne and water-borne infections. Many begin with the same fever and body ache, so testing is the only reliable way to know.",
      "## See a doctor if", "Fever lasts more than two days, is very high, or comes with severe body pain, rash, vomiting or weakness.",
      "## Dengue danger signs", "Bleeding gums or nose, black stools, severe belly pain, persistent vomiting or drowsiness need emergency care, often just as the fever settles.",
      "## Prevention", "Clear standing water, use repellent and nets, drink safe water, and avoid ibuprofen or aspirin during a suspected dengue fever."] },
  { id: "knee-pain", title: "Knee pain: when to move more and when to see a specialist", dept: "orthopaedics", date: "2026-08-21", read: 4, img: "/img/stock/post-knee-pain.webp",
    excerpt: "Most knee pain improves with the right exercise. A few signs mean it's time for an orthopaedic opinion.",
    body: ["Strengthening the muscles around the knee often helps more than rest.",
      "## Usually helpful", "Straight-leg raises, cycling, swimming and quadriceps work. Start gently and stop if pain sharpens.",
      "## See a specialist if", "Your knee locks or gives way, swells after an injury, can't take weight, or pain wakes you at night for weeks.",
      "## Options", "Physiotherapy and weight management come first, then injections, arthroscopy and, for advanced arthritis, joint replacement."] },
  { id: "pregnancy-first-trimester", title: "Your first trimester, week by week", dept: "obgyn", date: "2026-08-06", read: 6, img: "/img/stock/post-pregnancy-first-trimester.webp",
    excerpt: "Scans, supplements, food and the symptoms that are normal and the ones that aren't, in the first 12 weeks.",
    body: ["The first trimester is when the baby's organs form, so early care matters.",
      "## First visit", "Book your first antenatal visit as soon as you know. We'll confirm the pregnancy, date it with a scan and start folic acid if you haven't.",
      "## Normal", "Nausea, tiredness, breast tenderness and frequent urination are common.",
      "## Call us if", "You have heavy bleeding, severe one-sided pain, high fever, or vomiting that stops you keeping fluids down."] },
  { id: "diabetes-plate", title: "The Indian diabetes plate, simplified", dept: "general-medicine", date: "2026-07-22", read: 5, img: "/img/stock/post-diabetes-plate.webp",
    excerpt: "You don't have to give up rice or roti. Portions, swaps and timing that keep sugar steady.",
    body: ["Managing diabetes is about balance and timing, not bans.",
      "## Build the plate", "Half vegetables, a quarter protein (dal, paneer, eggs, fish, chicken), a quarter whole grains or millets.",
      "## Smart swaps", "Whole fruit over juice, buttermilk over soft drinks, roasted over fried snacks, ragi and jowar over refined flour.",
      "## Habits", "Eat at regular times, walk 10–15 minutes after meals and check HbA1c every three months."] },
  { id: "child-fever", title: "Child has a fever? A calm parent's checklist", dept: "paediatrics", date: "2026-07-09", read: 3, img: "/img/stock/post-child-fever.webp",
    excerpt: "Most childhood fevers are harmless. Here's how to keep your child comfortable and when to come in.",
    body: ["Fever is the body's normal response to infection. How your child looks and behaves matters more than the number.",
      "## At home", "Offer fluids often, dress them lightly and use paracetamol at the dose for their weight.",
      "## Come in now if", "Your baby is under 3 months with any fever, or your child is unusually drowsy, breathing fast, has a rash that doesn't fade when pressed, or shows signs of dehydration."] }
];

/* The hospital's own photography (public/img/lumi). Each has -sm.webp (760px) and .webp (1800px). */
const P = (id, alt, caption, cat, extra = {}) => ({ id, src: `/img/lumi/${id}.webp`, sm: `/img/lumi/${id}-sm.webp`, alt, caption, cat, ...extra });
export const PHOTOS = [
  P("exterior", "Front of Lumi Hospital with the main entrance and the 24/7 emergency entrance", "Main entrance & 24/7 emergency", "Building", { w: 1600, h: 1059 }),
  P("exterior-tall", "Lumi Hospital building with its glass stairwell and ambulance bay", "Our building", "Building", { w: 1059, h: 1600 }),
  P("exterior-2", "Lumi Hospital seen from the street", "From the street", "Building", { w: 1600, h: 1059 }),
  P("emergency-entrance", "Dedicated 24/7 emergency entrance with ramp access", "Emergency entrance, ramp access", "Emergency", { w: 1059, h: 1600 }),
  P("ambulance", "Lumi Hospital ambulance parked at the hospital", "Ambulance on standby", "Emergency", { w: 1600, h: 1059 }),
  P("reception", "Reception desk with natural light at Lumi Hospital", "Reception", "Patient areas", { w: 1600, h: 1059 }),
  P("opd", "Glass-fronted OPD consultation rooms", "OPD consultation rooms", "Patient areas", { w: 1600, h: 1059 }),
  P("ward", "General ward with curtained bays", "General ward", "Wards", { w: 1600, h: 1059 }),
  P("ward-bed", "Ward bed with oxygen and monitoring at the bedside", "Bedside oxygen & monitoring", "Wards", { w: 1600, h: 1059 }),
  P("ward-care", "A patient's attendant seated in a curtained ward bay", "Room for family at the bedside", "Wards", { w: 1600, h: 1059 }),
  P("icu", "Intensive care unit beds with patient monitors and ventilator", "Intensive Care Unit", "Critical care", { w: 1600, h: 1059 }),
  P("icu-ward", "Intensive care unit with multiple monitored beds", "ICU: monitored beds", "Critical care", { w: 1600, h: 1059 }),
  P("icu-sign", "Entrance to the Lumi Hospital Intensive Care Unit", "ICU entrance", "Critical care", { w: 1600, h: 1059 }),
  P("nicu", "Entrance to the Lumi Hospital Neonatal Intensive Care Unit", "Neonatal ICU", "Critical care", { w: 1600, h: 1059 }),
  P("ot", "Modular operation theatre with surgical lights and anaesthesia workstation", "Modular operation theatre", "Surgery", { w: 1600, h: 1059 }),
  P("ot-2", "Operation theatre with ceiling-mounted surgical light", "Operation theatre", "Surgery", { w: 1600, h: 1059 }),
  P("ot-tall", "Operation theatre table under twin surgical lights", "Twin-dome surgical lighting", "Surgery", { w: 1059, h: 1600 }),
  P("lab", "In-house diagnostic laboratory with analysers", "In-house laboratory", "Diagnostics", { w: 1600, h: 1059 })
];
export const photo = id => PHOTOS.find(p => p.id === id);
