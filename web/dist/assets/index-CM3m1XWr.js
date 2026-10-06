import{$ as e,G as t,H as n,J as r,L as i,N as a,O as o,P as s,Q as c,R as l,S as u,U as d,V as f,W as p,X as m,_ as h,b as g,g as _,q as v,t as y,v as b,w as x,x as S,y as C,z as w}from"./core-B_N3YoAS.js";import{n as T,t as E}from"./media-DPWLg7EO.js";var D=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`,O=`precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1;uniform vec3 c2;uniform vec3 bg;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r.xy; vec2 q=uv; q.x*=r.x/r.y;
  vec2 mm=m; mm.x*=r.x/r.y;
  float tt=t*.045;
  vec2 w=vec2(fbm(q*1.6+tt),fbm(q*1.6-tt+3.1));
  vec2 dm=q-mm; float pull=exp(-dot(dm,dm)*3.5);
  float f=fbm(q*2.2+w*1.8+vec2(tt*2.,-tt)+pull*.6);
  // light falls from the top-right like a window
  float asp=r.x/r.y;
  vec2 src=vec2(asp*.92,1.08);
  // portrait screens: measure distance in unstretched space so the beam stays a corner light
  float d=asp<1.?length((uv-vec2(.95,1.06))*vec2(1.,1.15))*1.25:length(q-src);
  float beam=smoothstep(1.55,0.,d)*.9;
  float rays=pow(max(0.,sin(atan(q.y-src.y,q.x-src.x)*14.+f*5.+tt*6.)),6.)*smoothstep(1.4,.1,d)*.22;
  float lum=beam*(.35+f*.95)+rays+pull*.18;
  vec3 col=mix(bg,c1*.9,smoothstep(.05,.9,lum));
  col=mix(col,c2,smoothstep(.75,1.25,lum)*.65);
  col+=(h(gl_FragCoord.xy+t)-.5)*.035; // film grain
  float vig=smoothstep(1.3,.2,length(uv-vec2(.55,.5)));
  col*=mix(.75,1.,vig);
  gl_FragColor=vec4(col,1.);
}`,k=e=>{let t=parseInt(e.replace(`#`,``),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]};function A(){let e=document.createElement(`i`);e.style.color=`var(--accent)`,e.style.display=`none`,document.body.appendChild(e);let t=getComputedStyle(e).color.match(/[\d.]+/g)?.slice(0,3).map(Number)||[14,138,112];return e.remove(),t.map(e=>e>1?e/255:e)}function j(e){let t=e.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!t){e.classList.add(`no-gl`);return}let r=t.getExtension(`WEBGL_debug_renderer_info`),i=r?String(t.getParameter(r.UNMASKED_RENDERER_WEBGL)):``;if(/swiftshader|llvmpipe|software/i.test(i)||(navigator.hardwareConcurrency||8)<=2){e.classList.add(`no-gl`);return}let a=(e,n)=>{let r=t.createShader(e);return t.shaderSource(r,n),t.compileShader(r),r},o=t.createProgram();t.attachShader(o,a(t.VERTEX_SHADER,D)),t.attachShader(o,a(t.FRAGMENT_SHADER,O)),t.linkProgram(o),t.useProgram(o),t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,`p`);t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0);let c=e=>t.getUniformLocation(o,e),l=c(`r`),u=c(`t`),f=c(`m`),p=c(`c1`),m=c(`c2`),h=c(`bg`),g=()=>{let e=A();t.uniform3fv(p,e),t.uniform3fv(m,e.map(e=>e+(1-e)*.75)),t.uniform3fv(h,k(`#0a0f0e`))};g(),d(()=>{g(),C||j(performance.now())});let _=Math.min(devicePixelRatio||1,1.25),v=()=>{let n=e.clientWidth,r=e.clientHeight;e.width=Math.max(1,n*_*.75),e.height=Math.max(1,r*_*.75),t.viewport(0,0,e.width,e.height),t.uniform2f(l,e.width,e.height)};v(),addEventListener(`resize`,v);let y=.7,b=.6,x=.7,S=.6;e.parentElement.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect();x=(t.clientX-n.left)/n.width,S=1-(t.clientY-n.top)/n.height},{passive:!0});let C=!1,w=!0,T=0,E=performance.now();function j(e){y+=(x-y)*.04,b+=(S-b)*.04,t.uniform1f(u,(e-E)/1e3+20),t.uniform2f(f,y,b),t.drawArrays(t.TRIANGLES,0,3),C&&(T=requestAnimationFrame(j))}let M=()=>{!C&&n()&&(C=!0,T=requestAnimationFrame(j))},N=()=>{C=!1,cancelAnimationFrame(T)};new IntersectionObserver(([e])=>{w=e.isIntersecting,w&&!document.hidden?M():N()}).observe(e),document.addEventListener(`visibilitychange`,()=>document.hidden||!w?N():M()),j(performance.now()),M()}var M=()=>`
<section class="hero" aria-label="Introduction">
  <canvas id="lumen" aria-hidden="true"></canvas>
  <div class="container hero-in">
    <div class="hero-copy">
      <div class="hero-kicker label"><span class="dot"></span>Open now · Emergency, ICU &amp; pharmacy 24/7</div>
      <h1 data-split data-instant>Medicine, in a better <em>light.</em></h1>
      <p class="hero-lead" data-reveal>${o(p.intro)}</p>
      <form class="hero-book" action="/appointment.html" method="get" data-reveal>
        <label class="sr-only" for="q-dept">Choose a speciality</label>
        <select class="select" id="q-dept" name="dept">
          <option value="">Which speciality do you need?</option>
          ${t.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}
        </select>
        <button class="btn btn--accent" type="submit" data-magnetic><span>Book a visit</span><span class="btn-ic">${f(`arrow`)}</span></button>
      </form>
      <div class="hero-links" data-reveal>
        <a class="link" href="/doctors.html">Find a doctor ${f(`arrowUpRight`)}</a>
        <a class="link" href="/gallery.html">Tour the hospital ${f(`arrowUpRight`)}</a>
      </div>
    </div>
    <div class="hero-visual" aria-label="Lumi Hospital">
      <div class="hero-photo hero-photo--main">${T(`exterior-tall`,{eager:!0,sizes:`(max-width: 1100px) 80vw, 32vw`})}</div>
      <div class="hero-photo hero-photo--sub">${T(`icu`,{sizes:`(max-width: 1100px) 45vw, 18vw`})}</div>
      <a class="hero-chip" href="${w(p.emergency)}"><span class="em-ic">${f(`ambulance`)}</span><span><small>24/7 emergency &amp; ambulance</small><b>${o(p.emergency)}</b></span></a>
    </div>
  </div>
  <div class="hero-foot"><div class="container">
    ${p.stats.map(e=>`<div class="hstat"><b><span data-count="${e.value}">${e.value}</span>${e.suffix}</b><span>${e.label}</span></div>`).join(``)}
  </div></div>
