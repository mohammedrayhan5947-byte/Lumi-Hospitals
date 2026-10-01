import{A as e,B as t,D as n,K as r,L as i,M as a,N as o,R as s,U as c,V as l,Y as u,a as d,b as f,g as p,m,t as h,v as g,x as _,y as v,z as y}from"./core-BNTx_ofm.js";import{t as b}from"./Flip-bUx2q-GE.js";p.registerPlugin(b);var x=[{id:`all`,label:`All packages`},{id:`men`,label:`Men`},{id:`women`,label:`Women`},{id:`seniors`,label:`Seniors 60+`},{id:`heart`,label:`Heart`},{id:`diabetes`,label:`Diabetes`}];function S(e){let t=`${e.id} ${e.name} ${e.for}`.toLowerCase(),n=new Set([`all`]);return/women|her health/.test(t)?n.add(`women`):n.add(`men`),/60\+|senior|silver/.test(t)&&n.add(`seniors`),/heart|cardiac/.test(t)&&n.add(`heart`),/diabet|sugar/.test(t)&&n.add(`diabetes`),[...n]}var C=[[`Complete blood count`,/complete blood count|cbc|full blood panel/i],[`Blood sugar`,/sugar/i],[`HbA1c (3-month sugar)`,/hba1c/i],[`Lipid profile`,/lipid/i],[`Liver function`,/liver/i],[`Kidney function`,/kidney/i],[`Thyroid profile`,/thyroid/i],[`Urine routine`,/urine/i],[`Cardiac risk markers`,/cardiac risk/i],[`ECG`,/ecg/i],[`2D Echo`,/echo/i],[`TMT stress test`,/tmt/i],[`Chest X-ray`,/x-ray/i],[`Ultrasound`,/ultrasound/i],[`Vitamins & iron`,/vitamin|iron/i],[`Bone density scan`,/bone density/i],[`Pap smear / mammogram`,/pap|mammo/i],[`Eye, hearing or foot screening`,/eye|hearing|foot/i]],w=(e,t=new Set)=>t.has(e.id)?[]:(t.add(e.id),e.includes.flatMap(e=>{let n=e.match(/^everything in (.+)$/i),r=n&&u.find(e=>e.name.toLowerCase()===n[1].trim().toLowerCase());return r?w(r,t):[e]})),T=(e,t)=>w(e).some(e=>t.test(e)),E=e=>w(e).filter(e=>/consult/i.test(e)).pop()?.replace(/\s*consult(ation)?$/i,``)||``,D=[[`Fast for 10–12 hours`,`Nothing to eat after dinner the night before. Plain water is fine and helps the blood draw.`],[`Take your usual medicines`,`Blood pressure and thyroid tablets as normal, with water. Bring diabetes medicines or insulin and take them after the fasting sample.`],[`Bring what you have`,`Photo ID, previous reports, prescriptions and a list of the medicines you take.`],[`Dress for the tests`,`Loose, two-piece clothing makes ECG, ultrasound and X-ray quicker. Leave jewellery at home.`],[`Tell us first`,`If you are pregnant, could be, or are on your period, let us know when booking. Some tests are rescheduled.`]],O=[{q:`Do I need to fast before a health check?`,a:`For most packages, yes: 10–12 hours without food. Plain water is fine. We confirm the instructions for your package when we call to book.`},{q:`Can I take my regular medicines?`,a:`Usually yes, with water. If you take medicine or insulin for diabetes, bring it along and take it after the fasting blood sample. When unsure, ask your doctor or call us.`},{q:`How long does a check-up take?`,a:`Plan for most of a morning. Fasting blood samples come first, then imaging and other tests, then the consultation included in your package.`},...r.filter(e=>/report/i.test(e.q)),{q:`Can I book a check-up for a parent or partner?`,a:`Yes. Book on their behalf and enter their name, age and mobile number in the booking form, so we can share instructions with them directly.`}],k=()=>`
<section class="page-hero pk-hero"><div class="page-hero-glow"></div><div class="container">
  <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Health checks</span></nav>
  <div class="pk-hero-in">
    <h1 data-split data-instant>Health checks, <em>clearly</em> priced.</h1>
    <div>
      <p class="lead" data-reveal>Six packages, each with a consultation to explain your results. No add-ons sprung on you at the counter.</p>
      <ul class="pk-jump" data-reveal aria-label="Jump to a package">
        ${u.map(t=>`<li><a href="#${t.id}"><span>${n(t.name)}</span><b>${e(t.price)}</b></a></li>`).join(``)}
      </ul>
    </div>
  </div>
</div></section>`,A=()=>`
<section class="section section--tight pk-list" aria-labelledby="pk-list-h"><div class="container">
  <div class="pk-bar">
    <h2 id="pk-list-h" class="sr-only">All packages</h2>
    <div class="chips" role="group" aria-label="Filter packages by who they are for">
      ${x.map(e=>`<button type="button" class="chip" data-f="${e.id}" aria-pressed="${e.id===`all`}">${e.label}<span class="cnt num">${u.filter(t=>S(t).includes(e.id)).length}</span></button>`).join(``)}
    </div>
    <p class="label" aria-live="polite" id="pk-count">Showing ${u.length} packages</p>
  </div>
  <div class="grid g3 pk-grid" id="pk-grid">${u.map(e=>a(e).replace(`class="tile pkg`,`data-aud="${S(e).join(` `)}" class="tile pkg`)).join(``)}</div>
  <p class="form-note pk-note">Prices include the listed tests and consultation. ${c.name} confirms the full test list when you book.</p>
</div></section>`,j=(e,[n,r])=>T(e,r)?`<span class="yes">${t(`check`)}<span class="sr-only">Included</span></span>`:`<span class="no" aria-hidden="true"></span><span class="sr-only">Not listed</span>`,M=()=>`
<section class="section section--alt" id="compare"><div class="container">
  ${i(`01`,`Compare`,`What's <em>inside</em> each check.`,`<p>Every row is taken from each package's list of inclusions. A dash means the test isn't listed for that package.</p>`)}
  <div class="cmp-wrap" data-reveal>
    <table class="cmp">
      <caption class="sr-only">Comparison of tests included in each health check package</caption>
      <thead><tr><th scope="col" class="cmp-corner"><span class="label">Test</span></th>
        ${u.map(t=>`<th scope="col" class="${t.featured?`is-featured`:``}"><a href="#${t.id}"><span class="label">${t.tests} tests</span><b>${n(t.name)}</b><span class="cmp-price">${e(t.price)}</span></a></th>`).join(``)}</tr></thead>
      <tbody>
        ${C.map(e=>`<tr><th scope="row">${e[0]}</th>${u.map(t=>`<td class="${t.featured?`is-featured`:``}">${j(t,e)}</td>`).join(``)}</tr>`).join(``)}
        <tr class="cmp-consult"><th scope="row">Consultation</th>${u.map(e=>`<td class="${e.featured?`is-featured`:``}">${n(E(e))||`—`}</td>`).join(``)}</tr>
      </tbody>
      <tfoot><tr><th scope="row"><span class="sr-only">Book</span></th>${u.map(e=>`<td class="${e.featured?`is-featured`:``}">${_(`/appointment.html?package=${e.id}`,`Book`,e.featured?`accent`:`line`,{sm:!0,ic:``,attrs:`aria-label="Book ${n(e.name)}"`})}</td>`).join(``)}</tr></tfoot>
    </table>
  </div>
  <div class="cmp-cards">
    ${u.map(r=>{let i=C.filter(e=>T(r,e[1]));return`<article class="tile cmp-card ${r.featured?`is-featured`:``}" data-reveal>
        <header><div><span class="label">${r.tests} tests</span><h3>${n(r.name)}</h3><p class="muted cmp-for">${n(r.for)}</p></div><b class="cmp-price">${e(r.price)}</b></header>
        <p class="label cmp-of">${i.length} of ${C.length} compared tests</p>
        <ul class="cmp-list">${i.map(e=>`<li>${t(`check`)}<span>${e[0]}</span></li>`).join(``)}</ul>
        <p class="cmp-miss"><span class="label">Not listed</span>${C.filter(e=>!T(r,e[1])).map(e=>e[0]).join(` · `)}</p>
        <p class="cmp-c"><span class="label">Consultation</span>${n(E(r))}</p>
        ${_(`/appointment.html?package=${r.id}`,`Book ${n(r.name)}`,r.featured?`accent`:`line`,{sm:!0})}
      </article>`}).join(``)}
  </div>
