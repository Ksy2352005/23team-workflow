// Branding Secret 1: a 23 Team "branding secret" reel. Editorial format after the user's reference: light grid pages and midnight pages,
// the spoken words appearing one by one (a small line over a big bold line), one object floating in the middle of each page,
// page-curl, blur-zoom and diagonal gold-streak transitions. Drawn frame by frame from render(t).
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('800 80px "Bricolage"', 'ÁÉÍÓÖŐÚÜŰ?'), document.fonts.load('500 40px "Inter"', 'ÁÉÍÓÖŐÚÜŰ'), document.fonts.load('600 80px "Cormorant"', 'KOCKA')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
// colours: the locked midnight blue, its glow, gold, cream; the light editorial page
const MID = '#00113F', GLOWB = '#163A8C', GOLD = '#ECBD4A', GOLD_D = '#B8862A', CREAM = '#F6EFDC', PAPER = '#F4F5F8', INK = '#10132B', INK2 = '#5B6270';
const STORY = 28.4, DUR = 30.0;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, seg = (t, a, b) => clamp((t - a) / (b - a));
function sp(tau, d = .4, b = .25) { if (tau <= 0) return 0; const z = Math.max(.05, 1 - b), wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau)); }
const E = (t, at, d = .4, b = .3) => t < at ? 0 : sp(t - at, d, b);
const ell = (c, x, y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 7); c.fill(); };
const rr = (c, x, y, w, h, r, col) => { c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
function shadowed(c, blur, oy, alpha, f) { c.save(); c.shadowColor = `rgba(0,10,40,${alpha})`; c.shadowBlur = blur * K; c.shadowOffsetY = oy * K; f(); c.restore(); }
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const tint = (img, col) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return c; };
const LOGO_C = tint(LOGO, '#C9D3F2');

