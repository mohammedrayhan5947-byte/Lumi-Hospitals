import{O as e,V as t,W as n,b as r,i,l as a,p as o,r as s,s as c,t as l,y as u,z as d}from"./core-B_N3YoAS.js";import{i as f,n as p,r as m,t as h}from"./legal-page-DQ7soz-9.js";var g=n.legal,_=t=>t?e(t):h,v=(n,r,i)=>`
  <article class="gr-off">
    <span class="label">${n}</span>
    <h3>${_(i.name)}</h3>
    <ul>
      <li>${t(`mail`)}<span>${i.email?`<a href="mailto:${e(i.email)}">${e(i.email)}</a>`:h}</span></li>
      ${`phone`in i?`<li>${t(`phone`)}<span>${i.phone?`<a href="${d(i.phone)}">${e(i.phone)}</a>`:h}</span></li>`:``}
      <li>${t(`pin`)}<span>${g.entity?e(g.entity)+`, `:``}${m(`{{address}}`)}</span></li>
    </ul>
    <p class="gr-law">${r}</p>
  </article>`,y={updated:`2026-10-01`,crumb:`Grievance redressal`,title:`Tell us. We'll <em>fix</em> it.`,lead:`How to raise a concern about your care, our services or your personal data, and how to exercise your rights under the Digital Personal Data Protection Act, 2023. Every request gets a reference number and a written reply.`,extraMin:2,sections:[{id:`contacts`,label:`Who to contact`,body:()=>`
      <div class="gr-offs">
        ${v(`Grievance Officer`,`Handles complaints about care, services, billing and this website. Published under rule 5(9) of the IT (SPDI) Rules, 2011, and the Charter of Patients' Rights.`,g.grievanceOfficer)}
        ${v(`Data Protection Officer`,`Answers questions about how we process your personal data. Published under Rule 9 of the DPDP Rules, 2025.`,g.dpo)}
      </div>`},{id:`timelines`,label:`Response times`,body:()=>`
      <dl class="lg-dl gr-times">${o.map(([t,n])=>`<div><dt>${e(t)}</dt><dd>${e(n)}</dd></div>`).join(``)}</dl>
      <p>The DPDP Rules allow up to 90 days for data requests. The Charter of Patients' Rights requires a written outcome to complaints within 15 days. We aim to do better than both.</p>`},{id:`request`,label:`Make a request`,body:()=>`
<form class="gr-form" id="gr-form" data-wa="Data / grievance request">
  <fieldset class="gr-types">
    <legend>What would you like to do? <span class="req">*</span></legend>
    <div class="gr-type-grid">${a.map(t=>`
      <label class="gr-type"><input type="radio" name="type" value="${e(t.label)}" data-label="Request" data-id="${t.id}" required>
        <span><b>${e(t.label)}</b><small>${e(t.hint)}</small></span></label>`).join(``)}
    </div>
  </fieldset>

  <div class="form-grid">
    <div class="field"><label for="gr-name">Your full name <span class="req">*</span></label><input class="input" id="gr-name" name="name" data-label="Name" autocomplete="name" required minlength="2"></div>
    <div class="field"><label for="gr-mobile">Mobile <span class="req">*</span></label><input class="input" id="gr-mobile" name="mobile" data-label="Mobile" type="tel" inputmode="tel" autocomplete="tel" required pattern="[+]?[0-9\\s\\-]{10,16}" placeholder="10-digit mobile"></div>
    <div class="field"><label for="gr-email">Email <span class="muted">(optional)</span></label><input class="input" id="gr-email" name="email" data-label="Email" type="email" autocomplete="email"></div>
    <div class="field"><label for="gr-rel">You are making this request as</label>
      <select class="select" id="gr-rel" name="relation" data-label="Requester">
        <option value="self">The patient (myself)</option><option value="guardian">Parent or lawful guardian of the patient</option>
        <option value="nominee">Nominee of the patient</option><option value="representative">Authorised representative</option>
      </select></div>
    <div class="field full" data-when="relation" hidden><label for="gr-patient">Patient's full name <span class="req">*</span></label><input class="input" id="gr-patient" name="patient" data-label="Patient name" required disabled></div>
    <div class="field"><label for="gr-uhid">Patient ID / UHID <span class="muted">(if known)</span></label><input class="input" id="gr-uhid" name="uhid" data-label="Patient ID"></div>
    <div class="field"><label for="gr-date">Date of visit <span class="muted">(if relevant)</span></label><input class="input" id="gr-date" name="visit" data-label="Visit date" type="date"></div>

    <fieldset class="full gr-nominee" data-when="nomination" hidden>
      <legend>Person you are nominating</legend>
      <div class="form-grid">
        <div class="field"><label for="gr-nname">Nominee's full name <span class="req">*</span></label><input class="input" id="gr-nname" name="nominee" data-label="Nominee" required disabled></div>
        <div class="field"><label for="gr-nrel">Relationship to you <span class="req">*</span></label><input class="input" id="gr-nrel" name="nominee_rel" data-label="Nominee relationship" required disabled></div>
        <div class="field full"><label for="gr-nmob">Nominee's mobile <span class="req">*</span></label><input class="input" id="gr-nmob" name="nominee_mobile" data-label="Nominee mobile" type="tel" inputmode="tel" required disabled pattern="[+]?[0-9\\s\\-]{10,16}"></div>
      </div>
    </fieldset>

    <div class="field full"><label for="gr-msg">Details of your request <span class="req">*</span></label>
      <textarea class="textarea" id="gr-msg" name="details" data-label="Details" rows="5" required minlength="10" aria-describedby="gr-msg-hint"></textarea>
      <small class="form-note" id="gr-msg-hint">Say what data or which visit this is about and what you'd like us to do. Please don't include ID numbers or attach documents. We'll verify you separately.</small></div>
    <div class="field full"><label for="gr-reply">How should we reply?</label>
      <select class="select" id="gr-reply" name="reply" data-label="Reply by"><option>WhatsApp</option><option>Email</option><option>Phone call</option></select></div>
    ${s(`handle this request, verify my identity and reply to me`)}
  </div>

  <div class="send-row">
    <button class="btn btn--accent" type="submit"><span>Send on WhatsApp</span><span class="btn-ic">${t(`chat`)}</span></button>
    <button class="btn btn--line" type="button" data-send="email"><span>Send by email</span><span class="btn-ic">${t(`mail`)}</span></button>
  </div>
  <p class="form-note">Nothing is stored on this website. Your request opens in your own WhatsApp or email app. You can also write directly to ${g.grievanceOfficer.email?`<a href="mailto:${e(g.grievanceOfficer.email)}">${e(g.grievanceOfficer.email)}</a>`:h}.</p>
  <div class="form-done" hidden role="status">
    <span class="done-ic">${t(`check`)}</span>
    <div><b>Request ready to send.</b><p>Once it reaches us, we'll acknowledge it within 2 working days with a reference number, and verify your identity before sharing or changing any data.</p></div>
  </div>
</form>`},{id:`verify`,label:`How we verify you`,body:[`To protect your privacy, we confirm who you are before sharing or changing any data. We may call you back on the mobile number in our records, or ask you to visit the front desk with photo ID.`,`If you are acting for someone else, as a parent, guardian, nominee or representative, we will also ask for proof of that authority.`,`We may decline a request if we can't verify your identity, or if the law requires us to keep the record. For example, medical records have to be kept for a minimum period. If we decline, we will tell you why in writing.`]},{id:`escalate`,label:`If you're not satisfied`,body:()=>`
      <ul class="gr-esc">${c.map(([n,r,i])=>`<li><h3>${e(n)}</h3><p>${e(r)}</p>${i?`<a class="link" href="${i}" target="_blank" rel="noopener">${e(i.replace(/^https?:\/\/(www\.)?/,``).replace(/\/.*/,``))}${t(`arrowUpRight`)}</a>`:``}</li>`).join(``)}</ul>`}]};function b(){let e=u(`#gr-form`);if(!e)return;let t=(t,n)=>r(t,e).forEach(e=>{e.hidden=!n,r(`input, select, textarea`,e).forEach(e=>{e.disabled=!n})}),n=()=>{t(`[data-when="relation"]`,u(`#gr-rel`,e).value!==`self`),t(`[data-when="nomination"]`,u(`input[name="type"]:checked`,e)?.dataset.id===`nomination`)};e.addEventListener(`change`,n);let i=new URLSearchParams(location.search).get(`type`),o=i&&a.some(e=>e.id===i)&&u(`input[name="type"][data-id="${i}"]`,e);o&&(o.checked=!0),n()}l(()=>{u(`main`).innerHTML=f(y),p(y),b(),i()});