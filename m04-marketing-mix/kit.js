// 23 Team motion kit: the shared engine of the neon motion-design reels (after the conversion.doc references).
// A reel's main.js imports this, draws its scenes with the neon pen, and calls start(). Copied into each reel folder by tools/motion-kit/new-reel.sh.
// Look: glowing white line art on the locked midnight blue, captions at the top, a soft blur-zoom between scenes, the locked 23 end card.
export const W = innerWidth, H = innerHeight, K = W / 1080;
export const MID = '#00113F', WHITE = '#F4F7FF', GOLD = '#ECBD4A', GREY = 'rgba(244,247,255,.35)';
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, seg = (t, a, b) => clamp((t - a) / (b - a));
function sp(tau, d = .4, b = .25) { if (tau <= 0) return 0; const z = Math.max(.05, 1 - b), wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau)); }
export const E = (t, at, d = .4, b = .3) => t < at ? 0 : sp(t - at, d, b);   // a spring from 0 to 1 starting at time `at`
export const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const ease3 = u => 1 - Math.pow(1 - clamp(u), 3);

// —— the neon pen ——
export function neon(c, f, o = {}) {   // draw f() twice: wide and blurred (the glow), then crisp
  const a = o.alpha ?? 1; if (a <= 0) return; c.save(); c.globalAlpha *= a; c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = o.col || WHITE; c.fillStyle = o.fill || o.col || WHITE; c.lineWidth = o.w ?? 4; c.shadowColor = o.glowCol || 'rgba(190,210,255,.95)'; c.shadowBlur = (o.glow ?? 22) * K; f(); c.shadowBlur = 0; f(); c.restore();
}
export const P = (c, pts, close) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath(); c.stroke(); };
export const circle = (c, x, y, r, fill) => { c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, 7); fill ? c.fill() : c.stroke(); };
export function glowDot(c, x, y, r, a = 1) {   // a bright filled orb with a soft halo
  if (a <= 0 || r <= 0) return; c.save(); c.globalAlpha *= a; const g = c.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, 'rgba(220,230,255,.45)'); g.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = g; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  c.fillStyle = WHITE; c.shadowColor = 'rgba(200,215,255,1)'; c.shadowBlur = 30 * K; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
}
export function txt(c, s, x, y, size, o = {}) { c.save(); c.font = `${o.weight || 800} ${size}px "${o.font || 'Unbounded'}"`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; if (o.ls) c.letterSpacing = o.ls + 'px'; c.globalAlpha *= o.alpha ?? 1; c.fillStyle = o.col || WHITE; c.shadowColor = 'rgba(190,210,255,.9)'; c.shadowBlur = (o.glow ?? 18) * K; c.fillText(s, x, y); c.shadowBlur = 0; c.fillText(s, x, y); c.restore(); }
const GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉŐŰÖÜ0123456789#%&?';
export function scramble(s, t, t0, dur) { return [...s].map((ch, i) => { if (ch === ' ') return ' '; const settle = t0 + dur * (i / s.length) + .15; if (t >= settle) return ch; if (t < t0) return ''; return GLY[Math.floor(hash(i * 13 + Math.floor(t * 24)) * GLY.length)]; }).join(''); }
export function bg(c) { c.fillStyle = MID; c.fillRect(0, 0, 1080, 1920); const g = c.createRadialGradient(540, 900, 40, 540, 900, 1000); g.addColorStop(0, 'rgba(22,58,140,.42)'); g.addColorStop(1, 'rgba(22,58,140,0)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
// 3D: a flat w×h rectangle turned in space and projected; onQuad maps flat drawing onto it
export function quad3(w, h, ry, rx, rz, cx, cy, s = 1) { const f = 1500; return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => { x *= s; y *= s; const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz); const x2 = x1 * Math.cos(ry), z2 = x1 * Math.sin(ry); const y3 = y1 * Math.cos(rx) - z2 * Math.sin(rx), z3 = y1 * Math.sin(rx) + z2 * Math.cos(rx); return [cx + x2 * f / (f + z3), cy + y3 * f / (f + z3)]; }); }
export function onQuad(c, q, w, h, f) { const [p0, p1, , p3] = q; c.save(); c.transform((p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p3[0] - p0[0]) / h, (p3[1] - p0[1]) / h, p0[0], p0[1]); f(); c.restore(); }
export async function loadImage(src) { const i = new Image(); i.src = src; await i.decode(); return i; }