// —— the pages ——
function paper(c, t) {   // the light editorial page: soft white with a faint grid and tiny crosses, darker towards the edges, curled midnight corners
  c.fillStyle = PAPER; c.fillRect(0, 0, 1080, 1920);
  const g = c.createRadialGradient(540, 1000, 200, 540, 1000, 1200); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(200,205,220,.55)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  c.strokeStyle = 'rgba(16,19,43,.06)'; c.lineWidth = 1.5; for (let x = 60; x < 1080; x += 120) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 1920); c.stroke(); } for (let y = 40; y < 1920; y += 120) { c.beginPath(); c.moveTo(0, y); c.lineTo(1080, y); c.stroke(); }
  c.fillStyle = 'rgba(16,19,43,.16)'; for (let x = 60; x < 1080; x += 120) for (let y = 40; y < 1920; y += 120) { c.fillRect(x - 6, y - 1, 12, 2); c.fillRect(x - 1, y - 6, 2, 12); }
  curl(c, 1080, 0, -1, 1, 230 + 10 * Math.sin(t * 1.3)); curl(c, 0, 1920, 1, -1, 260 + 10 * Math.sin(t * 1.1 + 1));
}
function curl(c, x, y, dx, dy, s) {   // a page corner peeling back in midnight: the corner folds over with a soft shadow
  c.save(); c.translate(x, y); c.scale(dx, dy);
  c.fillStyle = 'rgba(0,10,40,.18)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 1.15, 0); c.quadraticCurveTo(s * .4, s * .35, 0, s * 1.15); c.closePath(); c.fill();
  const g = c.createLinearGradient(0, 0, s * .6, s * .6); g.addColorStop(0, '#000a2a'); g.addColorStop(.6, MID); g.addColorStop(1, '#22348a'); c.fillStyle = g;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(s, 0); c.quadraticCurveTo(s * .38, s * .3, s * .55, s * .55); c.quadraticCurveTo(s * .3, s * .38, 0, s); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(s, 0); c.quadraticCurveTo(s * .38, s * .3, s * .55, s * .55); c.stroke(); c.restore();
}
function night(c, t) {   // the midnight page: deep blue, a soft glow in the middle, gold light streaks from two corners
  c.fillStyle = MID; c.fillRect(0, 0, 1080, 1920); const g = c.createRadialGradient(540, 980, 50, 540, 980, 900); g.addColorStop(0, 'rgba(22,58,140,.55)'); g.addColorStop(1, 'rgba(22,58,140,0)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  streak(c, 1080, 0, -1, 1, t); streak(c, 0, 1920, 1, -1, t + 2);
}
function streak(c, x, y, dx, dy, t) {
  c.save(); c.translate(x, y); c.scale(dx, dy); c.globalCompositeOperation = 'lighter'; const w = 1 + .06 * Math.sin(t * 1.7);
  for (const [len, wid, a, off] of [[620, 120, .16, 0], [520, 46, .35, 20], [420, 16, .8, 34]]) { c.save(); c.rotate(.78 + .03 * Math.sin(t)); const g = c.createLinearGradient(0, 0, len * w, 0); g.addColorStop(0, `rgba(236,189,74,${a})`); g.addColorStop(.6, `rgba(236,189,74,${a * .5})`); g.addColorStop(1, 'rgba(236,189,74,0)'); c.fillStyle = g; c.filter = `blur(${wid * .25 * K}px)`; c.beginPath(); c.ellipse(len * .35 * w, off - 30, len * .55 * w, wid / 2, 0, 0, 7); c.fill(); c.restore(); }
  c.restore();
}

// —— the words: a small line over a big bold line, each word appearing as it is spoken (blur to sharp, rising a little) ——
const SMALL = '500 50px "Inter"', BIG = '800 108px "Bricolage"';
const meas = document.createElement('canvas').getContext('2d');
function layout(i0, i1, font, maxW, lh) {   // place words i0..i1 in centred lines (positions fixed from the start, so nothing shifts as words appear)
  meas.font = font; const sp = meas.measureText(' ').width, lines = [[]]; let w = 0;
  for (let i = i0; i <= i1; i++) { const ww = meas.measureText(WORDS[i][0]).width; if (lines[lines.length - 1].length && w + sp + ww > maxW) { lines.push([]); w = 0; } const L = lines[lines.length - 1]; L.push({ i, w: ww, x: L.length ? w + sp : 0 }); w = (L.length > 1 ? w + sp : 0) + ww; }
  const out = []; lines.forEach((L, li) => { const lw = L[L.length - 1].x + L[L.length - 1].w; L.forEach(o => out.push({ ...o, x: o.x - lw / 2, li })); }); return { words: out, lines: lines.length, lh, font };
}
function words(c, t, L, cx, y, o = {}) {   // draw a laid-out block; o.col, o.key (word indices in gold), o.out (fade-out time)
  c.save(); c.font = L.font; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  for (const w of L.words) { const t0 = WORDS[w.i][1] - .05, k = clamp((t - t0) / .28); if (k <= 0) continue; const e = ss(k), x = cx + w.x, yy = y + w.li * L.lh + (1 - e) * 18;
    c.save(); c.globalAlpha = e * (o.alpha ?? 1); if (e < 1) c.filter = `blur(${(1 - e) * 10 * K}px)`; c.fillStyle = (o.key || []).includes(w.i) ? (o.keyCol || GOLD_D) : (o.col || INK); c.fillText(WORDS[w.i][0], x, yy); c.restore(); }
  c.restore();
}
const WI = s => WORDS.findIndex(w => w[0].replace(/[.,!?]/g, '') === s);   // a word's index by its text (first match)

// —— objects ——
function rotaryPhone(c, x, y, s, t) {   // a vintage phone in midnight blue with a cream dial and gold centre; the handset jumps when it "rings"
  const ring = t > WORDS[7][1] - .2 && t < WORDS[7][1] + 1.2 ? Math.sin((t - WORDS[7][1]) * 46) * Math.exp(-(t - WORDS[7][1]) * 2.4) : 0;
  c.save(); c.translate(x, y); c.scale(s, s);
  ell(c, 0, 250, 330, 40, 'rgba(0,10,40,.18)');
  // body
  shadowed(c, 60, 30, .35, () => { const g = c.createLinearGradient(-300, -60, 300, 250); g.addColorStop(0, '#2a46b0'); g.addColorStop(.45, '#13287a'); g.addColorStop(1, '#000c30'); c.fillStyle = g; c.beginPath(); c.moveTo(-250, -40); c.quadraticCurveTo(-260, -110, -150, -120); c.lineTo(150, -120); c.quadraticCurveTo(260, -110, 250, -40); c.lineTo(300, 210); c.quadraticCurveTo(300, 245, 260, 245); c.lineTo(-260, 245); c.quadraticCurveTo(-300, 245, -300, 210); c.closePath(); c.fill(); });
  c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(-230, -50); c.quadraticCurveTo(-230, -100, -150, -105); c.lineTo(-40, -105); c.quadraticCurveTo(-170, -60, -210, 150); c.closePath(); c.fill();
  // dial
  c.save(); c.translate(0, 75); ell(c, 0, 6, 150, 150, 'rgba(0,0,0,.25)'); ell(c, 0, 0, 150, 150, CREAM); ell(c, 0, 0, 118, 118, '#e9dfc4');
  for (let k = 0; k < 10; k++) { const a = -Math.PI * .35 + k * Math.PI * 1.45 / 9; ell(c, Math.cos(a) * 100, Math.sin(a) * 100, 24, 24, '#0a1a55'); ell(c, Math.cos(a) * 100 - 4, Math.sin(a) * 100 - 4, 8, 8, 'rgba(255,255,255,.18)'); }
  ell(c, 0, 0, 56, 56, GOLD); ell(c, -12, -14, 18, 12, 'rgba(255,255,255,.45)'); c.restore();
  // cradle forks and handset
  c.fillStyle = '#0a1a55'; c.fillRect(-190, -150, 40, 40); c.fillRect(150, -150, 40, 40);
  c.save(); c.translate(0, -150 - 26 * Math.abs(ring)); c.rotate(ring * .06);
  shadowed(c, 30, 14, .3, () => { const g = c.createLinearGradient(0, -120, 0, 40); g.addColorStop(0, '#3150c0'); g.addColorStop(1, '#0a1a55'); c.fillStyle = g; c.beginPath(); c.moveTo(-330, 10); c.quadraticCurveTo(-340, -60, -270, -70); c.quadraticCurveTo(0, -130, 270, -70); c.quadraticCurveTo(340, -60, 330, 10); c.quadraticCurveTo(320, 40, 260, 30); c.quadraticCurveTo(220, -20, 150, -40); c.quadraticCurveTo(0, -70, -150, -40); c.quadraticCurveTo(-220, -20, -260, 30); c.quadraticCurveTo(-320, 40, -330, 10); c.closePath(); c.fill(); });
  c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.moveTo(-250, -62); c.quadraticCurveTo(0, -118, 250, -62); c.quadraticCurveTo(0, -100, -250, -50); c.closePath(); c.fill(); c.restore();
  if (ring !== 0) { c.strokeStyle = `rgba(236,189,74,${.9 * Math.exp(-(t - WORDS[7][1]) * 1.8)})`; c.lineWidth = 12; c.lineCap = 'round'; for (const d of [-1, 1]) for (let q = 0; q < 2; q++) { c.beginPath(); c.arc(d * 380, -190, 40 + q * 36, d > 0 ? -1.1 : Math.PI - .5, d > 0 ? .5 : Math.PI + 1.1); c.stroke(); } }
  c.restore();
}
const TILE = ['#E8664F', '#ECBD4A', '#4CAF6E', '#3F6FD6', '#8A55B0', '#F08A24', '#D9443A', '#2a9d8f', '#C9A45C', '#6b4430'];
function feedPhone(c, x, y, s, scroll, o = {}) {   // a phone showing a feed; o.grid: a grid of many posts; otherwise big single posts (o.stopAt = the post that wins)
  c.save(); c.translate(x, y); c.scale(s, s); const w = 440, h = 900;
  shadowed(c, 70, 40, .4, () => rr(c, -w / 2, -h / 2, w, h, 70, '#0b0f1e'));
  rr(c, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 64, '#22283c'); c.save(); c.beginPath(); c.roundRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36, 54); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(-w / 2, -h / 2, w, h);
  if (o.grid) { const cs = (w - 36) / 3; for (let r = -1; r < 9; r++) { const yy = -h / 2 + 140 + r * cs - (scroll % cs) ; const n = r + Math.floor(scroll / cs); for (let k = 0; k < 3; k++) { const col = TILE[((n * 3 + k) * 7 % 10 + 10) % 10]; c.fillStyle = col; c.fillRect(-w / 2 + 18 + k * cs + 2, yy + 2, cs - 4, cs - 4); c.fillStyle = 'rgba(255,255,255,.35)'; if ((n + k) % 3 === 0) c.beginPath(), c.arc(-w / 2 + 18 + k * cs + cs / 2, yy + cs / 2, cs * .22, 0, 7), c.fill(); else c.fillRect(-w / 2 + 18 + k * cs + cs * .2, yy + cs * .6, cs * .6, cs * .12); } }
    c.fillStyle = '#ffffff'; c.fillRect(-w / 2, -h / 2, w, 140); ell(c, -w / 2 + 70, -h / 2 + 95, 26, 26, MID); c.fillStyle = 'rgba(16,19,43,.75)'; c.fillRect(-w / 2 + 110, -h / 2 + 82, 120, 12); c.fillStyle = 'rgba(16,19,43,.3)'; c.fillRect(-w / 2 + 110, -h / 2 + 102, 80, 10); }
  else { const ph = 560; for (let r = -1; r < 4; r++) { const n = r + Math.floor(scroll / ph), yy = -h / 2 + 60 + r * ph - (scroll % ph), win = o.stopAt === n;
      ell(c, -w / 2 + 50, yy + 26, 16, 16, win ? GOLD : '#9aa0b8'); c.fillStyle = 'rgba(16,19,43,.4)'; c.fillRect(-w / 2 + 76, yy + 20, 110, 11);
      if (win) poster(c, 0, yy + 56 + 230, .66, 1); else { c.fillStyle = TILE[(n * 3 % 10 + 10) % 10]; c.fillRect(-w / 2 + 18, yy + 56, w - 36, 440); c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(-60, yy + 230, 60, 0, 7); c.fill(); c.fillRect(-120, yy + 360, 240, 26); }
      if (win && o.focus > 0) { c.strokeStyle = GOLD; c.lineWidth = 10; c.globalAlpha = o.focus; c.strokeRect(-w / 2 + 14, yy + 52, w - 28, 448); c.globalAlpha = 1; } } }
  c.restore(); rr(c, -60, -h / 2 + 30, 120, 30, 15, '#0b0f1e'); c.restore();
}
function poster(c, x, y, s, a = 1) {   // a poster for KOCKA (23 Team's fictional premium brownie brand): it shows at once who it is for
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); const w = 520, h = 700;
  rr(c, -w / 2, -h / 2, w, h, 6, '#3A2218'); c.strokeStyle = '#C9A45C'; c.lineWidth = 3; c.strokeRect(-w / 2 + 22, -h / 2 + 22, w - 44, h - 44);
  c.strokeRect(-46, -h / 2 + 70, 92, 92); c.strokeRect(-36, -h / 2 + 80, 72, 72); c.font = '600 60px "Cormorant"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#C9A45C'; c.fillText('K', 0, -h / 2 + 118);
  c.font = '600 74px "Cormorant"'; c.letterSpacing = '14px'; c.fillText('KOCKA', 8, -h / 2 + 230); c.letterSpacing = '0px';
  // the brownie cube
  c.save(); c.translate(0, 70); c.fillStyle = '#24140D'; c.beginPath(); c.moveTo(-120, -40); c.lineTo(0, -95); c.lineTo(120, -40); c.lineTo(120, 90); c.lineTo(0, 145); c.lineTo(-120, 90); c.closePath(); c.fill();
  c.fillStyle = '#6B4430'; c.beginPath(); c.moveTo(-120, -40); c.lineTo(0, -95); c.lineTo(120, -40); c.lineTo(0, 15); c.closePath(); c.fill(); c.strokeStyle = 'rgba(243,235,221,.35)'; c.lineWidth = 3; for (const [a, b] of [[-60, -40], [10, -60], [40, -20]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(a + 30, b + 12); c.stroke(); }
  c.fillStyle = '#3A2218'; c.beginPath(); c.moveTo(0, 15); c.lineTo(120, -40); c.lineTo(120, 90); c.lineTo(0, 145); c.closePath(); c.fill(); c.restore();
  c.font = 'italic 500 40px "Cormorant"'; c.fillStyle = '#F3EBDD'; c.fillText('Neked, aki esténként', 0, h / 2 - 120); c.fillText('valami jóra vágyik.', 0, h / 2 - 74);
  c.restore();
}
function hand(c, x, y, s) {   // a mascot mitten hand (the 23 world's blue) holding the phone from below
  c.save(); c.translate(x, y); c.scale(s, s); const g = c.createRadialGradient(-30, -20, 10, 0, 0, 160); g.addColorStop(0, '#5a80f0'); g.addColorStop(.5, '#2448bb'); g.addColorStop(1, '#13246a');
  c.fillStyle = g; c.beginPath(); c.moveTo(-60, 400); c.lineTo(-90, 120); c.quadraticCurveTo(-110, 0, -40, -20); c.quadraticCurveTo(60, -40, 110, 30); c.quadraticCurveTo(140, 80, 90, 130); c.lineTo(80, 400); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(-150, -10, 46, 90, -.5, 0, 7); c.fill(); c.restore();
}
function messyCard(c, x, y, s, u) {   // a post with too much going on; u 0..1: its pieces fly off
  c.save(); c.translate(x, y); c.scale(s, s); const a = 1 - ss(u); c.globalAlpha = a;
  shadowed(c, 50, 30, .3 * a, () => rr(c, -280, -350, 560, 700, 24, '#FFF6E0'));
  const bits = [['#E8664F', -150, -230, 'circle', 70], ['#3F6FD6', 120, -250, 'rect', 90], ['#4CAF6E', -170, 40, 'tri', 90], ['#8A55B0', 160, 80, 'circle', 60], ['#F08A24', 0, -40, 'star', 80], ['#D9443A', -60, 220, 'rect', 70], ['#2a9d8f', 170, 250, 'tri', 60], ['#ECBD4A', -200, 260, 'star', 50]];
  bits.forEach(([col, bx, by, kind, r], i) => { const d = 1 + u * 3.5, rot = u * (i % 2 ? 2 : -2); c.save(); c.translate(bx * d, by * d); c.rotate(rot + i); c.fillStyle = col;
    if (kind === 'circle') { c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); } else if (kind === 'rect') c.fillRect(-r / 2, -r / 2, r, r); else if (kind === 'tri') { c.beginPath(); c.moveTo(0, -r / 2); c.lineTo(r / 2, r / 2); c.lineTo(-r / 2, r / 2); c.closePath(); c.fill(); } else { c.beginPath(); for (let k = 0; k < 10; k++) { const aa = k * Math.PI / 5, q = k % 2 ? r * .45 : r; c.lineTo(Math.cos(aa) * q, Math.sin(aa) * q); } c.fill(); } c.restore(); });
  c.font = '800 46px "Bricolage"'; c.textAlign = 'center'; c.fillStyle = '#D9443A'; c.save(); c.translate(-u * 300, -u * 200); c.rotate(-.12 - u); c.fillText('AKCIÓ!!!', -40, -120); c.restore(); c.font = 'italic 500 34px "Cormorant"'; c.fillStyle = '#3F6FD6'; c.save(); c.translate(u * 300, u * 260); c.rotate(.1 + u); c.fillText('új • most • mindenkinek', 30, 140); c.restore();
  c.restore();
}
function cleanCard(c, x, y, s, k) {   // the same post made clear: one message, one audience, lots of space
  if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s * (.9 + .1 * Math.min(1, k)), s * (.9 + .1 * Math.min(1, k))); c.globalAlpha = Math.min(1, k);
  shadowed(c, 60, 34, .35, () => rr(c, -280, -350, 560, 700, 24, MID)); const g = c.createRadialGradient(0, -40, 10, 0, -40, 330); g.addColorStop(0, 'rgba(22,58,140,.9)'); g.addColorStop(1, 'rgba(22,58,140,0)'); c.fillStyle = g; c.fillRect(-280, -350, 560, 700);
  ell(c, 0, -90, 120, 120, GOLD); c.font = '800 64px "Bricolage"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = CREAM; c.fillText('Egy üzenet.', 0, 130); c.font = '500 34px "Inter"'; c.fillStyle = 'rgba(246,239,220,.7)'; c.fillText('Egy közönség.', 0, 200);
  c.restore();
}

