// Whitespace Game: a 23 Team motion-design reel after the user's reference ("Let's play a game… whitespace").
// Glowing white line art on the midnight blue, a typewriter caption at the bottom, one idea at a time, each visual turning into the next.
import { WORDS } from './captions.js';

await Promise.all([document.fonts.load('800 80px "Unbounded"', 'WHITESPACE ÁÉŐŰ?'), document.fonts.load('500 40px "JBMono"', 'ÁÉÍÓÖŐÚÜŰáéíóöőúüű'), document.fonts.load('600 40px "Inter"', 'AURA 360')]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const MID = '#00113F', GLOWB = '#163A8C', WHITE = '#F4F7FF', GOLD = '#ECBD4A';
const STORY = 56.9, DUR = 59.4;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, u) => a + (b - a) * u, ss = u => { u = clamp(u); return u * u * (3 - 2 * u); }, seg = (t, a, b) => clamp((t - a) / (b - a));
function sp(tau, d = .4, b = .25) { if (tau <= 0) return 0; const z = Math.max(.05, 1 - b), wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau)); }
const E = (t, at, d = .4, b = .3) => t < at ? 0 : sp(t - at, d, b);
const T = i => WORDS[i][1];
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_C = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();

// —— the neon pen: everything is drawn as glowing white lines ——
function neon(c, f, o = {}) {   // draw f() twice: once wide and blurred (the glow), once crisp
  const a = o.alpha ?? 1; if (a <= 0) return; c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = o.col || WHITE; c.fillStyle = o.col || WHITE; c.lineWidth = (o.w ?? 4); c.shadowColor = o.glowCol || 'rgba(190,210,255,.95)'; c.shadowBlur = (o.glow ?? 22) * K; f(); c.shadowBlur = 0; f(); c.restore();
}
const P = (c, pts, close) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath(); c.stroke(); };
function bg(c) { c.fillStyle = MID; c.fillRect(0, 0, 1080, 1920); const g = c.createRadialGradient(540, 900, 40, 540, 900, 1000); g.addColorStop(0, 'rgba(22,58,140,.42)'); g.addColorStop(1, 'rgba(22,58,140,0)'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920); }
function txt(c, s, x, y, size, o = {}) { c.save(); c.font = `${o.weight || 800} ${size}px "${o.font || 'Unbounded'}"`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; if (o.ls) c.letterSpacing = o.ls + 'px'; c.globalAlpha = o.alpha ?? 1; c.fillStyle = o.col || WHITE; c.shadowColor = 'rgba(190,210,255,.9)'; c.shadowBlur = (o.glow ?? 18) * K; c.fillText(s, x, y); c.shadowBlur = 0; c.fillText(s, x, y); c.restore(); }
const GLY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉŐŰ0123456789#%&?';
function scramble(s, t, t0, dur) {   // the text decodes letter by letter (random glyphs until each settles)
  return [...s].map((ch, i) => { if (ch === ' ') return ' '; const settle = t0 + dur * (i / s.length) + .15; if (t >= settle) return ch; if (t < t0) return ''; return GLY[Math.floor(hash(i * 13 + Math.floor(t * 24)) * GLY.length)]; }).join('');
}

