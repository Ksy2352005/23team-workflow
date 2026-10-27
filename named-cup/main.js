// The Named Cup: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// A BOLT kiosk in an evening shopping mall (a counter, the seller, a shelf of plain cups); the boy, the cup and his name as big shapes that snap in with the voice.
import { lerp, seg, ss, hash, clamp } from '/core/lib.js';
import { drawMascot, BASE_H } from './char2d.js';
import { DUR, STORY, SHOTS, HIT, NAME } from './story.js';

await Promise.all([document.fonts.load('74px "Lilita One"', 'BOLT490Ft?'), document.fonts.load('74px "Caveat Brush"', NAME)]);
const W = innerWidth, H = innerHeight, K = W / 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; };
const [bufA, actx] = mk(), [bufB, bctx] = mk();
const NAVY = '#1c2450', GOLD = '#ecbd4a', GOLD2 = '#d9a332', CREAM = '#f6efdc', END_BLUE = '#0b1438';
const GLOW = (() => { const [c, x] = mk(); c.width = c.height = 256; const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,214,120,1)'); g.addColorStop(.25, 'rgba(255,214,120,.45)'); g.addColorStop(1, 'rgba(255,214,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return c; })();

function sp(tau, d = .4, b = .2) {   // a spring like Motion's { type: 'spring', visualDuration, bounce }
  if (tau <= 0) return 0; const z = Math.max(.05, 1 - b);
  if (z >= .999) { const w = 4.7 / d; return 1 - Math.exp(-w * tau) * (1 + w * tau); }
  const wd = Math.PI / d, w0 = wd / Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * tau) * (Math.cos(wd * tau) + z * w0 / wd * Math.sin(wd * tau));
}
const E = (t, at, d = .35, b = .35) => t < at ? 0 : sp(t - at, d, b);
const blinkAt = (t, seed) => { const per = 2.6 + hash(seed) * 1.8, ph = (t + seed * 3.7) % per; return ph < .14 ? Math.sin(ph / .14 * Math.PI) : 0; };
const reach = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const Hs = s => BASE_H * s * 1.08;

