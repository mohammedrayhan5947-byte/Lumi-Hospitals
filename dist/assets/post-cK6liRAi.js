import{B as e,D as t,E as n,F as r,I as i,L as a,O as o,R as s,S as c,U as l,Z as u,j as d,t as f,v as p,x as m}from"./core-BNTx_ofm.js";var h=document.querySelector(`main`)?.dataset.id||r.get(`id`),g=u.find(e=>e.id===h)||u[0],_=c(g.dept),v=e=>e.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``),y=g.body.filter(e=>e.startsWith(`## `)).map(e=>e.slice(3)),b=()=>g.body.map((e,n)=>e.startsWith(`## `)?`<h2 id="${v(e.slice(3))}">${t(e.slice(3))}</h2>`:`<p${n===0?` class="ps-lede"`:``}>${t(e)}</p>`).join(``),x=()=>`
<header class="ps-hero" data-instant>
  <div class="page-hero-glow"></div>
  <div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog.html">Journal</a><span>/</span><span>${_?t(_.name):`Article`}</span></nav>
    <div class="ps-meta">
      ${_?`<a class="tag" href="/blog.html?dept=${_.id}">${t(_.name)}</a>`:``}
      <span class="label"><time datetime="${g.date}">${o(g.date)}</time></span>
      <span class="label">${g.read} min read</span>
    </div>
    <h1 data-split>${t(g.title)}</h1>
    <p class="lead" data-reveal>${t(g.excerpt)}</p>
  </div>
  <div class="container"><div class="ps-media ph" data-reveal="scale">
    <div class="inner" data-parallax="0.06">${d(g.img,g.title,e(_?_.icon:`heart`))}</div>
  </div></div>
</header>`,S=()=>{let t=`${g.title} | ${l.name}`;return`<div class="ps-share">
    <span class="label">Share</span>
    <div class="ps-share-btns">
      <a class="ps-sh" href="https://wa.me/?text=${encodeURIComponent(t+` `+location.href)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${e(`chat`)}<span>WhatsApp</span></a>
      <button class="ps-sh" type="button" id="ps-copy" aria-label="Copy link to this article">${e(`globe`)}<span>Copy link</span></button>
    </div>
    <span class="ps-copied label" id="ps-copied" role="status" aria-live="polite"></span>
  </div>`},C=()=>`
<section class="ps-article"><div class="container ps-grid">
  <aside class="ps-rail" aria-label="Article tools">
    ${y.length?`<nav class="ps-toc" aria-label="In this article"><span class="label">In this article</span><ol>${y.map(e=>`<li><a href="#${v(e)}">${t(e)}</a></li>`).join(``)}</ol></nav>`:``}
    ${S()}
  </aside>
  <article class="ps-body">
    ${b()}
    <p class="ps-note">${e(`info`)}<span>This article is general information from ${t(l.name)} and isn't a substitute for a consultation. If symptoms are severe or sudden, call <a href="${s(l.emergency)}">${t(l.emergency)}</a>.</span></p>
  </article>
</div></section>`,w=()=>{if(!_)return``;let r=n(_.id);return`<section class="section--tight"><div class="container">
    <div class="ps-cta">
      <div class="ps-cta-glow"></div>
      <div>
        <span class="label">${t(_.name)} at ${t(l.short)}</span>
        <h2 data-split>Questions about this? Talk to <em>a specialist.</em></h2>
        <p>${t(_.summary)}</p>
        <div class="btn-row">${m(`/appointment.html?dept=${_.id}`,`Book ${t(_.name)}`,`accent`,{ic:`calendar`})}${m(`/specialities/${_.id}.html`,`About the department`,`glass`)}</div>
      </div>
      ${r.length?`<ul class="ps-docs" aria-label="${t(_.name)} specialists">${r.map(n=>`<li><a href="/doctors/${n.id}.html"><b>${t(n.name)}</b><span>${t(n.role)}</span>${e(`arrowUpRight`)}</a></li>`).join(``)}</ul>`:``}
    </div>
  </div></section>`},T=()=>{let e=u.filter(e=>e.id!==g.id),t=[...e.filter(e=>e.dept===g.dept),...e.filter(e=>e.dept!==g.dept).sort((e,t)=>t.date.localeCompare(e.date))].slice(0,3);return t.length?`<section class="section section--alt"><div class="container">
    ${a(`+`,`Keep reading`,`More from the <em>journal.</em>`,m(`/blog.html`,`All articles`,`line`))}
    <div class="grid g3">${t.map(i).join(``)}</div>
  </div></section>`:``};function E(){let e=document.createElement(`div`);e.className=`ps-progress`,e.setAttribute(`aria-hidden`,`true`),e.innerHTML=`<i></i>`,document.body.append(e);let t=e.firstChild,n=p(`.ps-body`),r=0,i=()=>{r=0;let e=n.getBoundingClientRect(),i=Math.min(1,Math.max(0,(innerHeight*.75-e.top)/Math.max(1,e.height)));t.style.transform=`scaleX(${i})`},a=()=>{r||=requestAnimationFrame(i)};addEventListener(`scroll`,a,{passive:!0}),addEventListener(`resize`,a),i()}function D(){let e=p(`#ps-copy`),t=p(`#ps-copied`);e.addEventListener(`click`,async()=>{let n=!1;try{await navigator.clipboard.writeText(location.href),n=!0}catch{let e=document.createElement(`textarea`);e.value=location.href,e.setAttribute(`readonly`,``),e.style.position=`fixed`,e.style.opacity=`0`,document.body.append(e),e.select();try{n=document.execCommand(`copy`)}catch{n=!1}e.remove()}t.textContent=n?`Link copied`:`Couldn't copy. Use your browser's share menu.`,e.classList.toggle(`is-done`,n),clearTimeout(e._t),e._t=setTimeout(()=>{t.textContent=``,e.classList.remove(`is-done`)},2600)})}f(()=>{document.title=`${g.title} | ${l.name}`,p(`meta[name="description"]`)?.setAttribute(`content`,g.excerpt),p(`meta[property="og:title"]`)?.setAttribute(`content`,document.title),p(`meta[property="og:description"]`)?.setAttribute(`content`,g.excerpt),p(`main`).innerHTML=x()+C()+w()+T(),E(),D()});