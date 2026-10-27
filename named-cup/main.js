// The Named Cup: a 23 Team reel in simple 2D motion graphics, drawn frame by frame from render(t).
// A clean navy stage and a minimal shop (a counter, the seller, a shelf of plain cups); the boy, the cup and his name as big shapes that snap in with the voice.
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
  c.fillStyle = 'rgba(255,255,255,.05)'; const off = (t * 24) % 60;
  for (let y = -60; y < 1980; y += 60) for (let x = -60; x < 1140; x += 60) { c.beginPath(); c.arc(x + off + (y / 60 % 2) * 30, y + off, 3, 0, 7); c.fill(); }
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

// —— the minimal shop: a BOLT sign, a shelf of plain cups, the seller (white) behind a counter ——
const CT = { x0: 400, x1: 1120, top: 1380, front: 1700 }, SPOT = [300, 1800], SELLER = { id: 'seller', skin: 'owner', tache: 1, s: 2.0, x: 860, y: 1560, f: -.4, smile: .8 };
function shop(c, t, o = {}) {
  bg(c, t, o.bg || {});
  c.save(); c.translate(540, 1100); c.scale(1.12, 1.12); c.translate(-630, -1420);
  c.fillStyle = 'rgba(5,8,30,.35)'; c.fillRect(-400, CT.front, 2000, 1200);
  c.fillStyle = '#121a46'; c.beginPath(); c.roundRect(640, 560, 300, 120, 22); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.stroke(); text(c, 'BOLT', 790, 624, 92, GOLD);
  c.fillStyle = 'rgba(0,0,20,.3)'; c.fillRect(440, 1004, 680, 16); c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(430, 990, 690, 22, 8); c.fill();
  for (let i = 0; i < 6; i++) cup(c, 475 + i * 120, 990, 105, { dim: o.dimShelf || 0 });
  if (o.glintShelf) glow(c, 715, 930, 120, o.glintShelf);
  const S = { ...SELLER, blink: blinkAt(t, 2), ...(o.seller || {}) }; drawMascot(c, { ...S, shadow: false });
  if (o.marker) { const [hx, hy] = S.handR || [S.x - 120, 1330]; c.save(); c.translate(hx, hy); c.rotate(-.6); c.fillStyle = NAVY; c.beginPath(); c.roundRect(-12, -70, 24, 90, 8); c.fill(); c.fillStyle = GOLD; c.fillRect(-12, -70, 24, 18); c.restore(); }
  c.fillStyle = 'rgba(0,0,20,.35)'; c.fillRect(CT.x0 + 10, CT.top + 14, CT.x1 - CT.x0, 24);
  c.fillStyle = '#8a5d38'; c.beginPath(); c.roundRect(CT.x0 - 20, CT.top - 14, CT.x1 - CT.x0 + 40, 30, 12); c.fill();
  c.fillStyle = CREAM; c.fillRect(CT.x0, CT.top + 16, CT.x1 - CT.x0, CT.front - CT.top - 16); c.fillStyle = '#26368c'; c.fillRect(CT.x0, CT.top + 80, CT.x1 - CT.x0, 44); c.fillStyle = GOLD; c.fillRect(CT.x0, CT.top + 76, CT.x1 - CT.x0, 5); c.fillRect(CT.x0, CT.top + 124, CT.x1 - CT.x0, 5);
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
    cam(c, 540, 960, 1 + .06 * seg(t, 0, 1.8), 0, () => shop(c, t, { front: [() => mascot(c, P)] }));
  },
  pov(c, t) {   // what he sees: the shelf, close; the focus pulls onto one plain cup, it glints
    bg(c, t);
    const f = ss(seg(t, HIT.focus, HIT.focus + .5)), z = 1 + .08 * seg(t, 1.8, 4.0);
    cam(c, 540, 1100, z, 0, () => { plank(c, -100, 1180, 1420, 40);
      [[-80, 380], [160, 400], [920, 400], [1160, 380]].forEach(([x, h]) => blurred(c, 7, () => cup(c, x, 1420, h)));
      blurred(c, 8 * (1 - f), () => cup(c, 540, 1420, 470));
      sparkle(c, 640, 990, seg(t, HIT.glint, HIT.glint + .7), 70); });
  },
  plain(c, t) {   // nothing special, not even expensive: a low angle, the cup turning slowly on the spot
    bg(c, t);
    const k = E(t, 4.05, .35, .4), sh = t > HIT.shrug ? Math.sin(clamp((t - HIT.shrug) / .6) * Math.PI * 2) * .05 * Math.exp(-(t - HIT.shrug) * 2) : 0;
    cam(c, 540, 1000, 1.05, Math.sin(t * .6) * .03, () => {
      c.fillStyle = '#121a46'; c.beginPath(); c.ellipse(540, 1480, 380, 70, 0, 0, 7); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 6; c.stroke();
      c.strokeStyle = 'rgba(239,228,200,.25)'; c.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * .8; c.beginPath(); c.moveTo(540 + Math.cos(a) * 300, 1480 + Math.sin(a) * 55); c.lineTo(540 + Math.cos(a) * 370, 1480 + Math.sin(a) * 68); c.stroke(); }
      c.save(); c.translate(540, 1470); c.rotate(sh); c.translate(-540, -1470); scaled(c, 540, 1470, k, () => cup(c, 540, 1470, 680, { spin: t * .8 })); c.restore();
      tag(c, 775, 790, E(t, HIT.tag, .4, .45)); });
  },
  row(c, t) {   // most people would never notice it: they walk straight past, close to us, out of focus
    bg(c, t);
    const pan = lerp(70, -70, seg(t, 7.7, 11.1));
    cam(c, 540 - pan, 1100, 1.05, 0, () => { plank(c, -40, 1120, 1240, 30); for (let i = 0; i < 6; i++) scaled(c, 70 + i * 190, 1240, E(t, 7.72 + i * .04, .3, .4), () => cup(c, 70 + i * 190, 1240, 220)); });
    HIT.passers.forEach((p, i) => { const u = seg(t, p, p + .9); if (u <= 0 || u >= 1) return; const dir = i % 2 ? -1 : 1, x = dir > 0 ? lerp(-500, 1580, u) : lerp(1580, -500, u);
      blurred(c, 9, () => drawMascot(c, { id: 'p' + i, skin: ['blue2', 'blue3', 'blue1'][i], fem: [null, 'bob', 'hat'][i], s: 3.6, x, y: 2380, f: .85 * dir, walk: 1, phi: u * Math.PI * 6, smile: .3, shadow: false })); });
  },
  ask(c, t) {   // over his shoulder: the seller lifts a marker and asks, would you like your name on it?
    bg(c, t);
    const lean = ss(seg(t, HIT.lean, HIT.lean + .35)), hand = ss(seg(t, 11.7, 12.1)), b = E(t, HIT.bubble, .35, .45), z = 1 + .07 * seg(t, 11.1, 16.4);
    cam(c, 600, 1150, z, 0, () => {
      plank(c, 60, 1060, 820, 24); for (let i = 0; i < 6; i++) cup(c, 140 + i * 160, 820, 130);
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
    bg(c, t, { rays: yes ? E(t, HIT.yes, .4, .3) : 0, ry: 600 });
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
    bg(c, t, { rays: ss(seg(t, HIT.shine - .4, HIT.shine)) });
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
    bg(c, t, { rays: .8 });
    cam(c, 540, 960, 1 + .08 * seg(t, 25.4, 26.9), 0, () => mascot(c, { id: 'boy', skin: 'blue1', s: 4.8, x: 540, y: 1900, smile: lerp(.5, 1, ss(seg(t, HIT.smile - .1, HIT.smile + .2))), blink: t > HIT.giggle - .05 && t < HIT.giggle + .45 ? 1 : 0, squash: t > HIT.giggle ? .03 * Math.sin((t - HIT.giggle) * 22) * Math.exp(-(t - HIT.giggle) * 3) : 0 }));
  },
  same(c, t) {   // the same cup as the others, in a row going away from us; but it isn't just a plain cup on the shelf any more
    bg(c, t);
    const pulse = t > HIT.pulse ? 1 + .06 * Math.sin(clamp((t - HIT.pulse) / .4) * Math.PI) : 1, dolly = seg(t, 26.9, 32.4);
    cam(c, lerp(580, 620, dolly), 1150, 1 + .06 * dolly, 0, () => {
      c.fillStyle = '#8a5d38'; c.beginPath(); c.moveTo(40, 1730); c.lineTo(1120, 1250); c.lineTo(1120, 1270); c.lineTo(40, 1780); c.closePath(); c.fill();
      for (let i = 4; i >= 0; i--) { const x = 200 + i * 200, y = 1720 - i * 115, h = 360 - i * 50, mine = i === 2, dim = mine ? 0 : .8 * ss(seg(t, HIT.dims[[0, 0, 1, 2, 3][i]], HIT.dims[[0, 0, 1, 2, 3][i]] + .3));
        scaled(c, x, y, E(t, 26.92 + (4 - i) * .05, .3, .4) * pulse, () => cup(c, x, y, h, mine ? { name: NAME, glow: ss(seg(t, 31.4, 32.0)) } : { dim })); } });
  },
  special(c, t) {   // but a cup made just for him: it rises, the camera turns around it
    const u = ss(seg(t, HIT.rise, HIT.rise + .7)), k = 1 + 1.1 * u;
    bg(c, t, { rays: u, ry: 1000 });
    cam(c, 540, 1100, 1, Math.sin((t - 32.4) * .7) * .05 * u, () => {
      c.save(); c.globalAlpha = 1 - u; plank(c, 60, 1020, 1240, 30); for (let i = 0; i < 5; i++) if (i !== 2) cup(c, 160 + i * 190, 1240, 220, { dim: .8 }); c.restore();
      const y = lerp(1240, 1420, u); scaled(c, 540, y, k, () => cup(c, 540, y, 220, { name: NAME, glow: 1, shine: seg(t, 33.6, 34.2), spin: t * .6 }));
      heart(c, 820, 600, E(t, HIT.heart, .35, .5), 70); });
  },
  buy(c, t) {   // he decides to buy it: a low angle on the counter, the coin lands right in front of us; the focus pulls back to them
    const rack = ss(seg(t, HIT.ching, HIT.ching + .5));
    bg(c, t);
    blurred(c, 6 * (1 - rack), () => cam(c, 640, 1250, .85, 0, () => shop(c, t, { seller: { smile: 1, look: .3, blink: t > HIT.ching && t < HIT.ching + .6 ? 1 : 0 }, front: [() => { const P = BOY({ smile: 1, look: -.2 }), [bx, base] = carryCup(P, 130); mascot(c, P); cup(c, bx, base, 130, { name: NAME }); }] })));
    c.fillStyle = '#8a5d38'; c.beginPath(); c.moveTo(-50, 1500); c.lineTo(1130, 1500); c.lineTo(1300, 1980); c.lineTo(-220, 1980); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(40,20,5,.3)'; c.lineWidth = 4; for (let i = 0; i < 6; i++) { const y = 1530 + i * 75; c.beginPath(); c.moveTo(-100, y); c.lineTo(1180, y); c.stroke(); }
    if (t > HIT.flip) { const u = clamp((t - HIT.flip) / (HIT.coin - HIT.flip)), y = t < HIT.coin ? lerp(200, 1640, u * u) : 1640 - Math.abs(Math.sin((t - HIT.coin) * 9)) * 40 * Math.exp(-(t - HIT.coin) * 5), ry = t < HIT.coin ? Math.abs(Math.cos(u * 14)) * 90 + 8 : 26;
      blurred(c, 3 * rack, () => { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(560, 1680, 110, 22, 0, 0, 7); c.fill(); c.fillStyle = GOLD; c.beginPath(); c.ellipse(540, y, 100, ry, 0, 0, 7); c.fill(); c.strokeStyle = GOLD2; c.lineWidth = 8; c.stroke(); }); }
  },
  detail(c, t) {   // sometimes one small detail is enough to see something completely differently
    const others = ss(seg(t, HIT.others, HIT.others + .6));
    bg(c, t, { rays: others, ry: 1100 });
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
