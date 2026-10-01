import{B as e,C as t,D as n,E as r,G as i,L as a,N as o,P as s,U as c,V as l,W as u,g as d,m as f,t as p,v as m,x as h,y as g,z as _}from"./core-BNTx_ofm.js";var v=`lumi-dept-view`,y=matchMedia(`(pointer: fine) and (hover: hover)`).matches,b=e=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${e}</svg>`,x=b(`<path d="M4 6h16M4 12h16M4 18h16"/>`),S=b(`<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>`),C=(e,t)=>`${e} ${t}${e===1?``:`s`}`,w=()=>s(`Specialities`,`Ten specialities. <em>One</em> record.`,`Every centre shares the same lab, imaging and patient file, so the specialist you see next already knows the story.`,`<dl class="dx-facts" data-reveal>
    <div><dt class="label">Specialities</dt><dd>${o(u.length)}</dd></div>
    <div><dt class="label">Specialists</dt><dd>${o(i.length)}</dd></div>
    <div><dt class="label">${n(c.stats[0].label)}</dt><dd>${c.stats[0].value}${c.stats[0].suffix}</dd></div>
  </dl>`),T=(t,i)=>{let a=r(t.id).length;return`<li><a class="dx-row" href="/specialities/${t.id}.html" data-i="${i}">
    <span class="dx-num num">${o(i+1)}</span>
    <span class="dx-title"><span class="dx-ic" aria-hidden="true">${e(t.icon)}</span><span class="dx-name">${n(t.name)}</span></span>
    <span class="dx-sum">${n(t.summary)}</span>
    <span class="dx-count label">${a?C(a,`doctor`):`Care team`}</span>
    <span class="dx-go" aria-hidden="true">${e(`arrowUpRight`)}</span>
  </a></li>`},E=()=>`
<section class="section dx" aria-labelledby="dx-title">
  <div class="container">
    <div class="dx-bar">
      <h2 id="dx-title" class="label"><span class="num">(01)</span> Index · ${u.length} specialities</h2>
      <div class="dx-toggle" role="group" aria-label="Layout">
        <button type="button" data-view="list" aria-pressed="true">${x}<span>List</span></button>
        <button type="button" data-view="grid" aria-pressed="false">${S}<span>Grid</span></button>
      </div>
    </div>
    <div class="dx-head label" aria-hidden="true"><span>No.</span><span>Speciality</span><span>Focus</span><span>Team</span></div>
    <ol class="dx-list" id="dx-list">${u.map(T).join(``)}</ol>
    <div class="grid g3 dx-grid" id="dx-grid" hidden>${u.map((e,n)=>t(e,n).replace(` data-reveal`,``)).join(``)}</div>
  </div>
  <div class="dx-preview" id="dx-preview" aria-hidden="true">
    <div class="dx-pv-media ph"><img class="dx-pv-img" alt="" decoding="async"><span class="dx-pv-ic"></span></div>
    <div class="dx-pv-body"><span class="label dx-pv-num"></span><ul class="dx-pv-list"></ul></div>
  </div>
</section>`,D=()=>{let e=u.flatMap(e=>e.conditions.map(t=>({c:t,d:e}))).sort((e,t)=>e.c.localeCompare(t.c)),t={};return e.forEach(e=>(t[e.c[0].toUpperCase()]||=[]).push(e)),`
<section class="section section--alt"><div class="container">
  ${a(`02`,`Start from a symptom`,`Not sure <em>where</em> to begin?`,`<p>Find what you're dealing with and we'll point you to the team that treats it.</p>`)}
  <div class="az" data-reveal>
    ${Object.entries(t).map(([e,t])=>`
      <div class="az-group"><span class="az-letter" aria-hidden="true">${e}</span>
        <ul>${t.map(({c:e,d:t})=>`<li><a href="/specialities/${t.id}.html"><span>${n(e)}</span><small>${n(t.name)}</small></a></li>`).join(``)}</ul>
      </div>`).join(``)}
  </div>
