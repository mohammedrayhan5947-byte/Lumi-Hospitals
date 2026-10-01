import{B as e,D as t,F as n,G as r,P as i,S as a,T as o,U as s,V as c,W as l,g as u,m as d,t as f,v as p,x as m,y as h,z as g}from"./core-BNTx_ofm.js";import{t as _}from"./Flip-bUx2q-GE.js";u.registerPlugin(_);var v=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`][new Date().getDay()],y=e=>e.days.includes(v),b=l.filter(e=>r.some(t=>t.dept===e.id)),x={q:n.get(`q`)||``,dept:a(n.get(`dept`))?n.get(`dept`):``,today:n.get(`today`)===`1`},S=e=>[e.name,e.role,e.quals,a(e.dept)?.name,...e.focus,...e.langs].join(` `).toLowerCase(),C=e=>{if(x.dept&&e.dept!==x.dept||x.today&&!y(e))return!1;let t=x.q.trim().toLowerCase();return!t||t.split(/\s+/).every(t=>S(e).includes(t))},w=()=>i(`Doctors`,`Find the <em>right</em> doctor.`,`Search by name, condition or language. Every consultant here sees you personally, and booked slots run to the clock.`),T=e=>{let n=o(e).replace(` data-reveal`,``),r=y(e)?`<span class="dr-today"><i></i>In today<span class="dr-today-t"> · ${t(e.time)}</span></span>`:``;return n.replace(`</a>`,`${r}</a>`)},E=()=>`
<section class="section dr" aria-label="Doctor finder"><div class="container">
  <div class="dr-tools" data-reveal>
    <div class="dr-search">
      <label for="dr-q" class="sr-only">Search doctors</label>
      ${e(`search`)}
      <input id="dr-q" class="input" type="search" placeholder="Name, condition or language, e.g. “knee”, “Tamil”" autocomplete="off" value="${t(x.q)}">
    </div>
    <label class="dr-switch" for="dr-today">
      <span><b>Available today</b><small>${v===`Sun`?`Sunday · OPD closed`:`OPD on `+v}</small></span>
      <input id="dr-today" class="switch" type="checkbox" ${x.today?`checked`:``}>
    </label>
  </div>
  <div class="dr-chips chips" role="group" aria-label="Filter by speciality" data-reveal>
    <button type="button" class="chip" data-dept="" aria-pressed="${!x.dept}">All specialities</button>
    ${b.map(e=>`<button type="button" class="chip" data-dept="${e.id}" aria-pressed="${x.dept===e.id}">${t(e.name)}<span class="chip-n">${r.filter(t=>t.dept===e.id).length}</span></button>`).join(``)}
  </div>
  <div class="dr-status">
    <p class="dr-count" id="dr-count" aria-live="polite"></p>
    <button type="button" class="dr-reset link" id="dr-reset">Clear filters</button>
  </div>
  <div class="grid g4 dr-grid" id="dr-grid">${r.map(T).join(``)}</div>
  <div class="dr-empty tile" id="dr-empty" hidden>
    <span class="dr-empty-ic">${e(`search`)}</span>
    <h2>No one matches <em>that</em>, yet.</h2>
    <p class="muted">Try a broader search or another speciality. Or tell a coordinator what you need and they'll find the right person.</p>
    <div class="btn-row"><button type="button" class="btn btn--accent" id="dr-reset-2"><span>Show all doctors</span></button>${m(g(`Hi, I'm looking for a doctor for: `),`Ask a coordinator`,`line`,{ic:`chat`,attrs:`target="_blank" rel="noopener"`})}</div>
  </div>
</div></section>`,D=()=>`
<section class="section--tight dr-note"><div class="container dr-note-in">
  <span class="label">OPD hours</span>
  <p>${t(s.hours.opd)} <span aria-hidden="true">·</span> ${t(s.hours.sunday)}</p>
  ${m(`/departments.html`,`Browse by speciality`,`line`,{sm:!0})}
</div></section>`;function O(){let e=new URLSearchParams;x.q.trim()&&e.set(`q`,x.q.trim()),x.dept&&e.set(`dept`,x.dept),x.today&&e.set(`today`,`1`);let t=e.toString();history.replaceState(null,``,location.pathname+(t?`?`+t:``))}function k(e=!0){let n=p(`#dr-grid`),i=h(`.doc-card`,n),o=e&&c(),s=o?_.getState(i):null,l=0;i.forEach(e=>{let t=C(r.find(t=>t.id===e.dataset.id));e.hidden=!t,l+=t}),p(`#dr-empty`).hidden=l>0,n.classList.toggle(`is-empty`,!l);let f=a(x.dept);p(`#dr-count`).innerHTML=`<b>${l}</b> ${l===1?`doctor`:`doctors`}${f?` in ${t(f.name)}`:``}${x.today?` available today`:``}<span class="muted"> of ${r.length}</span>`,p(`#dr-reset`).hidden=!(x.q||x.dept||x.today),h(`.dr-chips .chip`).forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.dept===x.dept)),O(),o?(_.from(s,{duration:.8,ease:`expo.out`,absolute:!0,scale:!0,nested:!0,prune:!0,onEnter:e=>u.fromTo(e,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.7,ease:`expo.out`,delay:.08}),onLeave:e=>u.to(e,{opacity:0,scale:.85,duration:.35,ease:`power2.in`}),onComplete:()=>d(n)}),l||u.fromTo(`#dr-empty`,{opacity:0,y:20},{opacity:1,y:0,duration:.8,ease:`expo.out`})):d(n)}function A(){let e;p(`#dr-q`).addEventListener(`input`,t=>{x.q=t.target.value,clearTimeout(e),e=setTimeout(k,180)}),p(`#dr-today`).addEventListener(`change`,e=>{x.today=e.target.checked,k()}),p(`.dr-chips`).addEventListener(`click`,e=>{let t=e.target.closest(`.chip`);t&&(x.dept=t.dataset.dept,k())});let t=()=>{x.q=``,x.dept=``,x.today=!1,p(`#dr-q`).value=``,p(`#dr-today`).checked=!1,k()};p(`#dr-reset`).addEventListener(`click`,t),p(`#dr-reset-2`).addEventListener(`click`,t)}function j(){c()&&u.from(h(`.doc-card:not([hidden])`,p(`#dr-grid`)),{opacity:0,y:40,duration:1,ease:`expo.out`,stagger:.06,delay:.25,clearProps:`opacity,transform`})}f(()=>{p(`main`).innerHTML=w()+E()+D(),A(),k(!1),j()});