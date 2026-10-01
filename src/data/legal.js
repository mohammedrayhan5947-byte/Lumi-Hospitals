/* =====================================================================
   LUMI HOSPITAL: LEGAL PAGES CONTENT
   Rendered by src/js/legal-page.js. Facts come from BIZ / BIZ.legal in site.js
   via {{tokens}}; an empty value renders as "[to be provided by the hospital]".
   Block types: "text" (paragraph), ["ul", [...]], ["ol", [...]], ["dl", [[term, def], ...]],
   ["table", { head: [...], rows: [[...], ...] }], ["note", text, tone?], ["h3", text].
   Sources and reasoning: docs/legal-compliance.md. Have counsel review before launch.
   ===================================================================== */

export const LEGAL_VERSION = "2026-10-01"; // bump when any notice changes (re-shows the consent banner)

const DPDP = "Digital Personal Data Protection Act, 2023 (DPDP Act)";

/* ------------------------------ PRIVACY ------------------------------ */
export const PRIVACY = {
  updated: "2026-10-01",
  crumb: "Privacy notice",
  title: "Your data, <em>your</em> say.",
  lead: "How {{name}} collects, uses, shares and protects your personal and health information, and how you stay in control of it. Written in plain language under the " + DPDP + ".",
  sections: [
    { id: "glance", label: "At a glance", body: [
      ["note", "This website does not store what you type into its forms. When you send a form, your own WhatsApp or email app opens with the message, and it is sent to us only when you press send in that app. At the hospital itself, we handle your health records under strict medical confidentiality."],
      ["ul", [
        "We collect only what we need to book, treat, bill and follow up with you.",
        "We never sell your data, and we never use your health data for advertising.",
        "You can ask to see, correct or erase your data, withdraw consent, or nominate someone, using the <a href=\"/grievance.html#request\">data request form</a>.",
        "Questions go to our Data Protection Officer at {{dpo.email}}."
      ]]
    ]},
    { id: "who", label: "Who we are", body: [
      "{{name}} is the Data Fiduciary for the personal data described here. This means we decide why and how it is processed.",
      ["dl", [
        ["Legal entity", "{{entity}}"],
        ["Registered address", "{{address}}"],
        ["KPME registration no.", "{{kpmeReg}}"],
        ["Data Protection Officer", "{{dpo.name}} · {{dpo.email}}"],
        ["Grievance Officer", "{{go.name}} · {{go.email}} · {{go.phone}}"]
      ]]
    ]},
    { id: "collect", label: "What we collect", body: [
      ["h3", "When you use this website"],
      ["table", { head: ["Data", "Why", "Basis", "Kept for"], rows: [
        ["Name, mobile, email and message you type into a form", "To reply, book or confirm an appointment", "Your consent (tick box on the form)", "Not stored on the website. Kept in our WhatsApp or email system for as long as needed to handle your request, then for at least 1 year as a record of processing (DPDP Rules, r.8(3))"],
        ["Speciality, doctor, preferred date, symptoms or reason for visit (may include health information)", "To route you to the right doctor and prepare your visit", "Your consent", "As above. Moved into your medical record if you become our patient"],
        ["Display preferences (theme, colours, accessibility settings, list or grid view) and your privacy choice", "To remember how you like the site to look", "Strictly necessary. Stored only on your device", "Until you clear your browser storage"],
        ["Technical data your browser sends (IP address, device, browser, pages requested)", "To deliver and secure the website", "Legitimate use / security", "Server logs for up to 1 year, kept by our hosting provider: {{hosting}}"]
      ]}],
      ["h3", "When you are our patient"],
      ["table", { head: ["Data", "Why", "Basis", "Kept for"], rows: [
        ["Identity and contact details, ID document, emergency contact", "Registration, identification, safety", "Consent; legal obligation", "As long as your medical record"],
        ["Medical history, examinations, test results, images, prescriptions, procedures and discharge summaries", "Diagnosis, treatment, continuity of care", "Consent; medical emergency where applicable", "As required by law and our records policy: {{retention}}"],
        ["Insurance, TPA and payment details", "Billing, cashless claims, refunds", "Consent; contract", "As required under tax and insurance law"],
        ["CCTV in public areas of the hospital", "Safety and security of patients and staff", "Legitimate use", "{{cctv}}"]
      ]}],
      "We do not knowingly collect data we don't need. Please don't send us copies of ID documents or reports over WhatsApp unless a coordinator asks you to."
    ]},
    { id: "purposes", label: "How we use it", body: [
      "We use your data only for the purpose we told you about when we collected it, or for a purpose the law allows:",
      ["ul", [
        "Booking, rescheduling and reminding you about appointments and health check-ups",
        "Diagnosis, treatment, nursing and follow-up care by the team treating you",
        "Sharing reports with you and with the doctors you are referred to",
        "Billing, insurance pre-authorisation and claims",
        "Meeting legal duties, for example notifying certain diseases to public health authorities, medico-legal cases, and PC-PNDT records",
        "Improving the quality and safety of care, using de-identified data wherever possible"
      ]],
      "Under section 7 of the DPDP Act we may also process data without fresh consent in certain situations: to respond to a medical emergency that threatens your life or health, to provide treatment during an epidemic or other public-health threat, to comply with a law or court order, or where you have voluntarily given us data for a stated purpose.",
      ["note", "We will ask for your consent again, separately, before using your data for anything new, such as research or health newsletters. Saying no will never affect your treatment."]
    ]},
    { id: "share", label: "Who we share with", body: [
      ["ul", [
        "<b>Your care team</b>: doctors, nurses, lab and imaging staff involved in your care.",
        "<b>Insurers and TPAs</b>: only when you ask us to process a claim.",
        "<b>Service providers (Data Processors)</b>: who handle data for us under contract with security safeguards. These are hospital information system, laboratory system, cloud hosting, and messaging (WhatsApp Business / email). Current list: {{processors}}.",
        "<b>Government and regulators</b>: when the law requires it, for example public health authorities, the police in medico-legal cases, or the PC-PNDT appropriate authority.",
        "<b>Someone you authorise</b>: a family member, nominee or legal representative you name."
      ]],
      "Some providers, such as WhatsApp and Google Maps, may process data outside India. We transfer data abroad only as section 16 of the DPDP Act allows.",
      "The map on our <a href=\"/contact.html\">contact page</a> is embedded from Google Maps. Google may set its own cookies when it loads. WhatsApp messages are also subject to WhatsApp's own privacy policy."
    ]},
    { id: "storage", label: "Cookies & device storage", body: [
      "This website does not use advertising or analytics cookies. It stores a few small settings in your browser. They never leave your device:",
      ["table", { head: ["Name", "Type", "Purpose"], rows: [
        ["lumi-theme", "Local storage", "Your light/dark mode, colour theme and accessibility settings"],
        ["lumi-dept-view", "Local storage", "Whether you prefer the list or grid view of specialities"],
        ["lumi-consent", "Local storage", "Your privacy choice, so we don't ask again"],
        ["lumi-pl", "Session storage", "Shows the opening animation only once per visit"]
      ]}],
      "If we ever add analytics, we will ask for your consent first and list it here. You can review your choice at any time from <b>Privacy choices</b> in the footer."
    ]},
    { id: "keep", label: "How long we keep it", body: [
      "We keep personal data only for as long as the purpose needs it, and then erase it, unless a law requires us to keep it longer.",
      ["ul", [
        "Medical records: for the period required by medical regulations (at least 3 years for in-patient records under the IMC Regulations, 2002) and our records policy: {{retention}}.",
        "Pre-natal diagnostic records: at least 2 years, as the PC-PNDT Rules require.",
        "Website enquiries that do not become appointments: deleted from our messaging systems once handled, keeping a minimal log for 1 year.",
        "Processing logs: at least 1 year, as the DPDP Rules require."
      ]]
    ]},
    { id: "security", label: "How we protect it", body: [
      "We apply reasonable security safeguards, as required by Rule 6 of the DPDP Rules and the IT (Reasonable Security Practices) Rules, 2011:",
      ["ul", [
        "Access to health records only for staff who need it, with individual logins",
        "Encryption of data in transit and, where supported, at rest",
        "Logging and review of access to detect misuse",
        "Backups, so care can continue if a system fails",
        "Written contracts requiring our processors to protect your data",
        "Staff confidentiality undertakings and regular training"
      ]],
      ["h3", "If something goes wrong"],
      "If a personal data breach affects you, we will tell you without delay. We will explain what happened, the likely impact, what we are doing about it, and what you can do. We will also inform the Data Protection Board of India, with a detailed report within 72 hours."
    ]},
    { id: "rights", label: "Your rights", body: [
      ["dl", [
        ["Access", "Get a summary of the personal data we hold about you, how we use it, and who we have shared it with (s.11)."],
        ["Correction & erasure", "Have inaccurate or incomplete data corrected, completed or updated, and data we no longer need erased (s.12). We may keep medical records the law requires us to keep."],
        ["Withdraw consent", "Withdraw consent as easily as you gave it (s.6(4)). Withdrawal does not affect processing already done, or care that the law or a medical emergency requires."],
        ["Nominate", "Name someone to exercise your rights if you die or become unable to (s.14)."],
        ["Grievance redressal", "Complain to our Grievance Officer, and if you are not satisfied, to the Data Protection Board of India (s.13)."]
      ]],
      "You can exercise these rights through our <a href=\"/grievance.html#request\">data request form</a> or by emailing {{dpo.email}}. We acknowledge requests within 2 working days and aim to resolve them within 30 days. We will always respond within 90 days, the maximum the DPDP Rules allow. To protect you, we may need to verify your identity first.",
      "Copies of your own medical records are a separate right under the Charter of Patients' Rights: within 24 hours during admission and within 72 hours after discharge. See <a href=\"/patient-rights.html#records\">Patient rights</a>.",
      ["note", "Your duties under section 15 of the DPDP Act: give accurate information, don't impersonate anyone, and don't file false or frivolous complaints."]
    ]},
    { id: "children", label: "Children & guardians", body: [
      "If a patient is under 18, or is a person with a disability who has a lawful guardian, we ask the parent or lawful guardian to give consent on their behalf. We verify the guardian's identity at registration.",
      "Under the Fourth Schedule of the DPDP Rules, a hospital may process a child's data without separate verifiable parental consent only to provide health services to that child, and only as far as needed to protect the child's health. We never track children or target them with advertising.",
      "Website forms for a child must be filled in by a parent or guardian."
    ]},
    { id: "changes", label: "Changes & language", body: [
      "We will update this notice when our practices or the law change, and show the new date at the top. We will tell you about significant changes before they take effect.",
      "You can ask for this notice in Kannada or another language listed in the Eighth Schedule to the Constitution. {{kannada}}",
      ["note", "The DPDP Rules, 2025 were notified on 13 November 2025. Most of their duties take effect on 13 May 2027, but we already follow them. Until then, the Information Technology Act, 2000 (section 43A) and the SPDI Rules, 2011 also apply to how we handle your sensitive personal data, including health information."]
    ]},
    { id: "contact", label: "Contact & complaints", body: [
      ["dl", [
        ["Data Protection Officer", "{{dpo.name}} · <a href=\"mailto:{{dpo.email}}\">{{dpo.email}}</a>"],
        ["Grievance Officer", "{{go.name}} · <a href=\"mailto:{{go.email}}\">{{go.email}}</a> · {{go.phone}}"],
        ["Postal address", "{{entity}}, {{address}}"]
      ]],
      "If we haven't resolved your grievance, you may complain to the Data Protection Board of India through the channels published by the Ministry of Electronics and Information Technology (<a href=\"https://www.meity.gov.in/data-protection-framework\" target=\"_blank\" rel=\"noopener\">meity.gov.in</a>)."
    ]}
  ]
};

