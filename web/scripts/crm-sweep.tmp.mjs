import puppeteer from "puppeteer-core"
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true })
let p = await b.newPage()
const errs=[]
p.on("console", m=>{ if(m.type()==="error") errs.push("console:"+m.text().slice(0,200)) })
p.on("pageerror", e=>errs.push("pageerror:"+String(e).slice(0,200)))
p.on("response", r=>{ if(r.status()>=400) errs.push(r.status()+" "+r.url().slice(0,120)) })
await p.setViewport({width:1440,height:900})
await p.goto("http://localhost:3000/login",{waitUntil:"networkidle0"})
await p.type('input[type="email"]',"admin@lumihospital.in"); await p.type('input[type="password"]',"v8FDyZ5OxYXE")
await Promise.all([p.waitForNavigation({waitUntil:"networkidle0"}).catch(()=>{}),p.click('button[type="submit"]')])
const routes=["billing","billing","billing/new","billing/refunds","finance/dashboard","finance/cash-counter","finance/expenses","finance/outstanding","finance/reports","inventory","inventory/alerts","inventory/transactions","services","templates","settings/signature","audit-logs","search?q=LH-","search?q=a","website/content","website/faqs","website/reviews"]
const seen=new Set()
async function visit(r,w){try{return await visit0(r,w)}catch(e){console.log(w,r,"EXC",e.message.slice(0,60));return []}}
async function visit0(r,w){
  const old=p; p=await b.newPage(); await old.close().catch(()=>{}); p.on("console",m=>{if(m.type()==="error")errs.push("console:"+m.text().slice(0,200))}); p.on("pageerror",e=>errs.push("pageerror:"+String(e).slice(0,200))); p.on("response",x=>{if(x.status()>=400)errs.push(x.status()+" "+x.url().slice(0,120))})
  errs.length=0
  await p.setViewport({width:w,height:900})
  const res=await p.goto("http://localhost:3000/"+r,{waitUntil:"networkidle0",timeout:90000}).catch(e=>({status:()=>"ERR "+e.message}))
  await new Promise(x=>setTimeout(x,500))
  await new Promise(x=>setTimeout(x,800));const info=await p.evaluate(()=>({ov:document.documentElement.scrollWidth>innerWidth, overlay:!!document.querySelector("nextjs-portal")?.shadowRoot?.querySelector("[data-nextjs-dialog]"), h1:document.querySelector("h1")?.textContent?.slice(0,40), txt:/dermat|chennai|zafoor|application error/i.test(document.body.innerText), links:[...document.querySelectorAll("a[href]")].map(a=>a.getAttribute("href")).filter(h=>/^\/(patients|billing|inventory)\/[^\/]+/.test(h))}))
  console.log(w,r,res.status?.(),info.h1||"-",info.ov?"OVERFLOW":"",info.overlay?"OVERLAY":"",info.txt?"STALE":"",errs.slice(0,3).join(" | "))
  return info.links
}
for (const r of routes){ const l=await visit(r,1440); l.forEach(x=>seen.add(x.slice(1))) ; await visit(r,390)}
const dyn=[...seen].filter(x=>!/\/new$/.test(x))
const pid=dyn.find(x=>/^patients\/[^\/]+$/.test(x))
const extra=[...dyn.filter(x=>/^(billing|inventory)\/[^\/]+$/.test(x)).slice(0,3)]
if(pid){extra.push(pid, pid+"/edit", pid+"/encounters/new")}
for(const r of extra){ await visit(r,1440); await visit(r,390)}
const links=await (async()=>{await p.goto("http://localhost:3000/"+pid,{waitUntil:"networkidle0"});return p.evaluate(()=>[...document.querySelectorAll("a[href]")].map(a=>a.getAttribute("href")).filter(h=>/encounters\/[^\/]+$/.test(h)&&!h.endsWith("new")))})()
for(const l of links.slice(0,2)) await visit(l.slice(1),1440)
await b.close()
