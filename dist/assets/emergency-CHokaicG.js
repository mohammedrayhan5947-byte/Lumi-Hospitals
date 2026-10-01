import{B as e,D as t,R as n,U as r,t as i,v as a,x as o,z as s}from"./core-BNTx_ofm.js";import{n as c}from"./media-CVPoxGO6.js";var l=[{id:`chest-pain`,ic:`heart`,title:`Chest pain`,sub:`Possible heart attack`,signs:[`Pressure, squeezing or heaviness in the chest for more than a few minutes`,`Pain spreading to the arm, jaw, neck or back`,`Breathlessness, cold sweat, nausea or sudden tiredness`],steps:[`Call us now. Don't drive yourself, and don't wait to see if it passes.`,`Sit them down and keep them calm. Loosen tight clothing.`,`If they aren't allergic and no doctor has told them not to, they can chew one regular adult aspirin.`,`If they collapse and aren't breathing normally, start CPR: push hard and fast in the centre of the chest, about two pushes a second. Keep going until help arrives.`],dont:[`Don't give food or drink`,`Don't let them walk around or climb stairs`]},{id:`stroke`,ic:`brain`,title:`Stroke`,sub:`Use BE-FAST to spot it`,fast:[[`B`,`Balance`,`Sudden loss of balance or dizziness`],[`E`,`Eyes`,`Sudden blurred, double or lost vision`],[`F`,`Face`,`One side of the face droops when they smile`],[`A`,`Arms`,`One arm is weak or drifts down when both are raised`],[`S`,`Speech`,`Slurred, strange or hard to understand`],[`T`,`Time`,`Call now and note the time it started`]],steps:[`Call us now. Stroke treatment works best within the first few hours.`,`Note the exact time the symptoms started, or when they were last seen well.`,`If they are drowsy, lay them on their side with the head slightly raised.`,`Bring a list of their medicines, especially blood thinners.`],dont:[`Don't give food, water or tablets: swallowing may be affected`,`Don't give aspirin: some strokes are bleeds`,`Don't wait for symptoms to settle`]},{id:`accident`,ic:`ambulance`,title:`Accident, injury or burn`,sub:`Road accidents, falls, cuts, burns`,signs:[`Heavy bleeding, a deep wound or an obvious broken bone`,`Head injury with vomiting, confusion or drowsiness`,`Burns larger than the palm, or on the face, hands or groin`],steps:[`Make sure the area is safe for you first, then call us.`,`Press firmly on bleeding with a clean cloth and keep pressing. Add more cloth on top if it soaks through.`,`If a neck or back injury is possible, don't move them unless they are in danger.`,`For burns, cool under gently running tap water for 20 minutes. Remove rings and watches, then cover loosely with clean cling film or cloth.`],dont:[`Don't pull out objects stuck in a wound`,`Don't put ice, toothpaste, oil or butter on a burn`,`Don't give anything to eat or drink`]},{id:`breathing`,ic:`lungs`,title:`Breathing difficulty`,sub:`Asthma, allergy, choking`,signs:[`Can't speak in full sentences`,`Lips or face turning blue or grey`,`Noisy breathing, or chest sucking in with each breath`,`Swelling of the lips, tongue or throat after food, a sting or a medicine`],steps:[`Call us now if any of these signs are present.`,`Sit them upright, leaning slightly forward. Loosen tight clothing.`,`Asthma: help them use their reliever inhaler as prescribed. Severe allergy: use their adrenaline auto-injector if they have one.`,`Choking adult or child over 1: up to five firm back blows between the shoulder blades, then up to five abdominal thrusts. Repeat.`],dont:[`Don't make them lie flat`,`Don't give anything by mouth`]},{id:`child`,ic:`baby`,title:`Child with fever or a seizure`,sub:`Fits, convulsions, high fever`,signs:[`A seizure: stiffening, jerking, eyes rolling, not responding`,`A baby under 3 months with any fever`,`Unusually drowsy, breathing fast, a rash that doesn't fade when pressed, or no wet nappy for many hours`],steps:[`Stay calm and note the time the seizure started.`,`Lay the child on their side on the floor, away from anything hard or sharp.`,`When the jerking stops, keep them on their side so they can breathe easily.`,`Call us right away if it lasts more than 5 minutes, it's their first seizure, or they don't wake up normally afterwards.`],dont:[`Don't put anything in their mouth, including fingers or a spoon`,`Don't hold them down`,`Don't put them in a cold bath or give medicine by mouth during a seizure`]}],u=[`Chest pain or pressure`,`Any BE-FAST stroke sign`,`Severe breathlessness or choking`,`Heavy bleeding or a major injury`,`Head injury with vomiting or confusion`,`A seizure, fainting or unconsciousness`,`Serious burns, poisoning or an overdose`,`Severe allergic reaction`,`Pregnancy with bleeding, severe pain or reduced baby movements`,`A baby under 3 months with fever`],d=[`Fever for a day or two while otherwise well`,`Cough, cold or sore throat`,`A minor sprain, cut or bruise`,`Ongoing pain you've had for a while`,`Blood pressure, sugar or thyroid review`,`Follow-ups, reports and repeat prescriptions`],f=[[`card`,`Photo ID and insurance card`,`The insurance desk starts the paperwork while we treat.`],[`pill`,`Current medicines`,`The strips themselves, or a photo of them.`],[`file`,`Recent reports`,`Discharge summaries, ECGs or scans, if they're at hand.`],[`phone`,`A charged phone`,`And the number of a family member.`],[`users`,`One attendant`,`Someone who can stay and speak for the patient.`]],p=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.mapQuery)}`,m=()=>`
<section class="er-hero" aria-labelledby="er-h1">
  <div class="er-hero-bg" aria-hidden="true">${c(`emergency-entrance`,{sizes:`100vw`,eager:!0,alt:``})}</div>
  <div class="container er-hero-in">
    <p class="er-kicker"><span class="dot" aria-hidden="true"></span>Emergency room open now · 24 hours, every day</p>
    <h1 id="er-h1">In an emergency, <em>call</em> us first.</h1>
    <a class="er-call" href="${n(r.emergency)}" aria-label="Call emergency and ambulance: ${t(r.emergency)}">
      <span class="er-ring" aria-hidden="true">${e(`phone`)}</span>
      <span class="er-num"><small>Tap to call · Emergency &amp; ambulance</small><b>${t(r.emergency)}</b></span>
    </a>
    <p class="er-alt">Can't get through? Call <a href="tel:112">112</a> (national emergency) or <a href="tel:108">108</a> (ambulance).</p>
    <div class="er-acts">
      <a class="btn btn--glass" href="${p}" target="_blank" rel="noopener"><span>Directions to the ER</span><span class="btn-ic">${e(`pin`)}</span></a>
      <a class="btn btn--glass" href="${s(`EMERGENCY: I need help. My location is: `)}" target="_blank" rel="noopener"><span>Send location on WhatsApp</span><span class="btn-ic">${e(`chat`)}</span></a>
    </div>
  </div>
  <nav class="er-jump" aria-label="What to do now"><div class="container">
    <span class="er-jump-l">What to do now:</span>
    <ul>${l.map(t=>`<li><a href="#${t.id}">${e(t.ic)}<span>${t.title}</span></a></li>`).join(``)}</ul>
  </div></nav>