/* ------------------------------- TERMS ------------------------------- */
export const TERMS = {
  updated: "2026-10-01",
  crumb: "Terms of use",
  title: "Terms of <em>use</em>",
  lead: "The rules for using the {{name}} website. By using this site, you agree to these terms. They never reduce your rights under the Consumer Protection Act, 2019.",
  sections: [
    { id: "about", label: "About these terms", body: [
      "This website is operated by {{entity}} (\"{{name}}\", \"we\"), a private medical establishment registered under the Karnataka Private Medical Establishments Act, 2007 (registration no. {{kpmeReg}}), at {{address}}. GSTIN: {{gstin}}.",
      "These terms cover your use of this website only. Treatment at the hospital is governed by the consent forms, estimates and policies you receive there."
    ]},
    { id: "info", label: "Health information", body: [
      "The content here is general information. It is not medical advice, diagnosis or treatment, and reading it does not create a doctor–patient relationship. Please read our <a href=\"/disclaimer.html\">medical disclaimer</a>.",
      ["note", "Do not use this website, its forms or WhatsApp for emergencies. Call our emergency line {{emergency}}, or 112 / 108.", "danger"]
    ]},
    { id: "appointments", label: "Appointments", body: [
      ["ul", [
        "A form or WhatsApp message is a <b>request</b>. An appointment is confirmed only when our team confirms it with you.",
        "Doctor availability and OPD timings can change at short notice for clinical reasons. We will try to tell you in advance.",
        "Please arrive on time and bring the documents listed in our <a href=\"/patient-guide.html#before\">patient guide</a>.",
        "To reschedule or cancel, message or call us as early as you can."
      ]]
    ]},
    { id: "prices", label: "Prices & payments", body: [
      "Prices shown for health check-ups and services are indicative, in Indian rupees, and inclusive of applicable taxes unless stated otherwise. The rate list displayed at the hospital under the KPME Act is the final reference: {{rates}}.",
      "Before any planned procedure you will receive a written cost estimate, and you will be told about changes that may affect it. On completion you are entitled to an itemised bill.",
      "We do not take payments on this website."
    ]},
    { id: "use", label: "Using the site", body: [
      "You agree not to:",
      ["ul", [
        "Submit false information or someone else's details without their permission",
        "Use the site to harass, defame or impersonate anyone",
        "Try to disrupt, overload or gain unauthorised access to the site",
        "Copy or scrape content for commercial use without our written permission"
      ]]
    ]},
    { id: "ip", label: "Content & trademarks", body: [
      "The name {{name}}, the logo and the site's text, design and images belong to us or our licensors. You may share links and quote short passages with credit. Health journal articles may not be republished without permission."
    ]},
    { id: "links", label: "Third-party services", body: [
      "The site links to or embeds services we don't control, such as WhatsApp, Google Maps and email providers. Their own terms and privacy policies apply. We are not responsible for their content or availability."
    ]},
    { id: "liability", label: "Our responsibility", body: [
      "We work to keep the information on this site accurate and current, but it may occasionally be incomplete or out of date. To the extent the law allows, we are not liable for loss arising only from relying on general website content instead of seeking medical advice.",
      "Nothing in these terms limits our responsibility for the care we provide, or your rights as a consumer or patient under Indian law."
    ]},
    { id: "disputes", label: "Complaints & disputes", body: [
      "Please tell us first, through our <a href=\"/grievance.html\">grievance page</a>. We acknowledge complaints within 2 working days and respond in writing within 15 days.",
      "You can also approach the National Consumer Helpline (1915 or <a href=\"https://consumerhelpline.gov.in\" target=\"_blank\" rel=\"noopener\">consumerhelpline.gov.in</a>), file a complaint before a Consumer Commission through <a href=\"https://edaakhil.nic.in\" target=\"_blank\" rel=\"noopener\">e-Daakhil</a>, or use the grievance mechanism under the KPME Act.",
      "These terms are governed by the laws of India. Subject to your statutory rights, the courts at {{jurisdiction}} have jurisdiction."
    ]},
    { id: "changes", label: "Changes", body: [
      "We may update these terms. The date at the top shows the latest version. Continuing to use the site after a change means you accept the updated terms."
    ]}
  ]
};

