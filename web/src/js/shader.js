/* "Lumen" hero field: a WebGL light caustic that drifts slowly and bends toward the cursor.
   It uses the current accent colour, pauses off-screen and when the tab is hidden, and draws
   a single static frame when motion is reduced. No dependencies. */
import { onThemeChange, motionAllowed } from "./theme.js";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision highp float;
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
}`;

const hex = h => { const v = parseInt(h.replace("#", ""), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
function readAccent() {
  // Resolve the accent to rgb via a probe element (handles color-mix and vars)
  const probe = document.createElement("i");
  probe.style.color = "var(--accent)"; probe.style.display = "none";
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [14, 138, 112];
  probe.remove();
  return rgb.map(v => v > 1 ? v / 255 : v);
}

export function lumenField(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) { canvas.classList.add("no-gl"); return; }
  // Software renderers (SwiftShader, llvmpipe) would stall the main thread: use the CSS fallback instead
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|software/i.test(gpu) || (navigator.hardwareConcurrency || 8) <= 2) { canvas.classList.add("no-gl"); return; }
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uR = U("r"), uT = U("t"), uM = U("m"), uC1 = U("c1"), uC2 = U("c2"), uBg = U("bg");

  const setColors = () => {
    const a = readAccent();
    gl.uniform3fv(uC1, a);
    gl.uniform3fv(uC2, a.map(v => v + (1 - v) * .75));
    gl.uniform3fv(uBg, hex("#0a0f0e"));
  };
  setColors(); onThemeChange(() => { setColors(); if (!running) frame(performance.now()); });

  const dpr = Math.min(devicePixelRatio || 1, 1.25);
  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.max(1, w * dpr * .75); canvas.height = Math.max(1, h * dpr * .75); // render below native res, it's soft anyway
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(uR, canvas.width, canvas.height);
  };
  size(); addEventListener("resize", size);

  let mx = .7, my = .6, tx = .7, ty = .6;
  canvas.parentElement.addEventListener("pointermove", e => {
    const r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height;
  }, { passive: true });

  let running = false, visible = true, raf = 0;
  const t0 = performance.now();
  function frame(now) {
    mx += (tx - mx) * .04; my += (ty - my) * .04;
    gl.uniform1f(uT, (now - t0) / 1000 + 20); gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (running) raf = requestAnimationFrame(frame);
  }
  const play = () => { if (running || !motionAllowed()) return; running = true; raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible && !document.hidden ? play() : stop(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden || !visible ? stop() : play()));
  frame(performance.now());
  play();
}