// —— the reel: scenes [[start, draw(c, t)], …] on the stage under the caption; caption at the top ——
export async function start({ scenes, words, story, dur, caption = {}, continuous = [], stage = true }) {
  await Promise.all([document.fonts.load('800 80px "Unbounded"', 'ÁÉŐŰ?'), document.fonts.load('600 42px "Inter"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű'), document.fonts.load('500 42px "JBMono"', 'ÁÉŐŰáéőű')]);
  const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; }; const [bufA, actx] = mk(), [bufB, bctx] = mk();
  const LOGO = await loadImage('logo-23.png'); const LOGO_C = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
  const STAGE = c => { if (!stage) return; c.translate(540, 1205); c.scale(.87, .87); c.translate(-540, -955); };
  // caption: the reference's line (centred), at the top; mode 'type' types each word in, 'fade' fades and lifts it
  const CAPF = caption.font || '600 42px "Inter"', CY = caption.y ?? 470, mode = caption.mode || 'fade', meas = document.createElement('canvas').getContext('2d'); meas.font = CAPF;
  const PAGES = (() => { const pages = []; let cur = []; words.forEach(([w, t0], i) => { cur.push(i); const nxt = words[i + 1]; const width = meas.measureText(cur.map(j => words[j][0]).join(' ')).width; if (/[.?!:]$/.test(w) || cur.length >= 5 || width > 760 || (/,$/.test(w) && cur.length >= 3) || (nxt && nxt[1] - t0 > 1.2)) { pages.push(cur); cur = []; } }); if (cur.length) pages.push(cur); return pages.map((p, k) => ({ p, t0: words[p[0]][1] - .05, t1: pages[k + 1] ? words[pages[k + 1][0]][1] - .05 : story - .4 })); })();
  function cap(c, t) { const pg = PAGES.find(q => t >= q.t0 && t < q.t1); if (!pg) return; const full = pg.p.map(i => words[i][0]).join(' '), fw = meas.measureText(full).width; let x = 540 - fw / 2;
    c.save(); c.font = CAPF; c.textBaseline = 'middle'; c.fillStyle = 'rgba(244,247,255,.95)'; c.shadowColor = 'rgba(190,210,255,.5)'; c.shadowBlur = 10 * K;
    pg.p.forEach(i => { const w = words[i][0], t0 = words[i][1]; if (t >= t0 - .03) { if (mode === 'type') { const n = Math.ceil(w.length * clamp((t - t0 + .03) / .12)); c.fillText(w.slice(0, n), x, CY); } else { const k = ss(clamp((t - t0 + .05) / .22)); c.save(); c.globalAlpha = k; c.fillText(w, x, CY + 10 * (1 - k)); c.restore(); } } x += meas.measureText(w + ' ').width; }); c.restore(); }
  const sceneAt = t => { let i = 0; while (i + 1 < scenes.length && t >= scenes[i + 1][0]) i++; return i; };
  const paint = (c, i, t) => { c.setTransform(K, 0, 0, K, 0, 0); c.clearRect(0, 0, 1080, 1920); STAGE(c); scenes[i][1](c, t); };
  function endCard(c, t) { const u = ss(seg(t, story + .15, story + 1.05)), w = 1080 * .30, h = w * LOGO.height / LOGO.width, s = 1.04 - .04 * u; c.save(); c.globalAlpha = u * .75; if (u < 1) c.filter = `blur(${(1 - u) * 6 * K}px)`; c.translate(540, 960); c.scale(s, s); c.drawImage(LOGO_C, -w / 2, -h / 2, w, h); c.restore(); }
  function draw(c, t) {
    c.setTransform(K, 0, 0, K, 0, 0); bg(c); if (t >= story) return endCard(c, t);
    const i = sceneAt(t), t0 = scenes[i][0], dt = t - t0, TR = .35;
    if (i > 0 && dt < TR && !continuous.includes(i)) { const e = ss(dt / TR); paint(actx, i - 1, t0 - 1 / 60); paint(bctx, i, t); c.setTransform(1, 0, 0, 1, 0, 0);
      c.save(); c.globalAlpha = 1 - e; c.filter = `blur(${e * 12 * K}px)`; c.translate(W / 2, H / 2); c.scale(1 + .12 * e, 1 + .12 * e); c.translate(-W / 2, -H / 2); c.drawImage(bufA, 0, 0); c.restore();
      c.save(); c.globalAlpha = e; c.filter = `blur(${(1 - e) * 12 * K}px)`; c.translate(W / 2, H / 2); c.scale(.9 + .1 * e, .9 + .1 * e); c.translate(-W / 2, -H / 2); c.drawImage(bufB, 0, 0); c.restore(); }
    else { c.save(); STAGE(c); scenes[i][1](c, t); c.restore(); }
    c.setTransform(K, 0, 0, K, 0, 0); cap(c, t);
    const f = ss(seg(t, story - .7, story)); if (f > 0) { c.globalAlpha = f; c.fillStyle = MID; c.fillRect(0, 0, 1080, 1920); c.globalAlpha = 1; }
  }
  window.DUR = dur; window.EV = []; window.render = t => draw(ctx, t); window.render(0); window.READY = true;
}
