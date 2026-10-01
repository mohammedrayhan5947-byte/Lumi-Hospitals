import{A as e,B as t,C as n,D as r,E as i,H as a,I as o,K as s,M as c,O as l,P as u,R as d,S as f,T as p,V as m,W as h,_ as g,t as _,y as v,z as y}from"./core-CdQdIRLX.js";var b=p(document.querySelector(`main`)?.dataset.id||o.get(`id`))||s[0],x=n(b.dept),S=r(b.dept).filter(e=>e.id!==b.id),C=S.length?S:s.filter(e=>e.id!==b.id).slice(0,4),w=`Dr. `+b.name.split(` `).pop(),T=`/appointment.html?dept=${b.dept}&doctor=${b.id}`,E=[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],D=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],O=new Date,k=D[O.getDay()],A=(e=>{let t=[...String(e).matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi)].map(([,e,t,n])=>e%12+(n.toUpperCase()===`PM`?12:0)+(+t||0)/60);return t.length===2?t:null})(b.time),j=7,M=new Date(O);M.setDate(O.getDate()-(O.getDay()+6)%7);var N=e=>{let t=new Date(M);return t.setDate(M.getDate()+e),t},P=(()=>{for(let e=0;e<7;e++){let t=new Date(O);t.setDate(O.getDate()+e);let n=D[t.getDay()];if(b.days.includes(n)&&!(e===0&&A&&O.getHours()+O.getMinutes()/60>=A[1]))return{date:t,label:e===0?`Today`:e===1?`Tomorrow`:t.toLocaleDateString(`en-IN`,{weekday:`long`})}}return null})(),F=(()=>{let e=l(b.name).split(` `),t=e.pop();return`${e.join(` `)} <em>${t}</em>`})(),I=()=>`
<section class="page-hero dc-hero"><div class="page-hero-glow"></div><div class="container dc-hero-in">
  <div class="dc-portrait ph" data-reveal="scale">
    <div class="dc-portrait-in" data-parallax="0.06">${c(b.photo,b.name,`<span class="initials">${e(b.name)}</span>`)}</div>
    ${x?`<a class="dc-dept" href="/specialities/${x.id}.html"><span class="dc-dept-ic">${m(x.icon)}</span>${l(x.name)}</a>`:``}
  </div>
  <div class="dc-intro">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/doctors.html">Doctors</a><span>/</span><span aria-current="page">${l(b.name)}</span></nav>
    <h1 data-split data-instant>${F}</h1>
    <p class="dc-role" data-reveal>${l(b.role)}</p>
    <dl class="dc-facts" data-reveal>
      <div><dt class="label">Experience</dt><dd><b>${b.exp}+</b> years</dd></div>
      <div><dt class="label">Qualifications</dt><dd>${l(b.quals)}</dd></div>
      <div><dt class="label">Languages</dt><dd>${b.langs.map(l).join(`, `)}</dd></div>
      <div><dt class="label">Next OPD</dt><dd>${P?`<span class="dc-live"></span>${P.label} · ${l(b.time)}`:`On request`}</dd></div>
    </dl>
    <div class="btn-row" data-reveal>${f(T,`Book with ${l(w)}`,`accent`,{ic:`calendar`})}${f(t(`Hi, I'd like an appointment with ${b.name}.`),`WhatsApp`,`line`,{ic:`chat`,attrs:`target="_blank" rel="noopener"`})}</div>
  </div>
