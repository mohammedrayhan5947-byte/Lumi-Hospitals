import{D as e,N as t,U as n,d as r,i,p as a,t as o,u as s,v as c,x as l}from"./core-BNTx_ofm.js";import{i as u,n as d}from"./legal-page-B04o9MLf.js";var f={updated:`2026-10-01`,crumb:`Patient rights`,title:`Your rights, <em>always</em>.`,lead:`The Charter of Patients' Rights and Responsibilities, as recommended by the National Human Rights Commission and adopted by the Ministry of Health and Family Welfare, and the Patients' Charter under the Karnataka Private Medical Establishments Act, in plain language.`,extraMin:3,sections:[{id:`promise`,label:`Our promise`,body:[`Good care is a partnership. These rights apply to every patient at {{name}}, and to the family member or caregiver you choose. They apply whatever your background, condition or ability to pay.`,[`note`,`In an emergency, we start treatment first. We never ask for payment or a deposit before giving you emergency care.`]]},{id:`rights`,label:`Your 17 rights`,body:()=>`
      <ol class="pr-grid">${r.map((n,r)=>`
        <li class="pr-card" id="${n.id}">
          <span class="pr-n">${t(r+1)}</span>
          <h3>${e(n.title)}</h3>
          <p>${e(n.text)}</p>
        </li>`).join(``)}
      </ol>`},{id:`responsibilities`,label:`Your responsibilities`,body:()=>`
      <p>Following these helps our doctors and staff care for you, and for everyone else here.</p>
      <ol class="pr-resp">${s.map((n,r)=>`<li><span class="num">${t(r+1)}</span><p>${e(n)}</p></li>`).join(``)}</ol>`},{id:`concern`,label:`Raising a concern`,body:()=>`
      <p>If something isn't right, please tell us. Raising a concern will never affect your care.</p>
      <div class="pr-steps">
        <div><span class="label">Step 1</span><h3>Tell the team</h3><p>Speak to the nurse in charge, the floor manager or the front desk. Many issues can be fixed on the spot.</p></div>
        <div><span class="label">Step 2</span><h3>Write to the Grievance Officer</h3><p>Use the <a href="/grievance.html#request">grievance form</a> or write to <a href="mailto:${e(n.legal.grievanceOfficer.email)}">${e(n.legal.grievanceOfficer.email)}</a>. You'll receive a reference number.</p></div>
        <div><span class="label">Step 3</span><h3>Escalate if needed</h3><p>If you're not satisfied, you can approach the bodies listed on our <a href="/grievance.html#escalate">grievance page</a>.</p></div>
      </div>
      <dl class="lg-dl pr-times">${a.slice(0,3).map(([t,n])=>`<div><dt>${e(t)}</dt><dd>${e(n)}</dd></div>`).join(``)}</dl>
      <div class="btn-row">${l(`/grievance.html#request`,`Raise a concern`,`accent`,{ic:`chat`})}${l(`/patient-guide.html`,`Patient & visitor guide`,`line`)}</div>`},{id:`display`,label:`At the hospital`,body:[`As the KPME Act requires, this charter and our rate list are displayed at the hospital in Kannada and English. Copies are available at the front desk.`,[`dl`,[[`KPME registration no.`,`{{kpmeReg}}`],[`Charter in Kannada`,`{{kannada}}`],[`Rate list`,`{{rates}}`]]],`Sources: Charter of Patients' Rights and Responsibilities (NHRC, adopted by MoHFW, 2019); Karnataka Private Medical Establishments Act, 2007, section 11A and Schedule (as amended in 2017).`]}]};o(()=>{c(`main`).innerHTML=u(f,{heroExtra:`<div class="btn-row lg-cta" data-reveal>${l(`#rights`,`Read your rights`,`accent`,{ic:`shield`})}${l(`/grievance.html`,`Raise a concern`,`line`,{ic:`chat`})}</div>`}),d(f),i()});