</section>`,N=()=>`
<div class="marquee" aria-hidden="true"><div class="marquee-track" data-speed="50">
  ${t.map((e,t)=>`<span class="marquee-item">${t%2?e.name.toLowerCase():e.name}${f(`sparkle`)}</span>`).join(``)}
</div></div>`,P=()=>`
<section class="section manifesto"><div class="container manifesto-row">
  <div class="sec-index label"><span class="num">(01)</span><span>Who we are</span></div>
  <div>
    <p id="manifesto-text">We believe a hospital should feel like the <em>opposite</em> of a waiting room: clear answers, senior doctors who listen, and a team that treats your time as carefully as your health.</p>
    <div class="btn-row" style="margin-top:40px" data-reveal>${u(`/about.html`,`Our story`,`line`)}</div>
  </div>
</div></section>`,F=[[`opd`,`reception`,`ward`,`nicu`,`ot`,`lab`],[`icu-ward`,`ambulance`,`ot-tall`,`ward-bed`,`exterior`,`icu-sign`]],I=()=>`
<section class="film" aria-label="Inside Lumi Hospital">
  <div class="container film-head">
    <div class="sec-index label"><span class="num">(↗)</span><span>Inside Lumi, photographed on site</span></div>
    ${u(`/gallery.html`,`Take the tour`,`line`,{sm:!0})}
  </div>
  ${F.map((e,t)=>`<div class="film-row" data-film="${t?1:-1}">${e.map(e=>`<a class="film-item" href="/gallery.html#${e}">${E(e,{sizes:`(max-width: 860px) 70vw, 30vw`})}</a>`).join(``)}</div>`).join(``)}
