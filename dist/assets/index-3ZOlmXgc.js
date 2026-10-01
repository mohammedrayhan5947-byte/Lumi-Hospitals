import{$ as e,E as t,G as n,H as r,J as i,K as a,L as o,N as s,O as c,P as l,Q as u,R as d,S as f,U as p,V as m,W as h,X as g,_,b as v,g as y,q as b,t as x,v as S,w as C,x as w,y as T,z as E}from"./core-CdQdIRLX.js";import{n as D,t as O}from"./media-BdCK0rUM.js";var k=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`,A=`precision highp float;
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
}`,j=e=>{let t=parseInt(e.replace(`#`,``),16);return[(t>>16&255)/255,(t>>8&255)/255,(t&255)/255]};function M(){let e=document.createElement(`i`);e.style.color=`var(--accent)`,e.style.display=`none`,document.body.appendChild(e);let t=getComputedStyle(e).color.match(/[\d.]+/g)?.slice(0,3).map(Number)||[14,138,112];return e.remove(),t.map(e=>e>1?e/255:e)}function N(e){let t=e.getContext(`webgl`,{antialias:!1,alpha:!1,powerPreference:`low-power`});if(!t){e.classList.add(`no-gl`);return}let n=t.getExtension(`WEBGL_debug_renderer_info`),i=n?String(t.getParameter(n.UNMASKED_RENDERER_WEBGL)):``;if(/swiftshader|llvmpipe|software/i.test(i)||(navigator.hardwareConcurrency||8)<=2){e.classList.add(`no-gl`);return}let a=(e,n)=>{let r=t.createShader(e);return t.shaderSource(r,n),t.compileShader(r),r},o=t.createProgram();t.attachShader(o,a(t.VERTEX_SHADER,k)),t.attachShader(o,a(t.FRAGMENT_SHADER,A)),t.linkProgram(o),t.useProgram(o),t.bindBuffer(t.ARRAY_BUFFER,t.createBuffer()),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,`p`);t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0);let c=e=>t.getUniformLocation(o,e),l=c(`r`),u=c(`t`),d=c(`m`),f=c(`c1`),m=c(`c2`),h=c(`bg`),g=()=>{let e=M();t.uniform3fv(f,e),t.uniform3fv(m,e.map(e=>e+(1-e)*.75)),t.uniform3fv(h,j(`#0a0f0e`))};g(),p(()=>{g(),C||D(performance.now())});let _=Math.min(devicePixelRatio||1,1.25),v=()=>{let n=e.clientWidth,r=e.clientHeight;e.width=Math.max(1,n*_*.75),e.height=Math.max(1,r*_*.75),t.viewport(0,0,e.width,e.height),t.uniform2f(l,e.width,e.height)};v(),addEventListener(`resize`,v);let y=.7,b=.6,x=.7,S=.6;e.parentElement.addEventListener(`pointermove`,t=>{let n=e.getBoundingClientRect();x=(t.clientX-n.left)/n.width,S=1-(t.clientY-n.top)/n.height},{passive:!0});let C=!1,w=!0,T=0,E=performance.now();function D(e){y+=(x-y)*.04,b+=(S-b)*.04,t.uniform1f(u,(e-E)/1e3+20),t.uniform2f(d,y,b),t.drawArrays(t.TRIANGLES,0,3),C&&(T=requestAnimationFrame(D))}let O=()=>{!C&&r()&&(C=!0,T=requestAnimationFrame(D))},N=()=>{C=!1,cancelAnimationFrame(T)};new IntersectionObserver(([e])=>{w=e.isIntersecting,w&&!document.hidden?O():N()}).observe(e),document.addEventListener(`visibilitychange`,()=>document.hidden||!w?N():O()),D(performance.now()),O()}var P=()=>`
<section class="hero" aria-label="Introduction">
  <canvas id="lumen" aria-hidden="true"></canvas>
  <div class="container hero-in">
    <div class="hero-copy">
      <div class="hero-kicker label"><span class="dot"></span>Open now · Emergency, ICU &amp; pharmacy 24/7</div>
      <h1 data-split data-instant>Medicine, in a better <em>light.</em></h1>
      <p class="hero-lead" data-reveal>${c(h.intro)}</p>
      <form class="hero-book" action="/appointment.html" method="get" data-reveal>
        <label class="sr-only" for="q-dept">Choose a speciality</label>
        <select class="select" id="q-dept" name="dept">
          <option value="">Which speciality do you need?</option>
          ${n.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}
        </select>
        <button class="btn btn--accent" type="submit" data-magnetic><span>Book a visit</span><span class="btn-ic">${m(`arrow`)}</span></button>
      </form>
      <div class="hero-links" data-reveal>
        <a class="link" href="/doctors.html">Find a doctor ${m(`arrowUpRight`)}</a>
        <a class="link" href="/gallery.html">Tour the hospital ${m(`arrowUpRight`)}</a>
      </div>
    </div>
    <div class="hero-visual" aria-label="Lumi Hospital">
      <div class="hero-photo hero-photo--main">${D(`exterior-tall`,{eager:!0,sizes:`(max-width: 1100px) 80vw, 32vw`})}</div>
      <div class="hero-photo hero-photo--sub">${D(`icu`,{sizes:`(max-width: 1100px) 45vw, 18vw`})}</div>
      <a class="hero-chip" href="${E(h.emergency)}"><span class="em-ic">${m(`ambulance`)}</span><span><small>24/7 emergency &amp; ambulance</small><b>${c(h.emergency)}</b></span></a>
    </div>
  </div>
  <div class="hero-foot"><div class="container">
    ${h.stats.map(e=>`<div class="hstat"><b><span data-count="${e.value}">${e.value}</span>${e.suffix}</b><span>${e.label}</span></div>`).join(``)}
  </div></div>
