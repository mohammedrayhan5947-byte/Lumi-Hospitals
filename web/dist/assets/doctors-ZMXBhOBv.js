import{B as e,C as t,E as n,F as r,G as i,H as a,I as o,K as s,O as c,S as l,V as u,W as d,_ as f,b as p,h as m,t as h,y as g}from"./core-B_N3YoAS.js";import{t as _}from"./Flip-bUx2q-GE.js";f.registerPlugin(_);var v=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`][new Date().getDay()],y=e=>e.days.includes(v),b=i.filter(e=>s.some(t=>t.dept===e.id)),x={q:o.get(`q`)||``,dept:t(o.get(`dept`))?o.get(`dept`):``,today:o.get(`today`)===`1`},S=e=>[e.name,e.role,e.quals,t(e.dept)?.name,...e.focus,...e.langs].join(` `).toLowerCase(),C=e=>{if(x.dept&&e.dept!==x.dept||x.today&&!y(e))return!1;let t=x.q.trim().toLowerCase();return!t||t.split(/\s+/).every(t=>S(e).includes(t))},w=()=>r(`Doctors`,`Find the <em>right</em> doctor.`,`Search by name, condition or language. Every consultant here sees you personally, and booked slots run to the clock.`),T=e=>{let t=n(e).replace(` data-reveal`,``),r=y(e)?`<span class="dr-today"><i></i>In today<span class="dr-today-t"> · ${c(e.time)}</span></span>`:``;return t.replace(`</a>`,`${r}</a>`)},E=()=>`
<section class="section dr" aria-label="Doctor finder"><div class="container">
  <div class="dr-tools" data-reveal>
    <div class="dr-search">
      <label for="dr-q" class="sr-only">Search doctors</label>
      ${u(`search`)}
      <input id="dr-q" class="input" type="search" placeholder="Name, condition or language, e.g. “knee”, “Tamil”" autocomplete="off" value="${c(x.q)}">
    </div>
    <label class="dr-switch" for="dr-today">
      <span><b>Available today</b><small>${v===`Sun`?`Sunday · OPD closed`:`OPD on `+v}</small></span>
      <input id="dr-today" class="switch" type="checkbox" ${x.today?`checked`:``}>
    </label>
  </div>
  <div class="dr-chips chips" role="group" aria-label="Filter by speciality" data-reveal>
    <button type="button" class="chip" data-dept="" aria-pressed="${!x.dept}">All specialities</button>
    ${b.map(e=>`<button type="button" class="chip" data-dept="${e.id}" aria-pressed="${x.dept===e.id}">${c(e.name)}<span class="chip-n">${s.filter(t=>t.dept===e.id).length}</span></button>`).join(``)}
  </div>
  <div class="dr-status">
    <p class="dr-count" id="dr-count" aria-live="polite"></p>
    <button type="button" class="dr-reset link" id="dr-reset">Clear filters</button>
  </div>
  <div class="grid g4 dr-grid" id="dr-grid">${s.map(T).join(``)}</div>
  <div class="dr-empty tile" id="dr-empty" hidden>
    <span class="dr-empty-ic">${u(`search`)}</span>
    <h2>No one matches <em>that</em>, yet.</h2>
    <p class="muted">Try a broader search or another speciality. Or tell a coordinator what you need and they'll find the right person.</p>
    <div class="btn-row"><button type="button" class="btn btn--accent" id="dr-reset-2"><span>Show all doctors</span></button>${l(e(`Hi, I'm looking for a doctor for: `),`Ask a coordinator`,`line`,{ic:`chat`,attrs:`target="_blank" rel="noopener"`})}</div>
  </div>
</div></section>`,D=()=>`
<section class="section--tight dr-note"><div class="container dr-note-in">
  <span class="label">OPD hours</span>
  <p>${c(d.hours.opd)} <span aria-hidden="true">·</span> ${c(d.hours.sunday)}</p>
  ${l(`/departments.html`,`Browse by speciality`,`line`,{sm:!0})}
</div></section>`;function O(){let e=new URLSearchParams;x.q.trim()&&e.set(`q`,x.q.trim()),x.dept&&e.set(`dept`,x.dept),x.today&&e.set(`today`,`1`);let t=e.toString();history.replaceState(null,``,location.pathname+(t?`?`+t:``))}function k(e=!0){let n=g(`#dr-grid`),r=p(`.doc-card`,n),i=e&&a(),o=i?_.getState(r):null,l=0;r.forEach(e=>{let t=C(s.find(t=>t.id===e.dataset.id));e.hidden=!t,l+=t}),g(`#dr-empty`).hidden=l>0,n.classList.toggle(`is-empty`,!l);let u=t(x.dept);g(`#dr-count`).innerHTML=`<b>${l}</b> ${l===1?`doctor`:`doctors`}${u?` in ${c(u.name)}`:``}${x.today?` available today`:``}<span class="muted"> of ${s.length}</span>`,g(`#dr-reset`).hidden=!(x.q||x.dept||x.today),p(`.dr-chips .chip`).forEach(e=>e.setAttribute(`aria-pressed`,e.dataset.dept===x.dept)),O(),i?(_.from(o,{duration:.8,ease:`expo.out`,absolute:!0,scale:!0,nested:!0,prune:!0,onEnter:e=>f.fromTo(e,{opacity:0,scale:.85},{opacity:1,scale:1,duration:.7,ease:`expo.out`,delay:.08}),onLeave:e=>f.to(e,{opacity:0,scale:.85,duration:.35,ease:`power2.in`}),onComplete:()=>m(n)}),l||f.fromTo(`#dr-empty`,{opacity:0,y:20},{opacity:1,y:0,duration:.8,ease:`expo.out`})):m(n)}function A(){let e;g(`#dr-q`).addEventListener(`input`,t=>{x.q=t.target.value,clearTimeout(e),e=setTimeout(k,180)}),g(`#dr-today`).addEventListener(`change`,e=>{x.today=e.target.checked,k()}),g(`.dr-chips`).addEventListener(`click`,e=>{let t=e.target.closest(`.chip`);t&&(x.dept=t.dataset.dept,k())});let t=()=>{x.q=``,x.dept=``,x.today=!1,g(`#dr-q`).value=``,g(`#dr-today`).checked=!1,k()};g(`#dr-reset`).addEventListener(`click`,t),g(`#dr-reset-2`).addEventListener(`click`,t)}function j(){a()&&f.from(p(`.doc-card:not([hidden])`,g(`#dr-grid`)),{opacity:0,y:40,duration:1,ease:`expo.out`,stagger:.06,delay:.25,clearProps:`opacity,transform`})}h(()=>{g(`main`).innerHTML=w()+E()+D(),A(),k(!1),j()});