</section>`,L=()=>`
<section class="section section--alt" id="specialities" style="padding-bottom:clamp(60px,8vw,110px)">
  <div class="container">${l(`02`,`Specialities`,`Ten centres. <em>One</em> team.`,`<p>Every speciality shares records, labs and imaging, so your care is joined up from the first visit.</p>`)}</div>
  <div class="hscroll" id="hscroll"><div class="hscroll-track" id="hscroll-track">
    ${t.map(x).join(``)}
    <div class="hscroll-end"><h3>Not sure where to start?</h3><p class="muted">Tell us your symptoms and we'll guide you to the right specialist.</p>${u(`/contact.html`,`Ask our care team`,`accent`)}</div>
  </div></div>
  <div class="container"><div class="hscroll-progress"><i id="hscroll-bar"></i></div></div>
</section>`,R=()=>`
<section class="section"><div class="container feature">
  <div class="feature-media ph" data-reveal="scale">
    <div class="inner" data-parallax="0.08">${T(`icu`,{sizes:`(max-width: 860px) 100vw, 45vw`})}</div>
    <div class="float-card"><span class="ic-badge">${f(`shield`)}</span><div><b>Our ICU, as it is</b><span>Monitored beds with bedside oxygen and ventilator support</span></div></div>
  </div>
  <div>
    <div class="sec-index label"><span class="num">(03)</span><span>Why ${o(p.short)}</span></div>
    <h2 data-split style="margin-top:14px">Hospital care, <em>without</em> the hospital feeling.</h2>
    <p class="lead" data-reveal>Modern medicine is complicated. Being a patient shouldn't be.</p>
    <div class="features">
      ${[[`users`,`Senior specialists, on time`,`Consultants see you themselves, and booked slots run to the clock.`],[`scan`,`Diagnostics under one roof`,`24/7 lab, CT, MRI and imaging, with reports on your phone.`],[`ambulance`,`An emergency team that's always up`,`Emergency room, ICU and ambulance, staffed around the clock.`],[`card`,`Cashless, without the chase`,`Our insurance desk handles approvals so you don't have to.`]].map(([e,t,n])=>`<div class="feat" data-reveal><span class="ic-badge">${f(e)}</span><div><h3>${t}</h3><p>${n}</p></div></div>`).join(``)}
    </div>
  </div>
</div></section>`,z=()=>`
<section class="section"><div class="container journey">
  <div class="journey-intro">
    <div class="sec-index label"><span class="num">(05)</span><span>Your visit</span></div>
    <h2 data-split style="margin-top:14px">Four steps. <em>No</em> runaround.</h2>
    <p class="lead" data-reveal>From booking to follow-up, every step is designed to save you time.</p>
    <div class="btn-row" data-reveal style="margin-top:28px">${u(`/patient-guide.html`,`Patient guide`,`line`)}</div>
  </div>
  <div class="jcards">${r.map((e,t)=>`<article class="jcard"><span class="num">${s(t+1)}</span><div><h3>${e.title}</h3><p>${e.text}</p></div></article>`).join(``)}</div>
