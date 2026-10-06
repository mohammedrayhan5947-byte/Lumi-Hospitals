import{C as e,D as t,E as n,G as r,H as i,I as a,N as o,O as s,P as c,R as l,S as u,V as d,W as f,X as p,_ as m,a as h,b as g,t as _,y as v,z as y}from"./core-Cli6QvB8.js";var b=e(document.querySelector(`main`)?.dataset.id||a.get(`id`))||r[0],x=r.indexOf(b),S=r[(x-1+r.length)%r.length],C=r[(x+1)%r.length],w=t(b.id),T=(b.packages||{cardiology:[`heart`,`executive`],obgyn:[`women`],"general-medicine":[`diabetes`,`executive`,`senior`],diagnostics:[`essential`,`executive`],neurology:[`senior`],orthopaedics:[`senior`],"nephro-uro":[`diabetes`]}[b.id]||[]).map(e=>p.find(t=>t.id===e)).filter(Boolean),E=s(b.name).replace(` &amp; `,` <em>&amp;</em> `),D=()=>`
<section class="page-hero dp-hero"><div class="page-hero-glow"></div><div class="container dp-hero-in">
  <div class="dp-hero-text">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/departments.html">Specialities</a><span>/</span><span aria-current="page">${s(b.name)}</span></nav>
    <h1 data-split data-instant>${E}</h1>
    <p class="lead" data-reveal>${s(b.about)}</p>
    <div class="btn-row" data-reveal>${u(`/appointment.html?dept=${b.id}`,`Book an appointment`,`accent`,{ic:`calendar`})}${u(y(f.phone),`Call reception`,`line`,{ic:`phone`})}</div>
  </div>
  <aside class="dp-emblem" data-reveal="scale" aria-label="At a glance">
    <div class="dp-emblem-media ph">${b.img?`<img class="dp-photo" src="${b.img}" srcset="${b.img.replace(`.webp`,`-sm.webp`)} 720w, ${b.img} 1800w" sizes="(max-width: 860px) 100vw, 40vw" alt="${b.name} at Lumi Hospital" fetchpriority="high"><span class="dp-photo-ic">${d(b.icon)}</span>`:`<div class="ph-mono">${d(b.icon)}</div>`}<span class="dp-emblem-num label">${c(x+1)} / ${c(r.length)}</span></div>
    <dl class="dp-glance">
      <div><dt class="label">Specialists</dt><dd>${w.length?c(w.length):`—`}</dd></div>
      <div><dt class="label">Services</dt><dd>${c(b.services.length)}</dd></div>
      <div class="wide"><dt class="label">OPD hours</dt><dd class="sm">${s(f.hours.opd)}</dd></div>
    </dl>
  </aside>
</div></section>`,O=()=>`
<section class="section dp-services"><div class="container dp-split">
  <div class="dp-split-head">
    <div class="sec-index label"><span class="num">(01)</span><span>Services</span></div>
    <h2 data-split>What we <em>do</em> here.</h2>
    <p class="muted" data-reveal>Every service is backed by the same 24/7 lab, imaging and pharmacy, and by colleagues across all ${r.length} specialities.</p>
  </div>
  <ol class="dp-svc">${b.services.map((e,t)=>`<li data-reveal><span class="num">${c(t+1)}</span><span class="dp-svc-name">${s(e)}</span><span class="dp-svc-dot" aria-hidden="true"></span></li>`).join(``)}</ol>
</div></section>`,k=()=>`
<section class="section section--alt dp-cond"><div class="container">
  ${l(`02`,`Conditions we treat`,`Common reasons people <em>see</em> us.`,`<p>Not on the list? This is a starting point, not a limit. Ask us about your symptoms.</p>`)}
  <ul class="dp-chips" aria-label="Conditions treated">${b.conditions.map(e=>`<li data-reveal>${s(e)}</li>`).join(``)}</ul>
</div></section>`,A=(e,t,n,r,i)=>`
  <div class="dp-split-head">
    <div class="sec-index label"><span class="num">(${e})</span><span>${t}</span></div>
    <h2 data-split>${n}</h2>
    ${r?`<p class="muted" data-reveal>${r}</p>`:``}
    <div class="btn-row" data-reveal>${i}</div>
  </div>`,j=()=>{let e=u(`/doctors.html?dept=${b.id}`,`Find a doctor`,`line`),t=w.length?`<div class="grid dp-team">${w.map(n).join(``)}</div>`:`<div class="tile dp-none" data-reveal><span class="ic-badge">${d(`users`)}</span><div><h3>Consultant profiles coming soon</h3><p class="muted">Call reception and we'll book you with the specialist on duty.</p></div>${u(y(f.phone),s(f.phone),`accent`,{ic:`phone`})}</div>`;return w.length>2?`<section class="section"><div class="container">${l(`03`,`Specialists`,`The <em>team</em> you'll meet.`,e)}${t}</div></section>`:`<section class="section"><div class="container dp-split">${A(`03`,`Specialists`,`The <em>team</em> you'll meet.`,`Senior consultants who see you themselves, with records shared across every speciality.`,e)}${t}</div></section>`},M=()=>T.length?`
<section class="section section--alt"><div class="container dp-split">
  ${A(`04`,`Health checks`,`Prevention, <em>packaged.</em>`,`Screening packages our ${s(b.name.toLowerCase())} team recommends, with results reviewed by a doctor.`,u(`/packages.html`,`All packages`,`line`))}
  <div class="grid dp-pkgs">${T.map(o).join(``)}</div>
</div></section>`:``,N=()=>`
<section class="section section--tight"><div class="container">
  <div class="dp-cta">
    <div class="dp-cta-glow" aria-hidden="true"></div>
    <span class="dp-cta-ic" aria-hidden="true">${d(b.icon)}</span>
    <span class="label">${s(b.name)} · ${s(f.hours.opd)}</span>
    <h2 data-split>Ready when <em>you</em> are.</h2>
    <p data-reveal>Pick a time online, or call and we'll find the earliest slot with the right specialist.</p>
    <div class="btn-row" data-reveal>${u(`/appointment.html?dept=${b.id}`,`Book appointment`,`accent`,{ic:`calendar`})}${u(y(f.emergency),`Emergency `+s(f.emergency),`glass`,{ic:`ambulance`})}</div>
  </div>
</div></section>`,P=()=>`
<nav class="dp-pager" aria-label="More specialities"><div class="container dp-pager-in">
  ${[[`prev`,S,`Previous`],[`next`,C,`Next`]].map(([e,t,n])=>`
    <a class="dp-pg dp-pg--${e}" href="/specialities/${t.id}.html" rel="${e}">
      <span class="label">${e===`prev`?d(`arrowLeft`):``}${n} speciality${e===`next`?d(`arrow`):``}</span>
      <span class="dp-pg-name">${s(t.name)}</span>
      <span class="dp-pg-ic" aria-hidden="true">${d(t.icon)}</span>
    </a>`).join(``)}
</div></nav>`;function F(){i()&&(g(`.dp-emblem .ph-mono .ic > *`).forEach(e=>{let t=e.getTotalLength?.()||0;t&&m.fromTo(e,{strokeDasharray:t,strokeDashoffset:t},{strokeDashoffset:0,duration:2,ease:`power2.inOut`,delay:.4})}),m.to(`.dp-emblem .ph-mono .ic`,{scale:1.15,rotate:-6,ease:`none`,scrollTrigger:{trigger:`.dp-hero`,start:`top top`,end:`bottom top`,scrub:!0}}))}_(()=>{document.title=`${b.name} | ${f.name}`,v(`meta[name="description"]`)?.setAttribute(`content`,b.summary),v(`main`).innerHTML=D()+O()+k()+j()+M()+([`obgyn`,`diagnostics`].includes(b.id)?`<div class="container" style="padding-block:0 40px">${h()}</div>`:``)+N()+P(),F()});