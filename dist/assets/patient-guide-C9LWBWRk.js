import{B as e,D as t,K as n,N as r,P as i,R as a,U as o,b as s,q as c,t as l,v as u,x as d,y as f,z as p}from"./core-BNTx_ofm.js";import{n as m}from"./media-CVPoxGO6.js";var h=(t,n=`check`)=>`<ul class="pg-list">${t.map(t=>`<li>${e(n)}<span>${t}</span></li>`).join(``)}</ul>`,g=e=>`<ol class="pg-steps">${e.map(([e,t],n)=>`<li><span class="num">${r(n+1)}</span><div><h4>${e}</h4><p>${t}</p></div></li>`).join(``)}</ol>`,_=[{id:`before`,label:`Before your visit`,title:`Before your <em>visit</em>`,body:()=>`
    <p class="pg-intro">A little preparation makes the first consultation faster and far more useful. Bring the story of your health with you.</p>
    <div class="pg-split">
      <div class="pg-card"><span class="label">What to bring</span>
        ${h([`A photo ID (Aadhaar, passport, driving licence)`,`Previous prescriptions, discharge summaries and reports`,`A list of every medicine you take, with doses`,`Your insurance card or policy number, if you have one`])}</div>
      <div class="pg-card"><span class="label">Good to do</span>
        ${h([`Write down your symptoms and when they started`,`Note the questions you want to ask`,`Arrive 15 minutes early for a first visit`,`Bring someone along if you'd like support`],`info`)}</div>
    </div>
    <div class="pg-journey">${c.map((e,t)=>`<div class="pg-jstep"><span class="num">${r(t+1)}</span><h4>${e.title}</h4><p>${e.text}</p></div>`).join(``)}</div>`},{id:`opd`,label:`OPD & appointments`,title:`OPD &amp; <em>appointments</em>`,body:()=>`
    <p class="pg-intro">Walk-ins are welcome, but booked patients are seen first. Booking takes under a minute, with no login.</p>
    <dl class="pg-hours">
      <div><dt class="label">Outpatient clinics</dt><dd>${t(o.hours.opd)}</dd></div>
      <div><dt class="label">Sunday</dt><dd>${t(o.hours.sunday)}</dd></div>
    </dl>
    <div class="pg-ways">
      <a class="pg-way" href="/appointment.html"><span class="ic-badge">${e(`calendar`)}</span><span><b>Book online</b><small>Pick a speciality, doctor and slot</small></span>${e(`arrowUpRight`)}</a>
      <a class="pg-way" href="${p(`Hello, I'd like to book an appointment.`)}" target="_blank" rel="noopener"><span class="ic-badge">${e(`chat`)}</span><span><b>WhatsApp</b><small>A coordinator replies and confirms</small></span>${e(`arrowUpRight`)}</a>
      <a class="pg-way" href="${a(o.phone)}"><span class="ic-badge">${e(`phone`)}</span><span><b>Call reception</b><small>${t(o.phone)}</small></span>${e(`arrowUpRight`)}</a>
    </div>`},{id:`admission`,label:`Admission & discharge`,title:`Admission &amp; <em>discharge</em>`,body:()=>`
    <p class="pg-intro">Whether your stay is planned or follows an emergency, one admissions team guides you from the desk to the ward, and back home again.</p>
    <div class="pg-split">
      <div><span class="label">Admission</span>${g([[`Admission desk`,`Bring your doctor's admission advice, photo ID and insurance details. We'll explain the estimate before anything else.`],[`Insurance or deposit`,`For cashless stays the insurance desk starts pre-authorisation. Otherwise an advance deposit is collected.`],[`To your room`,`A nurse settles you in, checks your medicines and explains the plan for the day.`]])}</div>
      <div><span class="label">Discharge</span>${g([[`Doctor's clearance`,`Your consultant confirms you're ready and reviews your results with you.`],[`Summary & medicines`,`You receive a discharge summary, prescriptions and a follow-up date, explained in plain language.`],[`Billing & home`,`The billing desk settles the final bill or insurance claim. Ask us about anything you're unsure of.`]])}</div>
    </div>`},{id:`insurance`,label:`Insurance & cashless`,title:`Insurance &amp; <em>cashless</em>`,body:()=>`
    <p class="pg-intro">We work with leading insurers, TPAs and government schemes. Our insurance desk handles pre-authorisation so you can focus on getting better.</p>
    <ul class="pg-insurers" aria-label="Insurance partners">${o.insurers.map(e=>`<li>${t(e)}</li>`).join(``)}</ul>
    ${g([[`Show your card`,`Share your policy card and photo ID at the insurance desk on arrival, or as soon as you can after an emergency.`],[`Pre-authorisation`,`We send your doctor's plan to the insurer and keep you updated on approval.`],[`Settlement`,`Approved amounts are settled directly. You pay only what the policy doesn't cover.`]])}
    <p class="pg-note">${e(`info`)}<span>Don't see your insurer? Tie-ups change, so <a class="link" href="${p(`Hello, is my health insurance accepted for cashless treatment?`)}" target="_blank" rel="noopener">ask us on WhatsApp</a> before your visit.</span></p>`},{id:`visiting`,label:`Visiting hours`,title:`Visiting <em>hours</em>`,body:()=>`
    <p class="pg-intro">Visitors help patients heal. A few simple rules keep wards calm and protect those who are most vulnerable.</p>
    <dl class="pg-hours pg-hours--big">
      <div><dt class="label">General wards</dt><dd>${t(o.hours.visiting)}</dd></div>
      <div><dt class="label">ICU &amp; NICU</dt><dd>One attendant at set times. Please ask the nursing station.</dd></div>
      <div><dt class="label">Pharmacy</dt><dd>${t(o.hours.pharmacy)}</dd></div>
      <div><dt class="label">Emergency</dt><dd>Always open</dd></div>
    </dl>
    ${h([`Please keep to two visitors per patient at a time`,`Wash or sanitise your hands as you enter and leave`,`Postpone your visit if you have a cough, cold or fever`,`Children under 12 visit only with the nurse's approval`])}`},{id:`reports`,label:`Reports`,title:`Your <em>reports</em>`,body:()=>`
    <p class="pg-intro">No more coming back just to collect a piece of paper. Reports travel to you, and to every doctor who treats you here.</p>
    <div class="pg-split">
      <div class="pg-card"><span class="ic-badge">${e(`file`)}</span><h4>Lab reports</h4><p>Sent to your registered mobile number as soon as they're verified, and available at the lab counter. The lab runs ${t(o.hours.lab.toLowerCase())}.</p></div>
      <div class="pg-card"><span class="ic-badge">${e(`scan`)}</span><h4>Imaging</h4><p>CT, MRI, X-ray and ultrasound reports are shared digitally, with films or images on request at the imaging desk.</p></div>
    </div>
    <p class="pg-note">${e(`shield`)}<span>Reports are only shared with you or someone you authorise. Bring photo ID when collecting on someone's behalf.</span></p>`},{id:`facilities`,label:`Facilities`,title:`On-site <em>facilities</em>`,body:()=>`
    <div class="pg-photos">${m(`reception`,{sizes:`(max-width: 960px) 50vw, 30vw`})}${m(`ward-care`,{sizes:`(max-width: 960px) 50vw, 30vw`})}</div>
    <div class="pg-facs">
      ${[[`car`,`Parking`,`On-site parking for patients and visitors, with drop-off right at the emergency entrance.`],[`coffee`,`Cafeteria`,`Fresh, simple meals and hot drinks for patients' families and visitors.`],[`wifi`,`Wi-Fi`,`Free Wi-Fi in waiting areas and rooms. Ask at the front desk for access.`],[`pill`,`Pharmacy`,`In-house pharmacy, open ${t(o.hours.pharmacy.toLowerCase())}, stocked for what our doctors prescribe.`]].map(([t,n,r])=>`<div class="pg-fac"><span class="ic-badge">${e(t)}</span><h4>${n}</h4><p>${r}</p></div>`).join(``)}
    </div>`},{id:`rights`,label:`Rights & responsibilities`,title:`Rights &amp; <em>responsibilities</em>`,body:()=>`
    <p class="pg-intro">Good care is a partnership. Here is what you can always expect from us, and how you can help us care for you.</p>
    <div class="pg-split pg-rights">
      <div><h4>${e(`shield`)}You have the right to</h4>${h([`Respectful, dignified care regardless of background or ability to pay`,`Clear information about your condition, treatment options and their costs`,`Give or refuse informed consent before any procedure`,`Privacy and confidentiality of your medical records`,`Access copies of your records and reports`,`Seek a second opinion and raise a concern without fear`])}</div>
      <div><h4>${e(`users`)}We ask that you</h4>${h([`Share complete, honest information about your health and medicines`,`Follow the treatment plan you've agreed, or tell us if you can't`,`Respect staff, other patients and hospital property`,`Keep to visiting hours and infection-control guidance`,`Settle bills or insurance formalities on time`,`Tell us when something isn't right, so we can fix it`],`arrow`)}</div>
    </div>`},{id:`faq`,label:`FAQ`,title:`Frequently <em>asked</em>`,body:()=>s(n)}],v=()=>`
<nav class="pg-nav" aria-label="Guide sections">
  <span class="label pg-nav-title">In this guide</span>
  <ol>${_.map((e,n)=>`<li><a href="#${e.id}" data-spy="${e.id}"><span class="num">${r(n+1)}</span>${t(e.label)}</a></li>`).join(``)}</ol>
  <div class="pg-nav-help"><span class="label">Need help now?</span>
    <a href="${p(`Hello, I have a question about my visit.`)}" target="_blank" rel="noopener">${e(`chat`)}WhatsApp us</a>
    <a href="${a(o.emergency)}" class="is-em">${e(`ambulance`)}Emergency</a>
  </div>
</nav>`,y=()=>`
<section class="pg-body"><div class="container pg-layout">
  ${v()}
  <div class="pg-sections">
    ${_.map((e,n)=>`
    <section class="pg-sec" id="${e.id}" aria-labelledby="${e.id}-h">
      <div class="sec-index label"><span class="num">(${r(n+1)})</span><span>${t(e.label)}</span></div>
      <h2 id="${e.id}-h">${e.title}</h2>
      ${e.body()}
    </section>`).join(``)}
  </div>
</div></section>`,b=()=>`
<section class="section--tight"><div class="container">
  <div class="pg-help">
    <div><span class="label">Still have a question?</span><h2>A real person, <em>not</em> a phone tree.</h2></div>
    <div class="btn-row">${d(p(`Hello, I have a question.`),`Message on WhatsApp`,`accent`,{ic:`chat`,attrs:`target="_blank" rel="noopener"`})}${d(`/contact.html`,`Contact & directions`,`line`,{ic:`pin`})}</div>
  </div>
</div></section>`;function x(){let e=f(`.pg-nav a[data-spy]`),t=u(`.pg-nav ol`),n=Object.fromEntries(e.map(e=>[e.dataset.spy,e])),r=``,i=i=>{if(i!==r&&n[i]&&(r=i,e.forEach(e=>{let t=e===n[i];e.classList.toggle(`is-active`,t),t?e.setAttribute(`aria-current`,`location`):e.removeAttribute(`aria-current`)}),t.scrollWidth>t.clientWidth+4)){let e=n[i],r=e.offsetLeft-(t.clientWidth-e.offsetWidth)/2;t.scrollTo({left:r,behavior:document.documentElement.classList.contains(`js-motion`)?`smooth`:`auto`})}},a=new Map,o=new IntersectionObserver(e=>{e.forEach(e=>a.set(e.target.id,e.isIntersecting));let t=_.find(e=>a.get(e.id));t&&i(t.id)},{rootMargin:`-30% 0px -60% 0px`});_.forEach(e=>o.observe(document.getElementById(e.id))),i(_[0].id)}l(()=>{u(`main`).innerHTML=i(`Patients &amp; visitors`,`Everything you need for <em>your</em> visit.`,`Appointments, admissions, insurance, visiting hours and reports, in one calm place. If anything's unclear, a coordinator is a message away.`,`<div class="btn-row pg-hero-cta" data-reveal>${d(`/appointment.html`,`Book appointment`,`accent`,{ic:`calendar`})}${d(`#insurance`,`Insurance & cashless`,`line`,{ic:`card`})}</div>`)+y()+b(),x()});