/* ----------------------------- DISCLAIMER ---------------------------- */
export const DISCLAIMER = {
  updated: "2026-10-01",
  crumb: "Medical disclaimer",
  title: "Read this <em>first</em>.",
  lead: "What the health information on this website can and can't do for you, and what to do in an emergency.",
  sections: [
    { id: "emergency", label: "Emergencies", body: [
      ["note", "If you or someone near you has chest pain, difficulty breathing, signs of stroke, severe bleeding, a serious injury or is unconscious, <b>call {{emergency}} (our 24/7 emergency line) or 112 / 108 now.</b> Do not wait for a reply to a form, email or WhatsApp message.", "danger"],
      "Every hospital in India must give emergency care to stabilise a patient without first asking for payment, as the Supreme Court held in <i>Parmanand Katara v. Union of India</i> (1989). Our emergency department follows this."
    ]},
    { id: "general", label: "General information only", body: [
      "Articles, department pages, FAQs and other content on this site are general health information written or reviewed by our clinicians. They are not a diagnosis, treatment plan or substitute for a consultation with a qualified doctor who knows your history.",
      "Don't start, stop or change any medicine or treatment because of something you read here. Talk to your doctor first.",
      "Reading this site, or messaging us through it, does not create a doctor–patient relationship."
    ]},
    { id: "outcomes", label: "No guarantees", body: [
      "Every patient is different. Results of tests, procedures and treatments vary with each person's condition. Nothing on this site is a promise or guarantee of a particular outcome or cure.",
      "As the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 requires, we do not claim to cure any disease, and we do not promote any remedy as \"magic\" or guaranteed. If you see wording on this site that sounds like such a claim, please <a href=\"/grievance.html\">tell us</a> so we can correct it."
    ]},
    { id: "doctors", label: "About our doctors", body: [
      "Doctor profiles show factual information only: name, qualifications, speciality, registration number, languages and OPD timings. This is permitted under the code of ethics for registered medical practitioners (Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, 2002).",
      "We do not publish ratings or comparisons, and we do not publish claims that a doctor is the \"best\". We publish patient stories only with the patient's written consent, and never to advertise a doctor.",
      "You can check any doctor's registration on the National Medical Register at <a href=\"https://www.nmc.org.in\" target=\"_blank\" rel=\"noopener\">nmc.org.in</a> or with the Karnataka Medical Council."
    ]},
    { id: "telemedicine", label: "Teleconsultation", body: [
      "Teleconsultation status: {{telemedicine}}. When we offer video, audio or chat consultations, they follow the Telemedicine Practice Guidelines, 2020:",
      ["ul", [
        "Consultations are given only by registered medical practitioners. The doctor's name, qualifications and registration number appear on every e-prescription.",
        "Both you and the doctor confirm identities at the start. For a minor, a parent or guardian must be present.",
        "Starting a teleconsultation means you consent to it. You can stop at any time and ask for an in-person visit.",
        "The doctor may decide that you need to be examined in person. Some medicines, including those under the NDPS Act and Schedule X, cannot be prescribed by teleconsultation.",
        "Teleconsultation is <b>not</b> for emergencies.",
        "Records of teleconsultations are kept and protected like any other medical record, as described in our <a href=\"/privacy.html\">privacy notice</a>."
      ]]
    ]},
    { id: "pcpndt", label: "Ultrasound & PC-PNDT", body: [
      ["note", "{{pcpndt}}", "danger"],
      "Our ultrasound facilities are registered under the Pre-Conception and Pre-Natal Diagnostic Techniques (Prohibition of Sex Selection) Act, 1994. Registration no.: {{pcpndtReg}}. Pregnancy scans are done only for medical reasons, with the forms the law requires."
    ]},
    { id: "prices", label: "Prices & availability", body: [
      "Prices, packages, OPD days and services on this site are indicative and may change. The rate list displayed at the hospital, under the Karnataka Private Medical Establishments Act, 2007, prevails. Please confirm before your visit."
    ]},
    { id: "links", label: "External links", body: [
      "Links to other websites are provided for convenience. We don't control or endorse their content."
    ]}
  ]
};