// —— the stage and its pieces (all in a 1080 × 1920 frame) ——
function bg(c, t, o = {}) {
  const g = c.createRadialGradient(540, 860, 80, 540, 960, 1400); g.addColorStop(0, '#26368c'); g.addColorStop(1, '#0a1034'); c.fillStyle = g; c.fillRect(0, 0, 1080, 1920);
  if (o.shop) backdrop(c, t, o.shop, o.dim ?? .5); else { c.fillStyle = 'rgba(255,255,255,.05)'; const off = (t * 24) % 60;
  for (let y = -60; y < 1980; y += 60) for (let x = -60; x < 1140; x += 60) { c.beginPath(); c.arc(x + off + (y / 60 % 2) * 30, y + off, 3, 0, 7); c.fill(); } }
  if (o.rays) { c.save(); c.translate(o.rx ?? 540, o.ry ?? 900); c.rotate(t * .25); c.fillStyle = `rgba(255,214,120,${.07 * o.rays})`;
    for (let i = 0; i < 14; i++) { c.rotate(Math.PI * 2 / 14); c.beginPath(); c.moveTo(0, 0); c.lineTo(1600, -120); c.lineTo(1600, 120); c.closePath(); c.fill(); } c.restore(); }
}
function spot(c, x, y, w) { const g = c.createRadialGradient(x, y, 0, x, y, w); g.addColorStop(0, 'rgba(0,0,20,.35)'); g.addColorStop(1, 'rgba(0,0,20,0)'); c.save(); c.translate(x, y); c.scale(1, .22); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, w, 0, 7); c.fill(); c.restore(); }
function glow(c, x, y, r, a) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a); c.drawImage(GLOW, x - r, y - r, 2 * r, 2 * r); c.restore(); }
function scaled(c, x, y, k, f) { if (k <= 0) return; c.save(); c.translate(x, y); c.scale(k, k); c.translate(-x, -y); f(); c.restore(); }
function mascot(c, P, k = 1) { spot(c, P.x, P.y + 4, Hs(P.s) * .42); scaled(c, P.x, P.y, k, () => drawMascot(c, { ...P, shadow: false })); }
function text(c, s, x, y, size, col = CREAM, font = 'Lilita One') { c.font = `${size}px "${font}"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }
function bubbleMark(c, x, y, k, mark = '!', r = 70, col = '#e8573a') { scaled(c, x, y, k, () => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.beginPath(); c.moveTo(x - r * .3, y + r * .8); c.lineTo(x - r * .1, y + r * 1.35); c.lineTo(x + r * .25, y + r * .85); c.fill(); text(c, mark, x, y + r * .08, r * 1.5, col); }); }
function check(c, x, y, k, r = 70) { if (k <= 0) return; c.save(); c.strokeStyle = GOLD; c.lineWidth = r * .18; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, k)); c.stroke();
  c.globalAlpha = Math.min(1, k); c.beginPath(); c.moveTo(x - r * .42, y + r * .02); c.lineTo(x - r * .1, y + r * .34); c.lineTo(x + r * .45, y - r * .3); c.stroke(); c.restore(); }
function heart(c, x, y, k, r = 50) { scaled(c, x, y, k, () => { c.fillStyle = GOLD; c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.3, y, x - r * .8, y - r, x, y - r * .35); c.bezierCurveTo(x + r * .8, y - r, x + r * 1.3, y, x, y + r * .9); c.fill(); }); }
function cloud(c, x, y, k, draw) { scaled(c, x, y, k, () => { c.fillStyle = '#ffffff';
  for (const [dx, dy, r] of [[-120, 0, 105], [-35, -60, 125], [70, -50, 120], [140, 10, 100], [10, 55, 125]]) { c.beginPath(); c.arc(x + dx, y + dy, r, 0, 7); c.fill(); }
  c.beginPath(); c.arc(x - 110, y + 175, 24, 0, 7); c.fill(); c.beginPath(); c.arc(x - 140, y + 240, 13, 0, 7); c.fill(); draw(); }); }

// the cup: a plain cream tumbler with a navy band; o.name writes his name on it (o.nameK reveals it, as if being written), o.dim greys it back
function cup(c, x, base, h, o = {}) {
  const tw = h * .36, bw = h * .28, top = base - h;
  if (o.glow) glow(c, x, base - h * .5, h * 1.3, .6 * o.glow);
  c.fillStyle = 'rgba(0,0,20,.3)'; c.beginPath(); c.ellipse(x + h * .04, base + h * .02, bw * 1.25, h * .05, 0, 0, 7); c.fill();
  const body = () => { c.beginPath(); c.moveTo(x - tw, top); c.lineTo(x + tw, top); c.lineTo(x + bw, base); c.quadraticCurveTo(x, base + h * .04, x - bw, base); c.closePath(); };
  const g = c.createLinearGradient(x - tw, 0, x + tw, 0); g.addColorStop(0, '#fbf6ea'); g.addColorStop(.55, CREAM); g.addColorStop(1, '#d9ccab'); c.fillStyle = g; body(); c.fill();
  c.save(); body(); c.clip();
  c.fillStyle = '#26346f'; c.fillRect(x - tw, top + h * .07, tw * 2, h * .07);
  const hx = x - tw * .72 + (o.spin ? (Math.sin(o.spin) * .5 + .5) * tw * 1.3 : 0); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(hx, top + h * .2, h * .05, h * .62);   // the highlight travels as it turns
  if (o.name && (o.nameK ?? 1) > 0) { const sz = h * .25; c.font = `${sz}px "Caveat Brush"`; const nw = c.measureText(o.name).width, ny = base - h * .45;
    c.save(); c.beginPath(); c.rect(x - nw / 2 - 4, ny - sz, (nw + 8) * (o.nameK ?? 1), sz * 2); c.clip(); text(c, o.name, x, ny, sz, NAVY, 'Caveat Brush'); c.restore();
    if (o.shine > 0 && o.shine < 1) { const sx = lerp(x - tw * 1.4, x + tw * 1.4, o.shine); const sg = c.createLinearGradient(sx - 60, 0, sx + 60, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.75)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(sx - 60, top, 120, h); } }
  c.restore();
  c.fillStyle = '#eee5cf'; c.beginPath(); c.ellipse(x, top, tw, h * .045, 0, 0, 7); c.fill(); c.fillStyle = '#cfc2a2'; c.beginPath(); c.ellipse(x, top + h * .008, tw * .86, h * .03, 0, 0, 7); c.fill();
  if (o.dim) { c.save(); c.globalAlpha = o.dim; c.fillStyle = 'rgba(10,15,45,.6)'; body(); c.fill(); c.restore(); }
}
function tag(c, x, y, k, label = '490 Ft') { if (k <= 0) return; const sw = Math.sin((k > 1 ? 0 : 1 - k) * 6) * .25; c.save(); c.translate(x, y); c.rotate(.15 + sw);
  c.strokeStyle = '#d9ccab'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 70); c.stroke(); c.translate(0, 70); c.scale(Math.min(1, k), Math.min(1, k));
  c.fillStyle = CREAM; c.beginPath(); c.moveTo(-70, 20); c.lineTo(-50, 0); c.lineTo(50, 0); c.lineTo(70, 20); c.lineTo(70, 110); c.lineTo(-70, 110); c.closePath(); c.fill(); c.fillStyle = '#26346f'; c.beginPath(); c.arc(0, 22, 9, 0, 7); c.fill();
  text(c, label, 0, 70, 44, NAVY); c.restore(); }
function carryCup(P, h) { const Hh = Hs(P.s), d = (P.f ?? 0) < -.1 ? -1 : 1, cx = P.x + d * (.26 * Hh + h * .3), base = P.y - .2 * Hh;
  P[d > 0 ? 'handR' : 'handL'] = [cx - d * h * .3, base - h * .45]; return [cx, base]; }


// —— the mall, painted once: a skylight, an upper gallery of shops, a lower row of shop windows, a polished navy floor ——
// 60-30-10: navy and blue (walls, glass, floor, shoppers) · cream and wood (trim, columns, the kiosk) · gold (lights, signs, the balloon)
const FLOOR = 1345, GAL = 760, MR = 1.5;
const MALL = (() => {
  const [cv0, x] = mk(); cv0.width = 2000 * MR; cv0.height = 2350 * MR; x.scale(MR, MR); x.translate(400, -100);   // world coords: x −400..1600, y 100..2450
  const icon = (cx, cy, k, col) => { x.fillStyle = col; x.beginPath(); if (k === 0) x.arc(cx, cy, 13, 0, 7); else if (k === 1) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7 : 16; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } } else { x.moveTo(cx, cy + 13); x.bezierCurveTo(cx - 20, cy, cx - 12, cy - 14, cx, cy - 5); x.bezierCurveTo(cx + 12, cy - 14, cx + 20, cy, cx, cy + 13); } x.fill(); };
  // the skylight
  x.fillStyle = '#0a1240'; x.fillRect(-400, 100, 2000, 340);
  for (let px = -400; px < 1600; px += 160) { const g = x.createLinearGradient(0, 120, 0, 420); g.addColorStop(0, '#1a2a74'); g.addColorStop(1, '#2d4596'); x.fillStyle = g; x.fillRect(px + 8, 120, 144, 290);
    x.fillStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.moveTo(px + 20, 410); x.lineTo(px + 70, 120); x.lineTo(px + 100, 120); x.lineTo(px + 50, 410); x.fill(); }
  x.fillStyle = '#e9dcc0'; x.fillRect(-400, 410, 2000, 14); x.fillStyle = '#c9b791'; x.fillRect(-400, 424, 2000, 6);
  // upper gallery: a row of small shops
  x.fillStyle = '#141d56'; x.fillRect(-400, 430, 2000, 330);
  for (let i = 0, px = -390; px < 1600; px += 300, i++) {
    x.fillStyle = '#1d2a6e'; x.fillRect(px + 15, 450, 270, 50); icon(px + 150, 475, i % 3, i % 2 ? '#ecbd4a' : '#efe4c8');
    const g = x.createLinearGradient(0, 510, 0, 760); g.addColorStop(0, '#3a54a8'); g.addColorStop(1, '#1b2766'); x.fillStyle = g; x.fillRect(px + 15, 510, 270, 250);
    x.fillStyle = 'rgba(239,228,200,.35)'; x.fillRect(px + 30, 600, 240, 6); x.fillRect(px + 30, 680, 240, 6);
    for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 3 ? 'rgba(239,228,200,.4)' : 'rgba(236,189,74,.45)'; x.beginPath(); x.roundRect(px + 45 + j * 58, 560 + ((i + j) % 2) * 6, 34, 40 - ((i + j) % 2) * 6, 6); x.fill(); x.beginPath(); x.roundRect(px + 50 + j * 58, 642, 28, 38, 6); x.fill(); }
    x.fillStyle = 'rgba(239,228,200,.25)'; x.fillRect(px + 148, 510, 4, 250);
  }
  // the gallery floor's edge and its underside, with downlights
  x.fillStyle = '#e9dcc0'; x.fillRect(-400, GAL, 2000, 30); x.fillStyle = '#c9b791'; x.fillRect(-400, GAL + 30, 2000, 6); x.fillStyle = '#0c1442'; x.fillRect(-400, GAL + 36, 2000, 94);
  for (let px = -340; px < 1600; px += 180) { x.fillStyle = '#ffe7a6'; x.beginPath(); x.ellipse(px, GAL + 122, 22, 6, 0, 0, 7); x.fill();
    const g = x.createLinearGradient(0, GAL + 125, 0, FLOOR); g.addColorStop(0, 'rgba(255,225,160,.16)'); g.addColorStop(1, 'rgba(255,225,160,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(px - 18, GAL + 125); x.lineTo(px + 18, GAL + 125); x.lineTo(px + 110, FLOOR); x.lineTo(px - 110, FLOOR); x.fill(); }
  // lower level: bigger shop windows, striped awnings on some
  x.fillStyle = '#141d56'; x.fillRect(-400, GAL + 130, 2000, FLOOR - GAL - 130);
  for (let i = 0, px = -400; px < 1600; px += 400, i++) {
    x.fillStyle = '#1d2a6e'; x.fillRect(px + 20, 905, 360, 56); icon(px + 200, 933, (i + 1) % 3, i % 2 ? '#efe4c8' : '#ecbd4a');
    const g = x.createLinearGradient(0, 1000, 0, FLOOR); g.addColorStop(0, '#3d58ae'); g.addColorStop(1, '#1a2563'); x.fillStyle = g; x.fillRect(px + 20, 1000, 360, FLOOR - 1000);
    if (i % 2 === 0) for (let s = 0; s < 9; s++) { x.fillStyle = s % 2 ? '#26368c' : '#e9dcc0'; x.fillRect(px + 20 + s * 40, 966, 40, 30); x.beginPath(); x.arc(px + 40 + s * 40, 996, 20, 0, Math.PI); x.fill(); }
    x.fillStyle = 'rgba(239,228,200,.32)'; x.fillRect(px + 40, 1150, 120, 6); x.fillRect(px + 240, 1150, 120, 6);
    for (let j = 0; j < 3; j++) { x.fillStyle = (i + j) % 3 ? 'rgba(239,228,200,.38)' : 'rgba(236,189,74,.42)'; x.beginPath(); x.roundRect(px + 45 + j * 40, 1090 + (j % 2) * 10, 30, 60 - (j % 2) * 10, 6); x.fill(); x.beginPath(); x.roundRect(px + 245 + j * 40, 1100, 30, 50, 6); x.fill(); }
    x.fillStyle = '#0f1748'; x.fillRect(px + 170, 1060, 60, FLOOR - 1060); x.fillStyle = 'rgba(239,228,200,.3)'; x.fillRect(px + 198, 1060, 4, FLOOR - 1060);
  }
  // cream columns
  for (const cx of [110, 1290]) { x.fillStyle = '#d9ccab'; x.fillRect(cx - 26, 430, 52, FLOOR - 430); x.fillStyle = 'rgba(0,0,20,.18)'; x.fillRect(cx + 10, 430, 16, FLOOR - 430); x.fillStyle = '#e9dcc0'; x.fillRect(cx - 34, FLOOR - 40, 68, 40); }
  // the polished floor: tiles in perspective, the shop windows reflected in it
  const fg = x.createLinearGradient(0, FLOOR, 0, 2450); fg.addColorStop(0, '#1d2862'); fg.addColorStop(1, '#0c1236'); x.fillStyle = fg; x.fillRect(-400, FLOOR, 2000, 1105);
  x.fillStyle = '#e9dcc0'; x.fillRect(-400, FLOOR - 4, 2000, 6);
  for (let i = 0, px = -400; px < 1600; px += 400, i++) { const g = x.createLinearGradient(0, FLOOR, 0, FLOOR + 260); g.addColorStop(0, 'rgba(90,120,210,.22)'); g.addColorStop(1, 'rgba(90,120,210,0)'); x.fillStyle = g; x.fillRect(px + 20, FLOOR, 360, 260); }
  x.strokeStyle = 'rgba(239,228,200,.07)'; x.lineWidth = 3;
  for (let k = 1; k < 14; k++) { const py = FLOOR + k * k * 7; x.beginPath(); x.moveTo(-400, py); x.lineTo(1600, py); x.stroke(); }
  for (let k = -14; k <= 14; k++) { x.beginPath(); x.moveTo(600 + k * 90, FLOOR); x.lineTo(600 + k * 90 * 4.5, 2450); x.stroke(); }
  return cv0;
})();
// the life in it: banners swaying, shoppers on both floors, the escalator running
const UP = [{ v: 70, dir: 1, off: 300, skin: 'blue2', fem: 'bob', s: .55 }, { v: 55, dir: -1, off: 1500, skin: 'blue3', s: .55, bag: '#efe4c8' }, { v: 62, dir: 1, off: 1250, skin: 'blue1', s: .52 }];
const LO = [{ v: 95, dir: -1, off: 700, skin: 'blue3', fem: 'hat', s: .8, bag: '#ecbd4a' }, { v: 80, dir: 1, off: 100, skin: 'blue1', s: .82, bag: '#efe4c8', dy: 10 }, { v: 70, dir: 1, off: 1350, skin: 'blue2', s: .55, balloon: 1, dy: 6 }, { v: 88, dir: -1, off: 1900, skin: 'blue2', fem: 'glasses', s: .78 }];
const ESC = { b: [-150, FLOOR], t: [330, GAL] };
function walker(c, t, w, i, floorY) {
  const d = ((w.off + t * w.v) % 2300 + 2300) % 2300, x = w.dir > 0 ? -500 + d : 1800 - d, y = floorY + (w.dy || 0), Hh = Hs(w.s);
  const P = { id: 'm' + i + floorY, skin: w.skin, fem: w.fem, s: w.s, x, y, f: .85 * w.dir, walk: 1, phi: d * .0765 / w.s, smile: .4, shadow: false, blink: blinkAt(t, i + floorY) };
  const hand = [x + w.dir * .2 * Hh, y - .44 * Hh]; if (w.bag || w.balloon) P[w.dir > 0 ? 'handR' : 'handL'] = hand;
  if (w.balloon) { const bx = hand[0] + Math.sin(t * 1.3 + i) * 10 - w.dir * 12, by = hand[1] - 1.05 * Hh; c.strokeStyle = 'rgba(239,228,200,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(hand[0], hand[1]); c.quadraticCurveTo(hand[0] - w.dir * 10, by + 60, bx, by + .2 * Hh); c.stroke();
    c.fillStyle = GOLD; c.beginPath(); c.ellipse(bx, by, .17 * Hh, .2 * Hh, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(bx - .06 * Hh, by - .07 * Hh, .04 * Hh, .06 * Hh, -.5, 0, 7); c.fill(); }
  drawMascot(c, P);
  if (w.bag) { const bw = .2 * Hh; c.strokeStyle = w.bag; c.lineWidth = 3; c.beginPath(); c.arc(hand[0], hand[1] + .06 * Hh, .05 * Hh, Math.PI, 0); c.stroke(); c.fillStyle = w.bag; c.beginPath(); c.roundRect(hand[0] - bw / 2, hand[1] + .06 * Hh, bw, bw * 1.05, 4); c.fill(); }
}
function mall(c, t) {
  c.drawImage(MALL, -400, 100, 2000, 2350);
  for (const [bx, ph] of [[250, 0], [1180, 1.7]]) { c.save(); c.translate(bx, 300); c.rotate(Math.sin(t * .9 + ph) * .04); c.strokeStyle = '#8a7a60'; c.lineWidth = 3; c.beginPath(); c.moveTo(-30, 0); c.lineTo(-30, 40); c.moveTo(30, 0); c.lineTo(30, 40); c.stroke();
    c.fillStyle = '#26368c'; c.beginPath(); c.moveTo(-50, 40); c.lineTo(50, 40); c.lineTo(50, 250); c.lineTo(0, 280); c.lineTo(-50, 250); c.fill(); c.fillStyle = GOLD; c.fillRect(-50, 40, 100, 10); c.fillStyle = '#e9dcc0'; c.fillRect(-36, 200, 72, 6); heart(c, 0, 130, 1, 26); c.restore(); }
  UP.forEach((w, i) => walker(c, t, w, i, GAL + 6));
  c.fillStyle = 'rgba(150,180,255,.12)'; c.fillRect(-400, GAL - 72, 2000, 72); c.fillStyle = '#e9dcc0'; c.fillRect(-400, GAL - 78, 2000, 8); c.fillStyle = 'rgba(233,220,192,.35)'; for (let px = -380; px < 1600; px += 140) c.fillRect(px, GAL - 70, 4, 70);
  // the escalator: steps sliding up, riders standing still on them, a glass side and a cream handrail
  const [bx, by] = ESC.b, [tx, ty] = ESC.t, at = u => [lerp(bx, tx, u), lerp(by, ty, u)];
  c.fillStyle = '#0d1440'; c.beginPath(); c.moveTo(bx - 90, by); c.lineTo(bx, by); c.lineTo(tx, ty); c.lineTo(tx + 90, ty); c.lineTo(tx + 90, ty + 70); c.lineTo(tx, ty + 70); c.lineTo(bx, by + 70); c.lineTo(bx - 90, by + 70); c.fill();
  c.strokeStyle = 'rgba(239,228,200,.35)'; c.lineWidth = 3; for (let k = 0; k < 16; k++) { const [sx, sy] = at(((k / 16 + t * .06) % 1)); c.beginPath(); c.moveTo(sx - 18, sy); c.lineTo(sx + 18, sy); c.stroke(); }
  for (let k = 0; k < 2; k++) { const u = (t * .06 + k * .5 + .2) % 1, [rx, ry] = at(u); c.save(); c.globalAlpha = clamp(Math.min(u, 1 - u) * 12); drawMascot(c, { id: 'esc' + k, skin: k ? 'blue3' : 'blue2', fem: k ? 'bob' : null, s: .62, x: rx, y: ry, f: .5, smile: .4, shadow: false, blink: blinkAt(t, 9 + k) }); c.restore(); }
  c.fillStyle = 'rgba(150,180,255,.16)'; c.beginPath(); c.moveTo(bx - 90, by - 70); c.lineTo(bx, by - 70); c.lineTo(tx, ty - 70); c.lineTo(tx + 90, ty - 70); c.lineTo(tx + 90, ty + 10); c.lineTo(tx, ty + 10); c.lineTo(bx, by + 10); c.lineTo(bx - 90, by + 10); c.fill();
  c.strokeStyle = '#e9dcc0'; c.lineWidth = 9; c.lineJoin = 'round'; c.beginPath(); c.moveTo(bx - 90, by - 74); c.lineTo(bx, by - 74); c.lineTo(tx, ty - 74); c.lineTo(tx + 90, ty - 74); c.stroke();
  c.fillStyle = '#1a2460'; c.beginPath(); c.moveTo(bx - 90, by + 10); c.lineTo(bx, by + 10); c.lineTo(tx, ty + 10); c.lineTo(tx + 90, ty + 10); c.lineTo(tx + 90, ty + 60); c.lineTo(tx, ty + 60); c.lineTo(bx, by + 60); c.lineTo(bx - 90, by + 60); c.fill();
  LO.forEach((w, i) => walker(c, t, w, i, FLOOR + 8));
  c.fillStyle = 'rgba(6,10,36,.3)'; c.fillRect(-400, 100, 2000, 2350);   // the setting a step darker than the kiosk and the characters
}
// the BOLT kiosk: two wooden posts, a striped canopy with bulbs, the sign on top, a small top shelf and the shelf of plain cups
function kiosk(c, t, o = {}) {
  c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(406, 680, 708, 120);
  for (const px of [384, 1114]) { c.fillStyle = '#8a5d38'; c.fillRect(px, 640, 22, 740); c.fillStyle = 'rgba(255,230,190,.15)'; c.fillRect(px, 640, 5, 740); }
  const pl = (x0, x1, y) => { c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(x0 + 10, y + 14, x1 - x0, 14); c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(x0, y, x1 - x0, 22, 8); c.fill(); c.fillStyle = 'rgba(255,230,190,.18)'; c.fillRect(x0, y, x1 - x0, 4); };
  pl(395, 1125, 820);
  cup(c, 470, 820, 84); cup(c, 470, 796, 84);
  c.fillStyle = '#efe4c8'; c.beginPath(); c.moveTo(572, 820); c.lineTo(628, 820); c.lineTo(638, 772); c.lineTo(562, 772); c.fill();
  for (const [lx, ly, r, col] of [[582, 735, 30, '#2b6c7e'], [620, 728, 28, '#3f8a92'], [600, 700, 26, '#2f7180']]) { c.fillStyle = col; c.beginPath(); c.ellipse(lx, ly, r, r * .6, -.4, 0, 7); c.fill(); }
  c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(700, 700, 200, 120, 10); c.fill(); c.fillStyle = '#16205a'; c.fillRect(712, 712, 176, 96);
  c.fillStyle = 'rgba(239,228,200,.75)'; for (let k = 0; k < 3; k++) { c.fillRect(800, 732 + k * 24, 72, 5); c.fillRect(728, 732 + k * 24, 10, 5); } c.fillStyle = GOLD; c.beginPath(); c.moveTo(752, 732); c.lineTo(782, 732); c.lineTo(778, 786); c.lineTo(756, 786); c.fill();
  c.fillStyle = 'rgba(230,240,255,.25)'; c.beginPath(); c.roundRect(990, 728, 70, 92, 12); c.fill(); c.fillStyle = GOLD; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(1005 + (i % 3) * 20, 803 - Math.floor(i / 3) * 20, 7, 0, 7); c.fill(); } c.fillStyle = '#8a5d38'; c.fillRect(986, 720, 78, 12);
  pl(395, 1125, 990);
  for (let i = 0; i < 6; i++) cup(c, 475 + i * 120, 990, 105, { dim: o.dimShelf || 0 });
  if (o.glintShelf) glow(c, 715, 930, 120, o.glintShelf);
  // the canopy
  for (let s = 0; s < 10; s++) { const x0 = 360 + s * 80; c.fillStyle = s % 2 ? '#26368c' : '#efe4c8'; c.fillRect(x0, 600, 80, 72); c.beginPath(); c.arc(x0 + 40, 672, 40, 0, Math.PI); c.fill(); }
  c.fillStyle = 'rgba(0,0,20,.15)'; c.fillRect(360, 600, 800, 16); c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(348, 586, 824, 22, 8); c.fill(); c.fillStyle = GOLD; c.fillRect(352, 604, 816, 5);
  for (let s = 0; s < 10; s++) { const bx = 400 + s * 80, by = 718, on = .7 + .3 * Math.sin(t * 3 + s * 1.9); c.fillStyle = '#ffe2a0'; c.beginPath(); c.arc(bx, by, 7, 0, 7); c.fill(); glow(c, bx, by, 30, .5 * on); }
  // the sign on top
  c.fillStyle = '#8a5d38'; c.fillRect(680, 560, 12, 30); c.fillRect(888, 560, 12, 30);
  c.fillStyle = 'rgba(0,0,20,.35)'; c.beginPath(); c.roundRect(648, 462, 300, 112, 18); c.fill();
  c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(640, 452, 300, 112, 18); c.fill(); c.strokeStyle = '#efe4c8'; c.lineWidth = 6; c.beginPath(); c.roundRect(652, 464, 276, 88, 12); c.stroke();
  text(c, 'BOLT', 790, 512, 82, GOLD); for (let i = 0; i < 8; i++) { const on = (Math.floor(t * 3) + i) % 3 !== 0; c.fillStyle = on ? '#ffe7a6' : '#8a7040'; c.beginPath(); c.arc(668 + i * 35, 452, 5, 0, 7); c.fill(); if (on) glow(c, 668 + i * 35, 452, 20, .4); }
}
// the mall as a soft, out-of-focus backdrop for the close shots: the escalator and the shoppers on the left, the kiosk's edge on the right
function backdrop(c, t, blur = 10, dim = .5) {
  c.save(); c.filter = `blur(${blur * K}px)`; c.translate(540, 960); c.translate(-90, -1150); mall(c, t); kiosk(c, t); c.restore();
  c.fillStyle = `rgba(10,16,50,${dim})`; c.fillRect(0, 0, 1080, 1920);
}

// —— the shop: the BOLT kiosk in the mall, the seller (white) behind its counter ——
const CT = { x0: 400, x1: 1120, top: 1380, front: 1700 }, SPOT = [300, 1800], SELLER = { id: 'seller', skin: 'owner', tache: 1, s: 2.0, x: 860, y: 1560, f: -.4, smile: .8 };
function shop(c, t, o = {}) {
  if (!o.noBg) bg(c, t, o.bg || {});
  c.save(); c.translate(540, 1100); c.scale(1.12, 1.12); c.translate(-630, -1420);
  mall(c, t); kiosk(c, t, o);
  const S = { ...SELLER, blink: blinkAt(t, 2), ...(o.seller || {}) }; drawMascot(c, { ...S, shadow: false });
  if (o.marker) { const [hx, hy] = S.handR || [S.x - 120, 1330]; c.save(); c.translate(hx, hy); c.rotate(-.6); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-12, -70, 24, 90, 8); c.fill(); c.fillStyle = GOLD; c.fillRect(-12, -70, 24, 18); c.restore(); }
  spot(c, 760, CT.front + 6, 520);
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(CT.x0 + 10, CT.top + 14, CT.x1 - CT.x0, 24);
  c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(CT.x0 - 20, CT.top - 14, CT.x1 - CT.x0 + 40, 30, 12); c.fill();
  c.fillStyle = CREAM; c.fillRect(CT.x0, CT.top + 16, CT.x1 - CT.x0, CT.front - CT.top - 16); c.fillStyle = '#26368c'; c.fillRect(CT.x0, CT.top + 80, CT.x1 - CT.x0, 44); c.fillStyle = GOLD; c.fillRect(CT.x0, CT.top + 76, CT.x1 - CT.x0, 5); c.fillRect(CT.x0, CT.top + 124, CT.x1 - CT.x0, 5);
  c.fillStyle = 'rgba(120,90,50,.14)'; for (let px = CT.x0 + 30; px < CT.x1 - 160; px += 240) { c.beginPath(); c.roundRect(px, CT.top + 150, 200, 140, 14); c.fill(); }
  c.fillStyle = GOLD; for (let px = CT.x0 + 130; px < CT.x1 - 60; px += 240) { c.beginPath(); c.arc(px, CT.top + 220, 9, 0, 7); c.fill(); }
  c.fillStyle = '#26346f'; c.beginPath(); c.roundRect(455, CT.top - 70, 50, 62, 8); c.fill(); for (const [dx, col] of [[-12, GOLD], [0, CREAM], [12, '#2448bb']]) { c.fillStyle = col; c.save(); c.translate(480 + dx, CT.top - 80); c.rotate(dx * .02); c.fillRect(-5, -30, 10, 40); c.restore(); }
  c.fillStyle = '#efe4c8'; c.beginPath(); c.roundRect(1010, CT.top - 110, 100, 98, 12); c.fill(); c.fillStyle = '#26346f'; c.fillRect(1022, CT.top - 98, 76, 26); c.fillStyle = GOLD; c.fillRect(1030, CT.top - 92, 40, 14); c.fillStyle = '#c9b791'; for (let i = 0; i < 6; i++) c.fillRect(1022 + (i % 3) * 26, CT.top - 62 + Math.floor(i / 3) * 18, 20, 12);
  (o.onCounter || []).forEach(f => f());
  (o.front || []).forEach(f => f());
  c.restore();
}
const BOY = (o = {}) => ({ id: 'boy', skin: 'blue1', s: 1.6, x: SPOT[0], y: SPOT[1], f: .5, smile: .7, ...o });

// —— the shots: each with its own camera ——
function cam(c, x, y, z = 1, rot = 0, f) { c.save(); c.translate(540, 960); c.rotate(rot); c.scale(z, z); c.translate(-x, -y); f(); c.restore(); }
function blurred(c, px, f) { if (px <= .2) return f(); c.save(); c.filter = `blur(${px * K}px)`; f(); c.restore(); }
function plank(c, x0, x1, y, th = 30) { c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(x0 + 10, y + th - 8, x1 - x0, 20); c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(x0, y, x1 - x0, th, 10); c.fill(); c.fillStyle = 'rgba(255,230,190,.18)'; c.fillRect(x0, y, x1 - x0, 5); }
function sparkle(c, x, y, k, r = 40) { if (k <= 0 || k >= 1) return; const s = Math.sin(k * Math.PI); c.save(); c.translate(x, y); c.rotate(k * 1.5); c.fillStyle = `rgba(255,255,255,${s})`;
  c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .18 * s : r * s; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); glow(c, x, y, r * 2.5, .6 * s); }
const SHOT = {
  intro(c, t) {   // a boy walks into a shop
    const u = seg(t, .2, 1.5), P = BOY({ x: lerp(-160, SPOT[0], ss(u)), walk: u > 0 && u < 1 ? 1 : 0, phi: u * Math.PI * 7, look: -.6 * ss(seg(t, 1.4, 1.7)) });
    cam(c, 540, lerp(900, 1010, ss(seg(t, 0, 1.8))), lerp(.76, .95, ss(seg(t, .1, 1.8))), 0, () => shop(c, t, { front: [() => mascot(c, P)] }));
  },
  pov(c, t) {   // what he sees: the shelf, close; the focus pulls onto one plain cup, it glints
    bg(c, t, { shop: 12, dim: .45 });
    const f = ss(seg(t, HIT.focus, HIT.focus + .5)), z = 1 + .08 * seg(t, 1.8, 4.0);
    cam(c, 540, 1100, z, 0, () => { plank(c, -100, 1180, 1420, 40);
      [[-80, 380], [160, 400], [920, 400], [1160, 380]].forEach(([x, h]) => blurred(c, 7, () => cup(c, x, 1420, h)));
      blurred(c, 8 * (1 - f), () => cup(c, 540, 1420, 470));
      sparkle(c, 640, 990, seg(t, HIT.glint, HIT.glint + .7), 70); });
  },
  plain(c, t) {   // nothing special, not even expensive: a low angle, the cup turning slowly on the spot
    bg(c, t, { shop: 14, dim: .55 });
    const k = E(t, 4.05, .35, .4), sh = t > HIT.shrug ? Math.sin(clamp((t - HIT.shrug) / .6) * Math.PI * 2) * .05 * Math.exp(-(t - HIT.shrug) * 2) : 0;
    cam(c, 540, 1000, 1.05, Math.sin(t * .6) * .03, () => {
      c.fillStyle = '#121a46'; c.beginPath(); c.ellipse(540, 1480, 380, 70, 0, 0, 7); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.stroke();
      c.strokeStyle = 'rgba(239,228,200,.25)'; c.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * .8; c.beginPath(); c.moveTo(540 + Math.cos(a) * 300, 1480 + Math.sin(a) * 55); c.lineTo(540 + Math.cos(a) * 370, 1480 + Math.sin(a) * 68); c.stroke(); }
      c.save(); c.translate(540, 1470); c.rotate(sh); c.translate(-540, -1470); scaled(c, 540, 1470, k, () => cup(c, 540, 1470, 680, { spin: t * .8 })); c.restore();
      tag(c, 775, 790, E(t, HIT.tag, .4, .45)); });
  },
  row(c, t) {   // most people would never notice it: they walk straight past, close to us, out of focus
    bg(c, t, { shop: 9, dim: .45 });
    const pan = lerp(70, -70, seg(t, 7.7, 11.1));
    cam(c, 540 - pan, 1100, 1.05, 0, () => { plank(c, -40, 1120, 1240, 30); for (let i = 0; i < 6; i++) scaled(c, 70 + i * 190, 1240, E(t, 7.72 + i * .04, .3, .4), () => cup(c, 70 + i * 190, 1240, 220)); });
    HIT.passers.forEach((p, i) => { const u = seg(t, p, p + .9); if (u <= 0 || u >= 1) return; const dir = i % 2 ? -1 : 1, x = dir > 0 ? lerp(-500, 1580, u) : lerp(1580, -500, u);
      blurred(c, 9, () => drawMascot(c, { id: 'p' + i, skin: ['blue2', 'blue3', 'blue1'][i], fem: [null, 'bob', 'hat'][i], s: 3.6, x, y: 2380, f: .85 * dir, walk: 1, phi: u * Math.PI * 6, smile: .3, shadow: false })); });
  },
  ask(c, t) {   // over his shoulder: the seller lifts a marker and asks, would you like your name on it?
    bg(c, t);
    const lean = ss(seg(t, HIT.lean, HIT.lean + .35)), hand = ss(seg(t, 11.7, 12.1)), b = E(t, HIT.bubble, .35, .45), z = 1 + .07 * seg(t, 11.1, 16.4);
    cam(c, 600, 1150, z, 0, () => {
      mall(c, t); kiosk(c, t);
      const S = { ...SELLER, x: 640, y: 1560, s: 2.6, f: -.15, smile: .9, look: .1, blink: blinkAt(t, 2), lean: .06 * lean, squash: -.03 * Math.sin(clamp((t - HIT.seller) / .35) * Math.PI) };
      S.handR = reach([700, 1300], [520, 1150], hand); drawMascot(c, { ...S, shadow: false });
      if (hand > .2) { const [hx, hy] = S.handR; c.save(); c.translate(hx, hy); c.rotate(-.5); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-14, -84, 28, 104, 9); c.fill(); c.fillStyle = GOLD; c.fillRect(-14, -84, 28, 22); c.restore(); }
      c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(-100, 1300, 1300, 36, 14); c.fill(); c.fillStyle = CREAM; c.fillRect(-100, 1334, 1300, 400); c.fillStyle = '#26368c'; c.fillRect(-100, 1400, 1300, 52); c.fillStyle = GOLD; c.fillRect(-100, 1396, 1300, 5); c.fillRect(-100, 1452, 1300, 5);
      scaled(c, 900, 760, b, () => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(700, 560, 420, 330, 60); c.fill(); c.beginPath(); c.moveTo(760, 870); c.lineTo(700, 1010); c.lineTo(850, 885); c.fill();
        cup(c, 840, 850, 230); c.save(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(790, 745); c.lineTo(890, 745); c.stroke(); c.restore(); text(c, '?', 1010, 720, 150, GOLD); }); });
    blurred(c, 3, () => drawMascot(c, { id: 'boy', skin: 'blue1', s: 4.4, x: 190, y: 2420, back: true, f: .3, shadow: false }));   // the boy's shoulder, close, out of focus
  },
  think(c, t) {   // a tight, tilted close-up: his eyes go from the plain cup to the one with his name... yes
    const yes = t > HIT.yes, n = HIT.swings.filter(s => t > s).length, side = n % 2 ? 1 : -1, sw = yes ? 0 : (n ? side : 0);
    const tilt = yes ? lerp(.1 * side, 0, ss(seg(t, HIT.yes, HIT.yes + .25))) : .1 * Math.sin((t - 16.4) * 1.6), zp = yes ? 1 + .08 * E(t, HIT.yes, .3, .4) : 1 + .04 * seg(t, 16.4, 19);
    bg(c, t, { shop: 16, dim: .55, rays: yes ? E(t, HIT.yes, .4, .3) : 0, ry: 600 });
    cam(c, 540, 960, zp, tilt, () => {
      const pk = k => (n && !yes && (n % 2 ? 1 : 0) === k) ? 1 + .1 * Math.sin(clamp((t - HIT.swings[n - 1]) / .35) * Math.PI) : 1;
      const lk = E(t, 16.55, .35, .4) * (yes ? 1 - ss(seg(t, HIT.yes, HIT.yes + .3)) : 1), rk = E(t, 16.7, .35, .4) * (yes ? 1 + .25 * E(t, HIT.yes, .3, .45) : 1);
      scaled(c, 210, 640, lk * pk(0), () => { c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(210, 520, 190, 0, 7); c.fill(); cup(c, 210, 650, 260); });
      scaled(c, 870, 640, rk * pk(1), () => { c.fillStyle = 'rgba(255,214,120,.14)'; c.beginPath(); c.arc(870, 520, 190, 0, 7); c.fill(); cup(c, 870, 650, 260, { name: yes ? NAME : '?', glow: yes ? 1 : 0 }); });
      const nod = yes ? Math.sin(clamp((t - HIT.yes) / .6) * Math.PI * 2) * .07 : 0;
      drawMascot(c, { id: 'boy', skin: 'blue1', s: 7.2, x: 540, y: 2380, headTurn: .35 * sw, look: -.35, smile: yes ? 1 : .35, squash: nod, shadow: false, blink: blinkAt(t, 3) });
      check(c, 870, 330, E(t, HIT.yes + .1, .3, .45), 70); });
  },
  write(c, t) {   // a few minutes later: his name on the cup, written by hand, and the cup in his hands
    bg(c, t, { shop: 16, dim: .55, rays: ss(seg(t, HIT.shine - .4, HIT.shine)) });
    const nk = seg(t, ...HIT.write), sh = seg(t, HIT.shine, HIT.shine + .5), z = 1 + .06 * seg(t, 20.4, 25.4);
    cam(c, 540, 1150, z, -.04 + .04 * seg(t, 20.4, 25.4), () => {
      cup(c, 540, 1500, 760, { name: NAME, nameK: nk, shine: sh });
      if (nk > 0 && nk < 1) { c.font = `${760 * .25}px "Caveat Brush"`; const nw = c.measureText(NAME).width, tx = 540 - nw / 2 + nw * nk, ty = 1500 - 760 * .45 + 40 * Math.sin(nk * 30);
        c.save(); c.lineCap = 'round'; c.strokeStyle = NAVY; c.lineWidth = 26; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + 70, ty + 140); c.stroke();
        const g = c.createLinearGradient(tx, ty, tx + 300, ty + 600); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bfc4d4'); c.strokeStyle = g; c.lineWidth = 80; c.beginPath(); c.moveTo(tx + 60, ty + 110); c.lineTo(tx + 420, ty + 760); c.stroke();
        c.fillStyle = g; c.beginPath(); c.arc(tx + 55, ty + 100, 58, 0, 7); c.fill(); c.restore(); }
      const hk = E(t, HIT.hands, .3, .4); if (hk > 0) for (const s of [-1, 1]) { const hx = 540 + s * 300, hy = lerp(2200, 1230, Math.min(1, hk)); c.strokeStyle = '#2448bb'; c.lineWidth = 92; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + s * 40, 2200); c.lineTo(hx, hy); c.stroke(); c.fillStyle = '#2a52c9'; c.beginPath(); c.arc(hx, hy, 66, 0, 7); c.fill(); } });
  },
  smile(c, t) {   // he smiles
    bg(c, t, { shop: 14, dim: .5, rays: .8 });
    cam(c, 540, 960, 1 + .08 * seg(t, 25.4, 26.9), 0, () => mascot(c, { id: 'boy', skin: 'blue1', s: 4.8, x: 540, y: 1900, smile: lerp(.5, 1, ss(seg(t, HIT.smile - .1, HIT.smile + .2))), blink: t > HIT.giggle - .05 && t < HIT.giggle + .45 ? 1 : 0, squash: t > HIT.giggle ? .03 * Math.sin((t - HIT.giggle) * 22) * Math.exp(-(t - HIT.giggle) * 3) : 0 }));
  },
  same(c, t) {   // the same cup as the others, in a row going away from us; but it isn't just a plain cup on the shelf any more
    bg(c, t, { shop: 11, dim: .5 });
    const pulse = t > HIT.pulse ? 1 + .06 * Math.sin(clamp((t - HIT.pulse) / .4) * Math.PI) : 1, dolly = seg(t, 26.9, 32.4);
    cam(c, lerp(580, 620, dolly), 1150, 1 + .06 * dolly, 0, () => {
      c.fillStyle = '#8a5d38'; c.beginPath(); c.moveTo(40, 1730); c.lineTo(1120, 1250); c.lineTo(1120, 1270); c.lineTo(40, 1780); c.closePath(); c.fill();
      for (let i = 4; i >= 0; i--) { const x = 200 + i * 200, y = 1720 - i * 115, h = 360 - i * 50, mine = i === 2, dim = mine ? 0 : .8 * ss(seg(t, HIT.dims[[0, 0, 1, 2, 3][i]], HIT.dims[[0, 0, 1, 2, 3][i]] + .3));
        scaled(c, x, y, E(t, 26.92 + (4 - i) * .05, .3, .4) * pulse, () => cup(c, x, y, h, mine ? { name: NAME, glow: ss(seg(t, 31.4, 32.0)) } : { dim })); } });
  },
  special(c, t) {   // but a cup made just for him: it rises, the camera turns around it
    const u = ss(seg(t, HIT.rise, HIT.rise + .7)), k = 1 + 1.1 * u;
    bg(c, t, { shop: 13, dim: .5 + .2 * u, rays: u, ry: 1000 });
    cam(c, 540, 1100, 1, Math.sin((t - 32.4) * .7) * .05 * u, () => {
      c.save(); c.globalAlpha = 1 - u; plank(c, 60, 1020, 1240, 30); for (let i = 0; i < 5; i++) if (i !== 2) cup(c, 160 + i * 190, 1240, 220, { dim: .8 }); c.restore();
      const y = lerp(1240, 1420, u); scaled(c, 540, y, k, () => cup(c, 540, y, 220, { name: NAME, glow: 1, shine: seg(t, 33.6, 34.2), spin: t * .6 }));
      heart(c, 820, 600, E(t, HIT.heart, .35, .5), 70); });
  },
  buy(c, t) {   // he decides to buy it: back at the counter, he flips a coin to the seller, who catches it. Ka-ching
    const z = 1 + .1 * ss(seg(t, 36.5, 39.3)), fly = seg(t, HIT.flip, HIT.coin), caught = t >= HIT.coin, yes = E(t, HIT.ching, .3, .45);
    const P = BOY({ smile: 1, look: -.4 * (fly > 0 && !caught ? 1 : 0), squash: t > HIT.ching ? .04 * Math.sin((t - HIT.ching) * 18) * Math.exp(-(t - HIT.ching) * 3) : 0 }), [bx, base] = carryCup(P, 130);
    if (t > HIT.flip - .3 && t < HIT.flip + .25) P.handL = reach([260, 1560], [380, 1450], Math.sin(seg(t, HIT.flip - .3, HIT.flip + .25) * Math.PI));
    const catchAt = [700, 1290], S = { smile: caught ? 1 : .8, look: .2, blink: t > HIT.ching && t < HIT.ching + .7 ? 1 : 0 };
    if (t > HIT.coin - .35 && t < HIT.coin + .5) S.handR = reach([800, 1360], catchAt, Math.sin(seg(t, HIT.coin - .35, HIT.coin + .5) * Math.PI));
    bg(c, t, { rays: yes * .7, ry: 900 });
    cam(c, 520, 1060, z, 0, () => shop(c, t, { noBg: 1, seller: S, front: [() => mascot(c, P), () => cup(c, bx, base, 130, { name: NAME, glow: yes * .6 }), () => {
      if (fly > 0 && !caught) { const x = lerp(390, catchAt[0], fly), y = lerp(1440, catchAt[1], fly) - Math.sin(fly * Math.PI) * 300, ry = Math.abs(Math.cos(fly * 12)) * 26 + 4;
        glow(c, x, y, 110, .5); c.fillStyle = GOLD; c.beginPath(); c.ellipse(x, y, 40, ry * 1.5, 0, 0, 7); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 5; c.stroke(); }
      check(c, bx, base - 230, yes, 62); }] }));
  },
  detail(c, t) {   // sometimes one small detail is enough to see something completely differently
    const others = ss(seg(t, HIT.others, HIT.others + .6));
    bg(c, t, { shop: 10, dim: .45 + .25 * others, rays: others, ry: 1100 });
    cam(c, 540, 1100, 1 + .06 * seg(t, 39.3, 44.6), 0, () => {
      c.fillStyle = `rgba(138,93,56,${1 - others * .7})`; c.beginPath(); c.roundRect(60, 1240, 960, 30, 10); c.fill();
      const xs = [160, 350, 540, 730, 920];
      xs.forEach((x, i) => { if (i === 3) return; c.save(); c.globalAlpha = 1 - .75 * others; cup(c, x, 1240, 220); c.restore(); });
      scaled(c, 730, 1240, 1 + .25 * others, () => cup(c, 730, 1240, 220, { name: NAME, glow: others }));
      const lu = ss(seg(t, HIT.lens, HIT.reveal)), lx = lerp(-150, 730, lu), ly = 1140, lr = 175, lk = E(t, HIT.lens, .3, .4) * (1 - ss(seg(t, HIT.others + .2, HIT.others + .6)));
      if (lk > 0) { c.save(); c.globalAlpha = Math.min(1, lk);
        c.save(); c.beginPath(); c.arc(lx, ly, lr, 0, 7); c.clip(); c.fillStyle = 'rgba(220,235,255,.12)'; c.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
        c.translate(lx, ly); c.scale(1.45, 1.45); c.translate(-lx, -ly); xs.forEach((x, i) => cup(c, x, 1240, 220, i === 3 ? { name: NAME } : {})); c.restore();
        c.strokeStyle = '#8a5d38'; c.lineWidth = 22; c.beginPath(); c.arc(lx, ly, lr, 0, 7); c.stroke(); c.lineCap = 'round'; c.lineWidth = 40; c.beginPath(); c.moveTo(lx + lr * .72, ly + lr * .72); c.lineTo(lx + lr * 1.6, ly + lr * 1.6); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 8; c.beginPath(); c.arc(lx, ly, lr * .8, -2.6, -1.9); c.stroke(); c.restore(); } });
  },
};
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
function paintShot(c, i, t) { c.setTransform(K, 0, 0, K, 0, 0); SHOT[SHOTS[i][1]](c, t); }

// —— the locked 23 Team end card (ANIMATION-STYLE.md) ——
const LOGO = new Image(); LOGO.src = 'refs/logo-23.png'; await LOGO.decode();
const LOGO_W = (() => { const c = document.createElement('canvas'); c.width = LOGO.width; c.height = LOGO.height; const x = c.getContext('2d'); x.drawImage(LOGO, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#aeb9e2'; x.fillRect(0, 0, c.width, c.height); return c; })();
function endCard(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  const u = ss(seg(t, STORY + .15, STORY + 1.05)), w = W * .30, h = w * LOGO.height / LOGO.width, sc = 1.04 - .04 * u;
  c.save(); c.globalAlpha = u * .75; c.filter = u < 1 ? `blur(${(1 - u) * 6 * K}px)` : 'none';
  c.translate(W / 2, H / 2); c.scale(sc, sc); c.drawImage(LOGO_W, -w / 2, -h / 2, w, h); c.restore();
}
function vignette(c) { c.setTransform(1, 0, 0, 1, 0, 0); const g = c.createRadialGradient(W / 2, H * .48, H * .3, W / 2, H * .5, H * .8); g.addColorStop(0, 'rgba(4,6,30,0)'); g.addColorStop(1, 'rgba(4,6,30,.4)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
const WHIP = .24, PUNCH = .26, CLOCK = .55;
function draw(c, t) {
  if (t >= STORY) return endCard(c, t);
  const i = shotAt(t), [t0, , kind] = SHOTS[i], dt = t - t0;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H);
  if (kind === 'whip' && dt < WHIP && i > 0) {
    const e = ss(dt / WHIP), blur = Math.sin(e * Math.PI) * 26 * K;
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t);
    c.save(); c.filter = `blur(${blur}px)`; c.drawImage(bufA, -W * e, 0); c.drawImage(bufB, W * (1 - e), 0); c.restore();
  } else if (kind === 'punch' && dt < PUNCH && i > 0) {
    const e = 1 - Math.pow(1 - dt / PUNCH, 3), s = lerp(1.22, 1, e);
    paintShot(bctx, i, t); c.save(); c.translate(W / 2, H / 2); c.scale(s, s); c.translate(-W / 2, -H / 2); c.filter = `blur(${(1 - e) * 10 * K}px)`; c.drawImage(bufB, 0, 0); c.restore();
  } else if (kind === 'clock' && dt < CLOCK && i > 0) {   // a clock hand sweeps round and wipes in the new shot: a few minutes later
    const e = ss(dt / CLOCK), a = -Math.PI / 2 + e * Math.PI * 2, cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
    paintShot(actx, i - 1, t0 - 1 / 48); paintShot(bctx, i, t); c.drawImage(bufA, 0, 0);
    c.save(); c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, R, -Math.PI / 2, a); c.closePath(); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    c.save(); c.strokeStyle = GOLD; c.lineCap = 'round'; c.lineWidth = 14 * K; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); c.fillStyle = GOLD; c.beginPath(); c.arc(cx, cy, 22 * K, 0, 7); c.fill(); c.restore();
  } else paintShot(c, i, t);
  vignette(c);
  const fade = ss(seg(t, STORY - .7, STORY)); if (fade > 0) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = fade; c.fillStyle = END_BLUE; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

// sound cues: the fixed hits, plus the boy's footsteps as he walks in and the passers-by
const EV = [];
for (const [type, v] of Object.entries(HIT)) for (const t of [].concat(v)) EV.push({ t, type });
for (let k = 1; k < 7; k++) EV.push({ t: +(.2 + k * 1.3 / 7).toFixed(3), type: 'step', who: 'boy', pan: lerp(-.8, -.3, k / 7) });
HIT.passers.forEach((p, i) => { for (let k = 1; k < 6; k++) EV.push({ t: +(p + k * .9 / 6).toFixed(3), type: 'step', who: 'guest', pan: (i % 2 ? 1 : -1) * lerp(-.8, .8, k / 6) }); });
window.DUR = DUR;
window.EV = EV.sort((a, b) => a.t - b.t);
window.render = t => draw(ctx, t);
window.render(0);
window.READY = true;