// —— line-art objects ——
function sneaker(c, x, y, s) {   // a side-view trainer
  c.save(); c.translate(x, y); c.scale(s, s);
  P(c, [[-150, 40], [150, 40]]); c.beginPath(); c.moveTo(-150, 40); c.quadraticCurveTo(-162, 20, -146, 4); c.lineTo(140, 4); c.quadraticCurveTo(166, 14, 150, 40); c.stroke();
  c.beginPath(); c.moveTo(-146, 4); c.quadraticCurveTo(-150, -46, -112, -64); c.quadraticCurveTo(-70, -84, -40, -70); c.lineTo(10, -40); c.quadraticCurveTo(70, -20, 120, -12); c.quadraticCurveTo(152, -6, 140, 4); c.stroke();
  c.beginPath(); c.moveTo(-40, -70); c.quadraticCurveTo(-60, -40, -100, -30); c.stroke(); for (let k = 0; k < 4; k++) P(c, [[-30 + k * 16, -62 + k * 7], [-14 + k * 16, -48 + k * 7]]);
  c.beginPath(); c.moveTo(-110, -10); c.quadraticCurveTo(-20, 10, 90, -16); c.stroke(); c.restore();
}
function headphones(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.beginPath(); c.arc(0, 0, 130, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); c.beginPath(); c.arc(0, 0, 112, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  for (const d of [-1, 1]) { c.save(); c.translate(d * 118, 40); c.beginPath(); c.roundRect(-34, -70, 68, 140, 34); c.stroke(); c.beginPath(); c.roundRect(-22 + d * 6, -56, 44, 112, 22); c.stroke(); P(c, [[0, -70], [-d * 10, -98]]); c.restore(); }
  c.restore();
}
function watch(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const d of [-1, 1]) { c.beginPath(); c.moveTo(-42, d * 70); c.lineTo(-36, d * 150); c.lineTo(36, d * 150); c.lineTo(42, d * 70); c.stroke(); for (let k = 1; k < 4; k++) P(c, [[-38, d * (70 + k * 20)], [38, d * (70 + k * 20)]]); }
  c.beginPath(); c.arc(0, 0, 80, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 64, 0, 7); c.stroke();
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; P(c, [[Math.cos(a) * 54, Math.sin(a) * 54], [Math.cos(a) * 60, Math.sin(a) * 60]]); }
  P(c, [[0, 0], [0, -42]]); P(c, [[0, 0], [28, 10]]); c.fillRect(-3, -3, 6, 6); c.beginPath(); c.roundRect(80, -10, 12, 20, 4); c.stroke(); c.restore();
}
function tent(c, x, y, s, fill) {   // a market stall: scalloped canopy, posts, a table; fill 0..1: products piling in
  c.save(); c.translate(x, y); c.scale(s, s);
  P(c, [[0, -230], [-210, -90], [210, -90]], true); for (let k = -3; k <= 3; k++) P(c, [[0, -230], [k * 60, -90]]);
  c.beginPath(); for (let k = 0; k < 7; k++) { const x0 = -210 + k * 60; c.moveTo(x0, -90); c.quadraticCurveTo(x0 + 30, -60, x0 + 60, -90); } c.stroke();
  P(c, [[-200, -80], [-200, 150]]); P(c, [[200, -80], [200, 150]]); c.strokeRect(-170, 60, 340, 20); P(c, [[-160, 80], [-160, 150]]); P(c, [[160, 80], [160, 150]]);
  const n = Math.floor(fill * 34); for (let k = 0; k < n; k++) { const col = k % 8, row = Math.floor(k / 8); const px = -150 + col * 40 + (row % 2) * 10, py = 50 - row * 34;
    if (row < 3) { const kind = k % 3; if (kind === 0) c.strokeRect(px, py - 26, 26, 26); else if (kind === 1) { c.beginPath(); c.arc(px + 13, py - 13, 13, 0, 7); c.stroke(); } else P(c, [[px, py], [px + 13, py - 28], [px + 26, py]], true); }
    else { const hx = -160 + (k % 6) * 62, hy = -40; P(c, [[hx, hy - 30], [hx, hy + 6]]); c.strokeRect(hx - 12, hy + 6, 24, 30); } }
  c.restore();
}
function cube(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); P(c, [[0, -40], [36, -20], [36, 22], [0, 42], [-36, 22], [-36, -20]], true); P(c, [[-36, -20], [0, 0], [36, -20]]); P(c, [[0, 0], [0, 42]]); c.restore(); }
function shopIcon(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.strokeRect(-110, -20, 220, 150); c.beginPath(); for (let k = 0; k < 5; k++) { const x0 = -130 + k * 52; c.moveTo(x0, -60); c.lineTo(x0, -20); c.quadraticCurveTo(x0 + 26, 10, x0 + 52, -20); c.lineTo(x0 + 52, -60); } c.stroke(); P(c, [[-130, -60], [130, -60], [110, -100], [-110, -100]], true); c.strokeRect(-30, 40, 60, 90); c.strokeRect(40, 10, 50, 40); c.restore(); }
function playIcon(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); P(c, [[x - r * .28, y - r * .42], [x + r * .46, y], [x - r * .28, y + r * .42]], true); }
function cursor(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = WHITE; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 64); c.lineTo(16, 50); c.lineTo(28, 76); c.lineTo(38, 71); c.lineTo(26, 46); c.lineTo(46, 46); c.closePath(); c.fill(); c.strokeStyle = MID; c.lineWidth = 3; c.stroke(); c.restore(); }
function check(c, x, y, s, p) {   // a big check mark drawn stroke by stroke
  if (p <= 0) return; const A = [x - 70 * s, y], B = [x - 15 * s, y + 55 * s], C = [x + 90 * s, y - 70 * s], l1 = Math.hypot(B[0] - A[0], B[1] - A[1]), l2 = Math.hypot(C[0] - B[0], C[1] - B[1]), L = (l1 + l2) * clamp(p);
  c.beginPath(); c.moveTo(...A); if (L <= l1) c.lineTo(lerp(A[0], B[0], L / l1), lerp(A[1], B[1], L / l1)); else { c.lineTo(...B); const u = (L - l1) / l2; c.lineTo(lerp(B[0], C[0], u), lerp(B[1], C[1], u)); } c.stroke();
}

