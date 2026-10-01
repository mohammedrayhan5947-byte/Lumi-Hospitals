import{B as e,D as t,J as n,R as r,U as i,V as a,g as o,t as s,v as c,x as l}from"./core-BNTx_ofm.js";var u=Array.from({length:12},(e,t)=>{let n=t*Math.PI/6,r=t%2?78:92;return`<line x1="${100+62*Math.cos(n)}" y1="${100+62*Math.sin(n)}" x2="${100+r*Math.cos(n)}" y2="${100+r*Math.sin(n)}"/>`}).join(``),d=()=>`
<section class="nf" aria-labelledby="nf-h">
  <div class="nf-glow" aria-hidden="true"></div>
  <div class="container nf-in">
    <div class="nf-code" aria-hidden="true">
      <span>4</span>
      <span class="nf-orb"><span class="nf-halo"></span><svg viewBox="0 0 200 200"><g class="nf-rays">${u}</g></svg><span class="nf-core"></span></span>
      <span>4</span>
    </div>
    <div class="nf-copy">
      <span class="label">Error 404 · Page not found</span>
      <h1 id="nf-h" data-split data-instant>This page has drifted <em>out</em> of the light.</h1>
      <p class="lead" data-reveal>The link may be old, or the page may have moved. Everything else is right where you left it, and our team is still here.</p>
      <div class="btn-row" data-reveal>
        ${l(`/`,`Back to home`,`accent`,{ic:`arrowLeft`})}
        ${l(`/emergency.html`,`Emergency care`,`danger`,{ic:`ambulance`})}
      </div>
      <p class="nf-em" data-reveal>Need urgent help? Call <a href="${r(i.emergency)}">${t(i.emergency)}</a>, open 24/7.</p>
    </div>
  </div>
  <div class="container"><nav class="nf-links" aria-label="Popular pages" data-reveal>
    <span class="label">Or try</span>
    <ul>${n.map(n=>`<li><a href="${n.href}">${t(n.label)}${e(`arrowUpRight`)}</a></li>`).join(``)}</ul>
  </nav></div>
</section>`;function f(){if(!a()||!matchMedia(`(pointer: fine)`).matches)return;let e=c(`.nf-orb`),t=c(`.nf-glow`),n=o.quickTo(e,`x`,{duration:1.4,ease:`expo.out`}),r=o.quickTo(e,`y`,{duration:1.4,ease:`expo.out`}),i=o.quickTo(t,`x`,{duration:2,ease:`expo.out`}),s=o.quickTo(t,`y`,{duration:2,ease:`expo.out`});addEventListener(`pointermove`,e=>{let t=e.clientX/innerWidth-.5,a=e.clientY/innerHeight-.5;n(t*24),r(a*18),i(t*120),s(a*80)},{passive:!0}),o.from(`.nf-orb`,{scale:.4,opacity:0,duration:1.6,ease:`expo.out`,delay:.1}),o.from(`.nf-code > span:not(.nf-orb)`,{yPercent:40,opacity:0,duration:1.2,ease:`expo.out`,stagger:.12,delay:.2})}s(()=>{c(`main`).innerHTML=d(),f()});