</div></section>`,L=()=>`
<section class="section section--alt dc-sched"><div class="container">
  ${d(`01`,`OPD schedule`,`When to <em>find</em> ${l(w)}.`,`<p>${l(b.time)} on ${b.days.length===6&&!b.days.includes(`Sun`)?`Monday to Saturday`:b.days.map(l).join(`, `)}. Times can shift for surgery or emergencies, so we confirm every booking.</p>`)}
  <ol class="week" aria-label="Weekly OPD schedule">
    ${E.map((e,t)=>{let n=b.days.includes(e),r=e===k,i=N(t),a=A?(A[0]-j)/14*100:0,o=A?(A[1]-A[0])/14*100:100;return`<li class="day ${n?`is-on`:``} ${r?`is-today`:``}" aria-label="${i.toLocaleDateString(`en-IN`,{weekday:`long`})}: ${n?l(b.time):`no OPD`}${r?` (today)`:``}">
        <div class="day-head"><span class="label">${e}</span><b>${i.getDate()}</b>${r?`<span class="day-now">Today</span>`:``}</div>
        <div class="day-track" aria-hidden="true">${n?`<i class="day-bar" style="top:${a}%;height:${o}%">${b.time.split(/\s*[–-]\s*/).map(e=>`<span>${l(e)}</span>`).join(``)}</i>`:`<span class="day-off">—</span>`}</div>
        <div class="day-foot">${n?A?`${+(A[1]-A[0]).toFixed(1)} hrs OPD`:l(b.time):`No OPD`}</div>
      </li>`}).join(``)}
  </ol>
</div></section>`,R=()=>`
<section class="section"><div class="container dc-about">
  <div>
    <div class="sec-index label"><span class="num">(02)</span><span>About</span></div>
    <p class="dc-bio" data-reveal>${l(b.bio)}</p>
    ${x?`<a class="dc-deptcard tile" href="/specialities/${x.id}.html" data-reveal>
      <span class="ic-badge">${m(x.icon)}</span>
      <span><span class="label">Part of</span><b>${l(x.name)}</b><small>${l(x.summary)}</small></span>
      <span class="dc-deptcard-go">${m(`arrowUpRight`)}</span></a>`:``}
  </div>
  <div>
    <div class="sec-index label"><span class="num">(03)</span><span>Focus areas</span></div>
    <ol class="dc-focus">${b.focus.map((e,t)=>`<li data-reveal><span class="num">${u(t+1)}</span>${l(e)}</li>`).join(``)}</ol>
  </div>
</div></section>`,z=()=>`
<section class="section section--tight"><div class="container">
  <div class="dc-book">
    <div class="dc-book-glow" aria-hidden="true"></div>
    <div>
      <span class="label">${P?`Next available · ${P.label}`:`Appointments`}</span>
      <h2 data-split>See ${l(w)}, <em>on</em> time.</h2>
      <p>Booked patients go straight to the doctor's floor. Bring previous reports and a list of current medicines.</p>
    </div>
    <div class="btn-row">${f(T,`Book appointment`,`accent`,{ic:`calendar`})}${f(y(h.phone),l(h.phone),`glass`,{ic:`phone`})}</div>
  </div>
</div></section>`,B=()=>C.length?`
<section class="section section--alt"><div class="container">
  ${d(`04`,S.length?`Same speciality`:`More specialists`,S.length?`Others in <em>${l(x?.name||`this team`)}</em>.`:`Other doctors <em>you</em> can see.`,f(S.length?`/doctors.html?dept=${b.dept}`:`/doctors.html`,`All doctors`,`line`))}
  <div class="grid g4 dc-more">${C.map(i).join(``)}</div>
</div></section>`:``;function V(){a()&&(g.from(`.day-bar`,{scaleY:0,transformOrigin:`top`,duration:1.1,ease:`expo.out`,stagger:.07,scrollTrigger:{trigger:`.week`,start:`top 80%`,once:!0}}),g.from(`.day`,{y:24,opacity:0,duration:.9,ease:`expo.out`,stagger:.05,scrollTrigger:{trigger:`.week`,start:`top 85%`,once:!0},clearProps:`transform,opacity`}))}_(()=>{document.title=`${b.name}, ${x?x.name:`Doctor`} | ${h.name}`,v(`meta[name="description"]`)?.setAttribute(`content`,`${b.name}, ${b.role}. ${b.bio}`),v(`main`).innerHTML=I()+L()+R()+z()+B(),V()});