// —— the website mockups (line art): a browser frame with a brand, a menu and a product ——
function page(c, kind, x, y, w, h, t, o = {}) {
  c.save(); c.translate(x - w / 2, y - h / 2);
  c.beginPath(); c.roundRect(0, 0, w, h, 18); c.stroke();
  c.save(); c.font = `700 ${h * .055}px "Inter"`; c.textBaseline = 'middle'; c.shadowBlur = 0; c.fillText(kind.startsWith('phones') ? 'AURA' : 'STRIDE', w * .05, h * .08); c.font = `500 ${h * .04}px "Inter"`; c.textAlign = 'right'; c.fillText('BOLT     ÚJDONSÁGOK     KAPCSOLAT', w * .95, h * .08); c.restore();
  const L = (x0, y0, ww) => P(c, [[x0, y0], [x0 + ww, y0]]);
  if (kind === 'sneakerClean') { sneaker(c, w * .5, h * .5, w / 620); c.save(); c.font = `700 ${h * .06}px "Inter"`; c.textAlign = 'center'; c.fillText('38 900 Ft', w * .5, h * .78); c.restore(); c.strokeRect(w * .36, h * .84, w * .12, h * .06); c.strokeRect(w * .52, h * .84, w * .12, h * .06); P(c, [[w * .1, h * .46], [w * .07, h * .5], [w * .1, h * .54]]); P(c, [[w * .9, h * .46], [w * .93, h * .5], [w * .9, h * .54]]); }
  if (kind === 'gridClutter') { for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const cx = w * (.08 + k * .225), cy = h * (.19 + r * .26); c.strokeRect(cx, cy, w * .2, h * .23); sneaker(c, cx + w * .1, cy + h * .09, w / 3800); L(cx + w * .02, cy + h * .16, w * .15); L(cx + w * .02, cy + h * .19, w * .09); c.save(); c.font = `800 ${h * .03}px "Inter"`; c.fillText(['-50%', 'ÚJ!', 'AKCIÓ', 'TOP'][(r + k) % 4], cx + w * .015, cy + h * .04); c.restore(); } }
  if (kind === 'phonesClutter') { headphones(c, w * .22, h * .52, w / 1500); c.save(); c.font = `800 ${h * .055}px "Inter"`; c.fillText('AURA SonoWave 360 PRO MAX', w * .42, h * .24); c.restore(); for (let k = 0; k < 9; k++) L(w * .42, h * (.32 + k * .055), w * (.25 + hash(k) * .28)); for (let k = 0; k < 4; k++) c.strokeRect(w * (.42 + k * .13), h * .83, w * .11, h * .07); c.save(); c.font = `800 ${h * .05}px "Inter"`; c.fillText('-35% • INGYEN SZÁLLÍTÁS • CSAK MA!', w * .05, h * .95); c.restore(); }
  if (kind === 'phonesClean') { headphones(c, w * .27, h * .55, w / 1050); c.save(); c.font = `700 ${h * .065}px "Inter"`; c.fillText('AURA 360', w * .58, h * .34); c.font = `500 ${h * .045}px "Inter"`; c.fillText('49 900 Ft', w * .58, h * .46); c.restore(); L(w * .58, h * .56, w * .26); L(w * .58, h * .62, w * .18); c.beginPath(); c.roundRect(w * .58, h * .74, w * .17, h * .08, h * .04); c.stroke(); }
  c.restore();
}

// —— scenes (each [start, draw]) ——
const scenes = [];
const sc = (t0, f, o = {}) => scenes.push([t0, f, o]);
// A: let's play a game: the play button, the cursor comes and clicks it
sc(0, (c, t) => { const k = E(t, .05, .45, .4), click = E(t, T(2), .25, .5); neon(c, () => { c.save(); c.translate(540, 900); const s = Math.min(1.08, k) * (1 - .1 * Math.sin(Math.min(1, click) * Math.PI)); c.scale(s, s); c.translate(-540, -900); playIcon(c, 540, 900, 110); c.restore(); });
  const cu = ss(seg(t, .2, T(2))); cursor(c, lerp(760, 575, cu), lerp(1160, 925, cu), 1.2); if (t > T(2)) neon(c, () => { const r = seg(t, T(2), T(2) + .5); if (r < 1) { c.globalAlpha = 1 - r; c.beginPath(); c.arc(540, 900, 110 + r * 120, 0, 7); c.stroke(); } }); });
// B: which brand looks more expensive: the question decodes itself
sc(1.5, (c, t) => { const q1 = 'MELYIK MÁRKA', q2 = 'TŰNIK DRÁGÁBBNAK?'; txt(c, scramble(q1, t, 1.55, .5), 540, 860, 60, { ls: 6 }); txt(c, scramble(q2, t, T(5) - .1, .6), 540, 950, 60, { ls: 6 }); });
// C-F: the two rounds of brand 1 vs brand 2
function versus(c, t, kinds, pick, tPick, tA, tB, tIn) {
  const k = E(t, tIn, .45, .35), hiA = ss(seg(t, tA - .1, tA + .2)) * (1 - ss(seg(t, tB - .1, tB + .1))), hiB = ss(seg(t, tB - .1, tB + .2)) * (1 - ss(seg(t, tPick - .5, tPick - .3))), pk = ss(seg(t, tPick - .3, tPick)), blur = Math.sin(clamp((t - tPick + .3) / 1.0) * Math.PI) * (t < tPick + .7 ? 1 : 0);
  c.save(); const s = Math.min(1, k); c.globalAlpha = s; c.filter = blur > .02 ? `blur(${blur * 8 * K}px)` : 'none';
  txt(c, 'MÁRKA 1', 540, 420, 44, { ls: 8, alpha: s * (pick === 1 || pk < .5 ? 1 : .45) }); txt(c, 'MÁRKA 2', 540, 985, 44, { ls: 8, alpha: s * (pick === 2 || pk < .5 ? 1 : .45) });
  neon(c, () => page(c, kinds[0], 540, 690, 760 * (1 + .03 * hiA), 450 * (1 + .03 * hiA), t), { alpha: s * (pick === 2 ? 1 - .55 * pk : 1), w: 3.5 + 2 * hiA }); neon(c, () => P(c, [[180, 940], [900, 940]]), { w: 3, alpha: s * .7 });
  neon(c, () => page(c, kinds[1], 540, 1245, 760 * (1 + .03 * hiB), 450 * (1 + .03 * hiB), t), { alpha: s * (pick === 1 ? 1 - .55 * pk : 1), w: 3.5 + 2 * hiB }); c.restore();
  const ck = seg(t, tPick, tPick + .45); if (ck > 0) neon(c, () => check(c, 540, pick === 1 ? 690 : 1245, 1.6, ck), { w: 16, glow: 30, alpha: 1 - ss(seg(t, tPick + 1.1, tPick + 1.4)) });
}
sc(3.35, (c, t) => versus(c, t, ['sneakerClean', 'gridClutter'], 1, T(19), T(11), T(14), 3.4));
sc(9.1, (c, t) => versus(c, t, ['phonesClutter', 'phonesClean'], 2, T(34), T(25), T(28), 9.15));
// G: a design principle, its name: WHITESPACE, a frame draws round it
sc(15.3, (c, t) => { txt(c, scramble('DESIGN ELV', t, 15.55, .5), 540, 960, 46, { ls: 10, alpha: 1 - ss(seg(t, T(44) - .3, T(44))) });
  const k = E(t, T(44), .5, .3); if (k > 0) { txt(c, 'WHITESPACE', 540, 960, 92 * (.9 + .1 * Math.min(1, k)), { ls: 10, alpha: Math.min(1, k), glow: 30 }); const f = ss(seg(t, T(44) + .4, T(44) + 1.1)); if (f > 0) neon(c, () => { const w0 = 940 * f, h0 = 260 * f; c.beginPath(); c.roundRect(540 - w0 / 2, 960 - h0 / 2, w0, h0, 22); c.stroke(); }, { w: 4 }); } });