</div></section>`,N=()=>`
<section class="section"><div class="container prep">
  <div class="prep-intro">
    <div class="sec-index label"><span class="num">(02)</span><span>Before you come</span></div>
    <h2 data-split style="margin-top:14px">Five things that make the <em>morning</em> easy.</h2>
    <p class="lead" data-reveal>Good preparation means accurate results and no repeat visits.</p>
  </div>
  <ol class="prep-list">${D.map(([e,t],n)=>`<li data-reveal><span class="num">${o(n+1)}</span><div><h3>${e}</h3><p>${t}</p></div></li>`).join(``)}</ol>
</div></section>`,P=()=>`
<section class="section section--alt"><div class="container prep" style="align-items:start">
  <div class="prep-intro">
    <div class="sec-index label"><span class="num">(03)</span><span>Questions</span></div>
    <h2 data-split style="margin-top:14px">Asked <em>often.</em></h2>
  </div>
  ${f(O)}
</div></section>`,F=()=>`
<section class="section"><div class="container">
  <div class="pk-cta">
    <div class="pk-cta-glow" aria-hidden="true"></div>
    <div>
      <span class="label">Not sure which one?</span>
      <h2 data-split>Tell us your age and history. We'll <em>suggest</em> the right check.</h2>
    </div>
    <div class="btn-row">
      <a class="btn btn--accent" href="${y(`Hi, I need help choosing a health check-up package.`)}" target="_blank" rel="noopener" data-magnetic><span>Ask on WhatsApp</span><span class="btn-ic">${t(`chat`)}</span></a>
      <a class="btn btn--glass" href="${s(c.phone)}" data-magnetic><span>${n(c.phone)}</span><span class="btn-ic">${t(`phone`)}</span></a>
    </div>
  </div>