</div></section>`},O=()=>`
<section class="section section--tight"><div class="container">
  <div class="dx-cta">
    <div>
      <span class="label">Still unsure?</span>
      <h2 data-split>Describe it. We'll <em>route</em> you.</h2>
      <p>A care coordinator reads every message and books you with the right specialist, usually the same day.</p>
    </div>
    <div class="btn-row">${h(_(`Hi, I'm not sure which speciality I need. My symptoms are: `),`Message a coordinator`,`accent`,{ic:`chat`,attrs:`target="_blank" rel="noopener"`})}${h(`/doctors.html`,`Browse doctors`,`line`)}</div>
  </div>
</div></section>`;function k(){let e=m(`#dx-list`),t=m(`#dx-grid`),n=m(`.dx-head`),r=g(`.dx-toggle button`),i=(i,a)=>{r.forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.view===i));let o=i===`grid`;e.hidden=o,n.hidden=o,t.hidden=!o;try{localStorage.setItem(v,i)}catch{}if(a&&l()){let n=o?g(`.dept-card`,t):g(`.dx-row`,e);d.fromTo(n,{opacity:0,y:24},{opacity:1,y:0,duration:.9,ease:`expo.out`,stagger:.04,clearProps:`transform,opacity`})}f(t)};r.forEach(e=>e.addEventListener(`click`,()=>i(e.dataset.view,!0)));let a=`list`;try{a=localStorage.getItem(v)||`list`}catch{}a===`grid`&&i(`grid`,!1)}function A(){if(!y||!l())return;let t=m(`#dx-preview`),r=m(`#dx-list`),i=m(`.dx-pv-ic`,t),a=m(`.dx-pv-num`,t),s=m(`.dx-pv-list`,t),c=m(`.dx-pv-img`,t);u.forEach(e=>{e.img&&(new Image().src=e.img.replace(`.webp`,`-sm.webp`))});let f=d.quickTo(t,`x`,{duration:.7,ease:`expo.out`}),p=d.quickTo(t,`y`,{duration:.7,ease:`expo.out`}),h=d.quickTo(t,`rotation`,{duration:.9,ease:`expo.out`}),g=0,_=-1;d.set(t,{xPercent:-50,yPercent:-50,scale:.6,autoAlpha:0});let v=0,b=0,x=!1,S=t=>{if(!t)return;let r=+t.dataset.i;if(r===_)return;_=r;let l=u[r];i.innerHTML=e(l.icon),a.textContent=`${o(r+1)} / ${o(u.length)} · ${l.name}`,s.innerHTML=l.services.slice(0,4).map(e=>`<li>${n(e)}</li>`).join(``),l.img?(c.src=l.img.replace(`.webp`,`-sm.webp`),c.hidden=!1,d.fromTo(c,{scale:1.15,opacity:0},{scale:1,opacity:1,duration:.7,ease:`expo.out`,overwrite:!0})):c.hidden=!0,d.fromTo(i,{scale:.6,rotate:-20,opacity:0},{scale:1,rotate:0,opacity:1,duration:.7,ease:`expo.out`,overwrite:!0})};r.addEventListener(`pointermove`,e=>{v=e.clientX,b=e.clientY,f(v+170),p(b),h(d.utils.clamp(-8,8,(v-g)*.6)),g=v,S(e.target.closest(`.dx-row`))}),addEventListener(`scroll`,()=>{if(!x)return;let e=document.elementFromPoint(v,b);if(!e||!r.contains(e)){x=!1,_=-1,d.to(t,{scale:.6,autoAlpha:0,duration:.4,overwrite:`auto`});return}S(e.closest(`.dx-row`))},{passive:!0}),r.addEventListener(`pointerenter`,e=>{x=!0,v=e.clientX,b=e.clientY,d.set(t,{x:e.clientX+170,y:e.clientY}),d.to(t,{scale:1,autoAlpha:1,duration:.6,ease:`expo.out`,overwrite:`auto`})}),r.addEventListener(`pointerleave`,()=>{_=-1,x=!1,d.to(t,{scale:.6,autoAlpha:0,duration:.4,ease:`power3.out`,overwrite:`auto`})})}p(()=>{m(`main`).innerHTML=w()+E()+D()+O(),k(),A()});