// H: you get it by leaving room between the elements of your site: dashed boxes spread out until every one can breathe, then it becomes the finished page
sc(18.9, (c, t) => { const u = ss(seg(t, T(53), T(56) + .3)), done = ss(seg(t, T(61) - .2, T(61) + .4)), breathe = t > T(61) ? .015 * Math.sin((t - T(61)) * 4) : 0;
  const X = 540, Y = 960, w = 940 * (1 + breathe), h = 560 * (1 + breathe);
  neon(c, () => { c.beginPath(); c.roundRect(X - w / 2, Y - h / 2, w, h, 18); c.stroke(); }, { w: 4 });
  c.save(); c.setLineDash([16, 12]); c.lineDashOffset = -t * 40;
  const box = (a, b) => { const [x0, y0, w0, h0] = a.map((v, i) => lerp(v, b[i], u)); return [X - w / 2 + x0 * w, Y - h / 2 + y0 * h, w0 * w, h0 * h]; };
  const parts = [[[.03, .1, .4, .6], [.06, .12, .42, .76], 'r'], [[.42, .08, .5, .06], [.56, .3, .3, .07], 'l'], [[.42, .16, .5, .06], [.56, .45, .2, .05], 'l'], [[.42, .24, .45, .06], [.56, .58, .26, .04], 'l'], [[.42, .32, .4, .06], [.56, .66, .18, .04], 'l'], [[.06, .74, .2, .1], [.56, .77, .2, .1], 'r'], [[.28, .74, .2, .1], [.8, .77, .12, .1], 'r'], [[.5, .42, .45, .3], [.8, .1, .14, .05], 'r']];
  neon(c, () => parts.forEach(([a, b, kind]) => { const [bx, by, bw, bh] = box(a, b); if (kind === 'r') c.strokeRect(bx, by, bw, bh); else P(c, [[bx, by + bh / 2], [bx + bw, by + bh / 2]]); }), { w: 3, alpha: 1 - done });
  c.restore();
  if (done > 0) neon(c, () => page(c, 'phonesClean', X, Y, w, h, t), { alpha: done, w: 4 }); });
// I-J: why does it look more expensive: the finished page, a ring of light moves from the brand to the product; no flood of information
sc(24.45, (c, t) => { const X = 540, Y = 960, w = 940, h = 560; neon(c, () => page(c, 'phonesClean', X, Y, w, h, t), { w: 4 });
  const pts = [[X - w * .42, Y - h * .42, T(68)], [X - w * .5 + w * .27, Y - h * .5 + h * .55, T(78)], [X - w * .5 + w * .7, Y - h * .5 + h * .45, T(80)], [X - w * .5 + w * .7, Y - h * .5 + h * .62, T(84)]];
  if (t > T(64) - .2) { let i = 0; while (i + 1 < pts.length && t > pts[i + 1][2]) i++; const nx = pts[Math.min(i + 1, pts.length - 1)], u = i + 1 < pts.length ? ss(seg(t, nx[2] - .5, nx[2])) : 0, cx = lerp(pts[i][0], nx[0], u), cy = lerp(pts[i][1], nx[1], u), a = ss(seg(t, T(64) - .2, T(64) + .2));
    neon(c, () => { c.beginPath(); c.arc(cx, cy, 82, 0, 7); c.stroke(); }, { w: 6, glow: 40, alpha: a });
    if (u > 0 && u < 1) { c.save(); c.setLineDash([6, 14]); neon(c, () => { c.beginPath(); c.moveTo(pts[i][0], pts[i][1] - 90); c.quadraticCurveTo((pts[i][0] + nx[0]) / 2, Math.min(pts[i][1], nx[1]) - 220, nx[0], nx[1] - 90); c.stroke(); }, { w: 3, alpha: .7 * Math.sin(u * Math.PI) }); c.restore(); } }
  // "no need to pour all the information on you": the ring grows big over the information, then the whole page starts to tilt away in 3D (scene K takes it from here)
  });