/* --------------------------- PATIENT RIGHTS -------------------------- */
/* Charter of Patients' Rights and Responsibilities (NHRC; adopted by MoHFW 2019) +
   KPME Act s.11A Patients' Charter. Plain-language restatement. */
export const RIGHTS = [
  { id: "information", title: "Information", text: "To know your diagnosis, the tests and treatment proposed, and the possible complications, explained in a language you understand. To receive a written estimate of costs and to be told in writing if it changes. To know the name and role of everyone caring for you, and which doctor is responsible." },
  { id: "records", title: "Records and reports", text: "To get copies of your case papers, records and reports: within 24 hours while admitted and within 72 hours after discharge, for a reasonable copying fee. Your family receives a discharge summary, or a death summary, with original investigation reports." },
  { id: "emergency", title: "Emergency care", text: "To receive emergency care promptly, without being asked to pay or deposit money first." },
  { id: "consent", title: "Informed consent", text: "To be asked for your informed consent before any major test or treatment, such as surgery or chemotherapy, after its risks, benefits and alternatives have been explained to you." },
  { id: "privacy", title: "Confidentiality, dignity and privacy", text: "To have your information kept confidential and shared only with your consent or where the law requires. Female patients have the right to have a female person present during a physical examination by a male practitioner." },
  { id: "second-opinion", title: "Second opinion", text: "To seek a second opinion from a doctor of your choice. We will provide the records you need, without any change in the care you receive here." },
  { id: "rates", title: "Transparency in rates", text: "To see the rates for each service and facility, displayed at the hospital, and to receive an itemised bill with an explanation of every charge." },
  { id: "non-discrimination", title: "Non-discrimination", text: "To receive care without discrimination because of illness or condition (including HIV status), religion, caste, ethnicity, gender, age, sexual orientation, language, place of origin, or social or economic status." },
  { id: "safety", title: "Safety and quality care", text: "To be cared for in a clean, safe environment that follows infection-control practices and accepted standards of care, and to seek redress if you believe care was negligent." },
  { id: "options", title: "Choose treatment options", text: "To choose between available treatment options after hearing about them, and to refuse treatment or leave against medical advice, after being told the consequences." },
  { id: "pharmacy", title: "Choose your pharmacy or lab", text: "To buy prescribed medicines from any registered pharmacy, and to have tests done at any registered laboratory, of your choice." },
  { id: "referral", title: "Proper referral and transfer", text: "To continuity of care. If you need to move to another facility, you have the right to an explanation of why, and to a transfer arranged safely, with your records sent along." },
  { id: "trials", title: "Protection in clinical trials", text: "If you are invited into a clinical trial: to full information, to say no without affecting your care, to withdraw at any time, and to compensation for trial-related injury, as the law provides." },
  { id: "research", title: "Protection in research", text: "To dignity, privacy and confidentiality if you take part in biomedical or health research, under national ethical guidelines." },
  { id: "discharge", title: "Discharge and release of the deceased", text: "Not to be detained in the hospital because of a billing dispute. Likewise, the body of a patient who has died cannot be held back over payment." },
  { id: "education", title: "Patient education", text: "To learn about your condition, healthy living, your rights and responsibilities, government health insurance schemes you may be eligible for, and how to raise a concern." },
  { id: "heard", title: "To be heard and seek redress", text: "To give feedback or complain, and to receive a registration number for your complaint and a written outcome within 15 days." }
];