// —— scenes: [start, kind, draw] ——
const T = i => WORDS[i][1];
const L1s = layout(0, 4, SMALL, 940, 64), L1b = layout(5, 7, BIG, 980, 120);
const L2s = layout(8, 13, SMALL, 940, 64), L2b = layout(14, 17, BIG, 980, 120);
const L3s = layout(18, 20, SMALL, 940, 64), L3b = layout(21, 24, BIG, 960, 120);
const L4s = layout(25, 29, SMALL, 940, 64), L4b = layout(30, 32, BIG, 980, 120);
const L5s = layout(33, 36, SMALL, 940, 64), L5b = layout(37, 38, BIG, 980, 120);
const L6s = layout(39, 45, SMALL, 940, 64), L6b = layout(46, 48, BIG, 980, 120);
const L7s = layout(49, 50, SMALL, 940, 64), L7b = layout(51, 52, BIG, 980, 120);
const L8s = layout(53, 57, SMALL, 940, 64), L8b = layout(58, 61, BIG, 980, 120);
const L9s = layout(62, 69, '500 46px "Inter"', 800, 62);
const S = [
  [0, 'paper', (c, t) => { paper(c, t); words(c, t, L1s, 540, 330); words(c, t, L1b, 540, 440, { col: MID });
    const k = E(t, .05, .5, .35); c.save(); c.globalAlpha = Math.min(1, k * 1.5); rotaryPhone(c, 540, 1180 + 10 * Math.sin(t * 1.6), .95 * (.85 + .15 * Math.min(1, k)), t); c.restore(); }],
  [3.3, 'paper', (c, t) => { paper(c, t);
    c.save(); c.globalAlpha = .9; for (const [y0, rot] of [[1000, -.5], [1400, -.5]]) { c.save(); c.translate(540, y0); c.rotate(rot); c.fillStyle = MID; c.fillRect(-900, -55, 1800, 110); c.restore(); } c.restore();
    const sc = (t - 3.3) * (260 + 420 * seg(t, T(15), T(17) + .3)); feedPhone(c, 540, 1230, .92, sc, { grid: true });
    words(c, t, L2s, 540, 330); words(c, t, L2b, 540, 440, { col: MID, key: [16] }); }],
  [7.2, 'night', (c, t) => { night(c, t); words(c, t, L3s, 540, 860, { col: 'rgba(246,239,220,.8)' }); words(c, t, L3b, 540, 975, { col: CREAM, key: [21], keyCol: GOLD }); }],
  [9.95, 'paper', (c, t) => { paper(c, t); words(c, t, L4s, 540, 330, { col: INK }); const k = E(t, 10.0, .5, .3);
    c.save(); c.globalAlpha = Math.min(1, k * 1.4); shadowed(c, 70, 40, .35, () => poster(c, 540, 1070 + 12 * Math.sin(t * 1.4), .98 * (.9 + .1 * Math.min(1, k)))); c.restore();
    const hl = ss(seg(t, T(31), T(31) + .5)); if (hl > 0) { c.fillStyle = GOLD; c.fillRect(540 - 180, 1070 + 343 * .98 - 80 + 28, 360 * hl, 6); }
    words(c, t, L4b, 540, 1560, { col: MID, key: [31] }); }],
  [13.05, 'paper', (c, t) => { paper(c, t); const k = E(t, 13.1, .45, .4); c.save(); c.translate(540, 1080); c.rotate(-.08 + .03 * Math.sin(t * 1.2)); c.scale(Math.min(1.1, k), Math.min(1.1, k)); c.font = '800 860px "Bricolage"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(236,189,74,.92)'; c.fillText('?', 0, 40); c.restore();
    words(c, t, L5s, 540, 1000, { col: INK }); words(c, t, L5b, 540, 1110, { col: MID }); }],
  [15.25, 'paper', (c, t) => { paper(c, t); const stopT = T(46) + .1, sc0 = 1316, v = 900, u = clamp((t - stopT) / 1.0);
    // the feed flies by, then slows and stops on the clear post
    const travel = t < stopT ? sc0 - v * (stopT - t) - 0 : sc0 + (1 - Math.pow(1 - u, 3)) * 260; const focus = ss(seg(t, stopT + .7, stopT + 1.1));
    feedPhone(c, 540, 1240, .92, travel, { stopAt: 3, focus });
    for (let k = 0; k < 4; k++) { const st = 15.45 + k * .5; if (st > stopT - .3) break; const u2 = seg(t, st, st + .4); if (u2 > 0 && u2 < 1) { const ty = lerp(1500, 1050, ss(u2)), a = Math.sin(u2 * Math.PI); c.fillStyle = `rgba(255,255,255,${.75 * a})`; c.beginPath(); c.arc(640, ty, 40, 0, 7); c.fill(); c.strokeStyle = `rgba(0,17,63,${.25 * a})`; c.lineWidth = 4; c.stroke(); } }   // a thumb flicking the feed
    words(c, t, L6s, 540, 330); words(c, t, L6b, 540, 440, { col: MID, key: [48] }); }],
  [18.85, 'night', (c, t) => { night(c, t); words(c, t, L7s, 540, 880, { col: 'rgba(246,239,220,.8)' }); words(c, t, L7b, 540, 1000, { col: CREAM, key: [52], keyCol: GOLD });
    const p = E(t, T(52), .4, .4); if (p > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(540, 960, 0, 540, 960, 420); g.addColorStop(0, `rgba(236,189,74,${.18 * Math.min(1, p)})`); g.addColorStop(1, 'rgba(236,189,74,0)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); c.restore(); } }],
  [21.2, 'paper', (c, t) => { paper(c, t); const u = seg(t, T(58) - .15, T(58) + .55); messyCard(c, 540, 1160, .95, u); cleanCard(c, 540, 1160, .95, E(t, T(58) + .05, .45, .35));
    words(c, t, L8s, 540, 330); words(c, t, L8b, 540, 440, { col: MID, key: [60] }); }],
  [25.4, 'night', (c, t) => { night(c, t); const u = ss(seg(t, 25.55, 26.4)), w = 1080 * .30, h = w * LOGO.height / LOGO.width, s = 1.04 - .04 * u;
    c.save(); c.globalAlpha = u * .75; if (u < 1) c.filter = `blur(${(1 - u) * 6 * K}px)`; c.translate(540, 900); c.scale(s, s); c.drawImage(LOGO_C, -w / 2, -h / 2, w, h); c.restore();
    words(c, t, L9s, 540, 1110, { col: 'rgba(246,239,220,.85)', key: [67, 68], keyCol: GOLD }); }],
];
// transitions into each scene: curl (page peels from the bottom-left corner), zoom (blur zoom), streak (diagonal gold-edged wipe)
const TRANS = { 1: ['curl', .6], 2: ['streak', .45], 3: ['streak', .45], 4: ['zoom', .4], 5: ['zoom', .4], 6: ['streak', .45], 7: ['streak', .45], 8: ['streak', .5] };

function sceneAt(t) { let i = 0; while (i + 1 < S.length && t >= S[i + 1][0]) i++; return i; }
function paint(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); const t0 = S[i][0], push = 1 + .035 * ss(seg(t, t0, t0 + 4)); c.translate(540, 1000); c.scale(push, push); c.translate(-540, -1000); S[i][2](c, t); }
function draw(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = MID; c.fillRect(0, 0, W, H);
  const i = sceneAt(t), [t0] = S[i], tr = TRANS[i], dt = t - t0;
  if (!tr || dt >= tr[1]) { paint(c, i, t); return finish(c, t); }
  const e = ss(dt / tr[1]); paint(actx, i - 1, t0 - 1 / 48); paint(bctx, i, t);
  if (tr[0] === 'zoom') { const b = Math.sin(e * Math.PI); c.save(); c.globalAlpha = 1; c.filter = `blur(${b * 14 * K}px)`; c.translate(W / 2, H / 2); c.scale(1 + .1 * e, 1 + .1 * e); c.translate(-W / 2, -H / 2); c.drawImage(bufA, 0, 0); c.restore();
    c.save(); c.globalAlpha = e; c.filter = `blur(${(1 - e) * 14 * K}px)`; c.translate(W / 2, H / 2); c.scale(.92 + .08 * e, .92 + .08 * e); c.translate(-W / 2, -H / 2); c.drawImage(bufB, 0, 0); c.restore(); }
  if (tr[0] === 'streak') {   // the new page sweeps in diagonally from the bottom-left, a gold light along its edge
    const d = lerp(-200, 3200, e) * K; c.drawImage(bufA, 0, 0); c.save(); c.beginPath(); c.moveTo(0, H); c.lineTo(d, H); c.lineTo(0, H - d); c.closePath(); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(236,189,74,.95)'; c.lineWidth = 10 * K; c.shadowColor = GOLD; c.shadowBlur = 40 * K; c.beginPath(); c.moveTo(d, H); c.lineTo(0, H - d); c.stroke(); c.restore(); }
  if (tr[0] === 'curl') {   // a real page peel: the old page folds back from the bottom-left corner, its back (soft grey) showing, until the new page is uncovered
    const dx = Math.SQRT1_2, dy = -Math.SQRT1_2, p = lerp(-50, 2300, e * e) * K;   // fold line: points with (x*dx + (y-H)*dy) = p
    c.drawImage(bufB, 0, 0);
    const dot = (x, y) => x * dx + (y - H) * dy; const corners = [[0, 0], [W, 0], [W, H], [0, H]];
    const clipPoly = (keepFar) => { const out = []; for (let k = 0; k < 4; k++) { const a = corners[k], b = corners[(k + 1) % 4], da = dot(...a) - p, db = dot(...b) - p, inA = keepFar ? da >= 0 : da < 0, inB = keepFar ? db >= 0 : db < 0; if (inA) out.push(a); if (inA !== inB) { const u = da / (da - db); out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); } } return out; };
    const far = clipPoly(true); if (far.length) { c.save(); c.beginPath(); far.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); c.drawImage(bufA, 0, 0); c.restore(); }
    const near = clipPoly(false); if (near.length) { const refl = near.map(([x, y]) => { const s = dot(x, y) - p; return [x - 2 * s * dx, y - 2 * s * dy]; });
      c.save(); c.shadowColor = 'rgba(0,10,40,.35)'; c.shadowBlur = 40 * K; const fx = refl.reduce((m, q) => m + q[0], 0) / refl.length, fy = refl.reduce((m, q) => m + q[1], 0) / refl.length; const g = c.createLinearGradient(fx - dx * 300 * K, fy - dy * 300 * K, fx + dx * 300 * K, fy + dy * 300 * K); g.addColorStop(0, '#c9ccd8'); g.addColorStop(1, '#f7f8fb'); c.fillStyle = g; c.beginPath(); refl.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.fill(); c.restore(); } }
  return finish(c, t);
}
function finish(c, t) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .85); g.addColorStop(0, 'rgba(0,8,30,0)'); g.addColorStop(1, 'rgba(0,8,30,.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const f = ss(seg(t, DUR - .6, DUR)); if (f > 0) { c.globalAlpha = f; c.fillStyle = MID; c.fillRect(0, 0, W, H); c.globalAlpha = 1; } }

window.DUR = DUR; window.EV = []; window.render = t => draw(ctx, t); window.render(0); window.READY = true;