// —— 3D: a flat rectangle turned in space and projected; content can be mapped onto it ——
function quad3(w, h, ry, rx, rz, cx, cy, s = 1) { const f = 1500; return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => { x *= s; y *= s; const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz); const x2 = x1 * Math.cos(ry), z2 = x1 * Math.sin(ry); const y3 = y1 * Math.cos(rx) - z2 * Math.sin(rx), z3 = y1 * Math.sin(rx) + z2 * Math.cos(rx); return [cx + x2 * f / (f + z3), cy + y3 * f / (f + z3)]; }); }
function onQuad(c, q, w, h, f) { const [p0, p1, , p3] = q; c.save(); c.transform((p1[0] - p0[0]) / w, (p1[1] - p0[1]) / w, (p3[0] - p0[0]) / h, (p3[1] - p0[1]) / h, p0[0], p0[1]); f(); c.restore(); }
function cardIcons(c, x, y, p) {   // a head (soft light) with dashed lines up to a cog, a bulb and a star: how we perceive
  const g = c.createRadialGradient(x, y + 40, 10, x, y + 40, 210); g.addColorStop(0, 'rgba(230,236,255,.95)'); g.addColorStop(1, 'rgba(230,236,255,0)'); c.save(); c.fillStyle = g; c.beginPath(); c.arc(x, y - 10, 60, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - 125, y + 220); c.quadraticCurveTo(x - 125, y + 70, x, y + 60); c.quadraticCurveTo(x + 125, y + 70, x + 125, y + 220); c.closePath(); c.fill(); c.restore();
  const icons = [[x - 105, y - 205, 'cog'], [x, y - 245, 'bulb'], [x + 105, y - 205, 'star']];
  icons.forEach(([ix, iy, kind], i) => { const k = clamp((p - i * .22) / .4); if (k <= 0) return; c.save(); c.setLineDash([6, 10]); neon(c, () => P(c, [[x + (ix - x) * .25, y - 85], [lerp(x + (ix - x) * .25, ix, k), lerp(y - 85, iy + 34, k)]]), { w: 3 }); c.restore();
    if (k >= 1) neon(c, () => { c.save(); c.translate(ix, iy); if (kind === 'cog') { c.beginPath(); c.arc(0, 0, 18, 0, 7); c.stroke(); for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4; P(c, [[Math.cos(a) * 18, Math.sin(a) * 18], [Math.cos(a) * 28, Math.sin(a) * 28]]); } } if (kind === 'bulb') { c.beginPath(); c.arc(0, -4, 22, Math.PI * .78, Math.PI * 2.22); c.stroke(); c.strokeRect(-10, 16, 20, 12); for (let q = -2; q <= 2; q++) { const a = -Math.PI / 2 + q * .55; P(c, [[Math.cos(a) * 32, Math.sin(a) * 32 - 4], [Math.cos(a) * 42, Math.sin(a) * 42 - 4]]); } } if (kind === 'star') { c.beginPath(); for (let q = 0; q < 10; q++) { const a = -Math.PI / 2 + q * Math.PI / 5, r = q % 2 ? 10 : 25; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); } c.restore(); }, { w: 3.5 }); });
}
// K: and because we know this feeling from real shops: the page tilts away in 3D and flips into a card (with a ghost trail), the card settles with a head and its ideas; then its frame multiplies into a tunnel
const K0 = T(84) + .2;   // the page starts to tilt
sc(K0, (c, t) => { const PW = 940, PH = 560, CW = 620, CH = 900, flip = K0 + .7, settle = K0 + 1.9, tun = ss(seg(t, 36.0, T(97)));
  const pose = tt => { if (tt < flip) { const u = ss(seg(tt, K0, flip)); return { w: PW, h: PH, ry: u * Math.PI / 2, rx: .25 * u, rz: -.12 * u, s: 1 - .25 * u, page: true }; }
    const u = clamp((tt - flip) / (settle - flip)), e = 1 - Math.pow(1 - u, 3); return { w: CW, h: CH, ry: -Math.PI / 2 * (1 - e) + Math.sin(e * Math.PI) * .35 + .06 * Math.sin(tt * 1.3) * e, rx: .22 * (1 - e) + .04 * Math.sin(tt) * e, rz: -.25 * (1 - e) - .03 * e, s: .8 + .2 * e, page: false }; };
  // the ghost trail while it spins
  if (t > flip && t < settle + .2) for (let g = 6; g >= 1; g--) { const p = pose(t - g * .035); if (p.page) continue; const q = quad3(p.w, p.h, p.ry, p.rx, p.rz, 540, 960, p.s); neon(c, () => P(c, q, true), { w: 2.5, alpha: (1 - g / 7) * .45, glow: 10 }); }
  const p = pose(t); const q = quad3(p.w, p.h, p.ry, p.rx, p.rz, 540, 960, p.s * (1 + tun * 2.2));
  if (p.page) { neon(c, () => onQuad(c, q, PW, PH, () => page(c, 'phonesClean', PW / 2, PH / 2, PW, PH, t)), { w: 4, alpha: 1 - ss(seg(t, flip - .35, flip)) }); neon(c, () => P(c, q, true), { w: 4 }); return; }
  neon(c, () => P(c, q, true), { w: 7, glow: 30 });
  // the card's frame multiplies into a tunnel, the stall waiting blurred at its end
  if (tun > 0) { neon(c, () => { for (let k = 1; k < 10; k++) { const f = 1 - k * .09; c.globalAlpha = (1 - k / 10) * tun; P(c, quad3(CW * f, CH * f, 0, 0, 0, 540, 960, 1 + tun * 2.2 * f - k * .02), true); } }, { w: 3 }); c.save(); c.filter = `blur(${(1 - tun) * 14 * K + 4 * K}px)`; neon(c, () => tent2(c, 540, 1000, .55 + .4 * tun, 0), { w: 3, alpha: tun }); c.restore(); }
  const content = ss(seg(t, settle - .5, settle)) * (1 - ss(seg(t, 35.95, 36.3))); if (content > 0) { c.save(); c.globalAlpha = content; onQuad(c, q, CW, CH, () => { c.translate(CW / 2, CH / 2 + 70); c.scale(1.3, 1.3); cardIcons(c, 0, 0, seg(t, settle, T(96))); }); c.restore(); } });
