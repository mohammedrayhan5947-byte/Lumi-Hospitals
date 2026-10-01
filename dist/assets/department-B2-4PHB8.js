import{B as e,D as t,E as n,F as r,L as i,M as a,N as o,R as s,S as c,T as l,U as u,V as d,W as f,Y as p,a as m,g as h,t as g,v as _,x as v,y}from"./core-BNTx_ofm.js";var b=c(document.querySelector(`main`)?.dataset.id||r.get(`id`))||f[0],x=f.indexOf(b),S=f[(x-1+f.length)%f.length],C=f[(x+1)%f.length],w=n(b.id),T=(b.packages||{cardiology:[`heart`,`executive`],obgyn:[`women`],"general-medicine":[`diabetes`,`executive`,`senior`],diagnostics:[`essential`,`executive`],neurology:[`senior`],orthopaedics:[`senior`],"nephro-uro":[`diabetes`]}[b.id]||[]).map(e=>p.find(t=>t.id===e)).filter(Boolean),E=t(b.name).replace(` &amp; `,` <em>&amp;</em> `),D=()=>`
<section class="page-hero dp-hero"><div class="page-hero-glow"></div><div class="container dp-hero-in">
  <div class="dp-hero-text">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/departments.html">Specialities</a><span>/</span><span aria-current="page">${t(b.name)}</span></nav>
    <h1 data-split data-instant>${E}</h1>
    <p class="lead" data-reveal>${t(b.about)}</p>
    <div class="btn-row" data-reveal>${v(`/appointment.html?dept=${b.id}`,`Book an appointment`,`accent`,{ic:`calendar`})}${v(s(u.phone),`Call reception`,`line`,{ic:`phone`})}</div>
  </div>
  <aside class="dp-emblem" data-reveal="scale" aria-label="At a glance">
    <div class="dp-emblem-media ph">${b.img?`<img class="dp-photo" src="${b.img}" srcset="${b.img.replace(`.webp`,`-sm.webp`)} 720w, ${b.img} 1800w" sizes="(max-width: 860px) 100vw, 40vw" alt="${b.name} at Lumi Hospital" fetchpriority="high"><span class="dp-photo-ic">${e(b.icon)}</span>`:`<div class="ph-mono">${e(b.icon)}</div>`}<span class="dp-emblem-num label">${o(x+1)} / ${o(f.length)}</span></div>
    <dl class="dp-glance">
      <div><dt class="label">Specialists</dt><dd>${w.length?o(w.length):`—`}</dd></div>
      <div><dt class="label">Services</dt><dd>${o(b.services.length)}</dd></div>
      <div class="wide"><dt class="label">OPD hours</dt><dd class="sm">${t(u.hours.opd)}</dd></div>
    </dl>
  </aside>
</div></section>`,O=()=>`
<section class="section dp-services"><div class="container dp-split">
  <div class="dp-split-head">
    <div class="sec-index label"><span class="num">(01)</span><span>Services</span></div>
    <h2 data-split>What we <em>do</em> here.</h2>
    <p class="muted" data-reveal>Every service is backed by the same 24/7 lab, imaging and pharmacy, and by colleagues across all ${f.length} specialities.</p>
  </div>
  <ol class="dp-svc">${b.services.map((e,n)=>`<li data-reveal><span class="num">${o(n+1)}</span><span class="dp-svc-name">${t(e)}</span><span class="dp-svc-dot" aria-hidden="true"></span></li>`).join(``)}</ol>
</div></section>`,k=()=>`
<section class="section section--alt dp-cond"><div class="container">
  ${i(`02`,`Conditions we treat`,`Common reasons people <em>see</em> us.`,`<p>Not on the list? This is a starting point, not a limit. Ask us about your symptoms.</p>`)}
  <ul class="dp-chips" aria-label="Conditions treated">${b.conditions.map(e=>`<li data-reveal>${t(e)}</li>`).join(``)}</ul>
</div></section>`,A=(e,t,n,r,i)=>`
  <div class="dp-split-head">
    <div class="sec-index label"><span class="num">(${e})</span><span>${t}</span></div>
    <h2 data-split>${n}</h2>
    ${r?`<p class="muted" data-reveal>${r}</p>`:``}
    <div class="btn-row" data-reveal>${i}</div>
  </div>`,j=()=>{let n=v(`/doctors.html?dept=${b.id}`,`Find a doctor`,`line`),r=w.length?`<div class="grid dp-team">${w.map(l).join(``)}</div>`:`<div class="tile dp-none" data-reveal><span class="ic-badge">${e(`users`)}</span><div><h3>Consultant profiles coming soon</h3><p class="muted">Call reception and we'll book you with the specialist on duty.</p></div>${v(s(u.phone),t(u.phone),`accent`,{ic:`phone`})}</div>`;return w.length>2?`<section class="section"><div class="container">${i(`03`,`Specialists`,`The <em>team</em> you'll meet.`,n)}${r}</div></section>`:`<section class="section"><div class="container dp-split">${A(`03`,`Specialists`,`The <em>team</em> you'll meet.`,`Senior consultants who see you themselves, with records shared across every speciality.`,n)}${r}</div></section>`},M=()=>T.length?`
<section class="section section--alt"><div class="container dp-split">
  ${A(`04`,`Health checks`,`Prevention, <em>packaged.</em>`,`Screening packages our ${t(b.name.toLowerCase())} team recommends, with results reviewed by a doctor.`,v(`/packages.html`,`All packages`,`line`))}
  <div class="grid dp-pkgs">${T.map(a).join(``)}</div>
</div></section>`:``,N=()=>`
<section class="section section--tight"><div class="container">
  <div class="dp-cta">
    <div class="dp-cta-glow" aria-hidden="true"></div>
    <span class="dp-cta-ic" aria-hidden="true">${e(b.icon)}</span>
    <span class="label">${t(b.name)} · ${t(u.hours.opd)}</span>
    <h2 data-split>Ready when <em>you</em> are.</h2>
    <p data-reveal>Pick a time online, or call and we'll find the earliest slot with the right specialist.</p>
    <div class="btn-row" data-reveal>${v(`/appointment.html?dept=${b.id}`,`Book appointment`,`accent`,{ic:`calendar`})}${v(s(u.emergency),`Emergency `+t(u.emergency),`glass`,{ic:`ambulance`})}</div>
  </div>
</div></section>`,P=()=>`
<nav class="dp-pager" aria-label="More specialities"><div class="container dp-pager-in">
  ${[[`prev`,S,`Previous`],[`next`,C,`Next`]].map(([n,r,i])=>`
    <a class="dp-pg dp-pg--${n}" href="/specialities/${r.id}.html" rel="${n}">
      <span class="label">${n===`prev`?e(`arrowLeft`):``}${i} speciality${n===`next`?e(`arrow`):``}</span>
      <span class="dp-pg-name">${t(r.name)}</span>
      <span class="dp-pg-ic" aria-hidden="true">${e(r.icon)}</span>
    </a>`).join(``)}
</div></nav>`;function F(){d()&&(y(`.dp-emblem .ph-mono .ic > *`).forEach(e=>{let t=e.getTotalLength?.()||0;t&&h.fromTo(e,{strokeDasharray:t,strokeDashoffset:t},{strokeDashoffset:0,duration:2,ease:`power2.inOut`,delay:.4})}),h.to(`.dp-emblem .ph-mono .ic`,{scale:1.15,rotate:-6,ease:`none`,scrollTrigger:{trigger:`.dp-hero`,start:`top top`,end:`bottom top`,scrub:!0}}))}g(()=>{document.title=`${b.name} | ${u.name}`,_(`meta[name="description"]`)?.setAttribute(`content`,b.summary),_(`main`).innerHTML=D()+O()+k()+j()+M()+([`obgyn`,`diagnostics`].includes(b.id)?`<div class="container" style="padding-block:0 40px">${m()}</div>`:``)+N()+P(),F()});