</section>`,F=()=>`
<div class="marquee" aria-hidden="true"><div class="marquee-track" data-speed="50">
  ${n.map((e,t)=>`<span class="marquee-item">${t%2?e.name.toLowerCase():e.name}${m(`sparkle`)}</span>`).join(``)}
</div></div>`,I=()=>`
<section class="section manifesto"><div class="container manifesto-row">
  <div class="sec-index label"><span class="num">(01)</span><span>Who we are</span></div>
  <div>
    <p id="manifesto-text">We believe a hospital should feel like the <em>opposite</em> of a waiting room: clear answers, senior doctors who listen, and a team that treats your time as carefully as your health.</p>
    <div class="btn-row" style="margin-top:40px" data-reveal>${f(`/about.html`,`Our story`,`line`)}</div>
  </div>
</div></section>`,L=[[`opd`,`reception`,`ward`,`nicu`,`ot`,`lab`],[`icu-ward`,`ambulance`,`ot-tall`,`ward-bed`,`exterior`,`icu-sign`]],R=()=>`
<section class="film" aria-label="Inside Lumi Hospital">
  <div class="container film-head">
    <div class="sec-index label"><span class="num">(↗)</span><span>Inside Lumi, photographed on site</span></div>
    ${f(`/gallery.html`,`Take the tour`,`line`,{sm:!0})}
  </div>
  ${L.map((e,t)=>`<div class="film-row" data-film="${t?1:-1}">${e.map(e=>`<a class="film-item" href="/gallery.html#${e}">${O(e,{sizes:`(max-width: 860px) 70vw, 30vw`})}</a>`).join(``)}</div>`).join(``)}
</section>`,z=()=>`
<section class="section section--alt" id="specialities" style="padding-bottom:clamp(60px,8vw,110px)">
  <div class="container">${d(`02`,`Specialities`,`Ten centres. <em>One</em> team.`,`<p>Every speciality shares records, labs and imaging, so your care is joined up from the first visit.</p>`)}</div>
  <div class="hscroll" id="hscroll"><div class="hscroll-track" id="hscroll-track">
    ${n.map(C).join(``)}
    <div class="hscroll-end"><h3>Not sure where to start?</h3><p class="muted">Tell us your symptoms and we'll guide you to the right specialist.</p>${f(`/contact.html`,`Ask our care team`,`accent`)}</div>
  </div></div>
  <div class="container"><div class="hscroll-progress"><i id="hscroll-bar"></i></div></div>
</section>`,B=()=>`
<section class="section"><div class="container feature">
  <div class="feature-media ph" data-reveal="scale">
    <div class="inner" data-parallax="0.08">${D(`icu`,{sizes:`(max-width: 860px) 100vw, 45vw`})}</div>
    <div class="float-card"><span class="ic-badge">${m(`shield`)}</span><div><b>Our ICU, as it is</b><span>Monitored beds with bedside oxygen and ventilator support</span></div></div>
  </div>
  <div>
    <div class="sec-index label"><span class="num">(03)</span><span>Why ${c(h.short)}</span></div>
    <h2 data-split style="margin-top:14px">Hospital care, <em>without</em> the hospital feeling.</h2>
    <p class="lead" data-reveal>Modern medicine is complicated. Being a patient shouldn't be.</p>
    <div class="features">
      ${[[`users`,`Senior specialists, on time`,`Consultants see you themselves, and booked slots run to the clock.`],[`scan`,`Diagnostics under one roof`,`24/7 lab, CT, MRI and imaging, with reports on your phone.`],[`ambulance`,`An emergency team that's always up`,`Emergency room, ICU and ambulance, staffed around the clock.`],[`card`,`Cashless, without the chase`,`Our insurance desk handles approvals so you don't have to.`]].map(([e,t,n])=>`<div class="feat" data-reveal><span class="ic-badge">${m(e)}</span><div><h3>${t}</h3><p>${n}</p></div></div>`).join(``)}
    </div>
  </div>