// a detailed market stall: striped canopy, posts, a table on the left, shelves on the right; fill 0..1: products crowd in, piece by piece
function tent2(c, x, y, s, fill) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const top = -320, eave = -150; P(c, [[-270, eave], [0, top], [270, eave]]); for (let k = -4; k <= 4; k++) P(c, [[0, top], [k * 67.5, eave]]);
  c.beginPath(); for (let k = 0; k < 8; k++) { const x0 = -270 + k * 67.5; c.moveTo(x0, eave); c.quadraticCurveTo(x0 + 34, eave + 34, x0 + 67.5, eave); } c.stroke();
  P(c, [[-262, eave + 6], [-282, 260]]); P(c, [[262, eave + 6], [282, 260]]);
  c.strokeRect(-240, 100, 210, 18); P(c, [[-228, 118], [-228, 240]]); P(c, [[-42, 118], [-42, 240]]);   // the table
  c.strokeRect(20, -90, 220, 330); for (const yy of [-10, 70, 150]) P(c, [[20, yy], [240, yy]]);   // the shelves
  P(c, [[-240, -80], [-40, -80]]);   // the clothes rail
  const items = [];
  for (let k = 0; k < 6; k++) items.push(() => { const hx = -225 + k * 34; P(c, [[hx + 12, -80], [hx + 12, -70]]); P(c, [[hx, -64], [hx + 6, -70], [hx + 18, -70], [hx + 24, -64], [hx + 22, -56], [hx + 20, -56], [hx + 20, -20], [hx + 4, -20], [hx + 4, -56], [hx + 2, -56]], true); });   // shirts on the rail
  for (let k = 0; k < 7; k++) items.push(() => { const bx = -232 + k * 28; if (k % 2) { c.strokeRect(bx, 72, 16, 28); P(c, [[bx + 5, 72], [bx + 5, 62], [bx + 11, 62], [bx + 11, 72]]); } else { c.beginPath(); c.roundRect(bx, 80, 20, 20, 4); c.stroke(); } });   // bottles and jars on the table
  for (let k = 0; k < 4; k++) items.push(() => { const hx = 50 + k * 50; c.beginPath(); c.arc(hx, -20, 16, Math.PI, 0); c.stroke(); P(c, [[hx - 24, -20], [hx + 24, -20]]); });   // hats on the top shelf
  for (let k = 0; k < 4; k++) items.push(() => { const bx = 34 + k * 50; P(c, [[bx, 66], [bx + 36, 66], [bx + 32, 30], [bx + 4, 30]], true); c.beginPath(); c.arc(bx + 18, 30, 9, Math.PI, 0); c.stroke(); });   // bags
  for (let k = 0; k < 5; k++) items.push(() => { c.strokeRect(34 + k * 40, 110, 30, 38); });   // boxes
  for (let k = 0; k < 5; k++) items.push(() => sneaker(c, -210 + k * 46, 238, .14));   // shoes on the ground
  const n = Math.floor(fill * items.length); items.slice(0, n).forEach((f, i) => f());
  c.restore();
}
// L: think of a flea-market stall: out of the tunnel the stall comes sharp, and fills up with products
sc(T(97), (c, t) => { const t0 = T(97), k = ss(seg(t, t0, t0 + .45)); c.save(); if (k < 1) c.filter = `blur(${(1 - k) * 8 * K}px)`; neon(c, () => tent2(c, 540, 1000, lerp(.95, 1.55, k), ss(seg(t, T(101) - .1, T(105) + .2))), { w: 3.5 }); c.restore();
  if (k < 1) neon(c, () => { for (let q = 1; q < 7; q++) { const f = (1 + q * .35) * (1 + k * 1.5); c.globalAlpha = (1 - k) * (1 - q / 7); c.beginPath(); c.roundRect(540 - 235 * f, 960 - 340 * f, 470 * f, 680 * f, 26 * f); c.stroke(); } }, { w: 3 }); });
// M: a premium watch shop: the brand's crown and name; the camera dives into the logo; out of the blur, one watch; then a few, sliding past one by one, each getting the light
function crown(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.roundRect(-70, 20, 140, 22, 6); c.fill();
  [[-62, -22], [-32, -48], [0, -58], [32, -48], [62, -22]].forEach(([px, py]) => { c.beginPath(); c.moveTo(px * .55 - 7, 20); c.lineTo(px - 4, py + 10); c.lineTo(px + 4, py + 10); c.lineTo(px * .55 + 7, 20); c.closePath(); c.fill(); c.beginPath(); c.arc(px, py, 10, 0, 7); c.fill(); }); c.restore(); }
function watch2(c, x, y, s) {   // a chronograph: bezel ticks, three small dials, a link bracelet
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const d of [-1, 1]) for (let k = 0; k < 4; k++) { const y0 = d * (86 + k * 24), wv = 50 - k * 2; c.beginPath(); c.roundRect(-wv, d > 0 ? y0 : y0 - 22, wv * 2, 22, 5); c.stroke(); P(c, [[-wv / 3, d > 0 ? y0 : y0 - 22], [-wv / 3, d > 0 ? y0 + 22 : y0]]); P(c, [[wv / 3, d > 0 ? y0 : y0 - 22], [wv / 3, d > 0 ? y0 + 22 : y0]]); }
  c.beginPath(); c.arc(0, 0, 92, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 76, 0, 7); c.stroke(); for (let k = 0; k < 60; k += 5) { const a = k / 60 * Math.PI * 2; P(c, [[Math.cos(a) * 80, Math.sin(a) * 80], [Math.cos(a) * 88, Math.sin(a) * 88]]); }
  for (const [dx, dy] of [[-30, 4], [30, 4], [0, 34]]) { c.beginPath(); c.arc(dx, dy, 15, 0, 7); c.stroke(); P(c, [[dx, dy], [dx + 6, dy - 9]]); }
  P(c, [[0, 0], [0, -58]]); P(c, [[0, 0], [40, -12]]); c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); c.beginPath(); c.roundRect(92, -12, 14, 24, 4); c.stroke(); P(c, [[86, -46], [96, -54]]); P(c, [[86, 46], [96, 54]]); c.restore(); }
