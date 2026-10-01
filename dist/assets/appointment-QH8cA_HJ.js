import{A as e,B as t,D as n,E as r,F as i,R as a,S as o,U as s,V as c,W as l,Y as u,g as d,j as f,k as p,r as m,t as h,v as g,w as _,x as v,y,z as b}from"./core-BNTx_ofm.js";var x=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],S=[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`],C=[{id:`morning`,label:`Morning`,range:`8 AM – 12 PM`,from:8,to:12},{id:`afternoon`,label:`Afternoon`,range:`12 PM – 4 PM`,from:12,to:16},{id:`evening`,label:`Evening`,range:`4 PM – 8 PM`,from:16,to:20}],w={id:`checkup`,name:`Health check-up`,icon:`flask`,summary:`A preventive package. Pick the package in step 3.`},T=[`Speciality`,`Doctor & time`,`Your details`,`Review`],E={step:1,max:1,dept:``,doctor:`any`,date:``,time:``};function D(e){let t=String(e).match(/(\d{1,2})(?::\d{2})?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::\d{2})?\s*(AM|PM)/i);if(!t)return null;let n=(e,t)=>e%12+(/pm/i.test(t)?12:0);return[n(t[1],t[2]),n(t[3],t[4])]}function O(){if(E.dept===w.id)return{days:new Set(x.slice(1)),ranges:[[8,12]]};let e=E.doctor===`any`?r(E.dept):[_(E.doctor)].filter(Boolean),t=new Set,n=[];return e.forEach(e=>{e.days.forEach(e=>t.add(e));let r=D(e.time);n.push(r||[8,20])}),{days:t,ranges:n}}var k=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,A=()=>Array.from({length:14},(e,t)=>{let n=new Date;return n.setHours(0,0,0,0),n.setDate(n.getDate()+t),n}),j=(e,t)=>t===0?`Today`:t===1?`Tomorrow`:x[e.getDay()],M=()=>`
<section class="page-hero ap-hero"><div class="page-hero-glow"></div><div class="container ap-hero-in">
  <div>
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Book an appointment</span></nav>
    <h1 data-split data-instant>Book a visit in <em>four</em> short steps.</h1>
  </div>
  <p class="lead" data-reveal>Choose a speciality, a doctor and a day, then send the request on WhatsApp or email. Our team confirms the exact time with you.</p>
</div></section>`,N=e=>`
  <label class="opt opt--dept">
    <input class="opt-in" type="radio" name="dept" value="${n(e.name)}" data-id="${e.id}" data-label="Speciality" required>
    <span class="opt-ic">${t(e.icon)}</span>
    <span class="opt-t"><b>${n(e.name)}</b><small>${n(e.summary)}</small></span>
    <span class="opt-tick" aria-hidden="true">${t(`check`)}</span>
  </label>`,P=()=>`
<section class="wz-step" data-step="1" aria-labelledby="wz-h1">
  <header class="wz-head"><span class="label">Step 01 of 04</span><h2 id="wz-h1" tabindex="-1">What do you need help with?</h2>
    <p class="muted">Not sure? Choose Internal Medicine and the physician will guide you.</p></header>
  <fieldset class="wz-set"><legend class="sr-only">Speciality</legend>
    <div class="opt-grid">${l.map(N).join(``)}${N(w)}</div>
  </fieldset>
  <p class="wz-err" role="alert" hidden></p>
</section>`,F=()=>`
<section class="wz-step" data-step="2" aria-labelledby="wz-h2" hidden>
  <header class="wz-head"><span class="label">Step 02 of 04</span><h2 id="wz-h2" tabindex="-1">Choose a doctor and a day.</h2>
    <p class="muted" id="wz-docnote"></p></header>
  <fieldset class="wz-set"><legend class="wz-legend">Doctor</legend><div class="doc-opts" id="doc-opts"></div></fieldset>
  <fieldset class="wz-set"><legend class="wz-legend">Date <span class="muted" id="wz-month"></span></legend>
    <div class="days" id="days"></div>
    <p class="form-note" id="days-note"></p></fieldset>
  <fieldset class="wz-set"><legend class="wz-legend">Time of day</legend><div class="slots" id="slots"></div></fieldset>
  <p class="wz-err" role="alert" hidden></p>
</section>`,I=()=>`
<section class="wz-step" data-step="3" aria-labelledby="wz-h3" hidden>
  <header class="wz-head"><span class="label">Step 03 of 04</span><h2 id="wz-h3" tabindex="-1">Who is the appointment for?</h2>
    <p class="muted">We only use these details to confirm your visit.</p></header>
  <div class="form-grid">
    <div class="field full"><label for="ap-name">Patient's full name <span class="req">*</span></label>
      <input class="input" id="ap-name" name="name" data-label="Patient" autocomplete="name" required minlength="2"></div>
    <div class="field"><label for="ap-mobile">Mobile number <span class="req">*</span></label>
      <input class="input" id="ap-mobile" name="mobile" data-label="Mobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile" required pattern="[+]?[0-9\\s\\-]{10,16}"></div>
    <div class="field"><label for="ap-age">Age</label>
      <input class="input" id="ap-age" name="age" data-label="Age" type="number" inputmode="numeric" min="0" max="120"></div>
    <div class="field full"><label for="ap-gender">Gender</label>
      <select class="select" id="ap-gender" name="gender" data-label="Gender">
        <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
      </select></div>
    <fieldset class="field full wz-set"><legend class="wz-legend wz-legend--sm">Visit type</legend>
      <div class="seg-opts">${[`First visit`,`Follow-up`,`Second opinion`].map((e,t)=>`
        <label class="seg-opt"><input class="opt-in" type="radio" name="visit" value="${e}" data-label="Visit type" ${t?``:`checked`}><span>${e}</span></label>`).join(``)}</div>
    </fieldset>
    <div class="field full"><label for="ap-pkg">Health package <span class="muted">(optional)</span></label>
      <select class="select" id="ap-pkg" name="package" data-label="Health package">
        <option value="">No package</option>
        ${u.map(t=>`<option value="${t.id}">${n(t.name)} · ${e(t.price)} · ${t.tests} tests</option>`).join(``)}
      </select></div>
    <div class="field full"><label for="ap-notes">Symptoms or reason for visit <span class="muted">(optional)</span></label>
      <textarea class="textarea" id="ap-notes" name="notes" data-label="Notes" rows="3" placeholder="For example: knee pain for two weeks, worse on stairs"></textarea></div>
  </div>
  <p class="wz-err" role="alert" hidden></p>
</section>`,L=()=>`
<section class="wz-step" data-step="4" aria-labelledby="wz-h4" hidden>
  <header class="wz-head"><span class="label">Step 04 of 04</span><h2 id="wz-h4" tabindex="-1">Check and send.</h2>
    <p class="muted">Send the request on WhatsApp or by email. A coordinator will confirm the exact time.</p></header>
  <dl class="review" id="review"></dl>
  <div class="field full">${m(`book and confirm my appointment`)}</div>
  <div class="send-row">
    <button class="btn btn--accent" type="submit"><span>Send on WhatsApp</span><span class="btn-ic">${t(`chat`)}</span></button>
    <button class="btn btn--line" type="button" data-send="email"><span>Send by email</span><span class="btn-ic">${t(`mail`)}</span></button>
  </div>
  <p class="form-note">Nothing is stored on this website. Your request opens in your own WhatsApp or email app, addressed to ${n(s.name)}.</p>
</section>`,R=()=>`
<div class="form-done" hidden>
  <span class="done-ic">${t(`check`)}</span>
  <h2>Request ready to send.</h2>
  <p class="lead">We've opened your WhatsApp or email app with the booking details. Once it's sent, our team will call or message you to confirm the time.</p>
  <div class="btn-row">${v(`/appointment.html`,`Book another visit`,`accent`,{ic:`calendar`})}${v(`/patient-guide.html`,`Prepare for your visit`,`line`)}</div>
</div>`,z=()=>`
<form class="wz" id="wz" data-wa="Appointment request" novalidate>
  <div class="wz-body">
    <nav class="wz-prog" aria-label="Booking progress">
      <ol>${T.map((e,t)=>`<li><button type="button" data-goto="${t+1}" ${t?`disabled`:`aria-current="step"`}><span class="num">0${t+1}</span><span class="t">${e}</span></button></li>`).join(``)}</ol>
      <div class="wz-bar" aria-hidden="true"><i id="wz-bar"></i></div>
      <p class="sr-only" aria-live="polite" id="wz-live"></p>
    </nav>
    <div class="wz-steps">${P()}${F()}${I()}${L()}</div>
    <div class="wz-nav">
      <button class="btn btn--line" type="button" id="wz-back" hidden><span class="btn-ic btn-ic--l">${t(`arrowLeft`)}</span><span>Back</span></button>
      <span class="wz-count label" id="wz-count">Step 1 of 4</span>
      <button class="btn btn--accent" type="button" id="wz-next"><span>Continue</span><span class="btn-ic">${t(`arrow`)}</span></button>
    </div>
  </div>
  ${R()}
</form>`,B=()=>`
<aside class="ap-side" aria-label="Booking help">
  <div class="tile sum" aria-live="polite">
    <span class="label">Your visit</span>
    <dl class="sum-list">
      <div data-k="dept"><dt>Speciality</dt><dd>Not chosen yet</dd></div>
      <div data-k="doctor"><dt>Doctor</dt><dd>Not chosen yet</dd></div>
      <div data-k="date"><dt>Day</dt><dd>Not chosen yet</dd></div>
      <div data-k="time"><dt>Time</dt><dd>Not chosen yet</dd></div>
    </dl>
  </div>
  <div class="em-card">
    <span class="em-pulse" aria-hidden="true">${t(`ambulance`)}</span>
    <div>
      <b>Is this an emergency?</b>
      <p>Don't book online. Call our 24/7 emergency line now, or come straight to the emergency room.</p>
      <a class="em-tel" href="${a(s.emergency)}">${t(`phone`)}<span>${n(s.emergency)}</span></a>
    </div>
  </div>
  <div class="tile talk">
    <span class="label">Prefer to talk?</span>
    <a href="${a(s.phone)}" class="talk-row">${t(`phone`)}<span><small>Reception</small>${n(s.phone)}</span></a>
    <a href="${b(`Hi, I'd like to book an appointment.`)}" target="_blank" rel="noopener" class="talk-row">${t(`chat`)}<span><small>WhatsApp</small>Message our care team</span></a>
    <div class="talk-row">${t(`clock`)}<span><small>OPD hours</small>${n(s.hours.opd)}<br>${n(s.hours.sunday)}</span></div>
  </div>
</aside>`,V=()=>`${M()}
<section class="section section--tight ap-sec"><div class="container">
  <a class="em-strip" href="${a(s.emergency)}">${t(`alert`)}<span>Emergency? Call <b>${n(s.emergency)}</b> now</span></a>
  <div class="ap-grid">${z()}${B()}</div>
</div></section>`,H=()=>g(`#wz`),U=e=>g(`input[name="${e}"]:checked`,H());function W(){let e=g(`#doc-opts`),i=E.dept===w.id,a=i?[]:r(E.dept),s=o(E.dept);g(`#wz-docnote`).textContent=i?`Check-ups are run by our preventive health team. Most need 10–12 hours of fasting, so they start in the morning.`:`${a.length} ${a.length===1?`specialist`:`specialists`} in ${s?s.name:`this speciality`}. Choose one, or let us find the first available.`,a.some(e=>e.id===E.doctor)||(E.doctor=`any`),e.innerHTML=`
    <label class="opt opt--doc">
      <input class="opt-in" type="radio" name="doctor" value="${i?`Preventive health team`:`Any available doctor`}" data-id="any" data-label="Doctor" required ${E.doctor===`any`?`checked`:``}>
      <span class="opt-av opt-av--any">${t(i?`flask`:`users`)}</span>
      <span class="opt-t"><b>${i?`Preventive health team`:`Any available doctor`}</b><small>${i?`Mon–Sat mornings`:`Fastest option. We match you to the next free slot.`}</small></span>
      <span class="opt-tick" aria-hidden="true">${t(`check`)}</span>
    </label>
    ${a.map(e=>`
    <label class="opt opt--doc">
      <input class="opt-in" type="radio" name="doctor" value="${n(e.name)}" data-id="${e.id}" data-label="Doctor" required ${E.doctor===e.id?`checked`:``}>
      <span class="opt-av ph">${f(e.photo,e.name,`<span class="initials">${p(e.name)}</span>`)}</span>
      <span class="opt-t"><b>${n(e.name)}</b><small>${n(e.role)}</small><small class="opt-when">${e.days.length===6?`Mon–Sat`:e.days.join(`, `)} · ${n(e.time)}</small></span>
      <span class="opt-tick" aria-hidden="true">${t(`check`)}</span>
    </label>`).join(``)}`,G()}function G(){let{days:e}=O(),t=A();E.date&&!e.has(x[new Date(E.date+`T00:00:00`).getDay()])&&(E.date=``);let n=[...new Set(t.map(e=>`${S[e.getMonth()]} ${e.getFullYear()}`))];g(`#wz-month`).textContent=`· `+n.join(` – `),g(`#days`).innerHTML=t.map((t,n)=>{let r=!e.has(x[t.getDay()]),i=`${x[t.getDay()]}, ${t.getDate()} ${S[t.getMonth()]} ${t.getFullYear()}`;return`<label class="day ${r?`is-off`:``}" title="${r?`Not available on `+x[t.getDay()]:i}">
      <input class="opt-in" type="radio" name="date" value="${i}" data-iso="${k(t)}" data-label="Date" required ${r?`disabled`:``} ${E.date===k(t)?`checked`:``}
        aria-label="${i}${n<2?` (`+j(t,n)+`)`:``}${r?`, not available`:``}">
      <span class="day-w">${j(t,n)}</span><span class="day-d">${t.getDate()}</span><span class="day-m">${t.getDate()===1||n===0?S[t.getMonth()]:`&nbsp;`}</span>
    </label>`}).join(``);let r=t.filter(t=>!e.has(x[t.getDay()])).length,i=E.dept===w.id?`Check-ups run`:E.doctor===`any`?`This speciality runs`:(_(E.doctor)?.name||`This doctor`)+` sees patients`,a=x.slice(1).concat(`Sun`).filter(t=>e.has(t));g(`#days-note`).textContent=r?`${i} on ${a.length===6&&!e.has(`Sun`)?`Mon–Sat`:a.join(`, `)}. Other days are greyed out.`:``,K()}function K(){let{ranges:e}=O(),t=new Date,n=E.date===k(t),r=r=>e.some(([e,t])=>e<r.to&&t>r.from)&&!(n&&t.getHours()>=r.to-1);E.time&&!r(C.find(e=>e.id===E.time))&&(E.time=``),g(`#slots`).innerHTML=C.map(t=>{let i=!r(t);return`<label class="slot ${i?`is-off`:``}">
      <input class="opt-in" type="radio" name="time" value="${t.label} (${t.range})" data-id="${t.id}" data-label="Preferred time" required ${i?`disabled`:``} ${E.time===t.id?`checked`:``}>
      <b>${t.label}</b><span>${t.range}</span>${i?`<small>${n&&e.some(([e,n])=>e<t.to&&n>t.from)?`Passed for today`:`Not available`}</small>`:``}
    </label>`}).join(``),q()}function q(){let e={dept:U(`dept`)?.value,doctor:U(`doctor`)?.value,date:U(`date`)?.value,time:U(`time`)?.value};y(`.sum-list > div`).forEach(t=>{let n=e[t.dataset.k],r=g(`dd`,t),i=n||`Not chosen yet`;r.textContent!==i&&(r.textContent=i,t.classList.toggle(`is-set`,!!n),n&&c()&&d.fromTo(r,{y:8,opacity:0},{y:0,opacity:1,duration:.6,ease:`expo.out`}))})}function J(){let t=H(),r=e=>t.elements.namedItem(e)?.value?.trim?.()??``,i=u.find(e=>e.id===r(`package`)),a=[[`Speciality`,U(`dept`)?.value,1],[`Doctor`,U(`doctor`)?.value,2],[`Day`,U(`date`)?.value,2],[`Time`,U(`time`)?.value,2],[`Patient`,[r(`name`),r(`age`)&&r(`age`)+` yrs`,t.elements.namedItem(`gender`).value].filter(Boolean).join(` · `),3],[`Mobile`,r(`mobile`),3],[`Visit type`,U(`visit`)?.value,3],[`Health package`,i?`${i.name} · ${e(i.price)}`:``,3],[`Notes`,r(`notes`),3]].filter(e=>e[1]);g(`#review`).innerHTML=a.map(([e,t,r])=>`<div><dt>${e}</dt><dd>${n(t)}</dd><dd class="rv-edit"><button type="button" class="link" data-goto="${r}">Change<span class="sr-only"> ${e.toLowerCase()}</span></button></dd></div>`).join(``)}function Y(e){let t=g(`.wz-step[data-step="${e}"]`),n=g(`.wz-err`,t),r=H(),i=``,a=null;if(y(`[aria-invalid]`,t).forEach(e=>e.removeAttribute(`aria-invalid`)),e===1&&!U(`dept`)&&(i=`Please choose a speciality to continue.`,a=g(`input[name="dept"]`,t)),e===2){let e=[!U(`doctor`)&&`a doctor`,!U(`date`)&&`a day`,!U(`time`)&&`a time of day`].filter(Boolean);e.length&&(i=`Please choose ${e.join(`, `).replace(/, ([^,]*)$/,` and $1`)}.`,a=U(`doctor`)?U(`date`)?g(`input[name="time"]:not(:disabled)`,t):g(`input[name="date"]:not(:disabled)`,t):g(`input[name="doctor"]`,t),a||(i=`There are no open slots for this choice in the next two weeks. Choose "Any available doctor" or call us.`))}if(e===3){let e=[],t=e=>r.elements.namedItem(e),n=t(`name`),o=t(`mobile`),s=t(`age`);n.value.trim().length<2&&e.push([n,`the patient's name`]);let c=o.value.replace(/\D/g,``);(c.length<10||c.length>13||!o.checkValidity())&&e.push([o,`a valid mobile number`]),s.value&&!s.checkValidity()&&e.push([s,`an age between 0 and 120`]),e.forEach(([e])=>e.setAttribute(`aria-invalid`,`true`)),e.length&&(i=`Please enter ${e.map(e=>e[1]).join(` and `)}.`,a=e[0][0])}return n.hidden=!i,n.textContent=i,i&&(a?.focus(),c()&&d.fromTo(n,{x:-6},{x:0,duration:.5,ease:`elastic.out(1, .3)`})),!i}function X(e,{focus:t=!0}={}){let n=E.step;if(e===n)return;if(e>n){for(let t=n;t<e;t++)if(!Y(t)){t!==n&&X(t);return}}E.step=e,E.max=Math.max(E.max,e),e===4&&J();let r=g(`.wz-step[data-step="${n}"]`),i=g(`.wz-step[data-step="${e}"]`),a=e>n?1:-1,o=()=>{r.hidden=!0,i.hidden=!1,c()&&d.fromTo(i,{x:28*a,opacity:0},{x:0,opacity:1,duration:.8,ease:`expo.out`,clearProps:`transform,opacity`}),t&&g(`h2`,i).focus({preventScroll:!0}),H().getBoundingClientRect().top<0&&(window.__lenis?window.__lenis.scrollTo(H(),{offset:-110}):H().scrollIntoView({block:`start`}))};c()&&n?d.to(r,{x:-20*a,opacity:0,duration:.22,ease:`power2.in`,onComplete:o}):o(),Z()}function Z(){let e=E.step;g(`#wz-bar`).style.transform=`scaleX(${e/T.length})`,y(`.wz-prog button`).forEach(t=>{let n=+t.dataset.goto;t.disabled=n>E.max,t.classList.toggle(`is-done`,n<e||n<=E.max&&n!==e),n===e?t.setAttribute(`aria-current`,`step`):t.removeAttribute(`aria-current`)}),g(`#wz-back`).hidden=e===1,g(`#wz-next`).hidden=e===T.length,g(`#wz-count`).textContent=`Step ${e} of ${T.length}`,g(`#wz-live`).textContent=`Step ${e} of ${T.length}: ${T[e-1]}`}function Q(){let e=H();e.addEventListener(`change`,t=>{let n=t.target;n.name===`dept`?(E.dept=n.dataset.id,W()):n.name===`doctor`?(E.doctor=n.dataset.id,G()):n.name===`date`?(E.date=n.dataset.iso,K()):n.name===`time`&&(E.time=n.dataset.id,q());let r=g(`.wz-err`,n.closest(`.wz-step`)||e);r&&!r.hidden&&[`dept`,`doctor`,`date`,`time`].includes(n.name)&&(r.hidden=!0)}),e.addEventListener(`input`,e=>e.target.removeAttribute(`aria-invalid`)),g(`#wz-next`).addEventListener(`click`,()=>X(E.step+1)),g(`#wz-back`).addEventListener(`click`,()=>X(E.step-1)),e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-goto]`);t&&!t.disabled&&X(+t.dataset.goto)}),e.addEventListener(`submit`,e=>{E.step<T.length&&(e.preventDefault(),e.stopImmediatePropagation(),X(E.step+1))},!0)}function $(){let e=H(),t=_(i.get(`doctor`)),n=u.find(e=>e.id===i.get(`package`)),r=t?t.dept:o(i.get(`dept`))?.id||``;if(!r&&n&&(r=w.id),n&&(e.elements.namedItem(`package`).value=n.id),!r)return;let a=g(`input[name="dept"][data-id="${r}"]`,e);a&&(a.checked=!0,E.dept=r,t&&(E.doctor=t.id),W(),E.max=2,g(`.wz-step[data-step="1"]`).hidden=!0,g(`.wz-step[data-step="2"]`).hidden=!1,E.step=2)}h(()=>{g(`main`).innerHTML=V(),Q(),$(),Z(),q()});