</div></section>`,V=()=>`
<section class="section section--alt"><div class="container">
  ${d(`04`,`Doctors`,`Meet the people behind <em>your</em> care.`,f(`/doctors.html`,`All ${a.length} doctors`,`line`))}
  <div class="grid g4">${a.slice(0,4).map(t).join(``)}</div>
</div></section>`,H=()=>`
<section class="section"><div class="container journey">
  <div class="journey-intro">
    <div class="sec-index label"><span class="num">(05)</span><span>Your visit</span></div>
    <h2 data-split style="margin-top:14px">Four steps. <em>No</em> runaround.</h2>
    <p class="lead" data-reveal>From booking to follow-up, every step is designed to save you time.</p>
    <div class="btn-row" data-reveal style="margin-top:28px">${f(`/patient-guide.html`,`Patient guide`,`line`)}</div>
  </div>
  <div class="jcards">${i.map((e,t)=>`<article class="jcard"><span class="num">${l(t+1)}</span><div><h3>${e.title}</h3><p>${e.text}</p></div></article>`).join(``)}</div>
</div></section>`,U=()=>`
<section class="section section--alt"><div class="container">
  ${d(`06`,`Health checks`,`Catch it early. <em>Feel</em> it later.`,f(`/packages.html`,`All packages`,`line`))}
  <div class="grid g3">${g.slice(0,3).map(s).join(``)}</div>
</div></section>`,W=()=>e.length?`
<section class="section"><div class="container">
  ${d(`07`,`Patients`,`In their <em>own</em> words.`)}
  <div class="grid g3">${e.map(e=>`<figure class="tile" data-reveal><blockquote class="lead" style="margin:0 0 18px">“${c(e.quote)}”</blockquote><figcaption class="label">${c(e.name)} · ${c(e.context)}</figcaption></figure>`).join(``)}</div>
</div></section>`:``,G=()=>`
<section class="section--tight insurers" aria-label="Insurance partners">
  <div class="container" style="margin-bottom:22px"><span class="label">Cashless with leading insurers &amp; TPAs</span></div>
  <div class="marquee"><div class="marquee-track" data-speed="60" data-dir="right">
    ${h.insurers.map(e=>`<span class="marquee-item">${c(e)}${m(`plus`)}</span>`).join(``)}
  </div></div>
</section>`,K=()=>`
<section class="section"><div class="container">
  ${d(`08`,`Journal`,`Straight answers from <em>our</em> doctors.`,f(`/blog.html`,`Read the journal`,`line`))}
  <div class="grid g3">${u.slice(0,3).map(o).join(``)}</div>
</div></section>`,q=()=>`
<section class="section section--alt"><div class="container feature" style="align-items:start">
  <div><div class="sec-index label"><span class="num">(09)</span><span>Questions</span></div>
    <h2 data-split style="margin-top:14px">Good to <em>know.</em></h2>
    <p class="lead" data-reveal>Can't find your answer? Message us on WhatsApp and a coordinator will reply.</p></div>
  ${w(b)}
</div></section>`,J=()=>`
<section class="section"><div class="container">
  <div class="big-cta"><div class="big-cta-photo" aria-hidden="true">${D(`exterior`,{sizes:`100vw`,alt:``})}</div><div class="big-cta-glow"></div>
    <span class="label" style="color:rgba(255,255,255,.6)">Book in under a minute</span>
    <h2 data-split style="margin-top:16px">Your health can't wait. <em>Neither</em> should you.</h2>
    <p data-reveal>Choose a doctor and a time online, or call us and we'll find the right specialist for you.</p>
    <div class="btn-row" data-reveal style="margin-top:32px">${f(`/appointment.html`,`Book appointment`,`accent`,{ic:`calendar`})}<a class="btn btn--glass" href="${E(h.phone)}" data-magnetic><span>${c(h.phone)}</span><span class="btn-ic">${m(`phone`)}</span></a></div>
  </div>
