import{B as e,D as t,F as n,I as r,O as i,P as a,S as o,V as s,Z as c,g as l,j as u,m as d,t as f,v as p,y as m}from"./core-BNTx_ofm.js";var h=[...c].sort((e,t)=>t.date.localeCompare(e.date)),g=[...new Set(h.map(e=>e.dept))].map(o).filter(Boolean),_=g.some(e=>e.id===n.get(`dept`))?n.get(`dept`):`all`,v=n=>{let r=o(n.dept);return`<a class="bl-feature" href="/journal/${n.id}.html" data-reveal>
    <div class="bl-feature-media ph">${u(n.img,n.title,e(r?r.icon:`heart`))}<span class="bl-flag label">Latest</span></div>
    <div class="bl-feature-body">
      <div class="bl-meta"><span class="tag">${r?r.name:`Health`}</span><span class="label">${i(n.date)} · ${n.read} min read</span></div>
      <h2>${t(n.title)}</h2>
      <p>${t(n.excerpt)}</p>
      <span class="bl-read">Read the article<span class="bl-read-ic">${e(`arrow`)}</span></span>
    </div>
  </a>`},y=()=>`
<div class="bl-filters" role="group" aria-label="Filter articles by speciality">
  <button class="chip" type="button" data-f="all" aria-pressed="${_===`all`}">All <span class="num">${h.length}</span></button>
  ${g.map(e=>`<button class="chip" type="button" data-f="${e.id}" aria-pressed="${_===e.id}">${e.name} <span class="num">${h.filter(t=>t.dept===e.id).length}</span></button>`).join(``)}
</div>`;function b(){let e=h.filter(e=>_===`all`||e.dept===_),[n,...i]=e,a=p(`#bl-list`);return a.innerHTML=`${n?v(n):``}
    ${i.length?`<div class="bl-grid-head"><span class="label">${_===`all`?`More from the journal`:`More in `+t(o(_).name)}</span><span class="label num">${String(i.length).padStart(2,`0`)}</span></div>
    <div class="grid g3 bl-grid">${i.map(r).join(``)}</div>`:``}`,p(`#bl-status`).textContent=`${e.length} article${e.length===1?``:`s`}${_===`all`?``:` in `+o(_).name}`,a}function x(){m(`.bl-filters .chip`).forEach(e=>e.addEventListener(`click`,()=>{if(e.dataset.f===_)return;_=e.dataset.f,m(`.bl-filters .chip`).forEach(t=>t.setAttribute(`aria-pressed`,t===e));let t=new URL(location.href);_===`all`?t.searchParams.delete(`dept`):t.searchParams.set(`dept`,_),history.replaceState(null,``,t);let n=p(`#bl-list`);if(!s()){b();return}l.to(n,{opacity:0,y:12,duration:.25,ease:`power2.in`,onComplete:()=>{b(),l.fromTo(n,{opacity:0,y:12},{opacity:1,y:0,duration:.7,ease:`expo.out`,clearProps:`transform`}),d(n)}})}))}f(()=>{p(`main`).innerHTML=a(`Journal`,`Straight answers from <em>our</em> doctors.`,`Clear, practical health writing from the specialists who see these questions every day. No scare stories, no jargon.`)+`<section class="bl-body"><div class="container">
        <div class="bl-bar">${y()}<p class="label bl-status" id="bl-status" aria-live="polite"></p></div>
        <div id="bl-list"></div>
        <p class="bl-disclaimer">${e(`info`)}<span>Articles are general information, not a diagnosis. If you're worried about symptoms, <a class="link" href="/appointment.html">book a consultation</a> or, in an emergency, <a class="link" href="/emergency.html">get help now</a>.</span></p>
      </div></section>`,b(),x()});