export const RESPONSIBILITIES = [
  "Share complete, honest information about your health, medicines and history, so we can diagnose and treat you safely.",
  "Cooperate during examination, tests and treatment, and follow the plan you have agreed with your doctor, or tell us if you can't.",
  "Keep to appointment times, cooperate with staff and other patients, avoid disturbing others, and help keep the hospital clean.",
  "Respect the dignity of doctors and staff. Whatever the grievance, never resort to violence or damage property.",
  "Take responsibility for the choices you make about your treatment, including refusing it, once the consequences have been explained to you."
];

/* ------------------------------ GRIEVANCE ---------------------------- */
export const REQUEST_TYPES = [
  { id: "access", label: "Access my data", hint: "A summary of the personal data we hold and who we've shared it with" },
  { id: "correction", label: "Correct or update", hint: "Fix inaccurate, incomplete or outdated details" },
  { id: "erasure", label: "Erase my data", hint: "Delete data we no longer need (legally required records are kept)" },
  { id: "withdraw", label: "Withdraw consent", hint: "Stop a use you agreed to, such as reminders or messages" },
  { id: "nomination", label: "Nominate someone", hint: "Who may act for you if you die or become unable to" },
  { id: "complaint", label: "Make a complaint", hint: "About your care, our staff, billing, privacy or this website" }
];

export const TIMELINES = [
  ["Acknowledgement with a reference number", "Within 2 working days"],
  ["Complaint about care or service: written outcome", "Within 15 days"],
  ["Copies of medical records", "24 hours while admitted · 72 hours after discharge"],
  ["Data request (access, correction, erasure, withdrawal, nomination)", "Usually within 30 days, and always within 90 days"],
  ["Personal data breach affecting you", "We tell you without delay"]
];

export const ESCALATION = [
  ["Data Protection Board of India", "For data-protection grievances not resolved by us (DPDP Act, s.13(3)).", "https://www.meity.gov.in/data-protection-framework"],
  ["KPME grievance redressal", "District-level grievance redressal committees under the Karnataka Private Medical Establishments Act, 2007 (as amended in 2017).", ""],
  ["Consumer Commission", "National Consumer Helpline 1915, or file online through e-Daakhil.", "https://edaakhil.nic.in"],
  ["Karnataka Medical Council", "For concerns about a doctor's professional conduct.", ""]
];