</div></section>`;function Y(){let e=T(`#manifesto-text`);if(!e)return;let t=e=>[...e.childNodes].forEach(e=>{if(e.nodeType===3){let t=document.createDocumentFragment();e.textContent.split(/(\s+)/).forEach(e=>{if(e){if(/^\s+$/.test(e))t.append(e);else{let n=document.createElement(`span`);n.className=`w`,n.textContent=e,t.append(n)}}}),e.replaceWith(t)}else e.nodeType===1&&t(e)});t(e),r()&&_.to(v(`.w`,e),{opacity:1,stagger:.05,ease:`none`,scrollTrigger:{trigger:e,start:`top 80%`,end:`bottom 45%`,scrub:!0}})}function X(){let e=T(`#hscroll`),t=T(`#hscroll-track`),n=T(`#hscroll-bar`);r()&&y.matchMedia({"(min-width: 861px)":()=>{let r=()=>t.scrollWidth-innerWidth,i=_.to(t,{x:()=>-r(),ease:`none`,scrollTrigger:{trigger:e,start:`center center`,end:()=>`+=`+r(),pin:e.parentElement,scrub:.6,invalidateOnRefresh:!0,anticipatePin:1,onUpdate:e=>_.set(n,{scaleX:e.progress})}});return()=>i.kill()}})}function Z(){if(!r()||innerWidth<861)return;let e=v(`.jcard`);e.forEach((t,n)=>{n!==e.length-1&&_.to(t,{scale:.92+n*.015,opacity:.55,ease:`none`,scrollTrigger:{trigger:e[n+1],start:`top bottom`,end:`top `+(parseInt(getComputedStyle(e[n+1]).top)+10)+`px`,scrub:!0}})})}function Q(){r()&&(_.timeline({delay:.35}).fromTo(`.hero-photo--main`,{clipPath:`inset(100% 0 0 0 round 28px)`},{clipPath:`inset(0% 0 0 0 round 28px)`,duration:1.5,ease:`expo.inOut`}).from(`.hero-photo--main img`,{scale:1.35,duration:2,ease:`expo.out`},`<.2`).fromTo(`.hero-photo--sub`,{clipPath:`inset(0 100% 0 0 round 20px)`},{clipPath:`inset(0 0% 0 0 round 20px)`,duration:1.2,ease:`expo.inOut`},`-=1.4`).from(`.hero-chip`,{y:30,opacity:0,duration:1,ease:`expo.out`},`-=.8`).from(`.hstat`,{y:20,opacity:0,duration:1,ease:`expo.out`,stagger:.08},`-=.9`),_.to(`.hero-photo--main`,{yPercent:-10,ease:`none`,scrollTrigger:{trigger:`.hero`,start:`top top`,end:`bottom top`,scrub:!0}}),_.to(`.hero-photo--sub`,{yPercent:-35,ease:`none`,scrollTrigger:{trigger:`.hero`,start:`top top`,end:`bottom top`,scrub:!0}}),_.to(`.hero-copy`,{yPercent:-8,opacity:.25,ease:`none`,scrollTrigger:{trigger:`.hero`,start:`top top`,end:`bottom top`,scrub:!0}}))}function $(){r()&&v(`[data-film]`).forEach(e=>{let t=+e.dataset.film;_.fromTo(e,{xPercent:t<0?0:-18},{xPercent:t<0?-18:0,ease:`none`,scrollTrigger:{trigger:`.film`,start:`top bottom`,end:`bottom top`,scrub:.5}})})}function ee(){if(!r())return Promise.resolve();try{if(sessionStorage.getItem(`lumi-pl`))return Promise.resolve();sessionStorage.setItem(`lumi-pl`,`1`)}catch{return Promise.resolve()}let e=document.createElement(`div`);e.className=`preloader`,e.innerHTML=`<div class="pl-mark">${S.replace(`class="logo-mark"`,``)}</div><span class="pl-word label" style="color:rgba(255,255,255,.6)">${c(h.name)} · ${c(h.tagline)}</span><span class="pl-count">0</span>`,document.body.append(e);let t={v:0};return new Promise(n=>{_.timeline({onComplete:()=>{e.remove(),n()}}).from(e.querySelector(`.pl-mark`),{scale:.4,rotate:-90,opacity:0,duration:.8,ease:`expo.out`}).to(t,{v:100,duration:1.1,ease:`power2.inOut`,onUpdate:()=>e.querySelector(`.pl-count`).textContent=Math.round(t.v)},0).to(e,{clipPath:`inset(0 0 100% 0)`,duration:.9,ease:`expo.inOut`},`+=.1`)})}x(async()=>{T(`main`).innerHTML=P()+F()+I()+R()+z()+B()+V()+H()+U()+W()+G()+K()+q()+J(),(window.requestIdleCallback||(e=>setTimeout(e,200)))(()=>N(T(`#lumen`)),{timeout:800}),Y();let e=ee();requestAnimationFrame(()=>{X(),Z(),Q(),$()}),await e});