import{B as e,D as t,F as n,G as r,H as i,K as a,O as o,P as s,R as c,S as l,V as u,W as d,_ as f,b as p,h as m,t as h,w as g,y as _}from"./core-Cli6QvB8.js";var v=`lumi-dept-view`,y=matchMedia(`(pointer: fine) and (hover: hover)`).matches,b=e=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${e}</svg>`,x=b(`<path d="M4 6h16M4 12h16M4 18h16"/>`),S=b(`<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>`),C=(e,t)=>`${e} ${t}${e===1?``:`s`}`,w=()=>n(`Specialities`,`Ten specialities. <em>One</em> record.`,`Every centre shares the same lab, imaging and patient file, so the specialist you see next already knows the story.`,`<dl class="dx-facts" data-reveal>
    <div><dt class="label">Specialities</dt><dd>${s(r.length)}</dd></div>
    <div><dt class="label">Specialists</dt><dd>${s(a.length)}</dd></div>
    <div><dt class="label">${o(d.stats[0].label)}</dt><dd>${d.stats[0].value}${d.stats[0].suffix}</dd></div>
  </dl>`),T=(e,n)=>{let r=t(e.id).length;return`<li><a class="dx-row" href="/specialities/${e.id}.html" data-i="${n}">
    <span class="dx-num num">${s(n+1)}</span>
    <span class="dx-title"><span class="dx-ic" aria-hidden="true">${u(e.icon)}</span><span class="dx-name">${o(e.name)}</span></span>
    <span class="dx-sum">${o(e.summary)}</span>
    <span class="dx-count label">${r?C(r,`doctor`):`Care team`}</span>
    <span class="dx-go" aria-hidden="true">${u(`arrowUpRight`)}</span>
  </a></li>`},E=()=>`
<section class="section dx" aria-labelledby="dx-title">
  <div class="container">
    <div class="dx-bar">
      <h2 id="dx-title" class="label"><span class="num">(01)</span> Index · ${r.length} specialities</h2>
      <div class="dx-toggle" role="group" aria-label="Layout">
        <button type="button" data-view="list" aria-pressed="true">${x}<span>List</span></button>
        <button type="button" data-view="grid" aria-pressed="false">${S}<span>Grid</span></button>
      </div>
    </div>
    <div class="dx-head label" aria-hidden="true"><span>No.</span><span>Speciality</span><span>Focus</span><span>Team</span></div>
    <ol class="dx-list" id="dx-list">${r.map(T).join(``)}</ol>
    <div class="grid g3 dx-grid" id="dx-grid" hidden>${r.map((e,t)=>g(e,t).replace(` data-reveal`,``)).join(``)}</div>
  </div>
  <div class="dx-preview" id="dx-preview" aria-hidden="true">
    <div class="dx-pv-media ph"><img class="dx-pv-img" alt="" decoding="async"><span class="dx-pv-ic"></span></div>
    <div class="dx-pv-body"><span class="label dx-pv-num"></span><ul class="dx-pv-list"></ul></div>
  </div>