</section>`,h=(e,t,n,r=``)=>`
  <div class="sec-head er-head">
    <div><div class="sec-index label"><span class="num">(${e})</span><span>${t}</span></div><h2>${n}</h2></div>
    ${r?`<div>${r}</div>`:``}
  </div>`,g=(i,a)=>`
<article class="er-case" id="${i.id}" aria-labelledby="${i.id}-h">
  <header class="er-case-h">
    <span class="er-case-ic" aria-hidden="true">${e(i.ic)}</span>
    <div><span class="label">${String(a+1).padStart(2,`0`)} · ${i.sub}</span><h3 id="${i.id}-h">${i.title}</h3></div>
    <a class="er-case-call" href="${n(r.emergency)}">${e(`phone`)}<span>Call ${t(r.emergency)}</span></a>
  </header>
  ${i.fast?`<ol class="fast" aria-label="BE-FAST stroke signs">${i.fast.map(([e,t,n])=>`<li><b aria-hidden="true">${e}</b><span><strong>${t}</strong>${n}</span></li>`).join(``)}</ol>`:``}
  <div class="er-case-b">
    ${i.signs?`<div class="er-signs"><h4>Call us if you see</h4><ul>${i.signs.map(e=>`<li>${e}</li>`).join(``)}</ul></div>`:``}
    <div class="er-steps"><h4>Do this now</h4><ol>${i.steps.map(e=>`<li>${e}</li>`).join(``)}</ol></div>
    <div class="er-dont"><h4>${e(`alert`)}Don't</h4><ul>${i.dont.map(e=>`<li>${e.replace(/^Don't (\w)/,(e,t)=>t.toUpperCase())}</li>`).join(``)}</ul></div>
  </div>
</article>`,_=()=>`
<section class="section er-cases" aria-labelledby="er-cases-h"><div class="container">
  ${h(`01`,`What to do now`,`<span id="er-cases-h">Five emergencies, <em>step</em> by step.</span>`,`<p>Call first, then follow the steps while help is on the way. Our team will guide you on the phone.</p>`)}
  ${l.map(g).join(``)}
  <p class="er-disc">${e(`info`)}This is general first-aid guidance, not a diagnosis. If you're unsure, call. We'd always rather you did.</p>
</div></section>`,v=()=>`
<section class="section section--alt"><div class="container">
  ${h(`02`,`ER or OPD?`,`Where should you <em>go?</em>`,`<p>The emergency room is for anything sudden, severe or getting worse. Everything else is faster in the OPD.</p>`)}
  <div class="tri">
    <div class="tri-col tri-er">
      <h3>${e(`ambulance`)}Come to the ER now</h3>
      <ul>${u.map(e=>`<li>${e}</li>`).join(``)}</ul>
      <a class="btn btn--danger btn--block" href="${n(r.emergency)}"><span>Call ${t(r.emergency)}</span><span class="btn-ic">${e(`phone`)}</span></a>
    </div>
    <div class="tri-col tri-opd">
      <h3>${e(`calendar`)}Book an OPD visit</h3>
      <ul>${d.map(e=>`<li>${e}</li>`).join(``)}</ul>
      <p class="tri-hours">${e(`clock`)}<span>${t(r.hours.opd)}<br>${t(r.hours.sunday)}</span></p>
      ${o(`/appointment.html`,`Book an appointment`,`line`,{ic:`arrow`})}
    </div>
  </div>
  <p class="tri-unsure"><b>Not sure?</b> Call <a href="${n(r.emergency)}">${t(r.emergency)}</a> and describe what's happening. The emergency team will tell you whether to come in now.</p>
</div></section>`,y=()=>`
<section class="section"><div class="container amb">
  <div>
    <figure class="amb-photo">${c(`ambulance`,{sizes:`(max-width: 860px) 100vw, 40vw`})}<figcaption class="label">Our ambulance, on standby at the emergency entrance</figcaption></figure>
    ${h(`03`,`Ambulance`,`Calling an <em>ambulance</em>.`)}
    <a class="er-call er-call--light" href="${n(r.emergency)}"><span class="er-ring" aria-hidden="true">${e(`phone`)}</span><span class="er-num"><small>Emergency &amp; ambulance · 24/7</small><b>${t(r.emergency)}</b></span></a>
  </div>
  <div class="amb-lists">
    <div><h3>When you call, tell us</h3>
      <ol class="amb-ol">
        <li><b>What happened</b> and how the patient is now: awake, breathing, bleeding.</li>
        <li><b>The patient's age</b> and any major illness you know of.</li>
        <li><b>The exact address</b> with a landmark, floor and flat number.</li>
        <li><b>A number we can call back.</b> Keep that phone free.</li>
      </ol></div>
    <div><h3>While you wait</h3>
      <ul class="amb-ul">
        <li>Send someone to the gate or main road to guide the crew.</li>
        <li>Clear the stairs or hold the lift, and switch on the outside light at night.</li>
        <li>Keep the patient still and warm. Don't give food or drink.</li>
        <li>Put their medicines and reports in one bag.</li>
      </ul></div>
  </div>
</div></section>`,b=()=>`
<section class="section section--alt"><div class="container">
  ${h(`04`,`What to bring`,`If you can, <em>bring</em> these.`,`<p><b>Never delay to find documents.</b> Come first. Paperwork can follow.</p>`)}
  <ul class="bring">${f.map(([t,n,r])=>`<li class="tile"><span class="ic-badge">${e(t)}</span><h3>${n}</h3><p>${r}</p></li>`).join(``)}</ul>
  <div class="er-where">
    <div><span class="label">Emergency entrance</span><p class="er-addr">${t(r.address)}</p></div>
    <div class="btn-row">${o(p,`Get directions`,`accent`,{ic:`pin`,attrs:`target="_blank" rel="noopener"`})}${o(`/contact.html`,`Map & contact`,`line`)}</div>
  </div>
</div></section>`;i(()=>{a(`main`).innerHTML=m()+_()+v()+y()+b()});