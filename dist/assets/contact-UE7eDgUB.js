import{B as e,D as t,R as n,U as r,W as i,r as a,t as o,v as s,x as c,z as l}from"./core-BNTx_ofm.js";import{n as u}from"./media-CVPoxGO6.js";var d=[`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`],f=encodeURIComponent(r.mapQuery),p=`https://www.google.com/maps?q=${f}&output=embed`,m=`https://www.google.com/maps/dir/?api=1&destination=${f}`,h=r.mapsLink||`https://www.google.com/maps/search/?api=1&query=${f}`;function g(e){let t=String(e).match(/^([A-Za-z]{3})(?:\s*[–-]\s*([A-Za-z]{3}))?\s*·\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);if(!t)return null;let n=d.indexOf(t[1]),r=t[2]?d.indexOf(t[2]):n;if(n<0||r<0)return null;let i=new Set;for(let e=n;i.add(e),e!==r;e=(e+1)%7);let a=(e,t,n)=>(e%12+(/pm/i.test(n)?12:0))*60+(+t||0);return{days:i,from:a(t[3],t[4],t[5]),to:a(t[6],t[7],t[8]),close:`${t[6]}${t[7]?`:`+t[7]:``} ${t[8].toUpperCase()}`}}function _(){let e=[r.hours.opd,r.hours.sunday].map(g);if(e.some(e=>!e))return null;let t=new Date,n=t.getDay(),i=t.getHours()*60+t.getMinutes(),a=e.find(e=>e.days.has(n)&&i>=e.from&&i<e.to);return a?{open:!0,text:`OPD open now · until ${a.close}`}:{open:!1,text:`OPD closed now · emergency is open`}}var v=()=>`
<section class="page-hero ct-hero"><div class="page-hero-glow"></div><div class="container ct-hero-in">
  <div>
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Contact</span></nav>
    <h1 data-split data-instant>Here for you, <em>day</em> and night.</h1>
  </div>
  <p class="lead" data-reveal>Call, message or visit. Anything urgent goes to the emergency line, which is answered around the clock.</p>
</div>
<div class="container"><figure class="ct-find" data-reveal="scale">${u(`exterior`,{sizes:`100vw`,eager:!0})}
  <figcaption><span class="ct-pin ct-pin--main"><b>Main entrance</b> OPD, reception &amp; pharmacy</span><span class="ct-pin ct-pin--er"><b>24/7 Emergency</b> separate entrance, ramp access</span></figcaption></figure></div>
</section>`,y=()=>{let i=_();return`
<section class="section section--tight ct-cards-sec" aria-label="Ways to reach us"><div class="container ct-bento">
  <a class="ct-em" href="${n(r.emergency)}" data-reveal>
    <span class="ct-em-glow" aria-hidden="true"></span>
    <span class="ct-em-top"><span class="label"><span class="dot" aria-hidden="true"></span>Emergency &amp; ambulance · 24/7</span><span class="ct-em-ic" aria-hidden="true">${e(`ambulance`)}</span></span>
    <span class="ct-em-num">${t(r.emergency)}</span>
    <span class="ct-em-cta">Tap to call now ${e(`arrowUpRight`)}</span>
  </a>
  <a class="tile is-link ct-card" href="${n(r.phone)}" data-reveal>
    <span class="ic-badge">${e(`phone`)}</span>
    <span class="label">Reception &amp; appointments</span>
    <b>${t(r.phone)}</b><span class="corner" aria-hidden="true">${e(`arrowUpRight`)}</span>
  </a>
  <a class="tile is-link ct-card" href="${l(`Hi, I have a question for `+r.name+`.`)}" target="_blank" rel="noopener" data-reveal>
    <span class="ic-badge">${e(`chat`)}</span>
    <span class="label">WhatsApp</span>
    <b>Message our care team</b><span class="corner" aria-hidden="true">${e(`arrowUpRight`)}</span>
  </a>
  <a class="tile is-link ct-card" href="mailto:${r.email}" data-reveal>
    <span class="ic-badge">${e(`mail`)}</span>
    <span class="label">Email</span>
    <b>${t(r.email)}</b><span class="corner" aria-hidden="true">${e(`arrowUpRight`)}</span>
  </a>
  <div class="tile ct-hours" data-reveal>
    <div class="ct-hours-h"><span class="label">Hours</span>${i?`<span class="ct-status ${i.open?`is-open`:``}"><i aria-hidden="true"></i>${i.text}</span>`:``}</div>
    <dl>
      <div><dt>Emergency &amp; ICU</dt><dd>24 hours, every day</dd></div>
      <div><dt>OPD</dt><dd>${t(r.hours.opd)}<br>${t(r.hours.sunday)}</dd></div>
      <div><dt>Visiting</dt><dd>${t(r.hours.visiting)}</dd></div>
      <div><dt>Pharmacy</dt><dd>${t(r.hours.pharmacy)}</dd></div>
      <div><dt>Laboratory</dt><dd>${t(r.hours.lab)}</dd></div>
    </dl>
  </div>
</div></section>`},b=()=>`
<section class="section section--alt" aria-labelledby="ct-map-h"><div class="container ct-map">
  <div class="ct-map-frame" data-reveal="fade">
    <iframe src="${p}" title="Map showing the location of ${t(r.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
  </div>
  <div class="ct-map-info">
    <div class="sec-index label"><span class="num">(01)</span><span>Visit us</span></div>
    <h2 id="ct-map-h" data-split>Finding <em>your</em> way here.</h2>
    <address class="ct-addr">${e(`pin`)}<span>${t(r.address)}</span></address>
    <ul class="ct-tips">
      <li>${e(`car`)}<span>On-site parking for patients and visitors, with drop-off at the emergency entrance.</span></li>
      <li>${e(`ambulance`)}<span>Ambulances use the emergency entrance, open 24/7.</span></li>
    </ul>
    <div class="btn-row">${c(m,`Get directions`,`accent`,{ic:`pin`,attrs:`target="_blank" rel="noopener"`})}${c(h,`Open in Google Maps`,`line`,{attrs:`target="_blank" rel="noopener"`})}</div>
  </div>
</div></section>`,x=()=>`
<section class="section" aria-labelledby="ct-form-h"><div class="container ct-form-wrap">
  <div class="ct-form-intro">
    <div class="sec-index label"><span class="num">(02)</span><span>Write to us</span></div>
    <h2 id="ct-form-h" data-split>Ask us <em>anything.</em></h2>
    <p class="lead" data-reveal>Questions about a treatment, a bill or a report. Your message opens in WhatsApp or email, ready to send to our team.</p>
    <p class="ct-warn" data-reveal>${e(`alert`)}<span>Please don't use this form for emergencies. Call <a href="${n(r.emergency)}">${t(r.emergency)}</a>.</span></p>
  </div>
  <form class="tile ct-form" data-wa="Website enquiry" data-reveal>
    <div class="form-grid">
      <div class="field"><label for="ct-name">Your name <span class="req">*</span></label><input class="input" id="ct-name" name="name" data-label="Name" autocomplete="name" required minlength="2"></div>
      <div class="field"><label for="ct-mobile">Mobile <span class="req">*</span></label><input class="input" id="ct-mobile" name="mobile" data-label="Mobile" type="tel" inputmode="tel" autocomplete="tel" required pattern="[+]?[0-9\\s\\-]{10,16}" placeholder="10-digit mobile"></div>
      <div class="field"><label for="ct-email">Email <span class="muted">(optional)</span></label><input class="input" id="ct-email" name="email" data-label="Email" type="email" autocomplete="email"></div>
      <div class="field"><label for="ct-topic">Topic</label>
        <select class="select" id="ct-topic" name="topic" data-label="Topic">
          ${[`General enquiry`,`Appointments`,`Health check-ups`,`Insurance & billing`,`Reports & records`,`Feedback`].map(e=>`<option>${e}</option>`).join(``)}
        </select></div>
      <div class="field full"><label for="ct-dept">Speciality <span class="muted">(optional)</span></label>
        <select class="select" id="ct-dept" name="dept" data-label="Speciality"><option value="">Not specific</option>${i.map(e=>`<option>${t(e.name)}</option>`).join(``)}</select></div>
      <div class="field full"><label for="ct-msg">Message <span class="req">*</span></label><textarea class="textarea" id="ct-msg" name="message" data-label="Message" rows="5" required minlength="5"></textarea></div>
      <div class="field full">${a(`reply to my enquiry`)}</div>
    </div>
    <div class="send-row">
      <button class="btn btn--accent" type="submit"><span>Send on WhatsApp</span><span class="btn-ic">${e(`chat`)}</span></button>
      <button class="btn btn--line" type="button" data-send="email"><span>Send by email</span><span class="btn-ic">${e(`mail`)}</span></button>
    </div>
    <p class="form-note">Nothing is stored on this website. Your message opens in your own app, addressed to ${t(r.name)}.</p>
    <div class="form-done" hidden role="status">
      <span class="done-ic">${e(`check`)}</span>
      <div><b>Message ready to send.</b><p>Send it from WhatsApp or your email app and our team will reply during working hours.</p></div>
    </div>
  </form>
</div></section>`;o(()=>{s(`main`).innerHTML=v()+y()+b()+x()});