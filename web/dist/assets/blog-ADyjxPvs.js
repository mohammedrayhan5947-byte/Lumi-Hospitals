import{$ as e,C as t,F as n,H as r,I as i,L as a,M as o,O as s,V as c,_ as l,b as u,h as d,k as f,t as p,y as m}from"./core-DP1POjhO.js";var h=[...e].sort((e,t)=>t.date.localeCompare(e.date)),g=[...new Set(h.map(e=>e.dept))].map(t).filter(Boolean),_=g.some(e=>e.id===i.get(`dept`))?i.get(`dept`):`all`,v=e=>{let n=t(e.dept);return`<a class="bl-feature" href="/journal/${e.id}.html" data-reveal>
    <div class="bl-feature-media ph">${o(e.img,e.title,c(n?n.icon:`heart`))}<span class="bl-flag label">Latest</span></div>
    <div class="bl-feature-body">
      <div class="bl-meta"><span class="tag">${n?n.name:`Health`}</span><span class="label">${f(e.date)} · ${e.read} min read</span></div>
      <h2>${s(e.title)}</h2>
      <p>${s(e.excerpt)}</p>
      <span class="bl-read">Read the article<span class="bl-read-ic">${c(`arrow`)}</span></span>
    </div>
  </a>`},y=()=>`
<div class="bl-filters" role="group" aria-label="Filter articles by speciality">
  <button class="chip" type="button" data-f="all" aria-pressed="${_===`all`}">All <span class="num">${h.length}</span></button>
  ${g.map(e=>`<button class="chip" type="button" data-f="${e.id}" aria-pressed="${_===e.id}">${e.name} <span class="num">${h.filter(t=>t.dept===e.id).length}</span></button>`).join(``)}
</div>`;function b(){let e=h.filter(e=>_===`all`||e.dept===_),[n,...r]=e,i=m(`#bl-list`);return i.innerHTML=`${n?v(n):``}
    ${r.length?`<div class="bl-grid-head"><span class="label">${_===`all`?`More from the journal`:`More in `+s(t(_).name)}</span><span class="label num">${String(r.length).padStart(2,`0`)}</span></div>
    <div class="grid g3 bl-grid">${r.map(a).join(``)}</div>`:``}`,m(`#bl-status`).textContent=`${e.length} article${e.length===1?``:`s`}${_===`all`?``:` in `+t(_).name}`,i}function x(){u(`.bl-filters .chip`).forEach(e=>e.addEventListener(`click`,()=>{if(e.dataset.f===_)return;_=e.dataset.f,u(`.bl-filters .chip`).forEach(t=>t.setAttribute(`aria-pressed`,t===e));let t=new URL(location.href);_===`all`?t.searchParams.delete(`dept`):t.searchParams.set(`dept`,_),history.replaceState(null,``,t);let n=m(`#bl-list`);if(!r()){b();return}l.to(n,{opacity:0,y:12,duration:.25,ease:`power2.in`,onComplete:()=>{b(),l.fromTo(n,{opacity:0,y:12},{opacity:1,y:0,duration:.7,ease:`expo.out`,clearProps:`transform`}),d(n)}})}))}p(()=>{m(`main`).innerHTML=n(`Journal`,`Straight answers from <em>our</em> doctors.`,`Clear, practical health writing from the specialists who see these questions every day. No scare stories, no jargon.`)+`<section class="bl-body"><div class="container">
        <div class="bl-bar">${y()}<p class="label bl-status" id="bl-status" aria-live="polite"></p></div>
        <div id="bl-list"></div>
        <p class="bl-disclaimer">${c(`info`)}<span>Articles are general information, not a diagnosis. If you're worried about symptoms, <a class="link" href="/appointment.html">book a consultation</a> or, in an emergency, <a class="link" href="/emergency.html">get help now</a>.</span></p>
      </div></section>`,b(),x()});