</div></section>`;function I(e,{animate:t=!0}={}){let n=g(`#pk-grid`),r=v(`.pkg`,n),i=t&&l()?b.getState(r):null,a=0;r.forEach(t=>{let n=t.dataset.aud.split(` `).includes(e);t.hidden=!n,n&&a++}),v(`.pk-bar .chip`).forEach(t=>t.setAttribute(`aria-pressed`,t.dataset.f===e)),g(`#pk-count`).textContent=`Showing ${a} ${a===1?`package`:`packages`}`,i&&(r.forEach(e=>{e.hidden||(e.dataset.revealed=`1`,p.set(e,{opacity:1,y:0}))}),b.from(i,{duration:.8,ease:`expo.out`,absolute:!0,scale:!0,onEnter:e=>p.fromTo(e,{opacity:0,scale:.94},{opacity:1,scale:1,duration:.7,ease:`expo.out`}),onLeave:e=>p.to(e,{opacity:0,scale:.94,duration:.35}),onComplete:()=>m(n)}))}function L(e){let t=decodeURIComponent(location.hash.slice(1)),n=t&&document.getElementById(t);n&&(n.classList.contains(`pkg`)&&n.hidden&&I(`all`,{animate:!1}),n.dataset.reveal!==void 0&&(n.dataset.revealed=`1`,n.style.opacity=1,n.style.transform=`none`),window.__lenis?window.__lenis.scrollTo(n,{offset:-110,immediate:!e}):n.scrollIntoView({block:`start`,behavior:e?`smooth`:`auto`}),n.classList.contains(`pkg`)&&(n.classList.remove(`is-target`),n.offsetWidth,n.classList.add(`is-target`),setTimeout(()=>n.classList.remove(`is-target`),2600)))}h(()=>{if(g(`main`).innerHTML=k()+A()+M()+`<div class="container" style="padding-bottom:40px">${d()}</div>`+N()+P()+F(),g(`.pk-bar`).addEventListener(`click`,e=>{let t=e.target.closest(`.chip`);t&&I(t.dataset.f)}),v(`.pkg`).forEach(e=>{e.style.scrollMarginTop=`110px`}),location.hash){`scrollRestoration`in history&&(history.scrollRestoration=`manual`);let e=()=>setTimeout(()=>L(!1),60);document.readyState===`complete`?requestAnimationFrame(e):addEventListener(`load`,e,{once:!0})}addEventListener(`hashchange`,()=>L(!0))});