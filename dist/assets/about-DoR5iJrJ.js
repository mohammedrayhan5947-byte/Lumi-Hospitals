import{B as e,D as t,L as n,N as r,R as i,U as a,V as o,W as s,g as c,h as l,t as u,v as d,x as f,y as p}from"./core-BNTx_ofm.js";import{n as m}from"./media-CVPoxGO6.js";var h=[{title:`Listen before we treat`,short:`Listen`,text:`The answer is usually in the story. Consultants take the history themselves and give you the time to tell it properly.`,practice:[`Senior doctors see you in person`,`Room for questions in every consult`,`Family welcome in the conversation`]},{title:`Say it plainly`,short:`Clarity`,text:`A diagnosis you don't understand is only half a diagnosis. We explain what we found, what it means and what happens next, in your language.`,practice:[`Plain-language explanations`,`Written plans you can take home`,`Costs discussed before treatment`]},{title:`Treat time as care`,short:`Time`,text:`Waiting is not neutral. Booked slots run to the clock, reports come to your phone, and records follow you between specialists.`,practice:[`Booked patients seen first`,`Shared records across specialities`,`Digital reports and reminders`]},{title:`Never cut a corner`,short:`Safety`,text:`Safety is a habit, not a poster. Checks at every handover, strict infection control and the humility to ask a colleague.`,practice:[`Checklists at every handover`,`Infection control on every floor`,`Second opinions encouraged`]}],g=[{name:`Intensive care unit`,ic:`bed`,meta:`24/7`,img:`icu`,text:`Monitored beds with ventilator support and a critical-care team on duty around the clock.`},{name:`Neonatal ICU`,ic:`baby`,img:`nicu`,link:`/specialities/paediatrics.html`,text:`Close monitoring and specialist care for premature and unwell newborns.`},{name:`Operation theatres`,ic:`shield`,img:`ot`,text:`Modular theatres with twin surgical lights and anaesthesia workstations, for planned and emergency surgery.`},{name:`Wards`,ic:`bed`,img:`ward`,text:`Curtained bays with bedside oxygen and monitoring, and room for a family member to stay close.`},{name:`Laboratory`,ic:`flask`,meta:a.hours.lab,img:`lab`,link:`/specialities/diagnostics.html`,text:`An in-house lab for routine and urgent tests, so results arrive while decisions are being made.`},{name:`OPD & reception`,ic:`users`,img:`opd`,link:`/doctors.html`,text:`Bright, glass-fronted consultation rooms and a reception that keeps your file ready before you arrive.`},{name:`Emergency & ambulance`,ic:`ambulance`,meta:`24/7`,img:`emergency-entrance`,link:`/emergency.html`,text:`A separate emergency entrance with ramp access, and an ambulance on standby day and night.`},{name:`Pharmacy`,ic:`pill`,meta:a.hours.pharmacy,img:`exterior-2`,text:`An in-house pharmacy at the entrance, so you leave with your medicines in hand.`}],_=()=>`
<section class="ab-hero" data-instant>
  <div class="page-hero-glow"></div>
  <div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>About</span></nav>
    <div class="ab-hero-grid">
      <h1 data-split>A hospital that feels like <em>someone</em> is looking out for you.</h1>
      <div class="ab-hero-aside">
        ${a.founded?`<span class="label label--accent">Caring since ${t(a.founded)}</span>`:`<span class="label">About ${t(a.name)}</span>`}
        <p class="lead" data-reveal>${t(a.intro)}</p>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="ab-hero-media ph" data-reveal="scale">
      <div class="inner" data-parallax="0.08">${m(`exterior`,{sizes:`100vw`,eager:!0})}</div>
      <span class="ab-hero-cap label">${t(a.tagline)}</span>
    </div>
  </div>
</section>`,v=()=>`
<section class="section ab-story"><div class="container ab-story-row">
  <div class="sec-index label"><span class="num">(01)</span><span>Our story</span></div>
  <div>
    <p class="ab-story-big" data-reveal>We started from one question: what would a hospital feel like if it were designed around the person in the waiting chair, <em>not</em> the queue?</p>
    <div class="ab-story-cols">
      <p data-reveal>The answer shaped everything. ${s.length} specialities that share one record, so you never repeat your story. Diagnostics in the same building, so a scan doesn't become a second trip. An emergency team, ICU and pharmacy that never close.</p>
      <p data-reveal>And people who remember that a hospital visit is rarely a good day. Our specialists are senior, but they are also patient. They explain, they listen, and they treat your time as carefully as your health.</p>
    </div>
  </div>
</div></section>`,y=(e,t)=>`<circle class="ab-ring" data-ring="${e}" cx="120" cy="120" r="${t}" pathLength="1"/>`,b=()=>`
<section class="section section--alt ab-values" aria-labelledby="ab-values-h">
  <div class="container">
    ${n(`02`,`What we stand for`,`Four principles, <em>every</em> shift.`,`<p>These aren't slogans on a wall. They're the questions we ask at handover, in reviews and when something goes wrong.</p>`).replace(`<h2 `,`<h2 id="ab-values-h" `)}
    <div class="ab-values-grid">
      <div class="ab-lumen" aria-hidden="true">
        <div class="ab-lumen-in">
          <svg viewBox="0 0 240 240">
            <circle class="ab-ring-bg" cx="120" cy="120" r="110"/><circle class="ab-ring-bg" cx="120" cy="120" r="90"/>
            <circle class="ab-ring-bg" cx="120" cy="120" r="70"/><circle class="ab-ring-bg" cx="120" cy="120" r="50"/>
            ${y(0,50)}${y(1,70)}${y(2,90)}${y(3,110)}
          </svg>
          <div class="ab-core"></div>
          <div class="ab-count"><span class="num" id="ab-count">01</span><span class="label">/ ${r(h.length)}</span></div>
        </div>
        <ol class="ab-lumen-keys label">${h.map((e,t)=>`<li data-key="${t}"><span class="num">${r(t+1)}</span>${e.short}</li>`).join(``)}</ol>
      </div>
      <ol class="ab-value-list">
        ${h.map((t,n)=>`
        <li class="ab-value" data-value="${n}">
          <span class="ab-value-num">${r(n+1)}</span>
          <h3>${t.title}</h3>
          <p>${t.text}</p>
          <ul class="ab-practice">${t.practice.map(t=>`<li>${e(`check`)}${t}</li>`).join(``)}</ul>
        </li>`).join(``)}
      </ol>
    </div>
  </div>
</section>`,x=()=>`
<section class="section ab-fac"><div class="container">
  ${n(`03`,`Facilities`,`Everything you need, <em>under</em> one roof.`,`<p>Critical care, surgery and diagnostics sit a corridor apart, so the right equipment and the right people reach you quickly.</p>`)}
  <div class="ab-fac-grid">
    ${g.map((n,i)=>{let a=n.link?`a`:`div`;return`<${a} class="ab-fac-cell${n.link?` is-link`:``}"${n.link?` href="${n.link}"`:``} data-reveal>
        ${n.img?`<div class="ab-fac-img">${m(n.img,{sizes:`(max-width: 860px) 100vw, 33vw`})}</div>`:``}
        <div class="ab-fac-top"><span class="ic-badge">${e(n.ic)}</span><span class="label num">${r(i+1)}</span></div>
        <h3>${n.name}</h3>
        <p>${n.text}</p>
        ${n.meta||n.link?`<div class="ab-fac-foot">${n.meta?`<span class="tag">${e(`clock`)}${t(n.meta)}</span>`:`<span></span>`}${n.link?`<span class="ab-fac-go">${e(`arrowUpRight`)}</span>`:``}</div>`:``}
      </${a}>`}).join(``)}
  </div>
</div></section>`,S=()=>`
<section class="section--tight section--alt ab-stats" aria-label="${t(a.name)} in numbers"><div class="container">
  <div class="ab-stats-grid">
    ${a.stats.map(e=>`<div class="ab-stat" data-reveal><b><span data-count="${e.value}">${e.value}</span><i>${t(e.suffix)}</i></b><span>${t(e.label)}</span></div>`).join(``)}
  </div>
</div></section>`,C=()=>`
<section class="section"><div class="container">
  <div class="ab-cta"><div class="ab-cta-glow"></div>
    <span class="label">Visit us</span>
    <h2 data-split>Come and see us in <em>person.</em></h2>
    <p data-reveal>Meet a specialist, walk the floors, ask us anything. Book a consultation, or call and we'll help you find the right doctor.</p>
    <div class="btn-row" data-reveal>${f(`/appointment.html`,`Book appointment`,`accent`,{ic:`calendar`})}${f(`/contact.html`,`Directions & contact`,`glass`,{ic:`pin`})}<a class="btn btn--glass" href="${i(a.phone)}" data-magnetic><span>${t(a.phone)}</span><span class="btn-ic">${e(`phone`)}</span></a></div>
  </div>
</div></section>`;function w(){let e=p(`.ab-value`),t=p(`.ab-ring`),n=p(`.ab-lumen-keys li`),i=d(`#ab-count`),a=d(`.ab-core`),s=t=>{e.forEach((e,n)=>e.classList.toggle(`is-active`,n===t)),n.forEach((e,n)=>e.classList.toggle(`is-on`,n<=t)),i.textContent=r(t+1)};if(!o()){d(`.ab-values`).classList.add(`is-static`),s(e.length-1);return}l.matchMedia({"(min-width: 861px)":()=>{c.set(t,{strokeDashoffset:1});let n=e.map((e,n)=>c.to(t[n],{strokeDashoffset:0,ease:`none`,scrollTrigger:{trigger:e,start:`top 75%`,end:`center 50%`,scrub:.6,onToggle:e=>e.isActive&&s(n),onEnterBack:()=>s(n)}})),r=c.fromTo(a,{scale:.55,opacity:.5},{scale:1.05,opacity:1,ease:`none`,scrollTrigger:{trigger:`.ab-value-list`,start:`top 70%`,end:`bottom 60%`,scrub:.6}}),i=c.fromTo(`.ab-lumen svg`,{rotate:-90},{rotate:30,ease:`none`,scrollTrigger:{trigger:`.ab-value-list`,start:`top bottom`,end:`bottom top`,scrub:1}});return s(0),()=>{n.forEach(e=>e.kill()),r.kill(),i.kill(),c.set(t,{clearProps:`all`})}},"(max-width: 860px)":()=>{e.forEach(e=>e.classList.add(`is-active`))}})}u(()=>{d(`main`).innerHTML=_()+v()+b()+x()+S()+C(),requestAnimationFrame(w)});