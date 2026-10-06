import{G as e,H as t,O as n,P as r,R as i,S as a,V as o,W as s,_ as c,b as l,g as u,t as d,y as f,z as p}from"./core-2HSPU3Fo.js";import{n as m}from"./media-Dj-sknZF.js";var h=[{title:`Listen before we treat`,short:`Listen`,text:`The answer is usually in the story. Consultants take the history themselves and give you the time to tell it properly.`,practice:[`Senior doctors see you in person`,`Room for questions in every consult`,`Family welcome in the conversation`]},{title:`Say it plainly`,short:`Clarity`,text:`A diagnosis you don't understand is only half a diagnosis. We explain what we found, what it means and what happens next, in your language.`,practice:[`Plain-language explanations`,`Written plans you can take home`,`Costs discussed before treatment`]},{title:`Treat time as care`,short:`Time`,text:`Waiting is not neutral. Booked slots run to the clock, reports come to your phone, and records follow you between specialists.`,practice:[`Booked patients seen first`,`Shared records across specialities`,`Digital reports and reminders`]},{title:`Never cut a corner`,short:`Safety`,text:`Safety is a habit, not a poster. Checks at every handover, strict infection control and the humility to ask a colleague.`,practice:[`Checklists at every handover`,`Infection control on every floor`,`Second opinions encouraged`]}],g=[{name:`Intensive care unit`,ic:`bed`,meta:`24/7`,img:`icu`,text:`Monitored beds with ventilator support and a critical-care team on duty around the clock.`},{name:`Neonatal ICU`,ic:`baby`,img:`nicu`,link:`/specialities/paediatrics.html`,text:`Close monitoring and specialist care for premature and unwell newborns.`},{name:`Operation theatres`,ic:`shield`,img:`ot`,text:`Modular theatres with twin surgical lights and anaesthesia workstations, for planned and emergency surgery.`},{name:`Wards`,ic:`bed`,img:`ward`,text:`Curtained bays with bedside oxygen and monitoring, and room for a family member to stay close.`},{name:`Laboratory`,ic:`flask`,meta:s.hours.lab,img:`lab`,link:`/specialities/diagnostics.html`,text:`An in-house lab for routine and urgent tests, so results arrive while decisions are being made.`},{name:`OPD & reception`,ic:`users`,img:`opd`,link:`/doctors.html`,text:`Bright, glass-fronted consultation rooms and a reception that keeps your file ready before you arrive.`},{name:`Emergency & ambulance`,ic:`ambulance`,meta:`24/7`,img:`emergency-entrance`,link:`/emergency.html`,text:`A separate emergency entrance with ramp access, and an ambulance on standby day and night.`},{name:`Pharmacy`,ic:`pill`,meta:s.hours.pharmacy,img:`exterior-2`,text:`An in-house pharmacy at the entrance, so you leave with your medicines in hand.`}],_=()=>`
<section class="ab-hero" data-instant>
  <div class="page-hero-glow"></div>
  <div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>About</span></nav>
    <div class="ab-hero-grid">
      <h1 data-split>A hospital that feels like <em>someone</em> is looking out for you.</h1>
      <div class="ab-hero-aside">
        ${s.founded?`<span class="label label--accent">Caring since ${n(s.founded)}</span>`:`<span class="label">About ${n(s.name)}</span>`}
        <p class="lead" data-reveal>${n(s.intro)}</p>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="ab-hero-media ph" data-reveal="scale">
      <div class="inner" data-parallax="0.08">${m(`exterior`,{sizes:`100vw`,eager:!0})}</div>
      <span class="ab-hero-cap label">${n(s.tagline)}</span>
    </div>
  </div>
</section>`,v=()=>`
<section class="section ab-story"><div class="container ab-story-row">
  <div class="sec-index label"><span class="num">(01)</span><span>Our story</span></div>
  <div>
    <p class="ab-story-big" data-reveal>We started from one question: what would a hospital feel like if it were designed around the person in the waiting chair, <em>not</em> the queue?</p>
    <div class="ab-story-cols">
      <p data-reveal>The answer shaped everything. ${e.length} specialities that share one record, so you never repeat your story. Diagnostics in the same building, so a scan doesn't become a second trip. An emergency team, ICU and pharmacy that never close.</p>
      <p data-reveal>And people who remember that a hospital visit is rarely a good day. Our specialists are senior, but they are also patient. They explain, they listen, and they treat your time as carefully as your health.</p>
    </div>
  </div>
</div></section>`,y=(e,t)=>`<circle class="ab-ring" data-ring="${e}" cx="120" cy="120" r="${t}" pathLength="1"/>`,b=()=>`
<section class="section section--alt ab-values" aria-labelledby="ab-values-h">
  <div class="container">
    ${i(`02`,`What we stand for`,`Four principles, <em>every</em> shift.`,`<p>These aren't slogans on a wall. They're the questions we ask at handover, in reviews and when something goes wrong.</p>`).replace(`<h2 `,`<h2 id="ab-values-h" `)}
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
        ${h.map((e,t)=>`
        <li class="ab-value" data-value="${t}">
          <span class="ab-value-num">${r(t+1)}</span>
          <h3>${e.title}</h3>
          <p>${e.text}</p>
          <ul class="ab-practice">${e.practice.map(e=>`<li>${o(`check`)}${e}</li>`).join(``)}</ul>
        </li>`).join(``)}
      </ol>
    </div>
  </div>
</section>`,x=()=>`
<section class="section ab-fac"><div class="container">
  ${i(`03`,`Facilities`,`Everything you need, <em>under</em> one roof.`,`<p>Critical care, surgery and diagnostics sit a corridor apart, so the right equipment and the right people reach you quickly.</p>`)}
  <div class="ab-fac-grid">
    ${g.map((e,t)=>{let i=e.link?`a`:`div`;return`<${i} class="ab-fac-cell${e.link?` is-link`:``}"${e.link?` href="${e.link}"`:``} data-reveal>
        ${e.img?`<div class="ab-fac-img">${m(e.img,{sizes:`(max-width: 860px) 100vw, 33vw`})}</div>`:``}
        <div class="ab-fac-top"><span class="ic-badge">${o(e.ic)}</span><span class="label num">${r(t+1)}</span></div>
        <h3>${e.name}</h3>
        <p>${e.text}</p>
        ${e.meta||e.link?`<div class="ab-fac-foot">${e.meta?`<span class="tag">${o(`clock`)}${n(e.meta)}</span>`:`<span></span>`}${e.link?`<span class="ab-fac-go">${o(`arrowUpRight`)}</span>`:``}</div>`:``}
      </${i}>`}).join(``)}
  </div>
</div></section>`,S=()=>`
<section class="section--tight section--alt ab-stats" aria-label="${n(s.name)} in numbers"><div class="container">
  <div class="ab-stats-grid">
    ${s.stats.map(e=>`<div class="ab-stat" data-reveal><b><span data-count="${e.value}">${e.value}</span><i>${n(e.suffix)}</i></b><span>${n(e.label)}</span></div>`).join(``)}
  </div>
</div></section>`,C=()=>`
<section class="section"><div class="container">
  <div class="ab-cta"><div class="ab-cta-glow"></div>
    <span class="label">Visit us</span>
    <h2 data-split>Come and see us in <em>person.</em></h2>
    <p data-reveal>Meet a specialist, walk the floors, ask us anything. Book a consultation, or call and we'll help you find the right doctor.</p>
    <div class="btn-row" data-reveal>${a(`/appointment.html`,`Book appointment`,`accent`,{ic:`calendar`})}${a(`/contact.html`,`Directions & contact`,`glass`,{ic:`pin`})}<a class="btn btn--glass" href="${p(s.phone)}" data-magnetic><span>${n(s.phone)}</span><span class="btn-ic">${o(`phone`)}</span></a></div>
  </div>
</div></section>`;function w(){let e=l(`.ab-value`),n=l(`.ab-ring`),i=l(`.ab-lumen-keys li`),a=f(`#ab-count`),o=f(`.ab-core`),s=t=>{e.forEach((e,n)=>e.classList.toggle(`is-active`,n===t)),i.forEach((e,n)=>e.classList.toggle(`is-on`,n<=t)),a.textContent=r(t+1)};if(!t()){f(`.ab-values`).classList.add(`is-static`),s(e.length-1);return}u.matchMedia({"(min-width: 861px)":()=>{c.set(n,{strokeDashoffset:1});let t=e.map((e,t)=>c.to(n[t],{strokeDashoffset:0,ease:`none`,scrollTrigger:{trigger:e,start:`top 75%`,end:`center 50%`,scrub:.6,onToggle:e=>e.isActive&&s(t),onEnterBack:()=>s(t)}})),r=c.fromTo(o,{scale:.55,opacity:.5},{scale:1.05,opacity:1,ease:`none`,scrollTrigger:{trigger:`.ab-value-list`,start:`top 70%`,end:`bottom 60%`,scrub:.6}}),i=c.fromTo(`.ab-lumen svg`,{rotate:-90},{rotate:30,ease:`none`,scrollTrigger:{trigger:`.ab-value-list`,start:`top bottom`,end:`bottom top`,scrub:1}});return s(0),()=>{t.forEach(e=>e.kill()),r.kill(),i.kill(),c.set(n,{clearProps:`all`})}},"(max-width: 860px)":()=>{e.forEach(e=>e.classList.add(`is-active`))}})}d(()=>{f(`main`).innerHTML=_()+v()+b()+x()+S()+C(),requestAnimationFrame(w)});