function glowWatch(c, x, y, s, a, sharp) { if (a <= 0) return; c.save(); if (!sharp) c.filter = `blur(${3.5 * K}px)`; const g = c.createRadialGradient(x, y, 0, x, y, 240 * s); g.addColorStop(0, `rgba(200,215,255,${.22 * a})`); g.addColorStop(1, 'rgba(200,215,255,0)'); c.fillStyle = g; c.fillRect(x - 260 * s, y - 260 * s, 520 * s, 520 * s); neon(c, () => watch2(c, x, y, s), { w: 3.2, alpha: a, glow: sharp ? 30 : 14 }); c.restore(); }
sc(T(106) - .05, (c, t) => { const t0 = T(106), dive = ss(seg(t, T(109) - .25, T(109) + .2)), logo = E(t, t0, .45, .35);
  if (dive < 1) { c.save(); c.translate(540, 900); const s = Math.min(1.04, logo) * (1 + dive * 7); c.scale(s, s); c.translate(-540, -900); if (dive > 0) c.filter = `blur(${dive * 18 * K}px)`;
    c.globalAlpha = (1 - dive) * Math.min(1, logo * 1.4); c.fillStyle = WHITE; c.shadowColor = 'rgba(200,215,255,.9)'; c.shadowBlur = 18 * K; crown(c, 540, 800, 1.45); c.shadowBlur = 0; crown(c, 540, 800, 1.45);
    txt(c, 'ROLEX', 540, 965, 150, { font: 'Cormorant', weight: 700, ls: 10, glow: 14 }); c.restore(); }
  // one watch, then the row: watches slide left, the one in the middle sharp and lit
  const one = ss(seg(t, T(109) - .05, T(109) + .45)); if (one <= 0) return;
  const row = ss(seg(t, T(112) - .1, T(112) + .5)), pan = t > T(115) ? (t - T(115)) * 1.45 : 0, gap = 440;
  for (let i = -2; i <= 6; i++) { const pos = i - pan, x = 540 + pos * gap, d = Math.abs(pos); if (x < -300 || x > 1380) continue; if (i !== 0 && row <= 0) continue;
    const focus = Math.max(0, 1 - d), a = i === 0 ? one * (1 - .55 * row * (1 - focus)) : row * (.35 + .65 * focus), s = (1.0 + .55 * focus) * (i === 0 ? lerp(1.15, 1, row) : 1);
    glowWatch(c, x, 960, s, a, focus > .5); } });
// N: whitespace is the digital version of that: WHITESPACE glitches in, dotted lines run down to PHYSICAL SPACE; then the room between elements: cubes on an orbit with space between them
sc(T(120) - .1, (c, t) => { const t0 = T(120); const sw = 1 - ss(seg(t, T(127) - .2, T(127) + .3));
  if (sw > 0) { const gl = t - T(121) < .5 && t > T(121) ? 1 : 0; for (let k = 0; k < (gl ? 3 : 1); k++) { const off = gl ? (hash(Math.floor(t * 30) + k) - .5) * 30 : 0; c.save(); if (gl) { c.globalCompositeOperation = 'lighter'; } txt(c, 'WHITESPACE', 540 + off, 720, 70, { ls: 8, alpha: sw * ss(seg(t, T(121) - .1, T(121) + .2)) * (gl ? .6 : 1), col: gl ? ['#9fc3ff', '#ffffff', '#ffd27a'][k] : WHITE }); c.restore(); }
    const dl = ss(seg(t, T(125) - .3, T(126) + .3)); if (dl > 0) { c.save(); c.setLineDash([4, 12]); neon(c, () => { for (let k = -4; k <= 4; k++) { const x = 540 + k * 32; c.beginPath(); c.moveTo(x, 790); c.lineTo(x, lerp(790, 1110, dl)); c.stroke(); } }, { w: 3, alpha: sw * .8 }); c.restore(); txt(c, 'FIZIKAI TÉR', 540, 1180, 56, { ls: 8, alpha: sw * ss(seg(t, T(126) - .1, T(126) + .3)) }); } }
  const ob = ss(seg(t, T(127) - .1, T(127) + .5)) * (1 - ss(seg(t, T(135) - .3, T(135)))); if (ob > 0) { c.save(); c.setLineDash([3, 14]); neon(c, () => { c.beginPath(); c.arc(540, 960, 300 * ob, 0, 7); c.stroke(); }, { w: 3, alpha: ob * .8 }); c.restore();
    neon(c, () => { for (let k = 0; k < 3; k++) { const a = (t - T(127)) * .6 + k * Math.PI * 2 / 3; cube(c, 540 + Math.cos(a) * 300 * ob, 960 + Math.sin(a) * 300 * ob, 1.5 * ob); } }, { w: 3.5, alpha: ob }); } });
