import{A as e,B as t,C as n,D as r,G as i,H as a,I as o,K as s,M as c,O as l,S as u,T as d,V as f,W as p,X as m,_ as h,b as g,j as _,m as ee,r as te,t as ne,y as v,z as y}from"./core-2HSPU3Fo.js";var b=String(p.crmUrl||``).replace(/\/+$/,``),x=!!b,re=6e3,S=class extends Error{constructor(e,t=0,n={},r=``){super(r||e),this.name=`CrmError`,this.kind=e,this.status=t,this.fields=n}};async function C(e,t={}){if(!x)throw new S(`unavailable`);let n=new AbortController,r=setTimeout(()=>n.abort(),re),i;try{i=await fetch(b+e,{...t,signal:n.signal,credentials:`omit`,headers:t.body?{"Content-Type":`application/json`}:void 0})}catch(e){throw new S(e?.name===`AbortError`?`timeout`:`network`)}finally{clearTimeout(r)}let a=null;try{a=await i.json()}catch{}if(i.ok)return a;throw i.status===400?new S(`invalid`,400,a?.fields||{},a?.error):i.status===409?new S(`conflict`,409,{},a?.error):new S(`server`,i.status,{},a?.error)}var w=null;function T(){return w||(w=(async()=>{let e={ok:!1,svc:new Map,doc:new Map};if(!x)return e;try{let[t,n]=await Promise.all([C(`/api/public/services`),C(`/api/public/doctors`)]);(Array.isArray(t)?t:[]).forEach(t=>t?.slug&&e.svc.set(t.slug,t)),(Array.isArray(n)?n:[]).forEach(t=>t?.slug&&e.doc.set(t.slug,t)),e.ok=e.svc.size>0&&e.doc.size>0}catch{}return e})(),w)}async function ie(e,t){let n=(await T()).doc.get(e);if(!n)throw new S(`unavailable`);let r=await C(`/api/public/availability?doctorId=${encodeURIComponent(n.id)}&date=${encodeURIComponent(t)}`);return{onLeave:!!r?.onLeave,reason:r?.reason||null,slots:Array.isArray(r?.slots)?r.slots:[]}}async function ae({serviceSlug:e,doctorSlug:t,...n}){let r=await T(),i=r.svc.get(e),a=r.doc.get(t);if(!i||!a)throw new S(`unavailable`);let o={...n,serviceId:i.id,doctorId:a.id};return Object.keys(o).forEach(e=>(o[e]===``||o[e]==null)&&delete o[e]),C(`/api/public/appointments`,{method:`POST`,body:JSON.stringify(o)})}var E=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],D=[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`],O=[{id:`morning`,label:`Morning`,range:`8 AM – 12 PM`,from:8,to:12},{id:`afternoon`,label:`Afternoon`,range:`12 PM – 4 PM`,from:12,to:16},{id:`evening`,label:`Evening`,range:`4 PM – 8 PM`,from:16,to:20}],k={id:`checkup`,name:`Health check-up`,icon:`flask`,summary:`A preventive package. Pick the package in step 3.`},A=[`Speciality`,`Doctor & time`,`Your details`,`Review`],j={step:1,max:1,dept:``,doctor:`any`,date:``,time:``,cat:null,forceWa:!1,assigned:null,fell:!1,notice:``},M=new Map,N=0,P=0,F=`Asia/Kolkata`,I=e=>new Date(e).toLocaleTimeString(`en-IN`,{hour:`numeric`,minute:`2-digit`,hour12:!0,timeZone:F}).toUpperCase(),oe=e=>new Date(e).toLocaleDateString(`en-IN`,{weekday:`short`,day:`numeric`,month:`short`,year:`numeric`,timeZone:F}).replace(/,/g,``)+` at `+I(e),se=e=>new Date(e).toLocaleString(`en-GB`,{hour:`2-digit`,hour12:!1,timeZone:F})%24;function ce(e){let t=String(e).match(/(\d{1,2})(?::\d{2})?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::\d{2})?\s*(AM|PM)/i);if(!t)return null;let n=(e,t)=>e%12+(/pm/i.test(t)?12:0);return[n(t[1],t[2]),n(t[3],t[4])]}function le(){if(j.dept===k.id)return{days:new Set(E.slice(1)),ranges:[[8,12]]};let e=j.doctor===`any`?r(j.dept):[d(j.doctor)].filter(Boolean),t=new Set,n=[];return e.forEach(e=>{e.days.forEach(e=>t.add(e));let r=ce(e.time);n.push(r||[8,20])}),{days:t,ranges:n}}var L=e=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`,R=()=>Array.from({length:14},(e,t)=>{let n=new Date;return n.setHours(0,0,0,0),n.setDate(n.getDate()+t),n}),z=(e,t)=>t===0?`Today`:t===1?`Tomorrow`:E[e.getDay()],ue=()=>`
<section class="page-hero ap-hero"><div class="page-hero-glow"></div><div class="container ap-hero-in">
  <div>
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Book an appointment</span></nav>
    <h1 data-split data-instant>Book a visit in <em>four</em> short steps.</h1>
  </div>
  <p class="lead" data-reveal>Choose a speciality, a doctor and a day, then send the request on WhatsApp or email. Our team confirms the exact time with you.</p>
</div></section>`,B=e=>`
  <label class="opt opt--dept">
    <input class="opt-in" type="radio" name="dept" value="${l(e.name)}" data-id="${e.id}" data-label="Speciality" required>
    <span class="opt-ic">${f(e.icon)}</span>
    <span class="opt-t"><b>${l(e.name)}</b><small>${l(e.summary)}</small></span>
    <span class="opt-tick" aria-hidden="true">${f(`check`)}</span>
  </label>`,de=()=>`
<section class="wz-step" data-step="1" aria-labelledby="wz-h1">
  <header class="wz-head"><span class="label">Step 01 of 04</span><h2 id="wz-h1" tabindex="-1">What do you need help with?</h2>
    <p class="muted">Not sure? Choose Internal Medicine and the physician will guide you.</p></header>
  <fieldset class="wz-set"><legend class="sr-only">Speciality</legend>
    <div class="opt-grid">${i.map(B).join(``)}${B(k)}</div>
  </fieldset>
  <p class="wz-err" role="alert" hidden></p>
</section>`,fe=()=>`
<section class="wz-step" data-step="2" aria-labelledby="wz-h2" hidden>
  <header class="wz-head"><span class="label">Step 02 of 04</span><h2 id="wz-h2" tabindex="-1">Choose a doctor and a day.</h2>
    <p class="muted" id="wz-docnote"></p></header>
  <fieldset class="wz-set"><legend class="wz-legend">Doctor</legend><div class="doc-opts" id="doc-opts"></div></fieldset>
  <fieldset class="wz-set"><legend class="wz-legend">Date <span class="muted" id="wz-month"></span></legend>
    <div class="days" id="days"></div>
    <p class="form-note" id="days-note"></p></fieldset>
  <input type="hidden" name="assigned" data-label="Doctor (matched)">
  <fieldset class="wz-set" id="slots-set"><legend class="wz-legend" id="slots-lg">Time of day</legend>
    <div id="pkg-pick" class="field pkg-pick" hidden><label for="ap-pkg2">Which health package?</label>
      <select class="select" id="ap-pkg2"><option value="">Choose a package</option>${m.map(e=>`<option value="${e.id}">${l(e.name)} · ${_(e.price)}</option>`).join(``)}</select></div>
    <div class="slots" id="slots"></div><p class="sr-only" role="status" aria-live="polite" id="slots-live"></p></fieldset>
  <p class="wz-err" role="alert" hidden></p>
</section>`,pe=()=>`
<section class="wz-step" data-step="3" aria-labelledby="wz-h3" hidden>
  <header class="wz-head"><span class="label">Step 03 of 04</span><h2 id="wz-h3" tabindex="-1">Who is the appointment for?</h2>
    <p class="muted">We only use these details to confirm your visit.</p></header>
  <div class="form-grid">
    <div class="field full"><label for="ap-name">Patient's full name <span class="req">*</span></label>
      <input class="input" id="ap-name" name="name" data-label="Patient" autocomplete="name" required minlength="2"></div>
    <div class="field"><label for="ap-mobile">Mobile number <span class="req">*</span></label>
      <input class="input" id="ap-mobile" name="mobile" data-label="Mobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile" required pattern="[+]?[0-9\\s\\-]{10,16}"></div>
    ${x?`<div class="field full"><label for="ap-email">Email <span class="muted">(optional, for your confirmation)</span></label>
      <input class="input" id="ap-email" name="email" data-label="Email" type="email" autocomplete="email"></div>`:``}
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
        ${m.map(e=>`<option value="${e.id}">${l(e.name)} · ${_(e.price)} · ${e.tests} tests</option>`).join(``)}
      </select></div>
    <div class="field full"><label for="ap-notes">Symptoms or reason for visit <span class="muted">(optional)</span></label>
      <textarea class="textarea" id="ap-notes" name="notes" data-label="Notes" rows="3" placeholder="For example: knee pain for two weeks, worse on stairs"></textarea></div>
  </div>
  <p class="wz-err" role="alert" hidden></p>
</section>`,me=()=>`
<section class="wz-step" data-step="4" aria-labelledby="wz-h4" hidden>
  <header class="wz-head"><span class="label">Step 04 of 04</span><h2 id="wz-h4" tabindex="-1">Check and send.</h2>
    <p class="muted">Send the request on WhatsApp or by email. A coordinator will confirm the exact time.</p></header>
  <dl class="review" id="review"></dl>
  <div class="field full">${te(`book and confirm my appointment`)}</div>
  <p class="crm-note" id="crm-note" role="alert" hidden></p>
  <div class="send-row">
    <button class="btn btn--accent" type="submit" id="wz-submit"><span>${x?`Confirm appointment`:`Send on WhatsApp`}</span>${x?``:`<span class="btn-ic">${f(`chat`)}</span>`}</button>
    <button class="btn btn--line" type="button" id="crm-retry" hidden><span>Try again</span></button>
    <button class="btn btn--line" type="button" data-send="email" ${x?`hidden`:``}><span>Send by email</span><span class="btn-ic">${f(`mail`)}</span></button>
  </div>
  <p class="form-note" id="wz-foot">${x?`Your details go to ${l(p.name)}'s booking system to reserve this slot, and are used only for your visit.`:`Nothing is stored on this website. Your request opens in your own WhatsApp or email app, addressed to ${l(p.name)}.`}</p>
</section>`,he=()=>`
<div class="form-done" hidden>
  <span class="done-ic">${f(`check`)}</span>
  <h2>Request ready to send.</h2>
  <p class="lead">We've opened your WhatsApp or email app with the booking details. Once it's sent, our team will call or message you to confirm the time.</p>
  <div class="btn-row">${u(`/appointment.html`,`Book another visit`,`accent`,{ic:`calendar`})}${u(`/patient-guide.html`,`Prepare for your visit`,`line`)}</div>
</div>`,ge=()=>`
<form class="wz" id="wz" data-wa="Appointment request" novalidate>
  <div class="wz-body">
    <nav class="wz-prog" aria-label="Booking progress">
      <ol>${A.map((e,t)=>`<li><button type="button" data-goto="${t+1}" ${t?`disabled`:`aria-current="step"`}><span class="num">0${t+1}</span><span class="t">${e}</span></button></li>`).join(``)}</ol>
      <div class="wz-bar" aria-hidden="true"><i id="wz-bar"></i></div>
      <p class="sr-only" aria-live="polite" id="wz-live"></p>
    </nav>
    <div class="wz-steps">${de()}${fe()}${pe()}${me()}</div>
    <div class="wz-nav">
      <button class="btn btn--line" type="button" id="wz-back" hidden><span class="btn-ic btn-ic--l">${f(`arrowLeft`)}</span><span>Back</span></button>
      <span class="wz-count label" id="wz-count">Step 1 of 4</span>
      <button class="btn btn--accent" type="button" id="wz-next"><span>Continue</span><span class="btn-ic">${f(`arrow`)}</span></button>
    </div>
  </div>
  ${he()}
</form>`,_e=()=>`
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
    <span class="em-pulse" aria-hidden="true">${f(`ambulance`)}</span>
    <div>
      <b>Is this an emergency?</b>
      <p>Don't book online. Call our 24/7 emergency line now, or come straight to the emergency room.</p>
      <a class="em-tel" href="${y(p.emergency)}">${f(`phone`)}<span>${l(p.emergency)}</span></a>
    </div>
  </div>
  <div class="tile talk">
    <span class="label">Prefer to talk?</span>
    <a href="${y(p.phone)}" class="talk-row">${f(`phone`)}<span><small>Reception</small>${l(p.phone)}</span></a>
    <a href="${t(`Hi, I'd like to book an appointment.`)}" target="_blank" rel="noopener" class="talk-row">${f(`chat`)}<span><small>WhatsApp</small>Message our care team</span></a>
    <div class="talk-row">${f(`clock`)}<span><small>OPD hours</small>${l(p.hours.opd)}<br>${l(p.hours.sunday)}</span></div>
  </div>
</aside>`,ve=()=>`${ue()}
<section class="section section--tight ap-sec"><div class="container">
  <a class="em-strip" href="${y(p.emergency)}">${f(`alert`)}<span>Emergency? Call <b>${l(p.emergency)}</b> now</span></a>
  <div class="ap-grid">${ge()}${_e()}</div>
</div></section>`,V=()=>v(`#wz`),H=e=>v(`input[name="${e}"]:checked`,V());function U(){let t=v(`#doc-opts`),i=j.dept===k.id,a=i?[]:r(j.dept),o=n(j.dept);v(`#wz-docnote`).textContent=i?`Check-ups are run by our preventive health team. Most need 10–12 hours of fasting, so they start in the morning.`:`${a.length} ${a.length===1?`specialist`:`specialists`} in ${o?o.name:`this speciality`}. Choose one, or let us find the first available.`,a.some(e=>e.id===j.doctor)||(j.doctor=`any`),t.innerHTML=`
    <label class="opt opt--doc">
      <input class="opt-in" type="radio" name="doctor" value="${i?`Preventive health team`:`Any available doctor`}" data-id="any" data-label="Doctor" required ${j.doctor===`any`?`checked`:``}>
      <span class="opt-av opt-av--any">${f(i?`flask`:`users`)}</span>
      <span class="opt-t"><b>${i?`Preventive health team`:`Any available doctor`}</b><small>${i?`Mon–Sat mornings`:`Fastest option. We match you to the next free slot.`}</small></span>
      <span class="opt-tick" aria-hidden="true">${f(`check`)}</span>
    </label>
    ${a.map(t=>`
    <label class="opt opt--doc">
      <input class="opt-in" type="radio" name="doctor" value="${l(t.name)}" data-id="${t.id}" data-label="Doctor" required ${j.doctor===t.id?`checked`:``}>
      <span class="opt-av ph">${c(t.photo,t.name,`<span class="initials">${e(t.name)}</span>`)}</span>
      <span class="opt-t"><b>${l(t.name)}</b><small>${l(t.role)}</small><small class="opt-when">${t.days.length===6?`Mon–Sat`:t.days.join(`, `)} · ${l(t.time)}</small></span>
      <span class="opt-tick" aria-hidden="true">${f(`check`)}</span>
    </label>`).join(``)}`,W()}function W(){let e=q(),t=e?new Set(E):le().days,n=R();j.date&&!t.has(E[new Date(j.date+`T00:00:00`).getDay()])&&(j.date=``);let r=[...new Set(n.map(e=>`${D[e.getMonth()]} ${e.getFullYear()}`))];if(v(`#wz-month`).textContent=`· `+r.join(` – `),v(`#days`).innerHTML=n.map((e,n)=>{let r=!t.has(E[e.getDay()]),i=`${E[e.getDay()]}, ${e.getDate()} ${D[e.getMonth()]} ${e.getFullYear()}`;return`<label class="day ${r?`is-off`:``}" title="${r?`Not available on `+E[e.getDay()]:i}">
      <input class="opt-in" type="radio" name="date" value="${i}" data-iso="${L(e)}" data-label="Date" required ${r?`disabled`:``} ${j.date===L(e)?`checked`:``}
        aria-label="${i}${n<2?` (`+z(e,n)+`)`:``}${r?`, not available`:``}">
      <span class="day-w">${z(e,n)}</span><span class="day-d">${e.getDate()}</span><span class="day-m">${e.getDate()===1||n===0?D[e.getMonth()]:`&nbsp;`}</span>
    </label>`}).join(``),e)return v(`#days-note`).textContent=e.needPkg?``:`Free times are checked live. Days with nothing available are greyed out as we check them.`,e.needPkg||Se(e),X();let i=n.filter(e=>!t.has(E[e.getDay()])).length,a=j.dept===k.id?`Check-ups run`:j.doctor===`any`?`This speciality runs`:(d(j.doctor)?.name||`This doctor`)+` sees patients`,o=E.slice(1).concat(`Sun`).filter(e=>t.has(e));v(`#days-note`).textContent=j.notice||(i?`${a} on ${o.length===6&&!t.has(`Sun`)?`Mon–Sat`:o.join(`, `)}. Other days are greyed out.`:``),X()}var G=()=>v(`#ap-pkg`)?.value||``,K=(e,t)=>e+`|`+t;function q(){let e=j.cat;if(!x||!e?.ok||j.forceWa||!j.dept)return null;let t=j.dept===k.id,n=t?G()?`pkg-`+G():``:j.dept;if(n&&!e.svc.has(n))return null;let i=(t?s:j.doctor===`any`?r(j.dept):[d(j.doctor)].filter(Boolean)).filter(t=>e.doc.has(t.id));return i.length?{service:n,cands:i,needPkg:!n}:null}var J=()=>!j.fell&&!!q()&&!!j.assigned&&/^\d{4}-/.test(j.time),Y=e=>d(e)?.name||``;function ye(e,t){let n=K(e,t);if(!M.has(n)){let r=ie(e,t);r.catch(()=>M.delete(n)),M.set(n,r)}return M.get(n)}async function be(e,t){let n=await Promise.all(e.cands.map(e=>ye(e.id,t).then(t=>({d:e,r:{...t,slots:t.slots.filter(e=>new Date(e)>new Date)}})))),r=n.find(e=>e.r.slots.length);return r?{doc:r.d,slots:r.r.slots}:{doc:null,slots:[],onLeave:n.every(e=>e.r.onLeave),reason:n.length===1?n[0].r.reason:null}}function xe(e,t){let n=v(`#days input[data-iso="${e}"]`);if(!n||t.slots.length)return;let r=n.closest(`.day`),i=t.onLeave?`on leave`:`no free times`;r.classList.add(`is-off`),n.disabled=!0,r.title=t.onLeave?`Doctor on leave`:`No free times`,n.setAttribute(`aria-label`,n.getAttribute(`aria-label`)+`, `+i),n.checked&&(n.checked=!1,j.date=``,j.time=``,Z())}async function Se(e){if(e.cands.length>3)return;let t=++N,n=R().map(L),r=0,i=async()=>{for(;r<n.length&&t===N;){let i=n[r++];try{let n=await be(e,i);t===N&&xe(i,n)}catch{}}};await Promise.all([i(),i(),i()])}function Ce(e){let t=v(`#slots`),n=v(`#slots-live`);t.className=`slots slots--crm`,t.removeAttribute(`aria-busy`),v(`#slots-lg`).textContent=`Available times`;let r=v(`#pkg-pick`);r.hidden=j.dept!==k.id,r.hidden||(v(`#ap-pkg2`).value=G()),j.assigned=null,v(`input[name="assigned"]`).value=``;let i=e=>{t.innerHTML=`<p class="slot-empty">${e}</p>`,Z()};if(e.needPkg)return i(`Choose a health package to see free times.`);if(!j.date)return i(`Choose a day to see free times.`);let a=++P,o=j.date;t.setAttribute(`aria-busy`,`true`),t.innerHTML=`<div class="chips" aria-hidden="true">${Array.from({length:9},()=>`<span class="chip sk">&nbsp;</span>`).join(``)}</div>`,n.textContent=`Loading available times.`,be(e,o).then(r=>{if(a!==P)return;if(t.removeAttribute(`aria-busy`),!r.slots.length){xe(o,r);let i=e.cands.length===1?Y(e.cands[0].id):`Our doctors`,a=r.onLeave?`${i} ${e.cands.length===1?`is`:`are`} on leave this day${r.reason?` (`+r.reason+`)`:``}. Please choose another day.`:`No free times on this day. Please choose another day.`;return t.innerHTML=`<p class="slot-empty">${l(a)}</p><p class="slot-alt"><button type="button" class="link" id="slot-alt">Prefer to send a request instead?</button></p>`,n.textContent=a,Z()}j.assigned=r.doc.id,v(`input[name="assigned"]`).value=r.doc.name,r.slots.includes(j.time)||(j.time=``);let i=[[`Morning`,e=>e<12],[`Afternoon`,e=>e>=12&&e<16],[`Evening`,e=>e>=16]],s=e.cands.length>1?`<p class="slot-note">With <b>${l(r.doc.name)}</b>, the first doctor with free times this day.</p>`:``;t.innerHTML=s+i.map(([e,t])=>{let n=r.slots.filter(e=>t(se(e)));return n.length?`<div class="slot-group" role="group" aria-label="${e}"><span class="label">${e}</span><div class="chips">${n.map(e=>`
        <label class="chip"><input class="opt-in" type="radio" name="time" value="${I(e)}" data-id="${e}" data-label="Preferred time" required ${j.time===e?`checked`:``}><span>${I(e)}</span></label>`).join(``)}</div></div>`:``}).join(``),n.textContent=`${r.slots.length} free ${r.slots.length===1?`time`:`times`} loaded.`,Z()}).catch(()=>{a===P&&(j.forceWa=!0,j.notice=`We couldn't load live times just now. Choose a time of day and we'll confirm by WhatsApp or email.`,n.textContent=j.notice,W())})}function X(){if(x&&!j.cat)return v(`#slots`).className=`slots slots--crm`,v(`#slots`).innerHTML=`<div class="chips" aria-hidden="true">${Array.from({length:6},()=>`<span class="chip sk">&nbsp;</span>`).join(``)}</div>`,Z();let e=q();if(e)return Ce(e);j.assigned=null,v(`input[name="assigned"]`).value=``,v(`#slots`).className=`slots`,v(`#slots-lg`).textContent=`Time of day`,v(`#pkg-pick`).hidden=!0;let{ranges:t}=le(),n=new Date,r=j.date===L(n),i=e=>t.some(([t,n])=>t<e.to&&n>e.from)&&!(r&&n.getHours()>=e.to-1),a=O.find(e=>e.id===j.time);j.time&&(!a||!i(a))&&(j.time=``),v(`#slots`).innerHTML=O.map(e=>{let n=!i(e);return`<label class="slot ${n?`is-off`:``}">
      <input class="opt-in" type="radio" name="time" value="${e.label} (${e.range})" data-id="${e.id}" data-label="Preferred time" required ${n?`disabled`:``} ${j.time===e.id?`checked`:``}>
      <b>${e.label}</b><span>${e.range}</span>${n?`<small>${r&&t.some(([t,n])=>t<e.to&&n>e.from)?`Passed for today`:`Not available`}</small>`:``}
    </label>`}).join(``),Z()}function Z(){let e={dept:H(`dept`)?.value,doctor:j.assigned?Y(j.assigned):H(`doctor`)?.value,date:H(`date`)?.value,time:H(`time`)?.value};g(`.sum-list > div`).forEach(t=>{let n=e[t.dataset.k],r=v(`dd`,t),i=n||`Not chosen yet`;r.textContent!==i&&(r.textContent=i,t.classList.toggle(`is-set`,!!n),n&&a()&&h.fromTo(r,{y:8,opacity:0},{y:0,opacity:1,duration:.6,ease:`expo.out`}))})}function we(){let e=V(),t=t=>e.elements.namedItem(t)?.value?.trim?.()??``,n=m.find(e=>e.id===t(`package`)),r=[[`Speciality`,H(`dept`)?.value,1],[`Doctor`,j.assigned?Y(j.assigned):H(`doctor`)?.value,2],[`Day`,H(`date`)?.value,2],[`Time`,H(`time`)?.value,2],[`Patient`,[t(`name`),t(`age`)&&t(`age`)+` yrs`,e.elements.namedItem(`gender`).value].filter(Boolean).join(` · `),3],[`Mobile`,t(`mobile`),3],[`Visit type`,H(`visit`)?.value,3],[`Health package`,n?`${n.name} · ${_(n.price)}`:``,3],[`Notes`,t(`notes`),3]].filter(e=>e[1]);v(`#review`).innerHTML=r.map(([e,t,n])=>`<div><dt>${e}</dt><dd>${l(t)}</dd><dd class="rv-edit"><button type="button" class="link" data-goto="${n}">Change<span class="sr-only"> ${e.toLowerCase()}</span></button></dd></div>`).join(``)}function Te(e){let t=v(`.wz-step[data-step="${e}"]`),n=v(`.wz-err`,t),r=V(),i=``,o=null;if(g(`[aria-invalid]`,t).forEach(e=>e.removeAttribute(`aria-invalid`)),e===1&&!H(`dept`)&&(i=`Please choose a speciality to continue.`,o=v(`input[name="dept"]`,t)),e===2){let e=[!H(`doctor`)&&`a doctor`,!H(`date`)&&`a day`,!H(`time`)&&(q()?`a time`:`a time of day`)].filter(Boolean);e.length&&(i=`Please choose ${e.join(`, `).replace(/, ([^,]*)$/,` and $1`)}.`,o=H(`doctor`)?H(`date`)?v(`input[name="time"]:not(:disabled)`,t):v(`input[name="date"]:not(:disabled)`,t):v(`input[name="doctor"]`,t),o||(i=`There are no open slots for this choice in the next two weeks. Choose "Any available doctor" or call us.`))}if(e===3){let e=[],t=e=>r.elements.namedItem(e),n=t(`name`),a=t(`mobile`),s=t(`age`);n.value.trim().length<2&&e.push([n,`the patient's name`]);let c=a.value.replace(/\D/g,``);(c.length<10||c.length>13||!a.checkValidity())&&e.push([a,`a valid mobile number`]),s.value&&!s.checkValidity()&&e.push([s,`an age between 0 and 120`]),e.forEach(([e])=>e.setAttribute(`aria-invalid`,`true`)),e.length&&(i=`Please enter ${e.map(e=>e[1]).join(` and `)}.`,o=e[0][0])}return n.hidden=!i,n.textContent=i,i&&(o?.focus(),a()&&h.fromTo(n,{x:-6},{x:0,duration:.5,ease:`elastic.out(1, .3)`})),!i}function Q(e,{focus:t=!0}={}){let n=j.step;if(e===n)return;if(e>n){for(let t=n;t<e;t++)if(!Te(t)){t!==n&&Q(t);return}}j.step=e,j.max=Math.max(j.max,e),e===4&&(we(),$());let r=v(`.wz-step[data-step="${n}"]`),i=v(`.wz-step[data-step="${e}"]`),o=e>n?1:-1,s=()=>{r.hidden=!0,i.hidden=!1,a()&&h.fromTo(i,{x:28*o,opacity:0},{x:0,opacity:1,duration:.8,ease:`expo.out`,clearProps:`transform,opacity`}),t&&v(`h2`,i).focus({preventScroll:!0}),V().getBoundingClientRect().top<0&&(window.__lenis?window.__lenis.scrollTo(V(),{offset:-110}):V().scrollIntoView({block:`start`}))};a()&&n?h.to(r,{x:-20*o,opacity:0,duration:.22,ease:`power2.in`,onComplete:s}):s(),Ee()}function Ee(){let e=j.step;v(`#wz-bar`).style.transform=`scaleX(${e/A.length})`,g(`.wz-prog button`).forEach(t=>{let n=+t.dataset.goto;t.disabled=n>j.max,t.classList.toggle(`is-done`,n<e||n<=j.max&&n!==e),n===e?t.setAttribute(`aria-current`,`step`):t.removeAttribute(`aria-current`)}),v(`#wz-back`).hidden=e===1,v(`#wz-next`).hidden=e===A.length,v(`#wz-count`).textContent=`Step ${e} of ${A.length}`,v(`#wz-live`).textContent=`Step ${e} of ${A.length}: ${A[e-1]}`}function De(){let e=V();e.addEventListener(`change`,t=>{let n=t.target;n.name===`dept`?(j.dept=n.dataset.id,j.forceWa=!1,j.notice=``,j.time=``,U()):n.name===`doctor`?(j.doctor=n.dataset.id,j.forceWa=!1,j.notice=``,j.time=``,W()):n.id===`ap-pkg2`?(e.elements.namedItem(`package`).value=n.value,j.time=``,W()):n.name===`package`?j.dept===k.id&&(j.time=``,W()):n.name===`date`?(j.date=n.dataset.iso,X()):n.name===`time`&&(j.time=n.dataset.id,Z());let r=v(`.wz-err`,n.closest(`.wz-step`)||e);r&&!r.hidden&&[`dept`,`doctor`,`date`,`time`].includes(n.name)&&(r.hidden=!0)}),e.addEventListener(`input`,e=>e.target.removeAttribute(`aria-invalid`)),v(`#wz-next`).addEventListener(`click`,()=>Q(j.step+1)),v(`#wz-back`).addEventListener(`click`,()=>Q(j.step-1)),e.addEventListener(`click`,e=>{let t=e.target.closest(`[data-goto]`);t&&!t.disabled&&Q(+t.dataset.goto)}),e.addEventListener(`submit`,e=>{j.step<A.length?(e.preventDefault(),e.stopImmediatePropagation(),Q(j.step+1)):J()&&(e.preventDefault(),e.stopImmediatePropagation(),Pe())},!0),e.addEventListener(`click`,t=>{t.target.closest(`#slot-alt`)&&(j.forceWa=!0,j.notice=`Choose a time of day and we'll confirm by WhatsApp or email.`,W()),t.target.closest(`#crm-retry`)&&(j.fell=!1,$(),e.requestSubmit(v(`#wz-submit`)))})}function Oe(){let e=V(),t=d(o.get(`doctor`)),r=m.find(e=>e.id===o.get(`package`)),i=t?t.dept:n(o.get(`dept`))?.id||``;if(!i&&r&&(i=k.id),r&&(e.elements.namedItem(`package`).value=r.id),!i)return;let a=v(`input[name="dept"][data-id="${i}"]`,e);a&&(a.checked=!0,j.dept=i,t&&(j.doctor=t.id),U(),j.max=2,v(`.wz-step[data-step="1"]`).hidden=!0,v(`.wz-step[data-step="2"]`).hidden=!1,j.step=2)}var ke=`Your details go to ${p.name}'s booking system to reserve this slot, and are used only for your visit.`,Ae=`Nothing is stored on this website. Your request opens in your own WhatsApp or email app, addressed to ${p.name}.`;function $(){if(!x)return;let e=J();v(`#wz-submit span`).textContent=e?`Confirm appointment`:`Send on WhatsApp`,v(`[data-send="email"]`).hidden=e,v(`#crm-retry`).hidden=!(j.fell&&q()&&j.assigned&&/^\d{4}-/.test(j.time)),v(`#wz-foot`).textContent=e?ke:Ae,v(`#wz-h4 + p`).textContent=e?`Confirm to reserve this time. We'll show your appointment code straight away.`:`Send the request on WhatsApp or by email. A coordinator will confirm the exact time.`}var je=e=>(typeof e==`string`?e:e?.name)||``;function Me(e,t,n,r,i){let a=e=>new Date(e).toISOString().replace(/[-:]/g,``).replace(/\.\d{3}/,``),o=e=>String(e).replace(/[\\;,]/g,e=>`\\`+e).replace(/\n/g,`\\n`),s=new Date(new Date(r).getTime()+(i||30)*6e4);return[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//${p.name}//Booking//EN`,`BEGIN:VEVENT`,`UID:${e}@lumi-booking`,`DTSTAMP:${a(new Date)}`,`DTSTART:${a(r)}`,`DTEND:${a(s)}`,`SUMMARY:${o(`${t||`Appointment`} · ${p.name}`)}`,`LOCATION:${o(p.address)}`,`DESCRIPTION:${o(`Booking code ${e}${n?`. `+n:``}`)}`,`END:VEVENT`,`END:VCALENDAR`].join(`\r
`)}function Ne(e,n){let r=V(),i=v(`.form-done`,r),a=e.appointmentCode||``,o=e.scheduledAt||n.scheduledAt,s=je(e.doctor)||n.doc,c=je(e.service)||n.svc,d=n.service.startsWith(`pkg-`);i.innerHTML=`<span class="done-ic">${f(`check`)}</span>
    <h2 id="cf-h" tabindex="-1">Appointment confirmed.</h2>
    <p class="lead">Your visit is booked. Keep this code handy, you'll need it at reception.</p>
    <span class="cf-code" aria-label="Appointment code ${l(a)}">${l(a)}</span>
    <dl class="cf-list">
      <div><dt>Doctor</dt><dd>${l(s)}</dd></div>
      <div><dt>For</dt><dd>${l(c)}</dd></div>
      <div><dt>When</dt><dd>${l(oe(o))}</dd></div>
    </dl>
    <span class="label">What to bring</span>
    <ul class="cf-bring"><li>A photo ID</li><li>Past reports, scans and prescriptions</li><li>A list of the medicines you take</li>${d?`<li>Fasting for 10–12 hours, if your package needs it</li>`:``}</ul>
    <div class="btn-row">
      <button class="btn btn--accent" type="button" id="cf-ics"><span>Add to calendar</span></button>
      <button class="btn btn--line" type="button" id="cf-wa"><span>Also send details on WhatsApp</span></button>
      ${u(`/appointment.html`,`Book another visit`,`line`)}
    </div>`,v(`#cf-ics`).addEventListener(`click`,()=>{let e=document.createElement(`a`),t=URL.createObjectURL(new Blob([Me(a,s,c,o,n.mins)],{type:`text/calendar`}));e.href=t,e.download=`appointment-${a||`lumi`}.ics`,document.body.append(e),e.click(),e.remove(),setTimeout(()=>URL.revokeObjectURL(t),1e3)}),v(`#cf-wa`).addEventListener(`click`,()=>window.open(t(`${ee(r)}\n\nBooking code: ${a}\nWhen: ${oe(o)}`),`_blank`,`noopener`)),i.hidden=!1,v(`#cf-h`).focus({preventScroll:!0}),r.getBoundingClientRect().top<0&&(window.__lenis?window.__lenis.scrollTo(r,{offset:-110}):r.scrollIntoView({block:`start`}))}async function Pe(){let e=V();if(!e.reportValidity())return;let t=q(),r=v(`#wz-submit`),i=v(`span`,r),a=v(`#crm-note`);if(!t)return;let o=t=>e.elements.namedItem(t)?.value?.trim()||``,s=o(`name`).replace(/\s+/g,` `),c=s.indexOf(` `),l=m.find(e=>e.id===o(`package`)),u=[H(`visit`)?.value,o(`age`)&&`Age `+o(`age`),l&&`Package: `+l.name,o(`notes`)].filter(Boolean).join(`. `),d={service:t.service,doc:Y(j.assigned),scheduledAt:j.time,svc:l&&t.service.startsWith(`pkg-`)?l.name:n(j.dept)?.name||j.cat.svc.get(t.service)?.name||``,mins:j.cat.svc.get(t.service)?.durationMinutes},f=j.date,p=j.assigned;a.hidden=!0,r.disabled=!0,r.setAttribute(`aria-busy`,`true`),i.textContent=`Confirming…`;try{Ne(await ae({serviceSlug:t.service,doctorSlug:p,firstName:c<0?s:s.slice(0,c),lastName:c<0?``:s.slice(c+1),phone:o(`mobile`).replace(/[\s-]/g,``),email:o(`email`),gender:{Female:`FEMALE`,Male:`MALE`,Other:`OTHER`}[o(`gender`)],scheduledAt:j.time,reason:u})||{},d)}catch(t){let n=(e,t,n=[])=>{let r=v(`.wz-step[data-step="${e}"] .wz-err`);r.textContent=t,r.hidden=!1,n.forEach(e=>e?.setAttribute(`aria-invalid`,`true`)),Q(e)};if(t.kind===`conflict`)M.delete(K(p,f)),j.time=``,W(),n(2,`Sorry, that time was just taken by someone else. We've refreshed the free times, please choose another.`);else if(t.kind===`invalid`){let r=t.fields||{},i={firstName:`name`,lastName:`name`,phone:`mobile`,email:`email`,gender:`gender`},a=Object.keys(r).filter(e=>i[e]);a.length?n(3,a.map(e=>r[e]).join(` `),a.map(t=>e.elements.namedItem(i[t]))):n(2,`Please check the doctor, day and time, then try again.`)}else j.fell=!0,a.textContent=`We couldn't reach our booking system, so nothing has been booked yet. Your details are still here. You can try again, or send the request on WhatsApp or by email and our team will confirm.`,a.hidden=!1}finally{r.disabled=!1,r.removeAttribute(`aria-busy`),$()}}ne(()=>{v(`main`).innerHTML=ve(),De(),Oe(),Ee(),Z(),x&&T().then(e=>{j.cat=e,e.ok&&(v(`.ap-hero .lead`).textContent=`Choose a speciality, a doctor and a free time, then confirm. You'll get your appointment code straight away.`),j.dept&&W()})});