</div></section>`,B=()=>`
<section class="section section--alt"><div class="container">
  ${l(`06`,`Health checks`,`Catch it early. <em>Feel</em> it later.`,u(`/packages.html`,`All packages`,`line`))}
  <div class="grid g3">${m.slice(0,3).map(a).join(``)}</div>
</div></section>`,V=()=>e.length?`
<section class="section"><div class="container">
  ${l(`07`,`Patients`,`In their <em>own</em> words.`)}
  <div class="grid g3">${e.map(e=>`<figure class="tile" data-reveal><blockquote class="lead" style="margin:0 0 18px">“${o(e.quote)}”</blockquote><figcaption class="label">${o(e.name)} · ${o(e.context)}</figcaption></figure>`).join(``)}</div>
</div></section>`:``,H=()=>`
<section class="section--tight insurers" aria-label="Insurance partners">
  <div class="container" style="margin-bottom:22px"><span class="label">Cashless with leading insurers &amp; TPAs</span></div>
  <div class="marquee"><div class="marquee-track" data-speed="60" data-dir="right">
    ${p.insurers.map(e=>`<span class="marquee-item">${o(e)}${f(`plus`)}</span>`).join(``)}
  </div></div>
</section>`,U=()=>`
<section class="section"><div class="container">
  ${l(`08`,`Journal`,`Straight answers from <em>our</em> doctors.`,u(`/blog.html`,`Read the journal`,`line`))}
  <div class="grid g3">${c.slice(0,3).map(i).join(``)}</div>
</div></section>`,W=()=>`
<section class="section section--alt"><div class="container feature" style="align-items:start">
  <div><div class="sec-index label"><span class="num">(09)</span><span>Questions</span></div>
    <h2 data-split style="margin-top:14px">Good to <em>know.</em></h2>
    <p class="lead" data-reveal>Can't find your answer? Message us on WhatsApp and a coordinator will reply.</p></div>
  ${S(v)}
</div></section>`,G=()=>`
<section class="section"><div class="container">
  <div class="big-cta"><div class="big-cta-photo" aria-hidden="true">${T(`exterior`,{sizes:`100vw`,alt:``})}</div><div class="big-cta-glow"></div>
    <span class="label" style="color:rgba(255,255,255,.6)">Book in under a minute</span>
    <h2 data-split style="margin-top:16px">Your health can't wait. <em>Neither</em> should you.</h2>
    <p data-reveal>Choose a doctor and a time online, or call us and we'll find the right specialist for you.</p>
    <div class="btn-row" data-reveal style="margin-top:32px">${u(`/appointment.html`,`Book appointment`,`accent`,{ic:`calendar`})}<a class="btn btn--glass" href="${w(p.phone)}" data-magnetic><span>${o(p.phone)}</span><span class="btn-ic">${f(`phone`)}</span></a></div>
  </div>