// O-P: use it in your shop: the shop icon, a star of value lands on it; and sell more: the bars climb
sc(T(135) - .1, (c, t) => { const k = E(t, T(135), .45, .35), out = ss(seg(t, T(143), T(143) + .4)); neon(c, () => shopIcon(c, 540, 960, 1.9 * Math.min(1.06, k) * (1 - out)), { w: 4, alpha: 1 - out });
  const st = E(t, T(141), .35, .45) * (1 - out); if (st > 0) neon(c, () => { c.save(); c.translate(540 + 150, 960 - 230); c.scale(Math.min(1.15, st), Math.min(1.15, st)); c.beginPath(); for (let q = 0; q < 10; q++) { const a = -Math.PI / 2 + q * Math.PI / 5, r = q % 2 ? 22 : 54; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }, { col: GOLD, glowCol: 'rgba(236,189,74,.9)', glow: 30 });
  const bars = ss(seg(t, T(144), T(146) + .3)); if (out > 0) neon(c, () => { P(c, [[300, 1160], [800, 1160]]); for (let q = 0; q < 5; q++) { const hh = lerp(30, 90 + q * 85, clamp(bars * 1.4 - q * .1)); c.save(); const g = c.createLinearGradient(0, 1160 - hh, 0, 1160); g.addColorStop(0, 'rgba(244,247,255,.95)'); g.addColorStop(1, 'rgba(244,247,255,.15)'); c.fillStyle = g; c.fillRect(330 + q * 92, 1160 - hh, 62, hh); c.restore(); } }, { w: 4, alpha: out }); });

// —— the caption: a typewriter line at the bottom, words appearing as spoken ——
const CAPF = '500 40px "JBMono"', meas = document.createElement('canvas').getContext('2d'); meas.font = CAPF;
const PAGES = (() => { const pages = []; let cur = []; WORDS.forEach(([w, t0], i) => { cur.push(i); const nxt = WORDS[i + 1]; if (/[.?!:]$/.test(w) || cur.length >= 5 || (/,$/.test(w) && cur.length >= 3) || (nxt && nxt[1] - t0 > 1.2)) { pages.push(cur); cur = []; } }); if (cur.length) pages.push(cur); return pages.map((p, k) => ({ p, t0: WORDS[p[0]][1] - .05, t1: pages[k + 1] ? WORDS[pages[k + 1][0]][1] - .05 : STORY - .4 })); })();
function caption(c, t) { const pg = PAGES.find(q => t >= q.t0 && t < q.t1); if (!pg) return; const shown = pg.p.filter(i => t >= WORDS[i][1] - .03);
  const full = pg.p.map(i => WORDS[i][0]).join(' '), fw = meas.measureText(full).width; let x = 540 - fw / 2; c.save(); c.font = CAPF; c.textBaseline = 'middle'; c.fillStyle = 'rgba(244,247,255,.92)'; c.shadowColor = 'rgba(0,8,30,.8)'; c.shadowBlur = 8 * K;
  pg.p.forEach(i => { const w = WORDS[i][0]; if (shown.includes(i)) { const k = clamp((t - WORDS[i][1] + .03) / .12), n = Math.ceil(w.length * k); c.fillText(w.slice(0, n), x, 1580); } x += meas.measureText(w + ' ').width; }); c.restore(); }

// —— transitions: each new visual comes in with a short blur-zoom; the screen never cuts hard ——
function sceneAt(t) { let i = 0; while (i + 1 < scenes.length && t >= scenes[i + 1][0]) i++; return i; }
const mk = () => { const cc = document.createElement('canvas'); cc.width = W; cc.height = H; return [cc, cc.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
function paint(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); c.clearRect(0, 0, 1080, 1920); scenes[i][1](c, t); }
function draw(c, t) {
  c.setTransform(K, 0, 0, K, 0, 0); bg(c);
  if (t >= STORY) return endCard(c, t);
  const i = sceneAt(t), t0 = scenes[i][0], dt = t - t0, TR = .35;
  if (i > 0 && dt < TR && t0 !== K0 && t0 !== T(97)) { const e = ss(dt / TR); paint(actx, i - 1, t0 - 1 / 48); paint(bctx, i, t); c.setTransform(1, 0, 0, 1, 0, 0);
    c.save(); c.globalAlpha = 1 - e; c.filter = `blur(${e * 12 * K}px)`; c.translate(W / 2, H / 2); c.scale(1 + .12 * e, 1 + .12 * e); c.translate(-W / 2, -H / 2); c.drawImage(bufA, 0, 0); c.restore();
    c.save(); c.globalAlpha = e; c.filter = `blur(${(1 - e) * 12 * K}px)`; c.translate(W / 2, H / 2); c.scale(.9 + .1 * e, .9 + .1 * e); c.translate(-W / 2, -H / 2); c.drawImage(bufB, 0, 0); c.restore(); }
  else { c.save(); scenes[i][1](c, t); c.restore(); }
  c.setTransform(K, 0, 0, K, 0, 0); caption(c, t);
  const f = ss(seg(t, STORY - .7, STORY)); if (f > 0) { c.globalAlpha = f; c.fillStyle = MID; c.fillRect(0, 0, 1080, 1920); c.globalAlpha = 1; }
}
function endCard(c, t) {   // the locked 23 end card: the logo fades in, settling from 104% while a blur clears
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = 1080 * .30, h = w * LOGO.height / LOGO.width, s = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; if (u < 1) c.filter = `blur(${(1 - u) * 6 * K}px)`; c.translate(540, 960); c.scale(s, s); c.drawImage(LOGO_C, -w / 2, -h / 2, w, h); c.restore();
}
window.DUR = DUR; window.EV = []; window.render = t => draw(ctx, t); window.render(0); window.READY = true;
