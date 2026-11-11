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
const sc = (t0, f) => scenes.push([t0, f]);
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
  // "no need to pour all the information on you": a crowd of text lines tries to rush in, and falls away
  const fl = seg(t, T(83) - .2, T(85) + .6); if (fl > 0 && fl < 1) neon(c, () => { for (let k = 0; k < 14; k++) { const a = hash(k) * Math.PI * 2, d = lerp(700, 380, ss(Math.min(1, fl * 2))) + (fl > .5 ? (fl - .5) * 1200 : 0); P(c, [[X + Math.cos(a) * d, Y + Math.sin(a) * d], [X + Math.cos(a) * d + 90, Y + Math.sin(a) * d]]); } }, { w: 4, alpha: Math.sin(fl * Math.PI) * .8 }); });
// K: and because we know this feeling from real shops: a card turns in 3D, a head with ideas in it; then the card becomes a tunnel
sc(32.9, (c, t) => { const k = E(t, 32.95, .5, .3), ry = Math.sin((t - 32.9) * 1.2) * .55, rz = -.18 + .1 * Math.sin((t - 32.9) * .8), zoom = ss(seg(t, 35.9, T(97)));
  c.save(); c.translate(540, 960); c.rotate(rz * (1 - zoom)); c.scale(Math.cos(ry) * (1 - zoom) + zoom, 1); const s = Math.min(1, k) * (1 + zoom * 2.4); c.scale(s, s);
  neon(c, () => { c.beginPath(); c.roundRect(-230, -330, 460, 660, 26); c.stroke(); for (let q = 1; q < 6; q++) { c.globalAlpha = (1 - q / 6) * .6; const f = 1 - q * .09; c.beginPath(); c.roundRect(-230 * f, -330 * f, 460 * f, 660 * f, 26 * f); c.stroke(); } c.globalAlpha = 1; }, { w: 4, alpha: 1 - zoom * .5 });
  const g = c.createRadialGradient(0, 40, 10, 0, 40, 200); g.addColorStop(0, 'rgba(230,236,255,.9)'); g.addColorStop(1, 'rgba(230,236,255,0)'); c.fillStyle = g; c.globalAlpha = 1 - zoom; c.beginPath(); c.arc(0, -10, 62, 0, 7); c.fill(); c.beginPath(); c.moveTo(-120, 230); c.quadraticCurveTo(-120, 70, 0, 60); c.quadraticCurveTo(120, 70, 120, 230); c.closePath(); c.fill();
  neon(c, () => { const ic = (x, y, f) => { c.save(); c.translate(x, y); f(); c.restore(); }; ic(-90, -150, () => { c.beginPath(); c.arc(0, 0, 22, 0, 7); c.stroke(); for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4; P(c, [[Math.cos(a) * 22, Math.sin(a) * 22], [Math.cos(a) * 32, Math.sin(a) * 32]]); } }); ic(0, -190, () => { c.beginPath(); c.arc(0, -6, 24, Math.PI * .8, Math.PI * 2.2); c.stroke(); c.strokeRect(-12, 16, 24, 14); }); ic(90, -150, () => { c.beginPath(); for (let q = 0; q < 10; q++) { const a = -Math.PI / 2 + q * Math.PI / 5, r = q % 2 ? 11 : 26; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); }); }, { w: 3, alpha: 1 - zoom });
  c.restore(); });
// L: think of a flea-market stall: out of the tunnel the stall appears, and fills up with products
sc(T(97), (c, t) => { const t0 = T(97), tun = 1 - ss(seg(t, t0, t0 + .7)); if (tun > 0) neon(c, () => { for (let q = 0; q < 9; q++) { const z = ((q / 9) + (t - t0) * 1.4) % 1, f = .15 + z * 2.2; c.globalAlpha = tun * (1 - z) * .8; c.beginPath(); c.roundRect(540 - 230 * f, 960 - 330 * f, 460 * f, 660 * f, 26 * f); c.stroke(); } }, { w: 3 });
  const k = E(t, t0 + .2, .5, .3), out = ss(seg(t, T(106) - .2, T(106) + .45)); c.save(); c.filter = k < .8 ? `blur(${(1 - Math.min(1, k)) * 10 * K}px)` : 'none'; neon(c, () => tent(c, 540 - out * 900, 980, 1.75 * Math.min(1.04, k), ss(seg(t, T(101), T(105) + .3))), { w: 3.5, alpha: Math.min(1, k) }); c.restore(); });
// M: in a premium watch shop, only a few pieces are out, each one in its own light
sc(T(106) + .1, (c, t) => { const t0 = T(106); const one = E(t, t0 + .3, .5, .3), three = ss(seg(t, T(111) - .2, T(111) + .5)), turn = (t - T(111)) * .35;
  const label = ss(seg(t, t0 + .1, t0 + .5)) * (1 - ss(seg(t, T(111) - .3, T(111)))); txt(c, scramble('PRÉMIUM ÓRAÜZLET', t, t0 + .1, .5), 540, 640, 40, { ls: 8, alpha: label });
  const items = three > 0 ? [0, 1, 2].map(i => { const a = turn + i * Math.PI * 2 / 3; return { x: 540 + Math.sin(a) * 330 * three, z: Math.cos(a), i }; }).sort((p, q) => p.z - q.z) : [{ x: 540, z: 1, i: 0 }];
  items.forEach(({ x, z, i }) => { const sc2 = (.62 + .38 * (z + 1) / 2) * Math.min(1.05, one), spot = t > T(116) ? (Math.floor((t - T(116)) / .7) % 3 === i ? 1 : 0) : (i === 0 ? 1 : 0), a = (.45 + .55 * (z + 1) / 2);
    if (spot) { const g = c.createRadialGradient(x, 900, 0, x, 900, 260); g.addColorStop(0, 'rgba(200,215,255,.22)'); g.addColorStop(1, 'rgba(200,215,255,0)'); c.fillStyle = g; c.fillRect(x - 300, 600, 600, 600); }
    neon(c, () => watch(c, x, 960, 1.6 * sc2), { w: 3.5, alpha: a, glow: spot ? 34 : 16 }); }); });
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
  if (i > 0 && dt < TR) { const e = ss(dt / TR); paint(actx, i - 1, t0 - 1 / 48); paint(bctx, i, t); c.setTransform(1, 0, 0, 1, 0, 0);
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