</div></section>`;function K(){let e=C(`#manifesto-text`);if(!e)return;let t=e=>[...e.childNodes].forEach(e=>{if(e.nodeType===3){let t=document.createDocumentFragment();e.textContent.split(/(\s+)/).forEach(e=>{if(e){if(/^\s+$/.test(e))t.append(e);else{let n=document.createElement(`span`);n.className=`w`,n.textContent=e,t.append(n)}}}),e.replaceWith(t)}else e.nodeType===1&&t(e)});t(e),n()&&h.to(g(`.w`,e),{opacity:1,stagger:.05,ease:`none`,scrollTrigger:{trigger:e,start:`top 80%`,end:`bottom 45%`,scrub:!0}})}function q(){let e=C(`#hscroll`),t=C(`#hscroll-track`),r=C(`#hscroll-bar`);n()&&_.matchMedia({"(min-width: 861px)":()=>{let n=()=>t.scrollWidth-innerWidth,i=h.to(t,{x:()=>-n(),ease:`none`,scrollTrigger:{trigger:e,start:`center center`,end:()=>`+=`+n(),pin:e.parentElement,scrub:.6,invalidateOnRefresh:!0,anticipatePin:1,onUpdate:e=>h.set(r,{scaleX:e.progress})}});return()=>i.kill()}})}function J(){if(!n()||innerWidth<861)return;let e=g(`.jcard`);e.forEach((t,n)=>{n!==e.length-1&&h.to(t,{scale:.92+n*.015,opacity:.55,ease:`none`,scrollTrigger:{trigger:e[n+1],start:`top bottom`,end:`top `+(parseInt(getComputedStyle(e[n+1]).top)+10)+`px`,scrub:!0}})})}function Y(){n()&&(h.timeline({delay:.35}).fromTo(`.hero-photo--main`,{clipPath:`inset(100% 0 0 0 round 28px)`},{clipPath:`inset(0% 0 0 0 round 28px)`,duration:1.5,ease:`expo.inOut`}).from(`.hero-photo--main img`,{scale:1.35,duration:2,ease:`expo.out`},`<.2`).fromTo(`.hero-photo--sub`,{clipPath:`inset(0 100% 0 0 round 20px)`},{clipPath:`inset(0 0% 0 0 round 20px)`,duration:1.2,ease:`expo.inOut`},`-=1.4`).from(`.hero-chip`,{y:30,opacity:0,duration:1,ease:`expo.out`},`-=.8`).from(`.hstat`,{y:20,opacity:0,duration:1,ease:`expo.out`,stagger:.08},`-=.9`),h.to(`.hero-photo--main`,{yPercent:-10,ease:`none`,scrollTrigger:{trigger:`.hero`,start:`top top`,end:`bottom top`,scrub:!0}}),h.to(`.hero-photo--sub`,{yPercent:-35,ease:`none`,scrollTrigger:{trigger:`.hero`,start:`top top`,end:`bottom top`,scrub:!0}}),h.to(`.hero-copy`,{yPercent:-8,opacity:.25,ease:`none`,scrollTrigger:{trigger:`.hero`,start:`top top`,end:`bottom top`,scrub:!0}}))}function X(){n()&&g(`[data-film]`).forEach(e=>{let t=+e.dataset.film;h.fromTo(e,{xPercent:t<0?0:-18},{xPercent:t<0?-18:0,ease:`none`,scrollTrigger:{trigger:`.film`,start:`top bottom`,end:`bottom top`,scrub:.5}})})}function Z(){if(!n())return Promise.resolve();try{if(sessionStorage.getItem(`lumi-pl`))return Promise.resolve();sessionStorage.setItem(`lumi-pl`,`1`)}catch{return Promise.resolve()}let e=document.createElement(`div`);e.className=`preloader`,e.innerHTML=`<div class="pl-mark">${b.replace(`class="logo-mark"`,``)}</div><span class="pl-word label" style="color:rgba(255,255,255,.6)">${o(p.name)} · ${o(p.tagline)}</span><span class="pl-count">0</span>`,document.body.append(e);let t={v:0};return new Promise(n=>{h.timeline({onComplete:()=>{e.remove(),n()}}).from(e.querySelector(`.pl-mark`),{scale:.4,rotate:-90,opacity:0,duration:.8,ease:`expo.out`}).to(t,{v:100,duration:1.1,ease:`power2.inOut`,onUpdate:()=>e.querySelector(`.pl-count`).textContent=Math.round(t.v)},0).to(e,{clipPath:`inset(0 0 100% 0)`,duration:.9,ease:`expo.inOut`},`+=.1`)})}y(async()=>{C(`main`).innerHTML=M()+N()+P()+I()+L()+R()+z()+B()+V()+H()+U()+W()+G(),(window.requestIdleCallback||(e=>setTimeout(e,200)))(()=>j(C(`#lumen`)),{timeout:800}),K();let e=Z();requestAnimationFrame(()=>{q(),J(),Y(),X()}),await e});