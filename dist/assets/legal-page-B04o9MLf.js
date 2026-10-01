import{B as e,D as t,N as n,O as r,P as i,U as a,n as o,v as s,y as c}from"./core-BNTx_ofm.js";var l=`<span class="todo">[to be provided by the hospital]</span>`,u=a.legal||{},d=e=>e&&!/^(Address line|\+91 0{5} 0{5})/.test(e)?e:``,f={name:a.name,entity:u.entity,address:d(a.address),email:a.email,emergency:a.emergency,kpmeReg:u.kpmeReg,pcpndtReg:u.pcpndtReg,gstin:u.gstin,"go.name":u.grievanceOfficer?.name,"go.email":u.grievanceOfficer?.email,"go.phone":d(u.grievanceOfficer?.phone),"dpo.name":u.dpo?.name,"dpo.email":u.dpo?.email,jurisdiction:a.city?`${a.city}, ${a.region}`:``,pcpndt:o,hosting:``,retention:``,cctv:``,processors:``,rates:``,telemedicine:``,kannada:``},p=e=>String(e).replace(/\{\{([\w.]+)\}\}/g,(e,n)=>f[n]?t(f[n]):l),m=n=>{if(typeof n==`string`)return`<p>${p(n)}</p>`;let[r,i,a]=n;return r===`h3`?`<h3>${p(i)}</h3>`:r===`ul`||r===`ol`?`<${r} class="lg-list">${i.map(e=>`<li>${p(e)}</li>`).join(``)}</${r}>`:r===`dl`?`<dl class="lg-dl">${i.map(([e,t])=>`<div><dt>${p(e)}</dt><dd>${p(t)}</dd></div>`).join(``)}</dl>`:r===`note`?`<div class="lg-note ${a?`lg-note--`+a:``}" role="note">${e(a===`danger`?`alert`:`info`)}<p>${p(i)}</p></div>`:r===`table`?`<div class="lg-table" role="region" aria-label="${t(i.head.join(`, `))}" tabindex="0"><table>
    <thead><tr>${i.head.map(e=>`<th scope="col">${t(e)}</th>`).join(``)}</tr></thead>
    <tbody>${i.rows.map(e=>`<tr>${e.map((e,n)=>n?`<td data-th="${t(i.head[n])}">${p(e)}</td>`:`<th scope="row">${p(e)}</th>`).join(``)}</tr>`).join(``)}</tbody></table></div>`:``},h=e=>e.map(m).join(``),g=e=>Math.max(2,Math.round(JSON.stringify(e.sections.map(e=>typeof e.body==`function`?``:e.body)).split(/\s+/).length/220)+(e.extraMin||0));function _(o,{heroExtra:s=``,after:c=``}={}){let l=o.sections,u=e=>`<ol class="${e}">${l.map((e,r)=>`<li><a href="#${e.id}" data-spy="${e.id}"><span class="num">${n(r+1)}</span><span>${t(e.label)}</span></a></li>`).join(``)}</ol>`,d=`<div class="lg-meta" data-reveal>
      <span class="label">Last updated · <time datetime="${o.updated}">${r(o.updated)}</time></span>
      <span class="label">${g(o)} min read</span>
      <button type="button" class="lg-print" data-print>${e(`file`)}<span>Print or save as PDF</span></button>
    </div>${s}`;return i(o.crumb,o.title,p(o.lead),d)+`
  <section class="lg-body"><div class="container lg-layout">
    <aside class="lg-aside">
      <nav class="lg-nav" aria-label="On this page">
        <span class="label">On this page</span>
        <div class="lg-track" aria-hidden="true"><span class="lg-fill"></span></div>
        ${u(`lg-toc`)}
      </nav>
    </aside>
    <details class="lg-mtoc"><summary><span class="label">On this page</span><span class="lg-mtoc-n">${l.length} sections</span>${e(`plus`)}</summary>${u(`lg-toc lg-toc--m`)}</details>
    <article class="lg-doc">
      ${l.map((e,r)=>`
      <section class="lg-sec" id="${e.id}" aria-labelledby="${e.id}-h">
        <h2 id="${e.id}-h"><span class="num">${n(r+1)}</span><span>${t(e.label)}</span><a class="lg-anchor" href="#${e.id}" aria-label="Link to ${t(e.label)}">#</a></h2>
        ${typeof e.body==`function`?e.body():h(e.body)}
      </section>`).join(``)}
      <p class="lg-end label">End of document · ${t(a.name)} · <time datetime="${o.updated}">${r(o.updated)}</time></p>
    </article>
  </div></section>${c}`}function v(e){let t=e.sections.map(e=>e.id),n=c(`.lg-nav a[data-spy]`),r=s(`.lg-fill`),i=s(`.lg-doc`),a=``,o=e=>{e!==a&&(a=e,n.forEach(t=>{let n=t.dataset.spy===e;t.classList.toggle(`is-active`,n),n?t.setAttribute(`aria-current`,`location`):t.removeAttribute(`aria-current`)}))},l=new Map,u=new IntersectionObserver(e=>{e.forEach(e=>l.set(e.target.id,e.isIntersecting));let n=t.find(e=>l.get(e));n&&o(n)},{rootMargin:`-25% 0px -65% 0px`});t.forEach(e=>{let t=document.getElementById(e);t&&u.observe(t)}),o(t[0]);let d=!1,f=()=>{if(d=!1,!r||!i)return;let e=i.getBoundingClientRect(),t=e.height-innerHeight*.5,n=Math.min(1,Math.max(0,(innerHeight*.3-e.top)/Math.max(1,t)));r.style.transform=`scaleY(${n})`};addEventListener(`scroll`,()=>{d||(d=!0,requestAnimationFrame(f))},{passive:!0}),f(),c(`.lg-toc--m a`).forEach(e=>e.addEventListener(`click`,()=>{s(`.lg-mtoc`).open=!1})),s(`[data-print]`)?.addEventListener(`click`,()=>window.print())}export{_ as i,v as n,p as r,l as t};