</section>`,D=()=>{let e=r.flatMap(e=>e.conditions.map(t=>({c:t,d:e}))).sort((e,t)=>e.c.localeCompare(t.c)),t={};return e.forEach(e=>(t[e.c[0].toUpperCase()]||=[]).push(e)),`
<section class="section section--alt"><div class="container">
  ${c(`02`,`Start from a symptom`,`Not sure <em>where</em> to begin?`,`<p>Find what you're dealing with and we'll point you to the team that treats it.</p>`)}
  <div class="az" data-reveal>
    ${Object.entries(t).map(([e,t])=>`
      <div class="az-group"><span class="az-letter" aria-hidden="true">${e}</span>
        <ul>${t.map(({c:e,d:t})=>`<li><a href="/specialities/${t.id}.html"><span>${o(e)}</span><small>${o(t.name)}</small></a></li>`).join(``)}</ul>
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
    <div class="btn-row">${l(e(`Hi, I'm not sure which speciality I need. My symptoms are: `),`Message a coordinator`,`accent`,{ic:`chat`,attrs:`target="_blank" rel="noopener"`})}${l(`/doctors.html`,`Browse doctors`,`line`)}</div>
  </div>
</div></section>`;function k(){let e=_(`#dx-list`),t=_(`#dx-grid`),n=_(`.dx-head`),r=p(`.dx-toggle button`),a=(a,o)=>{r.forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.view===a));let s=a===`grid`;e.hidden=s,n.hidden=s,t.hidden=!s;try{localStorage.setItem(v,a)}catch{}if(o&&i()){let n=s?p(`.dept-card`,t):p(`.dx-row`,e);f.fromTo(n,{opacity:0,y:24},{opacity:1,y:0,duration:.9,ease:`expo.out`,stagger:.04,clearProps:`transform,opacity`})}m(t)};r.forEach(e=>e.addEventListener(`click`,()=>a(e.dataset.view,!0)));let o=`list`;try{o=localStorage.getItem(v)||`list`}catch{}o===`grid`&&a(`grid`,!1)}function A(){if(!y||!i())return;let e=_(`#dx-preview`),t=_(`#dx-list`),n=_(`.dx-pv-ic`,e),a=_(`.dx-pv-num`,e),c=_(`.dx-pv-list`,e),l=_(`.dx-pv-img`,e);r.forEach(e=>{e.img&&(new Image().src=e.img.replace(`.webp`,`-sm.webp`))});let d=f.quickTo(e,`x`,{duration:.7,ease:`expo.out`}),p=f.quickTo(e,`y`,{duration:.7,ease:`expo.out`}),m=f.quickTo(e,`rotation`,{duration:.9,ease:`expo.out`}),h=0,g=-1;f.set(e,{xPercent:-50,yPercent:-50,scale:.6,autoAlpha:0});let v=0,b=0,x=!1,S=e=>{if(!e)return;let t=+e.dataset.i;if(t===g)return;g=t;let i=r[t];n.innerHTML=u(i.icon),a.textContent=`${s(t+1)} / ${s(r.length)} · ${i.name}`,c.innerHTML=i.services.slice(0,4).map(e=>`<li>${o(e)}</li>`).join(``),i.img?(l.src=i.img.replace(`.webp`,`-sm.webp`),l.hidden=!1,f.fromTo(l,{scale:1.15,opacity:0},{scale:1,opacity:1,duration:.7,ease:`expo.out`,overwrite:!0})):l.hidden=!0,f.fromTo(n,{scale:.6,rotate:-20,opacity:0},{scale:1,rotate:0,opacity:1,duration:.7,ease:`expo.out`,overwrite:!0})};t.addEventListener(`pointermove`,e=>{v=e.clientX,b=e.clientY,d(v+170),p(b),m(f.utils.clamp(-8,8,(v-h)*.6)),h=v,S(e.target.closest(`.dx-row`))}),addEventListener(`scroll`,()=>{if(!x)return;let n=document.elementFromPoint(v,b);if(!n||!t.contains(n)){x=!1,g=-1,f.to(e,{scale:.6,autoAlpha:0,duration:.4,overwrite:`auto`});return}S(n.closest(`.dx-row`))},{passive:!0}),t.addEventListener(`pointerenter`,t=>{x=!0,v=t.clientX,b=t.clientY,f.set(e,{x:t.clientX+170,y:t.clientY}),f.to(e,{scale:1,autoAlpha:1,duration:.6,ease:`expo.out`,overwrite:`auto`})}),t.addEventListener(`pointerleave`,()=>{g=-1,x=!1,f.to(e,{scale:.6,autoAlpha:0,duration:.4,ease:`power3.out`,overwrite:`auto`})})}h(()=>{_(`main`).innerHTML=w()+E()+D()+O(),k(),A()});