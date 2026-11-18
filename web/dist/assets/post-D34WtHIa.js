import{$ as e,C as t,D as n,I as r,L as i,M as a,O as o,R as s,S as c,V as l,W as u,k as d,t as f,y as p,z as m}from"./core-DP1POjhO.js";var h=document.querySelector(`main`)?.dataset.id||r.get(`id`),g=e.find(e=>e.id===h)||e[0],_=t(g.dept),v=e=>e.toLowerCase().replace(/[^a-z0-9]+/g,`-`).replace(/^-|-$/g,``),y=g.body.filter(e=>e.startsWith(`## `)).map(e=>e.slice(3)),b=()=>g.body.map((e,t)=>e.startsWith(`## `)?`<h2 id="${v(e.slice(3))}">${o(e.slice(3))}</h2>`:`<p${t===0?` class="ps-lede"`:``}>${o(e)}</p>`).join(``),x=()=>`
<header class="ps-hero" data-instant>
  <div class="page-hero-glow"></div>
  <div class="container">
    <nav class="crumbs label" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/blog.html">Journal</a><span>/</span><span>${_?o(_.name):`Article`}</span></nav>
    <div class="ps-meta">
      ${_?`<a class="tag" href="/blog.html?dept=${_.id}">${o(_.name)}</a>`:``}
      <span class="label"><time datetime="${g.date}">${d(g.date)}</time></span>
      <span class="label">${g.read} min read</span>
    </div>
    <h1 data-split>${o(g.title)}</h1>
    <p class="lead" data-reveal>${o(g.excerpt)}</p>
  </div>
  <div class="container"><div class="ps-media ph" data-reveal="scale">
    <div class="inner" data-parallax="0.06">${a(g.img,g.title,l(_?_.icon:`heart`))}</div>
  </div></div>
</header>`,S=()=>{let e=`${g.title} | ${u.name}`;return`<div class="ps-share">
    <span class="label">Share</span>
    <div class="ps-share-btns">
      <a class="ps-sh" href="https://wa.me/?text=${encodeURIComponent(e+` `+location.href)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${l(`chat`)}<span>WhatsApp</span></a>
      <button class="ps-sh" type="button" id="ps-copy" aria-label="Copy link to this article">${l(`globe`)}<span>Copy link</span></button>
    </div>
    <span class="ps-copied label" id="ps-copied" role="status" aria-live="polite"></span>
  </div>`},C=()=>`
<section class="ps-article"><div class="container ps-grid">
  <aside class="ps-rail" aria-label="Article tools">
    ${y.length?`<nav class="ps-toc" aria-label="In this article"><span class="label">In this article</span><ol>${y.map(e=>`<li><a href="#${v(e)}">${o(e)}</a></li>`).join(``)}</ol></nav>`:``}
    ${S()}
  </aside>
  <article class="ps-body">
    ${b()}
    <p class="ps-note">${l(`info`)}<span>This article is general information from ${o(u.name)} and isn't a substitute for a consultation. If symptoms are severe or sudden, call <a href="${m(u.emergency)}">${o(u.emergency)}</a>.</span></p>
  </article>
</div></section>`,w=()=>{if(!_)return``;let e=n(_.id);return`<section class="section--tight"><div class="container">
    <div class="ps-cta">
      <div class="ps-cta-glow"></div>
      <div>
        <span class="label">${o(_.name)} at ${o(u.short)}</span>
        <h2 data-split>Questions about this? Talk to <em>a specialist.</em></h2>
        <p>${o(_.summary)}</p>
        <div class="btn-row">${c(`/appointment.html?dept=${_.id}`,`Book ${o(_.name)}`,`accent`,{ic:`calendar`})}${c(`/specialities/${_.id}.html`,`About the department`,`glass`)}</div>
      </div>
      ${e.length?`<ul class="ps-docs" aria-label="${o(_.name)} specialists">${e.map(e=>`<li><a href="/doctors/${e.id}.html"><b>${o(e.name)}</b><span>${o(e.role)}</span>${l(`arrowUpRight`)}</a></li>`).join(``)}</ul>`:``}
    </div>
  </div></section>`},T=()=>{let t=e.filter(e=>e.id!==g.id),n=[...t.filter(e=>e.dept===g.dept),...t.filter(e=>e.dept!==g.dept).sort((e,t)=>t.date.localeCompare(e.date))].slice(0,3);return n.length?`<section class="section section--alt"><div class="container">
    ${s(`+`,`Keep reading`,`More from the <em>journal.</em>`,c(`/blog.html`,`All articles`,`line`))}
    <div class="grid g3">${n.map(i).join(``)}</div>
  </div></section>`:``};function E(){let e=document.createElement(`div`);e.className=`ps-progress`,e.setAttribute(`aria-hidden`,`true`),e.innerHTML=`<i></i>`,document.body.append(e);let t=e.firstChild,n=p(`.ps-body`),r=0,i=()=>{r=0;let e=n.getBoundingClientRect(),i=Math.min(1,Math.max(0,(innerHeight*.75-e.top)/Math.max(1,e.height)));t.style.transform=`scaleX(${i})`},a=()=>{r||=requestAnimationFrame(i)};addEventListener(`scroll`,a,{passive:!0}),addEventListener(`resize`,a),i()}function D(){let e=p(`#ps-copy`),t=p(`#ps-copied`);e.addEventListener(`click`,async()=>{let n=!1;try{await navigator.clipboard.writeText(location.href),n=!0}catch{let e=document.createElement(`textarea`);e.value=location.href,e.setAttribute(`readonly`,``),e.style.position=`fixed`,e.style.opacity=`0`,document.body.append(e),e.select();try{n=document.execCommand(`copy`)}catch{n=!1}e.remove()}t.textContent=n?`Link copied`:`Couldn't copy. Use your browser's share menu.`,e.classList.toggle(`is-done`,n),clearTimeout(e._t),e._t=setTimeout(()=>{t.textContent=``,e.classList.remove(`is-done`)},2600)})}f(()=>{document.title=`${g.title} | ${u.name}`,p(`meta[name="description"]`)?.setAttribute(`content`,g.excerpt),p(`meta[property="og:title"]`)?.setAttribute(`content`,document.title),p(`meta[property="og:description"]`)?.setAttribute(`content`,g.excerpt),p(`main`).innerHTML=x()+C()+w()+T(),E(),D()});